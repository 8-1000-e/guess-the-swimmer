import Surface from './Surface'

interface StatProps {
  value: number | string
  label: string
  highlight?: boolean
}

export default function Stat({ value, label, highlight }: StatProps) {
  return (
    <Surface className="stat">
      <span className={`stat-value ${highlight ? 'hi' : ''}`}>{value}</span>
      <span className="stat-label">{label}</span>
    </Surface>
  )
}
