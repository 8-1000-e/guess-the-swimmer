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
import type { NeverPlayed, RoundStatus, UserStats } from '@/types/game'

const STATUS: Record<RoundStatus, string> = {
  playing: 'en cours',
  solved: 'à signer',
  validated: 'validé',
  expired: 'expiré',
}

function neverPlayedOf(e: ApiError): NeverPlayed | null {
  const p = e.payload as NeverPlayed | undefined
  return p?.code === 'NEVER_PLAYED' ? p : null
}

export default function Profile() {
  const { login = '' } = useParams()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [absent, setAbsent] = useState<NeverPlayed | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setStats(null)
    setAbsent(null)
    setError('')
    api
      .get<UserStats>(ROUTES.game.user(login))
      .then(setStats)
      .catch((e: ApiError) => {
        const np = neverPlayedOf(e)
        if (np) setAbsent(np)
        else setError(`Aucun joueur ne s’appelle « ${login} ».`)
      })
  }, [login])

  return (
    <AppShell>
      <main className="page">
        {error && <p className="error-text">{error}</p>}
        {!stats && !absent && !error && <Loading />}

        {absent && (
          <>
            <header className="profile-head">
              <Avatar src={absent.ftPfpUrl} login={absent.login} size="lg" />
              <div>
                <h1 className="page-title">{absent.login}</h1>
                <p className="page-sub">{absent.displayName ?? '—'}</p>
              </div>
            </header>

            <Surface className="notice">
              <p className="notice-title">Pas encore de compte</p>
              <p className="notice-text">
                {absent.staff
                  ? 'Cette personne fait partie du staff et ne s’est jamais connectée au jeu.'
                  : 'Cette personne est bien dans la piscine, mais ne s’est jamais connectée. Elle peut quand même te tomber comme cible — et elle pourra signer ton QR dès sa première connexion.'}
              </p>
            </Surface>
          </>
        )}

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
