import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo">
          Guess the <span className="accent">Swimmer</span>
        </h1>

        <nav className="nav">
          <NavLink to="/" end className="nav-link">
            Jeu
          </NavLink>
          <NavLink to="/leaderboard" className="nav-link">
            Classement
          </NavLink>
          {user && (
            <NavLink to={`/u/${user.login}`} className="nav-link">
              Profil
            </NavLink>
          )}
        </nav>

        <div className="topbar-right">
          {user?.ftPfpUrl && (
            <img className="avatar" src={user.ftPfpUrl} alt="" />
          )}
          <span className="mono">{user?.login}</span>
          <button type="button" className="btn-ghost" onClick={() => logout()}>
            Déconnexion
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}
