import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import Avatar from '@/components/ui/Avatar'
import Loading from '@/components/ui/Loading'
import Stat from '@/components/ui/Stat'
import Surface from '@/components/ui/Surface'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import type { ApiError } from '@/types/auth'
import type { RoundStatus, UserStats } from '@/types/game'

const STATUS: Record<RoundStatus, string> = {
  playing: 'en cours',
  solved: 'à signer',
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
        {!stats && !error && <Loading />}

        {stats && (
          <>
            <header className="profile-head">
              <Avatar src={stats.ftPfpUrl} login={stats.login} size="lg" />
              <div>
                <h1 className="page-title">{stats.login}</h1>
                <p className="page-sub">{stats.campus ?? 'campus inconnu'}</p>
              </div>
            </header>

            <div className="stats">
              <Stat value={stats.validated} label="signés" highlight />
              <Stat value={stats.found} label="trouvés" />
              <Stat value={stats.attempts} label="essais" />
              <Stat value={stats.played} label="manches" />
            </div>

            <h2 className="section-title">Historique</h2>

            <Surface className="table-wrap">
              {stats.rounds.length === 0 ? (
                <p className="empty">Aucune manche jouée pour l’instant.</p>
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
                      <tr key={`${r.assignedOn}-${r.targetLogin ?? 'x'}`}>
                        <td className="mono muted">
                          {r.assignedOn.slice(0, 10)}
                        </td>
                        <td className="mono">{r.targetLogin ?? '········'}</td>
                        <td>
                          <span className={`badge ${r.status}`}>
                            {STATUS[r.status]}
                          </span>
                        </td>
                        <td className="num">{r.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Surface>
          </>
        )}
      </main>
    </AppShell>
  )
}
