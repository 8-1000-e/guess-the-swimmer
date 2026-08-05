import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import AnimatedGradient from '@/components/ui/animated-gradient'
import type { LetterState } from '@/types/game'

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

const DEMO_SECRET = 'natation'
const SIZE = DEMO_SECRET.length

function score(guess: string, target: string): LetterState[] {
  const states: LetterState[] = [...guess].map(() => 'absent')
  const left = new Map<string, number>()

  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) states[i] = 'correct'
    else left.set(target[i], (left.get(target[i]) ?? 0) + 1)
  }

  for (let i = 0; i < states.length; i++) {
    if (states[i] === 'correct') continue
    const n = left.get(guess[i]) ?? 0
    if (n > 0) {
      states[i] = 'present'
      left.set(guess[i], n - 1)
    }
  }

  return states
}

export default function Login() {
  const { loginWith42 } = useAuth()
  const [params] = useSearchParams()
  const reducedMotion = useReducedMotion()

  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [states, setStates] = useState<LetterState[] | null>(null)
  const [feedback, setFeedback] = useState('')
  const [fading, setFading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])

  const error = ERRORS[params.get('error') ?? '']

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function reset() {
    setValue('')
    setStates(null)
    setFeedback('')
    setFading(false)
  }

  const gradient = useMemo(
    () => ({ preset: 'Prism' as const, speed: reducedMotion ? 0 : 18 }),
    [reducedMotion],
  )

  function change(next: string) {
    clearTimers()
    setFading(false)
    setValue(next.toLowerCase().replace(/[^a-z-]/g, '').slice(0, SIZE))
    setStates(null)
    setFeedback('')
  }

  function submit() {
    if (value.length < SIZE) {
      setFeedback('Remplis les huit cases pour essayer.')
      return
    }

    clearTimers()
    setStates(score(value, DEMO_SECRET))
    setFeedback(
      value === DEMO_SECRET
        ? 'Bien joué. Dans le vrai jeu, il reste à la faire signer.'
        : 'Connecte-toi pour deviner une vraie cible.',
    )

    if (reducedMotion) {
      timers.current.push(window.setTimeout(reset, 3000))
      return
    }

    timers.current.push(window.setTimeout(() => setFading(true), 3000))
    timers.current.push(window.setTimeout(reset, 3700))
  }

  return (
    <main className="login">
      <AnimatedGradient config={gradient} noise={{ opacity: 0.35 }} />
      <div className="login-veil" aria-hidden="true" />

      <div className="login-col">
        <p className="login-brand">guess the swimmer</p>

        <div
          className={`login-field ${fading ? 'is-fading' : ''}`}
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            className="login-input"
            value={value}
            onChange={(e) => change(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={SIZE}
            spellCheck={false}
            autoComplete="off"
            aria-label="Essaie un mot pour voir les couleurs"
          />

          <div className="login-slots" aria-hidden="true">
            {Array.from({ length: SIZE }, (_, i) => {
              const active = focused && !states && i === value.length
              return (
                <span
                  key={i}
                  className={[
                    'login-slot',
                    value[i] ? 'is-filled' : '',
                    active ? 'is-active' : '',
                    states ? states[i] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ animationDelay: `${0.12 + i * 0.045}s` }}
                >
                  {value[i] ?? (active ? '' : '?')}
                </span>
              )
            })}
          </div>
        </div>

        <p className="login-feedback mono" aria-live="polite">
          {feedback || 'Tape un login puis Entrée pour voir les couleurs.'}
        </p>

        <h1 className="login-title">
          Découvre les gens
          <br />
          <span className="login-title-accent">de ta piscine.</span>
        </h1>

        <p className="login-lead">
          Chaque jour, le login d’un autre piscineux à deviner. Deviner ne
          suffit pas : il faut aller lui parler pour qu’il valide. En un mois,
          tu les auras tous rencontrés.
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

        <p className="login-meta">Août 2026 · Angoulême</p>
      </div>
    </main>
  )
}
