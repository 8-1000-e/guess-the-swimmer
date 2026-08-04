import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '@/api/client'
import { API_BASE_URL, ROUTES } from '@/api/routes'
import { tokenStore } from './tokenStore'
import type { Tokens, User } from '@/types/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  setTokens: (tokens: Tokens) => void
  fetchMe: () => Promise<User>
  loginWith42: () => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const me = await api.get<User>(ROUTES.users.me)
    setUser(me)
    return me
  }, [])

  const setTokens = useCallback((tokens: Tokens) => {
    tokenStore.set(tokens)
  }, [])

  const loginWith42 = useCallback(() => {
    window.location.href = `${API_BASE_URL}${ROUTES.auth.ft}`
  }, [])

  const logout = useCallback(async () => {
    const refresh_token = tokenStore.getRefreshToken()
    try {
      if (refresh_token) await api.post(ROUTES.auth.logout, { refresh_token })
    } finally {
      tokenStore.clear()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function restore() {
      const refresh_token = tokenStore.getRefreshToken()
      if (!refresh_token) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const tokens = await api.post<Tokens>(
          ROUTES.auth.refresh,
          { refresh_token },
          { auth: false },
        )
        tokenStore.set(tokens)
        const me = await api.get<User>(ROUTES.users.me)
        if (!cancelled) setUser(me)
      } catch {
        tokenStore.clear()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      setTokens,
      fetchMe,
      loginWith42,
      logout,
    }),
    [user, loading, setTokens, fetchMe, loginWith42, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
