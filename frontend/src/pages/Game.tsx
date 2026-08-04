import { useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import QrPanel from '@/components/QrPanel'
import TargetList from '@/components/TargetList'
import { useGame } from '@/game/useGame'

export default function Game() {
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
    <AppShell>
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

              {game.solved ? (
                <QrPanel />
              ) : (
                <Keyboard
                  keys={game.keys}
                  onKey={game.type}
                  onEnter={() => void game.submit()}
                  onBackspace={game.backspace}
                  disabled={game.submitting}
                />
              )}

              <p className="hint mono">
                {game.length} lettres · {game.rows.length} essai
                {game.rows.length > 1 ? 's' : ''}
              </p>
            </>
          )}
        </main>

        {!game.loading && <TargetList targets={game.targets} />}
      </div>
    </AppShell>
  )
}
