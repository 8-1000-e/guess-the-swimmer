import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import AnimatedGradient from '@/components/ui/animated-gradient'

const ERRORS: Record<string, { title: string; hint: string }> = {
  invalid_state: {
    title: 'Session expirée',
    hint: 'La demande a mis trop de temps. Relance la connexion.',
  },
  ft_auth_failed: {
    title: 'Connexion refusée par 42',
    hint: "L'intra n'a pas validé la demande. Réessaie dans un instant.",
  },
  not_in_pool: {
    title: 'Tu n’es pas dans la piscine',
    hint: "Seuls les piscineux d'Angoulême du mois en cours peuvent jouer.",
  },
}

export default function Login() {
  const { loginWith42 } = useAuth()
  const [params] = useSearchParams()
  const reducedMotion = useReducedMotion()

  const error = ERRORS[params.get('error') ?? '']

  const gradient = useMemo(
    () => ({ preset: 'Prism' as const, speed: reducedMotion ? 0 : 18 }),
    [reducedMotion],
  )

  return (
    <main className="login">
      <AnimatedGradient config={gradient} noise={{ opacity: 0.35 }} />
      <div className="login-veil" aria-hidden="true" />

      <section className="login-card">
        <div className="login-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M2 17c2.2 0 2.2-1.6 4.4-1.6S8.6 17 10.8 17s2.2-1.6 4.4-1.6S17.4 17 19.6 17c1.4 0 1.9-.6 2.4-1.1M2 12c2.2 0 2.2-1.6 4.4-1.6S8.6 12 10.8 12s2.2-1.6 4.4-1.6S17.4 12 19.6 12c1.4 0 1.9-.6 2.4-1.1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="16" cy="6" r="2.2" fill="currentColor" />
          </svg>
        </div>

        <h1 className="login-title">
          Guess the <span className="accent">Swimmer</span>
        </h1>
        <p className="login-sub">
          Une cible par jour. Trouve son login, puis fais-lui signer ton QR code
          en vrai pour valider.
        </p>

        <div className="login-alert-slot" aria-live="polite">
          {error && (
            <div className="login-alert" role="alert">
              <strong>{error.title}</strong>
              <span>{error.hint}</span>
            </div>
          )}
        </div>

        <button type="button" className="login-btn" onClick={loginWith42}>
          <span className="login-btn-mark">42</span>
          Se connecter avec 42
        </button>

        <p className="login-foot">
          Piscine d’août 2026 · campus d’Angoulême
        </p>
      </section>
    </main>
  )
}
