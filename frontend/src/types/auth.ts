export interface Tokens {
  access_token: string
  refresh_token: string
}

export interface User {
  ftId: string
  login: string
  name: string
  ftPfpUrl: string | null
  campus: string | null
  totalTryCount: number
}

export interface ApiError {
  statusCode: number
  message: string
  payload?: unknown
}
