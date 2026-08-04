import type { LetterState } from '@/types/game'

const ROWS = ['azertyuiop', 'qsdfghjklm', 'wxcvbn']

interface KeyboardProps {
  keys: Record<string, LetterState>
  onKey: (letter: string) => void
  onEnter: () => void
  onBackspace: () => void
  disabled?: boolean
}

export default function Keyboard({
  keys,
  onKey,
  onEnter,
  onBackspace,
  disabled,
}: KeyboardProps) {
  return (
    <div className="keyboard">
      {ROWS.map((row, i) => (
        <div className="kb-row" key={i}>
          {i === 2 && (
            <button
              type="button"
              className="key wide"
              onClick={onEnter}
              disabled={disabled}
            >
              Enter
            </button>
          )}
          {[...row].map((letter) => (
            <button
              type="button"
              key={letter}
              className={`key ${keys[letter] ?? ''}`}
              onClick={() => onKey(letter)}
              disabled={disabled}
            >
              {letter}
            </button>
          ))}
          {i === 2 && (
            <button
              type="button"
              className="key wide"
              onClick={onBackspace}
              disabled={disabled}
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
