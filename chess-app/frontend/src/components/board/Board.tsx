import { motion, AnimatePresence } from "framer-motion";
import { UseChessGame } from "../../hooks/useChessGame";
import { useTheme } from "../../context/ThemeContext";
import PieceSVG from "./PieceSVG";
import PromotionDialog from "./PromotionDialog";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

interface BoardProps {
  game: UseChessGame;
  flipped: boolean;
}

export default function Board({ game, flipped }: BoardProps) {
  const { whitePalette, blackPalette } = useTheme();
  const files = flipped ? [...FILES].reverse() : FILES;
  const ranks = flipped ? [...RANKS].reverse() : RANKS;

  const inCheckSquare = (() => {
    if (game.status !== "check" && game.status !== "checkmate") return null;
    for (const row of game.board) {
      for (const cell of row) {
        if (cell && cell.type === "k" && cell.color === game.turn) return cell.square;
      }
    }
    return null;
  })();

  return (
    <div className="relative select-none">
      <div
        className="grid grid-cols-8 aspect-square w-full rounded-lg overflow-hidden shadow-panel ring-1 ring-black/10"
        role="grid"
        aria-label="Chess board"
      >
        {ranks.map((rank, rIdx) =>
          files.map((file, fIdx) => {
            const square = `${file}${rank}`;
            const isDark = (FILES.indexOf(file) + RANKS.indexOf(rank)) % 2 === 1;
            const cell = game.board[RANKS.indexOf(rank)][FILES.indexOf(file)];
            const isSelected = game.selected === square;
            const isLegalTarget = game.legalTargets.includes(square);
            const isLastMove = game.lastMove && (game.lastMove.from === square || game.lastMove.to === square);
            const isCheck = inCheckSquare === square;
            const palette = cell?.color === "w" ? whitePalette : blackPalette;

            return (
              <button
                key={square}
                type="button"
                onClick={() => game.select(square)}
                aria-label={`Square ${square}${cell ? `, ${cell.color === "w" ? "white" : "black"} ${cell.type}` : ""}`}
                className={[
                  "relative flex items-center justify-center aspect-square focus-visible:z-10 transition-colors duration-150",
                  isDark ? "bg-board-dark hover:bg-board-dark-hover" : "bg-board-light hover:bg-board-light-hover",
                ].join(" ")}
              >
                {isLastMove && <span className="absolute inset-0 bg-brass/25" aria-hidden="true" />}
                {isCheck && <span className="absolute inset-0 bg-garnet/45" aria-hidden="true" />}
                {isSelected && (
                  <span
                    className="absolute inset-0.5 rounded-sm ring-2 ring-brass"
                    aria-hidden="true"
                  />
                )}

                {fIdx === 0 && (
                  <span
                    className="absolute left-1 top-0.5 text-[0.55rem] sm:text-xs font-semibold pointer-events-none"
                    style={{ color: isDark ? "var(--board-light)" : "var(--board-dark)" }}
                    aria-hidden="true"
                  >
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span
                    className="absolute right-1 bottom-0.5 text-[0.55rem] sm:text-xs font-semibold pointer-events-none"
                    style={{ color: isDark ? "var(--board-light)" : "var(--board-dark)" }}
                    aria-hidden="true"
                  >
                    {file}
                  </span>
                )}

                <AnimatePresence mode="popLayout" initial={false}>
                  {cell && (
                    <motion.div
                      key={`${cell.color}${cell.type}-${square}`}
                      layoutId={`piece-${square}`}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      className="w-[78%] h-[78%] pointer-events-none drop-shadow"
                    >
                      <PieceSVG type={cell.type} palette={palette} className="w-full h-full" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLegalTarget && !cell && (
                  <span
                    className="absolute w-[28%] h-[28%] rounded-full bg-felt/50"
                    aria-hidden="true"
                  />
                )}
                {isLegalTarget && cell && (
                  <span
                    className="absolute inset-1 rounded-sm ring-4 ring-felt/60"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {game.pendingPromotion && (
        <PromotionDialog
          color={game.turn}
          onSelect={game.completePromotion}
          onCancel={game.cancelPromotion}
        />
      )}
    </div>
  );
}
