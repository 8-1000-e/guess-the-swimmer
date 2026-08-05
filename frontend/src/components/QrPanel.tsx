import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import Surface from './ui/Surface'
import type { ApiError } from '@/types/auth'
import type { QrToken, TargetIdentity } from '@/types/game'

export default function QrPanel({ target }: { target: TargetIdentity | null }) {
  const [qr, setQr] = useState<QrToken | null>(null)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setQr(await api.get<QrToken>(ROUTES.game.qr))
      setError('')
    } catch (e) {
      setError((e as ApiError).message)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 30_000)
    return () => clearInterval(id)
  }, [refresh])

  const name = target?.displayName?.split(' ')[0] ?? target?.login ?? 'la cible'
  const online = Boolean(target?.location)

  return (
    <Surface as="section" className="qr-card">
      <ol className="steps">
        <li className="step done">
          <span className="step-mark" aria-hidden="true">
            ✓
          </span>
          Login trouvé
        </li>
        <li className="step-line" aria-hidden="true" />
        <li className="step now">
          <span className="step-mark">2</span>
          Rencontre en vrai
        </li>
      </ol>

      <div className="qr-body">
        <div className="qr-who">
          <span className={`qr-portrait ${online ? 'online' : ''}`}>
            {target?.ftPfpUrl ? (
              <img src={target.ftPfpUrl} alt="" />
            ) : (
              <span className="qr-portrait-empty" aria-hidden="true" />
            )}
            <span className="qr-dot" aria-hidden="true" />
          </span>

          <div className="qr-id">
            <p className="qr-name">{target?.displayName ?? target?.login}</p>
            <p className="qr-login mono">{target?.login}</p>
            <p className={`qr-where mono ${online ? 'on' : 'off'}`}>
              {online ? `en cluster · poste ${target?.location}` : 'hors ligne'}
            </p>
          </div>
        </div>

        <p className="qr-why">
          Deviner le login ne rapporte rien tant que <strong>{name}</strong> ne
          l’a pas confirmé. Va le voir et fais-lui scanner ce code : c’est sa
          signature qui valide la rencontre.
        </p>

        <p className="qr-tip mono">
          {online
            ? `Poste ${target?.location} · il y est en ce moment`
            : 'Personne en cluster · garde le code pour plus tard'}
        </p>
      </div>

      <div className="qr-code">
        <div className="qr-frame">
          {error ? (
            <p className="qr-fallback">{error}</p>
          ) : qr ? (
            <QRCodeSVG
              value={`${window.location.origin}/sign/${qr.token}`}
              size={168}
              level="M"
            />
          ) : (
            <span className="qr-skeleton" />
          )}
        </div>
        <p className="qr-caption">
          À scanner par <strong>{name}</strong>
        </p>
        <p className="hint">Nouveau code toutes les 30 s</p>
      </div>
    </Surface>
  )
}
