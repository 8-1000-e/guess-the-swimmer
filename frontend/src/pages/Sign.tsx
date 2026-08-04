import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import { useAuth } from '@/auth/useAuth'
import type { ApiError } from '@/types/auth'
import type { SignResponse } from '@/types/game'

export const PENDING_SIGN_KEY = 'gts_pending_sign'

export default function Sign() {
  const { token = '' } = useParams()
  const { isAuthenticated, loading, loginWith42 } = useAuth()
  const [result, setResult] = useState<SignResponse | null>(null)
  const [error, setError] = useState('')
  const done = useRef(false)

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
      <div className="auth-card">
        <h1 className="auth-title">
          Guess the <span className="accent">Swimmer</span>
        </h1>

        {loading && <p className="auth-sub">Connexion…</p>}
        {!loading && !result && !error && (
          <p className="auth-sub">Validation en cours…</p>
        )}

        {error && <p className="error-text">{error}</p>}

        {result && (
          <>
            <p className="sign-ok">Signé</p>
            <p className="auth-sub">
              {result.player?.login} valide sa cible, {result.bonus} essais
              remboursés.
            </p>
          </>
        )}

        <Link to="/" className="btn">
          Retour au jeu
        </Link>
      </div>
    </main>
  )
}
