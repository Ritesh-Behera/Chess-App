import { UseChessGame } from "../../hooks/useChessGame";

export default function GameStatus({ game }: { game: UseChessGame }) {
  const isOver = game.isGameOver;
  const isCheck = game.status === "check";

  return (
    <div className="rounded-panel bg-surface-raised shadow-panel px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={[
            "h-2.5 w-2.5 rounded-full shrink-0",
            isOver ? "bg-garnet" : isCheck ? "bg-brass animate-pulse" : "bg-felt",
          ].join(" ")}
          aria-hidden="true"
        />
        <p className="font-display text-base sm:text-lg truncate">{game.statusLabel}</p>
      </div>
      <span className="text-xs uppercase tracking-wide text-ink-faint shrink-0">
        Move {Math.ceil((game.history.length + 1) / 2)}
      </span>
    </div>
  );
}
