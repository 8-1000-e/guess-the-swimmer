import type { ElementType, ReactNode } from 'react'

interface SurfaceProps {
  as?: ElementType
  className?: string
  children: ReactNode
}

export default function Surface({
  as: Tag = 'div',
  className = '',
  children,
}: SurfaceProps) {
  return <Tag className={`surface ${className}`.trim()}>{children}</Tag>
}
