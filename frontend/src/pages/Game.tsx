import { useEffect, useState } from 'react'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import { playableLengths } from '@/game/engine'
import { useGame } from '@/game/useGame'
import { useAuth } from '@/auth/useAuth'

const LENGTHS = playableLengths()

export default function Game() {
  const { user, logout } = useAuth()
  const [length, setLength] = useState(LENGTHS[LENGTHS.length - 1] ?? 8)
  const game = useGame(length)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') game.submit()
      else if (e.key === 'Backspace') game.backspace()
      else if (/^[a-zA-Z-]$/.test(e.key)) game.type(e.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [game])

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo">
          Guess the <span className="accent">Swimmer</span>
        </h1>
        <div className="topbar-right">
          {user?.ftPfpUrl && (
            <img className="avatar" src={user.ftPfpUrl} alt="" />
          )}
          <span className="mono">{user?.login}</span>
          <button type="button" className="btn-ghost" onClick={() => logout()}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="game">
        <div className="controls">
          <span className="mono muted">Longueur</span>
          {LENGTHS.map((n) => (
            <button
              type="button"
              key={n}
              className={`chip ${n === length ? 'chip-active' : ''}`}
              onClick={() => setLength(n)}
            >
              {n}
            </button>
          ))}
          <button type="button" className="btn-ghost" onClick={game.reset}>
            Rejouer
          </button>
        </div>

        <p className={`message ${game.status}`}>{game.message || ' '}</p>

        <Board rows={game.rows} current={game.current} length={game.length} />

        <Keyboard
          keys={game.keys}
          onKey={game.type}
          onEnter={game.submit}
          onBackspace={game.backspace}
        />

        <p className="hint mono">
          {game.pool.length} logins de {length} lettres dans la piscine
        </p>
      </main>
    </div>
  )
}
