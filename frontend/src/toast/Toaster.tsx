import { useToast } from './useToast'

const MARK: Record<string, string> = {
  error: '!',
  success: '✓',
  info: 'i',
}

export default function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="toaster" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <output key={t.id} className={`toast ${t.kind}`}>
          <span className="toast-mark" aria-hidden="true">
            {MARK[t.kind]}
          </span>
          <span className="toast-body">
            <strong>{t.title}</strong>
            {t.detail && <span>{t.detail}</span>}
          </span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismiss(t.id)}
            aria-label="Fermer"
          >
            ✕
          </button>
        </output>
      ))}
    </div>
  )
}
