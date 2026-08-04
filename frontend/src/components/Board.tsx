import type { LetterResult } from '@/types/game'

interface BoardProps {
  rows: LetterResult[][]
  current: string
  length: number
  solved: boolean
}

export default function Board({ rows, current, length, solved }: BoardProps) {
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

      {!solved && (
        <div className="row">
          {Array.from({ length }, (_, j) => (
            <div className={`tile ${current[j] ? 'filled' : ''}`} key={j}>
              {current[j] ?? ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
