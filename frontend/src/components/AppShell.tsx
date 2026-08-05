import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import Avatar from './ui/Avatar'

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <header className="topbar">
        <p className="logo">
          guess the <span>swimmer</span>
        </p>

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
          {user && <Avatar src={user.ftPfpUrl} login={user.login} />}
          <span className="mono">{user?.login}</span>
          <button type="button" className="btn-glass" onClick={() => logout()}>
            Quitter
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}
