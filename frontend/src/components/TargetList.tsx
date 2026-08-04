import type { Target } from '@/types/game'

export default function TargetList({ targets }: { targets: Target[] }) {
  const left = targets.filter((t) => !t.validated).length

  return (
    <aside className="targets">
      <h2 className="targets-title mono">
        Cibles <span className="muted">{left} restantes</span>
      </h2>
      <ul className="targets-list">
        {targets.map((t) => {
          const state = t.validated
            ? 'done'
            : t.guessed
              ? 'tried'
              : t.solved
                ? 'pending'
                : ''
          return (
            <li key={t.login} className={`target ${state}`}>
              {t.login}
            </li>
          )
        })}
      </ul>
      <p className="targets-legend mono">
        <span className="dot tried" /> déjà tenté aujourd'hui
        <span className="dot pending" /> en attente de signature
        <span className="dot done" /> validé
      </p>
    </aside>
  )
}
