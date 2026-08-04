import { useEffect } from 'react'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import TargetList from '@/components/TargetList'
import { useGame } from '@/game/useGame'
import { useAuth } from '@/auth/useAuth'

export default function Game() {
  const { user, logout } = useAuth()
  const game = useGame()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') void game.submit()
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

      <div className="layout">
        <main className="game">
          {game.loading ? (
            <p className="hint mono">Chargement…</p>
          ) : (
            <>
              <p className={`message ${game.solved ? 'won' : ''}`}>
                {game.message || ' '}
              </p>

              <Board
                rows={game.rows}
                current={game.current}
                length={game.length}
                solved={game.solved}
              />

              <Keyboard
                keys={game.keys}
                onKey={game.type}
                onEnter={() => void game.submit()}
                onBackspace={game.backspace}
                disabled={game.solved || game.submitting}
              />

              <p className="hint mono">
                {game.length} lettres · {game.rows.length} essai
                {game.rows.length > 1 ? 's' : ''}
              </p>
            </>
          )}
        </main>

        {!game.loading && <TargetList targets={game.targets} />}
      </div>
    </div>
  )
}
