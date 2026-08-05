import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import { useAuth } from '@/auth/useAuth'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import AnimatedGradient from '@/components/ui/animated-gradient'
import Loading from '@/components/ui/Loading'
import Surface from '@/components/ui/Surface'
import type { ApiError } from '@/types/auth'
import type { SignResponse } from '@/types/game'

export const PENDING_SIGN_KEY = 'gts_pending_sign'

export default function Sign() {
  const { token = '' } = useParams()
  const { isAuthenticated, loading, loginWith42 } = useAuth()
  const reducedMotion = useReducedMotion()
  const [result, setResult] = useState<SignResponse | null>(null)
  const [error, setError] = useState('')
  const done = useRef(false)

  const gradient = useMemo(
    () => ({ preset: 'Prism' as const, speed: reducedMotion ? 0 : 18 }),
    [reducedMotion],
  )

  useEffect(() => {
    if (loading || done.current) return

    if (!isAuthenticated) {
      sessionStorage.setItem(PENDING_SIGN_KEY, token)
      loginWith42()
      return
    }

    done.current = true
    api
      .post<SignResponse>(ROUTES.game.sign, { token })
      .then(setResult)
      .catch((e: ApiError) => setError(e.message))
  }, [loading, isAuthenticated, token, loginWith42])

  return (
    <main className="auth">
      <AnimatedGradient config={gradient} noise={{ opacity: 0.35 }} />
      <div className="login-veil" aria-hidden="true" />

      <Surface as="section" className="auth-card">
        {(loading || (!result && !error)) && (
          <Loading label={loading ? 'Connexion' : 'Validation'} />
        )}

        {error && (
          <>
            <div className="auth-icon ko" aria-hidden="true">
              ✕
            </div>
            <h1 className="auth-title">Signature refusée</h1>
            <p className="auth-sub">{error}</p>
          </>
        )}

        {result && (
          <>
            <div className="auth-icon ok" aria-hidden="true">
              ✓
            </div>
            <h1 className="auth-title">C’est signé</h1>
            <p className="auth-sub">
              <span className="qr-target">{result.player?.login}</span> valide sa
              cible et récupère {result.bonus} essais.
            </p>
          </>
        )}

        <div className="auth-actions">
          <Link to="/" className="btn-glass">
            Aller au jeu
          </Link>
        </div>
      </Surface>
    </main>
  )
}
