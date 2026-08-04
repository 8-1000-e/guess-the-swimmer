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
    hint: 'L’intra n’a pas validé la demande. Réessaie dans un instant.',
  },
  not_in_pool: {
    title: 'Tu n’es pas dans la piscine',
    hint: 'Seuls les piscineux d’Angoulême du mois en cours peuvent jouer.',
  },
}

const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7]

export default function Login() {
  const { loginWith42 } = useAuth()
  const [params] = useSearchParams()
  const reducedMotion = useReducedMotion()

  const error = ERRORS[params.get('error') ?? '']

  const gradient = useMemo(
    () =>
      ({
        preset: 'custom',
        color1: '#050A10',
        color2: '#1B4B6B',
        color3: '#7DE2D1',
        rotation: -12,
        proportion: 44,
        scale: 0.34,
        speed: reducedMotion ? 0 : 11,
        distortion: 8,
        swirl: 55,
        swirlIterations: 8,
        softness: 100,
        offset: 0,
        shape: 'Stripes',
        shapeSize: 62,
      }) as const,
    [reducedMotion],
  )

  return (
    <main className="login">
      <AnimatedGradient config={gradient} noise={{ opacity: 0.3 }} />
      <div className="login-depth" aria-hidden="true" />

      <div className="login-col">
        <p className="login-brand">guess the swimmer</p>

        <div className="login-hero">
          <div className="login-slots" aria-hidden="true">
            {SLOTS.map((i) => (
              <span
                key={i}
                className="login-slot"
                style={{ animationDelay: `${0.12 + i * 0.045}s` }}
              >
                ?
              </span>
            ))}
            <span className="login-sweep" />
          </div>
        </div>

        <h1 className="login-title">
          Huit caractères.
          <br />
          <span className="login-title-dim">Une personne.</span>
        </h1>

        <p className="login-lead">
          Chaque jour, un login de ta piscine à deviner — puis à retrouver en
          vrai pour qu’elle valide ta trouvaille.
        </p>

        <div className="login-alert-slot" aria-live="polite">
          {error && (
            <div className="login-alert" role="alert">
              <strong>{error.title}</strong>
              <span>{error.hint}</span>
            </div>
          )}
        </div>

        <button type="button" className="login-cta" onClick={loginWith42}>
          <span className="login-cta-mark">42</span>
          Se connecter avec 42
        </button>

        <p className="login-meta">Août 2026 · Angoulême · une cible par jour</p>
      </div>
    </main>
  )
}
