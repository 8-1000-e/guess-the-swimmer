import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import Surface from './ui/Surface'
import Loading from './ui/Loading'
import type { ApiError } from '@/types/auth'
import type { QrToken } from '@/types/game'

export default function QrPanel() {
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

  if (error)
    return (
      <Surface className="qr-panel">
        <p className="error-text">{error}</p>
      </Surface>
    )

  if (!qr)
    return (
      <Surface className="qr-panel">
        <Loading label="Génération du QR" />
      </Surface>
    )

  return (
    <Surface className="qr-panel">
      <p className="qr-title">Fais-le scanner à ta cible</p>
      <div className="qr-frame">
        <QRCodeSVG value={`${window.location.origin}/sign/${qr.token}`} size={184} />
      </div>
      <p className="hint">
        Elle le scanne depuis son téléphone, connectée à son compte 42.
      </p>
    </Surface>
  )
}
