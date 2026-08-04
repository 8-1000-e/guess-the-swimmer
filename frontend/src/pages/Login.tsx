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
    hint: 'Seuls les piscineux d’Angoulême du mois en cours peuvent jouer.',
  },
}

const DEMO = [
  { letter: 'p', state: 'correct' },
  { letter: 'i', state: 'absent' },
  { letter: 's', state: 'present' },
  { letter: 'c', state: 'absent' },
  { letter: 'i', state: 'correct' },
  { letter: 'n', state: 'absent' },
  { letter: 'e', state: 'correct' },
]

const STEPS = [
  {
    title: 'Une cible par jour',
    text: 'Chaque matin, le login d’un autre piscineux à deviner.',
  },
  {
    title: 'Va lui parler',
    text: 'Trouver le login ne suffit pas. Il faut retrouver la personne derrière.',
  },
  {
    title: 'Fais signer ton QR',
    text: 'Elle le scanne avec son téléphone, ta cible est validée.',
  },
]

export default function Login() {
  const { loginWith42 } = useAuth()
  const [params] = useSearchParams()
  const reducedMotion = useReducedMotion()

  const error = ERRORS[params.get('error') ?? '']

  const gradient = useMemo(
    () => ({ preset: 'Prism' as const, speed: reducedMotion ? 0 : 16 }),
    [reducedMotion],
  )

  return (
    <main className="login">
      <AnimatedGradient config={gradient} noise={{ opacity: 0.35 }} />
      <div className="login-veil" aria-hidden="true" />

      <section className="login-card">
        <p className="login-eyebrow mono">Piscine août 2026 · Angoulême</p>

        <h1 className="login-title">
          Apprends à connaître
          <br />
          <span className="accent">ta piscine.</span>
        </h1>

        <p className="login-lead">
          Vous êtes 41 et vous ne vous connaissez pas encore. Ce jeu vous force
          à vous parler : impossible de marquer un point sans aller voir
          quelqu’un en vrai.
        </p>

        <div className="login-demo" aria-hidden="true">
          {DEMO.map((c, i) => (
            <span
              key={i}
              className={`login-tile ${c.state}`}
              style={{ animationDelay: `${0.35 + i * 0.06}s` }}
            >
              {c.letter}
            </span>
          ))}
        </div>
        <p className="login-legend mono">
          <span className="sw correct" /> bien placé
          <span className="sw present" /> ailleurs
          <span className="sw absent" /> absent
        </p>

        <ol className="login-steps">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="login-step"
              style={{ animationDelay: `${0.5 + i * 0.09}s` }}
            >
              <span className="login-step-num mono">{i + 1}</span>
              <span className="login-step-body">
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </span>
            </li>
          ))}
        </ol>

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
          Ton login intra doit être dans la piscine du mois.
        </p>
      </section>
    </main>
  )
}
