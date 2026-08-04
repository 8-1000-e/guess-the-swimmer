import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import type { ApiError } from '@/types/auth'
import type { RoundStatus, UserStats } from '@/types/game'

const STATUS_LABEL: Record<RoundStatus, string> = {
  playing: 'en cours',
  solved: 'trouvé, non signé',
  validated: 'validé',
  expired: 'expiré',
}

export default function Profile() {
  const { login = '' } = useParams()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setStats(null)
    setError('')
    api
      .get<UserStats>(ROUTES.game.user(login))
      .then(setStats)
      .catch((e: ApiError) => setError(e.message))
  }, [login])

  return (
    <AppShell>
      <main className="page">
        {error && <p className="error-text">{error}</p>}
        {!stats && !error && <p className="hint mono">Chargement…</p>}

        {stats && (
          <>
            <header className="profile-head">
              {stats.ftPfpUrl && (
                <img className="avatar lg" src={stats.ftPfpUrl} alt="" />
              )}
              <div>
                <h2 className="page-title">{stats.login}</h2>
                <p className="hint mono">{stats.campus ?? '—'}</p>
              </div>
            </header>

            <div className="stats">
              <div className="stat">
                <span className="stat-value">{stats.validated}</span>
                <span className="stat-label mono">signés</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.found}</span>
                <span className="stat-label mono">trouvés</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.attempts}</span>
                <span className="stat-label mono">essais</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.played}</span>
                <span className="stat-label mono">manches</span>
              </div>
            </div>

            <h3 className="section-title mono">Historique</h3>
            {stats.rounds.length === 0 ? (
              <p className="hint mono">Aucune manche jouée.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Jour</th>
                    <th>Cible</th>
                    <th>Statut</th>
                    <th className="num">Essais</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.rounds.map((r) => (
                    <tr key={`${r.assignedOn}-${r.targetLogin}`}>
                      <td className="mono muted">
                        {r.assignedOn.slice(0, 10)}
                      </td>
                      <td className="mono">
                        {r.targetLogin ?? '—'}
                      </td>
                      <td className={`status ${r.status}`}>
                        {STATUS_LABEL[r.status]}
                      </td>
                      <td className="num mono">{r.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </main>
    </AppShell>
  )
}
