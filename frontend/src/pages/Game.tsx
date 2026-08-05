import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import Board from "@/components/Board";
import Keyboard from "@/components/Keyboard";
import QrPanel from "@/components/QrPanel";
import Loading from "@/components/ui/Loading";
import { useGame } from "@/game/useGame";

export default function Game() {
  const game = useGame();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") void game.submit();
      else if (e.key === "Backspace") game.backspace();
      else if (/^[a-zA-Z-]$/.test(e.key)) game.type(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game]);

  const tries = game.rows.length;

  return (
    <AppShell>
      <main className="game">
        {game.loading ? (
          <Loading label="Tirage de ta cible" />
        ) : (
          <>
            <div className="game-head">
              <p className="game-target">
                Cible du jour · {game.length} lettres · {tries} essai
                {tries > 1 ? "s" : ""}
              </p>
            </div>

            <p
              className={`message ${game.solved ? "won" : game.message ? "err" : ""}`}
              aria-live="polite"
            >
              {game.solved && !game.message ? "Trouvé." : game.message || " "}
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
          </>
        )}
      </main>
    </AppShell>
  );
}
