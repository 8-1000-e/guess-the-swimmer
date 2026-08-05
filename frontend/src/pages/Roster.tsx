import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import Loading from '@/components/ui/Loading'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import type { ApiError } from '@/types/auth'
import type { RosterEntry } from '@/types/game'

export default function Roster() {
  const [people, setPeople] = useState<RosterEntry[] | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    api
      .get<RosterEntry[]>(ROUTES.game.roster)
      .then(setPeople)
      .catch((e: ApiError) => setError(e.message))
  }, [])

  const shown = useMemo(() => {
    if (!people) return []
    const q = query.trim().toLowerCase()
    if (!q) return people
    return people.filter(
      (p) =>
        p.login.includes(q) ||
        (p.displayName ?? '').toLowerCase().includes(q),
    )
  }, [people, query])

  const met = people?.filter((p) => p.met).length ?? 0
  const swimmers = people?.filter((p) => !p.staff).length ?? 0

  return (
    <AppShell>
      <main className="page page-wide">
        <header className="page-head roster-head">
          <div>
            <h1 className="page-title">Trombinoscope</h1>
            <p className="page-sub">
              {swimmers} piscineux · {met} rencontré{met > 1 ? 's' : ''}
            </p>
          </div>

          <input
            className="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un login ou un nom"
            aria-label="Chercher quelqu’un"
          />
        </header>

        {error && <p className="error-text">{error}</p>}
        {!people && !error && <Loading />}

        {people && shown.length === 0 && (
          <p className="empty">Personne ne correspond à « {query} ».</p>
        )}

        {people && shown.length > 0 && (
          <ul className="roster">
            {shown.map((p) => (
              <li key={p.login}>
                <Link
                  to={`/u/${p.login}`}
                  className={`face ${p.met ? 'is-met' : ''} ${p.me ? 'is-me' : ''}`}
                >
                  <span className="face-photo">
                    {p.ftPfpUrl ? (
                      <img src={p.ftPfpUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="face-initial">{p.login.slice(0, 2)}</span>
                    )}
                    {p.met && (
                      <span className="face-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </span>

                  <span className="face-login mono">{p.login}</span>
                  <span className="face-name">
                    {p.me ? 'toi' : p.staff ? 'staff' : (p.displayName ?? '—')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  )
}
