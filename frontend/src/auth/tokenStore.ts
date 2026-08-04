import type { Tokens } from '@/types/auth'

const REFRESH_KEY = 'gts_refresh'

let accessToken: string | null = null
let refreshToken: string | null = localStorage.getItem(REFRESH_KEY)

const listeners = new Set<() => void>()

function emit() {
  for (const fn of listeners) fn()
}

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,

  set(tokens: Tokens) {
    accessToken = tokens.access_token
    refreshToken = tokens.refresh_token
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
    emit()
  },

  clear() {
    accessToken = null
    refreshToken = null
    localStorage.removeItem(REFRESH_KEY)
    emit()
  },

  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
