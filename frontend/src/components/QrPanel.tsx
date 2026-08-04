import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
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

  if (error) return <p className="error-text">{error}</p>
  if (!qr) return <p className="hint mono">Génération du QR…</p>

  const url = `${window.location.origin}/sign/${qr.token}`

  return (
    <div className="qr-panel">
      <p className="qr-title">Fais signer ta cible</p>
      <div className="qr-frame">
        <QRCodeSVG value={url} size={188} bgColor="#ffffff" fgColor="#0b0d10" />
      </div>
      <p className="hint mono">
        Elle le scanne avec son téléphone, connectée à son compte 42.
      </p>
    </div>
  )
}
