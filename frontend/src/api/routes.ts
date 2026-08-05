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
    round: '/game/round',
    guess: '/game/guess',
    targets: '/game/targets',
    roster: '/game/roster',
    qr: '/game/qr',
    sign: '/game/sign',
    leaderboard: '/game/leaderboard',
    user: (login: string) => `/game/users/${login}`,
  },
} as const

export function intraUrl(login: string): string {
  return `https://profile.intra.42.fr/users/${login}`
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
