import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

const ERRORS: Record<string, string> = {
  invalid_state: 'Session OAuth invalide, réessaie.',
  ft_auth_failed: 'La connexion avec 42 a échoué.',
  not_in_pool: "Ton login n'est pas dans la piscine d'août 2026.",
  account_disabled: 'Ton compte a été désactivé.',
}

export default function Login() {
  const { loginWith42 } = useAuth()
  const [params] = useSearchParams()
  const error = ERRORS[params.get('error') ?? '']

  return (
    <main className="auth">
      <div className="auth-card">
        <h1 className="auth-title">
          Guess the <span className="accent">Swimmer</span>
        </h1>
        <p className="auth-sub">// piscine august 2026</p>

        {error && <p className="error-text">{error}</p>}

        <button type="button" className="btn btn-42" onClick={loginWith42}>
          <span className="mark-42">42</span>
          Continuer avec 42
        </button>

        <p className="auth-footer">
          Connecte-toi avec ton compte intra pour jouer.
        </p>
      </div>
    </main>
  )
}
