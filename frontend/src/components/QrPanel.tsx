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

  return (
    <Surface as="section" className="qr-card">
      <div className="qr-side">
        <p className="qr-step mono">Reste à la faire signer</p>

        <div className="qr-who">
          {target?.ftPfpUrl ? (
            <img className="qr-face" src={target.ftPfpUrl} alt="" />
          ) : (
            <span className="qr-face qr-face-empty" aria-hidden="true" />
          )}
          <div className="qr-who-text">
            <p className="qr-name">{target?.displayName ?? target?.login}</p>
            <p className="qr-login mono">{target?.login}</p>
          </div>
        </div>

        {target && (
          <p className={`qr-where mono ${target.location ? 'on' : 'off'}`}>
            <span className="pulse" aria-hidden="true" />
            {target.location ? `poste ${target.location}` : 'hors ligne'}
          </p>
        )}

        <p className="qr-lead">
          {target?.location
            ? 'Elle est en cluster en ce moment. Va la voir et fais-lui scanner le code.'
            : 'Elle n’est sur aucun poste. Garde le code sous la main pour quand tu la croiseras.'}
        </p>
      </div>

      <div className="qr-side qr-side-code">
        <div className="qr-frame">
          {error ? (
            <p className="qr-fallback">{error}</p>
          ) : qr ? (
            <QRCodeSVG
              value={`${window.location.origin}/sign/${qr.token}`}
              size={172}
              level="M"
            />
          ) : (
            <span className="qr-skeleton" />
          )}
        </div>
        <p className="hint">Le code tourne toutes les 30 s</p>
      </div>
    </Surface>
  )
}
