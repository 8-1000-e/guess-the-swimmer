import { MAX_ATTEMPTS, type LetterResult } from '@/game/engine'

interface BoardProps {
  rows: LetterResult[][]
  current: string
  length: number
}

export default function Board({ rows, current, length }: BoardProps) {
  const empty = Math.max(0, MAX_ATTEMPTS - rows.length - 1)

  return (
    <div className="board" style={{ '--cols': length } as React.CSSProperties}>
      {rows.map((row, i) => (
        <div className="row" key={`played-${i}`}>
          {row.map((cell, j) => (
            <div className={`tile ${cell.state}`} key={j}>
              {cell.letter}
            </div>
          ))}
        </div>
      ))}

      {rows.length < MAX_ATTEMPTS && (
        <div className="row">
          {Array.from({ length }, (_, j) => (
            <div className={`tile ${current[j] ? 'filled' : ''}`} key={j}>
              {current[j] ?? ''}
            </div>
          ))}
        </div>
      )}

      {Array.from({ length: empty }, (_, i) => (
        <div className="row" key={`empty-${i}`}>
          {Array.from({ length }, (_, j) => (
            <div className="tile" key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}
