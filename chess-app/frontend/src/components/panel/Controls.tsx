import { UseChessGame } from "../../hooks/useChessGame";

interface ControlsProps {
  game: UseChessGame;
  flipped: boolean;
  onFlip: () => void;
  onNewGame: () => void;
  onSaveGame?: () => void;
  canSave: boolean;
  saving: boolean;
}

export default function Controls({
  game,
  flipped,
  onFlip,
  onNewGame,
  onSaveGame,
  canSave,
  saving,
}: ControlsProps) {
  return (
    <div className="rounded-panel bg-surface-raised shadow-panel p-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onNewGame}
        className="px-3 py-2 rounded-md bg-felt text-white text-sm font-medium hover:brightness-110 transition"
      >
        New game
      </button>
      <button
        type="button"
        onClick={game.undo}
        disabled={game.history.length === 0}
        className="px-3 py-2 rounded-md bg-surface-sunken text-sm font-medium hover:bg-brass/20 disabled:opacity-40 disabled:hover:bg-surface-sunken transition"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onFlip}
        className="px-3 py-2 rounded-md bg-surface-sunken text-sm font-medium hover:bg-brass/20 transition"
      >
        {flipped ? "Black at bottom" : "White at bottom"}
      </button>
      {onSaveGame && (
        <button
          type="button"
          onClick={onSaveGame}
          disabled={!canSave || saving}
          className="ml-auto px-3 py-2 rounded-md bg-brass text-white text-sm font-medium hover:brightness-110 disabled:opacity-40 transition"
        >
          {saving ? "Saving…" : "Save game"}
        </button>
      )}
    </div>
  );
}
