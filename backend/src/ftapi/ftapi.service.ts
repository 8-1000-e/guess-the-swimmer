import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FtProfile, FtTokenResponse } from './ftapi.types';

@Injectable()
export class FtApiService {
  private appToken: string | null = null;
  private appTokenExpiresAt = 0;

  constructor(private readonly config: ConfigService) {}

  async getProfileFromCode(code: string): Promise<FtProfile> {
    const res = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.getOrThrow('FT_OAUTH_CLIENT_ID'),
        client_secret: this.config.getOrThrow('FT_OAUTH_CLIENT_SECRET'),
        code,
        redirect_uri: this.config.getOrThrow('FT_OAUTH_REDIRECT_URI'),
      }),
    });

    const data = (await res.json()) as FtTokenResponse;
    if (!res.ok || !data.access_token) {
      throw new UnauthorizedException({
        message: '42 token exchange failed',
        status: res.status,
        ftError: data.error,
        ftErrorDescription: data.error_description,
      });
    }

    const me = await fetch('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (!me.ok)
      throw new UnauthorizedException(`42 /v2/me failed (${me.status})`);

    return (await me.json()) as FtProfile;
  }

  private async getAppToken(): Promise<string> {
    if (this.appToken && Date.now() < this.appTokenExpiresAt)
      return this.appToken;

    const res = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.getOrThrow('FT_OAUTH_CLIENT_ID'),
        client_secret: this.config.getOrThrow('FT_OAUTH_CLIENT_SECRET'),
      }),
    });

    const data = (await res.json()) as FtTokenResponse;
    if (!res.ok || !data.access_token)
      throw new Error(`42 client_credentials failed (${res.status})`);

    this.appToken = data.access_token;
    this.appTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return data.access_token;
  }

  async get<T>(path: string): Promise<T> {
    const token = await this.getAppToken();

    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(`https://api.intra.42.fr${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`42 GET ${path} -> ${res.status}`);
      return (await res.json()) as T;
    }

    throw new Error(`42 GET ${path} -> rate limited`);
  }
}
