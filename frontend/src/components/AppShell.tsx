import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import Avatar from './ui/Avatar'

const ICONS = {
  game: (
    <path
      d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
    />
  ),
  board: (
    <path
      d="M5 20v-7M12 20V4M19 20v-11"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.7 9.6a2.4 2.4 0 114.6 1c0 1.4-1.9 1.6-1.9 3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="12.2" cy="16.5" r="0.9" fill="currentColor" />
    </>
  ),
  faces: (
    <>
      <circle cx="8.5" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 18.5c.8-2.4 2.6-3.6 5-3.6s4.2 1.2 5 3.6M13.5 18.5c.8-2.4 2.6-3.6 5-3.6 1 0 1.9.2 2.6.6"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.8 20c1.1-3.5 3.8-5.3 7.2-5.3s6.1 1.8 7.2 5.3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      {children}
    </svg>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <aside className="sidebar">
        <p className="logo">
          guess the <span>login</span>
        </p>

        <nav className="nav">
          <NavLink to="/" end className="nav-link">
            <Icon>{ICONS.game}</Icon>
            Jeu
          </NavLink>
          <NavLink to="/trombinoscope" className="nav-link">
            <Icon>{ICONS.faces}</Icon>
            Trombinoscope
          </NavLink>
          <NavLink to="/leaderboard" className="nav-link">
            <Icon>{ICONS.board}</Icon>
            Classement
          </NavLink>
          {user && (
            <NavLink to={`/u/${user.login}`} className="nav-link">
              <Icon>{ICONS.user}</Icon>
              Profil
            </NavLink>
          )}
        </nav>

        <NavLink to="/comment-ca-marche" className="nav-link nav-foot">
          <Icon>{ICONS.help}</Icon>
          Comment ça marche
        </NavLink>

        <div className="side-user">
          {user && <Avatar src={user.ftPfpUrl} login={user.login} />}
          <span className="side-login mono">{user?.login}</span>
          <button
            type="button"
            className="side-out"
            onClick={() => logout()}
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M15 17l4-5-4-5M19 12H9M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h5"
                stroke="currentColor"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </aside>

      <div className="app-main">{children}</div>
    </div>
  )
}
