import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  login: string;
}

export interface AuthedRequest extends Request {
  user: JwtPayload;
}

export interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}
