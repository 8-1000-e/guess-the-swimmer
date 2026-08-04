import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { tokenStore } from '@/auth/tokenStore'

export default function AuthCallback() {
  const { setTokens, fetchMe } = useAuth()
  const navigate = useNavigate()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    const hash = window.location.hash.replace(/^#/, '')
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (!access_token || !refresh_token) {
      navigate('/login?error=ft_auth_failed', { replace: true })
      return
    }

    setTokens({ access_token, refresh_token })
    history.replaceState(null, '', window.location.pathname)

    fetchMe()
      .then(() => navigate('/', { replace: true }))
      .catch(() => {
        tokenStore.clear()
        navigate('/login?error=ft_auth_failed', { replace: true })
      })
  }, [setTokens, fetchMe, navigate])

  return (
    <main className="auth">
      <p className="auth-sub">Connexion en cours…</p>
    </main>
  )
}
