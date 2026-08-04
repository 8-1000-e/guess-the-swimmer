import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
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
        <h2 className="page-title">Classement du mois</h2>

        {error && <p className="error-text">{error}</p>}
        {!rows && !error && <p className="hint mono">Chargement…</p>}

        {rows && (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Joueur</th>
                <th className="num">Signés</th>
                <th className="num">Trouvés</th>
                <th className="num">Essais</th>
                <th className="num">Manches</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.login}
                  className={r.login === user?.login ? 'is-me' : ''}
                >
                  <td className="mono muted">{r.rank}</td>
                  <td>
                    <Link to={`/u/${r.login}`} className="player">
                      {r.ftPfpUrl && (
                        <img className="avatar sm" src={r.ftPfpUrl} alt="" />
                      )}
                      {r.login}
                    </Link>
                  </td>
                  <td className="num mono">{r.validated}</td>
                  <td className="num mono">{r.found}</td>
                  <td className="num mono">{r.attempts}</td>
                  <td className="num mono muted">{r.played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="hint mono">
          Cibles signées d'abord, puis trouvées, puis le moins d'essais.
        </p>
      </main>
    </AppShell>
  )
}
