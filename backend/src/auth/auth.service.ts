import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { FtApiService } from '../ftapi/ftapi.service';
import { PrismaService } from '../prisma/prisma.service';

const REFRESH_TTL_DAYS = 7;

export type FtAuthError = 'not_in_pool';

export class FtAuthRejection extends Error {
  constructor(readonly reason: FtAuthError) {
    super(reason);
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly ft: FtApiService,
  ) {}

  getFtAuthUrl(state: string) {
    const clientId = this.config.getOrThrow<string>('FT_OAUTH_CLIENT_ID');
    const redirectUri = encodeURIComponent(
      this.config.getOrThrow<string>('FT_OAUTH_REDIRECT_URI'),
    );
    return `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public&state=${state}`;
  }

  async handleFtCallback(code: string) {
    const profile = await this.ft.getProfileFromCode(code);
    const login = profile.login.trim().toLowerCase();

    const swimmer = await this.prisma.swimmer.findUnique({ where: { login } });
    if (!swimmer) throw new FtAuthRejection('not_in_pool');

    const ftId = String(profile.id);
    const identity = {
      login,
      name: profile.login,
      ftPfpUrl: profile.image?.link ?? null,
      campus: profile.campus?.[0]?.name ?? null,
    };

    const user = await this.prisma.user.upsert({
      where: { ftId },
      update: identity,
      create: { ftId, ...identity },
    });

    return this.issueTokens(user.ftId, user.login);
  }

  private async issueTokens(ftId: string, login: string) {
    const refresh_token = await this.createRefreshToken(ftId);
    const access_token = this.jwt.sign({ sub: ftId, login });
    return { access_token, refresh_token };
  }

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createRefreshToken(ftId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: { tokenHash: this.hash(token), ftId, expiresAt },
    });

    return token;
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hash(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!stored) throw new UnauthorizedException();

    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
    if (count === 0) throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { ftId: stored.ftId },
    });
    if (!user) throw new UnauthorizedException();

    return this.issueTokens(user.ftId, user.login);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash: this.hash(refreshToken) },
    });
    return { message: 'Logged out' };
  }

  async me(ftId: string) {
    const user = await this.prisma.user.findUnique({
      where: { ftId },
      select: {
        ftId: true,
        login: true,
        name: true,
        ftPfpUrl: true,
        campus: true,
        totalTryCount: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
