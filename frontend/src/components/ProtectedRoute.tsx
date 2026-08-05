import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import Loading from './ui/Loading'
import Surface from './ui/Surface'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading)
    return (
      <main className="auth">
        <Surface as="section" className="auth-card">
          <Loading />
        </Surface>
      </main>
    )

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}
