import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type ToastKind = 'error' | 'success' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  title: string
  detail?: string
}

export interface ToastContextValue {
  toasts: Toast[]
  push: (kind: ToastKind, title: string, detail?: string) => void
  dismiss: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const LIFETIME = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, title: string, detail?: string) => {
      const id = Date.now() + Math.random()
      setToasts((list) => [...list.slice(-3), { id, kind, title, detail }])
      window.setTimeout(() => dismiss(id), LIFETIME)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
