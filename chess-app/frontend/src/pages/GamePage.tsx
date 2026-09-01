import { useState } from "react";
import { useChessGame } from "../hooks/useChessGame";
import { useAuth } from "../context/AuthContext";
import { api, googleLoginUrl } from "../api/client";
import Board from "../components/board/Board";
import GameStatus from "../components/panel/GameStatus";
import MoveHistory from "../components/panel/MoveHistory";
import CapturedPieces from "../components/panel/CapturedPieces";
import Controls from "../components/panel/Controls";
import PieceThemeSwitcher from "../components/panel/PieceThemeSwitcher";

export default function GamePage() {
  const game = useChessGame();
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const [whiteName, setWhiteName] = useState("White");
  const [blackName, setBlackName] = useState("Black");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleNewGame = () => {
    game.reset();
    setSavedMessage(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSavedMessage(null);
    try {
      await api.post("/api/games", {
        whiteName,
        blackName,
        pgn: game.pgn(),
        result: game.resultCode(),
        endReason: game.status,
        moveCount: game.history.length,
      });
      setSavedMessage("Game saved.");
    } catch (err) {
      setSavedMessage(err instanceof Error ? err.message : "Could not save game.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-5 sm:gap-6 items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <input
              value={flipped ? blackName : whiteName}
              onChange={(e) => (flipped ? setBlackName : setWhiteName)(e.target.value)}
              className="bg-transparent font-display text-lg w-32 focus-visible:outline-none border-b border-transparent focus:border-ink-faint"
              aria-label="Top player name"
              maxLength={20}
            />
            <span className="text-xs text-ink-faint uppercase tracking-wide">vs</span>
            <input
              value={flipped ? whiteName : blackName}
              onChange={(e) => (flipped ? setWhiteName : setBlackName)(e.target.value)}
              className="bg-transparent font-display text-lg w-32 text-right focus-visible:outline-none border-b border-transparent focus:border-ink-faint"
              aria-label="Bottom player name"
              maxLength={20}
            />
          </div>
          <Board game={game} flipped={flipped} />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <GameStatus game={game} />
          <Controls
            game={game}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            onNewGame={handleNewGame}
            onSaveGame={user ? handleSave : undefined}
            canSave={game.history.length > 0}
            saving={saving}
          />
          {!user && (
            <p className="text-xs text-ink-faint px-1">
              <a href={googleLoginUrl} className="text-brass font-medium hover:underline">
                Sign in with Google
              </a>{" "}
              to save finished games to your history.
            </p>
          )}
          {savedMessage && <p className="text-xs text-felt px-1">{savedMessage}</p>}
          <CapturedPieces game={game} />
          <MoveHistory game={game} />
          <PieceThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
