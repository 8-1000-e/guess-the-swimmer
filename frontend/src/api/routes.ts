export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const ROUTES = {
  auth: {
    refresh: '/refresh',
    logout: '/logout',
    ft: '/auth/42',
    ftCallback: '/auth/42/callback',
  },

  users: {
    me: '/me',
  },

  game: {
    daily: '/game/daily',
    guess: '/game/guess',
    history: '/game/history',
    leaderboard: '/game/leaderboard',
    swimmers: '/game/swimmers',
  },
} as const

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
