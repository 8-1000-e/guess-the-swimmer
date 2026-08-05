import { useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import QrPanel from '@/components/QrPanel'
import Loading from '@/components/ui/Loading'
import { useGame } from '@/game/useGame'

export default function Game() {
  const game = useGame()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') void game.submit()
      else if (e.key === 'Backspace' || e.key === 'Delete') game.backspace()
      else if (/^[a-zA-Z-]$/.test(e.key)) game.type(e.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [game])

  const tries = game.rows.length

  return (
    <AppShell>
      <main className="game">
        {game.loading ? (
          <Loading label="Tirage de ta cible" />
        ) : (
          <>
            <header className="game-head">
              <p className="game-eyebrow mono">Cible du jour</p>
              <h1 className="game-title">
                {game.solved ? 'Trouvée' : `${game.length} lettres`}
              </h1>
              <p className="game-meta mono">
                {tries} essai{tries > 1 ? 's' : ''}
                {!game.solved && tries === 0 && ' · à toi de jouer'}
              </p>
            </header>

            <p
              className={`message ${game.message ? 'err' : ''}`}
              aria-live="polite"
            >
              {game.message || ' '}
            </p>

            <Board
              rows={game.rows}
              current={game.current}
              length={game.length}
              solved={game.solved}
            />

            {game.solved ? (
              <QrPanel target={game.target} />
            ) : (
              <Keyboard
                keys={game.keys}
                onKey={game.type}
                onEnter={() => void game.submit()}
                onBackspace={game.backspace}
                disabled={game.submitting}
              />
            )}

          </>
        )}
      </main>
    </AppShell>
  )
}
