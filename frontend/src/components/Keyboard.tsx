import type { LetterState } from '@/game/engine'

const ROWS = ['azertyuiop', 'qsdfghjklm', 'wxcvbn']

interface KeyboardProps {
  keys: Record<string, LetterState>
  onKey: (letter: string) => void
  onEnter: () => void
  onBackspace: () => void
}

export default function Keyboard({
  keys,
  onKey,
  onEnter,
  onBackspace,
}: KeyboardProps) {
  return (
    <div className="keyboard">
      {ROWS.map((row, i) => (
        <div className="kb-row" key={i}>
          {i === 2 && (
            <button type="button" className="key wide" onClick={onEnter}>
              Enter
            </button>
          )}
          {[...row].map((letter) => (
            <button
              type="button"
              key={letter}
              className={`key ${keys[letter] ?? ''}`}
              onClick={() => onKey(letter)}
            >
              {letter}
            </button>
          ))}
          {i === 2 && (
            <button type="button" className="key wide" onClick={onBackspace}>
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
