import { intraUrl } from '@/api/routes'
import Surface from './ui/Surface'
import type { TargetIdentity } from '@/types/game'

interface SignedCardProps {
  target: TargetIdentity | null
  signBonus: number
}

export default function SignedCard({ target, signBonus }: SignedCardProps) {
  const name = target?.displayName?.split(' ')[0] ?? target?.login ?? 'ta cible'

  return (
    <Surface as="section" className="signed-card">
      <span className="signed-mark" aria-hidden="true">
        ✓
      </span>

      <div className="signed-body">
        <p className="signed-step mono">Manche validée</p>
        <h2 className="signed-title">
          {name} a signé
        </h2>
        <p className="signed-text">
          Rencontre confirmée, {signBonus} essai{signBonus > 1 ? 's' : ''} en
          moins sur ton total. {target?.displayName ?? target?.login} ne
          retombera plus comme cible.
        </p>
        <p className="hint">Nouvelle cible demain matin.</p>
      </div>

      <a
        className="signed-face"
        href={target ? intraUrl(target.login) : '#'}
        target="_blank"
        rel="noreferrer"
        title={`Voir ${target?.login} sur l’intra`}
      >
        {target?.ftPfpUrl ? (
          <img src={target.ftPfpUrl} alt="" />
        ) : (
          <span className="signed-face-empty" aria-hidden="true" />
        )}
      </a>
    </Surface>
  )
}
