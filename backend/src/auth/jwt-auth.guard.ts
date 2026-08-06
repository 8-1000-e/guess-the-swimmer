import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthedRequest, JwtPayload } from './authed-request';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<AuthedRequest>();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(token, { algorithms: ['HS256'] });
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { ftId: payload.sub },
      select: { ftId: true, swimmer: { select: { active: true } } },
    });
    if (!user?.swimmer.active) throw new UnauthorizedException();

    request.user = payload;
    return true;
  }
}
