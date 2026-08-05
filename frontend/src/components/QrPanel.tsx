import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import Surface from './ui/Surface'
import type { ApiError } from '@/types/auth'
import type { QrToken, TargetIdentity } from '@/types/game'

interface QrPanelProps {
  target: TargetIdentity | null
  signBonus: number
}

export default function QrPanel({ target, signBonus }: QrPanelProps) {
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

  const name = target?.displayName?.split(' ')[0] ?? target?.login ?? 'ta cible'
  const online = Boolean(target?.location)

  return (
    <Surface as="section" className="qr-card">
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
            <p className={`qr-where ${online ? 'on' : 'off'}`}>
              {online ? `En cluster · poste ${target?.location}` : 'Hors ligne'}
            </p>
          </div>
        </div>

        <p className="qr-why">
          <strong>{name}</strong> compte déjà dans tes trouvés. Sa signature y
          ajoute le point qui départage le classement, te rembourse {signBonus}{' '}
          essais et clôt cette cible pour de bon — sinon elle pourra retomber un
          autre jour.
        </p>
      </div>

      <div className="qr-code">
        <div className="qr-frame">
          {error ? (
            <p className="qr-fallback">{error}</p>
          ) : qr ? (
            <QRCodeSVG
              value={`${window.location.origin}/sign/${qr.token}`}
              size={158}
              level="M"
            />
          ) : (
            <span className="qr-skeleton" />
          )}
        </div>
        <p className="qr-caption">
          À faire scanner par <strong>{name}</strong>
        </p>
        <p className="hint">Nouveau code toutes les 30 s</p>
      </div>
    </Surface>
  )
}
