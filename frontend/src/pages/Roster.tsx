import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/AppShell'
import Loading from '@/components/ui/Loading'
import { api } from '@/api/client'
import { intraUrl, ROUTES } from '@/api/routes'
import type { ApiError } from '@/types/auth'
import { toFrench } from '@/api/errors'
import { useToast } from '@/toast/useToast'
import type { RosterEntry } from '@/types/game'

export default function Roster() {
  const { push } = useToast()
  const [people, setPeople] = useState<RosterEntry[] | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    api
      .get<RosterEntry[]>(ROUTES.game.roster)
      .then(setPeople)
      .catch((e: ApiError) => {
        const { title, detail } = toFrench(e)
        setError(title)
        push('error', title, detail)
      })
  }, [push])

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
                <a
                  href={intraUrl(p.login)}
                  target="_blank"
                  rel="noreferrer"
                  className={`face ${p.met ? 'is-met' : ''} ${p.me ? 'is-me' : ''}`}
                  title={`Voir ${p.login} sur l’intra`}
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
                    {p.me ? 'toi' : p.staff ? 'staff' : (p.displayName ?? '···')}
                  </span>
                  <span className="face-out" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
                      <path
                        d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  )
}
