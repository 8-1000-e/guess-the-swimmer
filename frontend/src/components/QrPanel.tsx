import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/api/client'
import { intraUrl, ROUTES } from '@/api/routes'
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
        <a
          className="qr-who"
          href={target ? intraUrl(target.login) : '#'}
          target="_blank"
          rel="noreferrer"
          title={`Voir ${target?.login} sur l’intra`}
        >
          <span className={`qr-portrait ${online ? 'online' : ''}`}>
            {target?.ftPfpUrl ? (
              <img src={target.ftPfpUrl} alt="" />
            ) : (
              <span className="qr-portrait-empty" aria-hidden="true" />
            )}
            <span className="qr-dot" aria-hidden="true" />
          </span>

          <div className="qr-id">
            <p className="qr-name">
              {target?.displayName ?? target?.login}
              <svg
                className="qr-out"
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>
            <p className="qr-login mono">{target?.login}</p>
            <p className={`qr-where ${online ? 'on' : 'off'}`}>
              <span className="qr-where-dot" aria-hidden="true" />
              {online ? 'En cluster' : 'Hors ligne'}
              {online && <span className="qr-post mono">{target?.location}</span>}
            </p>
          </div>
        </a>

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
