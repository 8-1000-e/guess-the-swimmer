import Surface from './ui/Surface'
import type { Target } from '@/types/game'

export default function TargetList({ targets }: { targets: Target[] }) {
  const left = targets.filter((t) => !t.validated).length

  return (
    <Surface as="aside" className="targets">
      <div className="targets-head">
        <h2 className="targets-title">Reste à valider</h2>
        <span className="targets-count">{left}</span>
      </div>

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
            <li key={t.login} className={`target ${state}`.trim()}>
              {t.login}
            </li>
          )
        })}
      </ul>

      <p className="legend">
        <span>
          <i className="dot tried" /> tenté aujourd’hui
        </span>
        <span>
          <i className="dot pending" /> à faire signer
        </span>
        <span>
          <i className="dot done" /> validé
        </span>
      </p>
    </Surface>
  )
}
