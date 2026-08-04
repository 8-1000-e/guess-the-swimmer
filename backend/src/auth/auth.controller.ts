import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import type { Response } from 'express';
import { AuthService, FtAuthRejection } from './auth.service';
import type { AuthedRequest, RequestWithCookies } from './authed-request';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get frontendUrl() {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  }

  @Get('auth/42')
  ftAuth(@Res() res: Response) {
    const state = randomBytes(16).toString('hex');
    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });
    res.redirect(this.auth.getFtAuthUrl(state));
  }

  @Get('auth/42/callback')
  async ftCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: RequestWithCookies,
    @Res() res: Response,
  ) {
    res.clearCookie('oauth_state');

    const cookieState = req.cookies?.['oauth_state'];
    if (!code || !cookieState || cookieState !== state)
      return res.redirect(`${this.frontendUrl}/login?error=invalid_state`);

    try {
      const tokens = await this.auth.handleFtCallback(code);
      return res.redirect(
        `${this.frontendUrl}/auth/callback#access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
      );
    } catch (e) {
      const reason = e instanceof FtAuthRejection ? e.reason : 'ft_auth_failed';
      return res.redirect(`${this.frontendUrl}/login?error=${reason}`);
    }
  }

  @Post('refresh')
  refresh(@Body() body: TokenDto) {
    return this.auth.refresh(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: AuthedRequest, @Body() body: TokenDto) {
    return this.auth.logout(req.user.sub, body.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.user.sub);
  }
}
