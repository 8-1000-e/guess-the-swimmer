import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading)
    return (
      <main className="auth">
        <p className="auth-sub">Chargement…</p>
      </main>
    )

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}
