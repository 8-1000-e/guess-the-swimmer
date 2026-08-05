import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import Avatar from '@/components/ui/Avatar'
import Loading from '@/components/ui/Loading'
import Surface from '@/components/ui/Surface'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import { useAuth } from '@/auth/useAuth'
import type { ApiError } from '@/types/auth'
import type { LeaderboardRow } from '@/types/game'

export default function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<LeaderboardRow[]>(ROUTES.game.leaderboard)
      .then(setRows)
      .catch((e: ApiError) => setError(e.message))
  }, [])

  return (
    <AppShell>
      <main className="page">
        <header className="page-head">
          <h1 className="page-title">Classement</h1>
          <p className="page-sub">
            Le plus de cibles signées d’abord, puis le moins d’essais.
          </p>
        </header>

        {error && <p className="error-text">{error}</p>}
        {!rows && !error && <Loading />}

        {rows && (
          <Surface className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Joueur</th>
                  <th className="num">Signés</th>
                  <th className="num">Trouvés</th>
                  <th className="num">Essais</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.login}
                    className={r.login === user?.login ? 'is-me' : ''}
                  >
                    <td>
                      <span className={`rank ${r.rank <= 3 ? 'top' : ''}`}>
                        {String(r.rank).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/u/${r.login}`} className="player">
                        <Avatar src={r.ftPfpUrl} login={r.login} size="sm" />
                        {r.login}
                      </Link>
                    </td>
                    <td className="num">{r.validated}</td>
                    <td className="num">{r.found}</td>
                    <td className="num muted">{r.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <p className="empty">Personne n’a encore joué.</p>
            )}
          </Surface>
        )}
      </main>
    </AppShell>
  )
}
