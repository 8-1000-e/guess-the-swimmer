export interface FtTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

export interface FtProfile {
  id: number;
  login: string;
  email: string;
  image?: { link: string | null };
  campus?: { id: number; name: string }[];
}
