import { useEffect, useMemo, useRef, useState } from 'react'
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

const SIZE = 8

export default function Login() {
  const { loginWith42 } = useAuth()
  const [params] = useSearchParams()
  const reducedMotion = useReducedMotion()

  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const error = ERRORS[params.get('error') ?? '']

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const gradient = useMemo(
    () => ({ preset: 'Prism' as const, speed: reducedMotion ? 0 : 18 }),
    [reducedMotion],
  )

  return (
    <main className="login">
      <AnimatedGradient config={gradient} noise={{ opacity: 0.35 }} />
      <div className="login-veil" aria-hidden="true" />

      <div className="login-col">
        <p className="login-brand">guess the swimmer</p>

        <div
          className={`login-field ${focused ? 'is-focused' : ''}`}
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            className="login-input"
            value={value}
            onChange={(e) =>
              setValue(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z-]/g, '')
                  .slice(0, SIZE),
              )
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={SIZE}
            spellCheck={false}
            autoComplete="off"
            aria-label="Essaie un login de ta piscine"
          />

          <div className="login-slots" aria-hidden="true">
            {Array.from({ length: SIZE }, (_, i) => (
              <span
                key={i}
                className={`login-slot ${value[i] ? 'is-filled' : ''} ${
                  focused && i === value.length ? 'is-active' : ''
                }`}
                style={{ animationDelay: `${0.12 + i * 0.045}s` }}
              >
                {value[i] ?? '?'}
              </span>
            ))}
          </div>
        </div>

        <h1 className="login-title">
          Découvre les gens
          <br />
          <span className="login-title-accent">de ta piscine.</span>
        </h1>

        <p className="login-lead">
          Chaque jour, un login à deviner en huit caractères. Puis il faut aller
          trouver la personne derrière pour qu’elle valide.
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
