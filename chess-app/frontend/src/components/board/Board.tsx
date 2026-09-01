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
                {isCheck && <span className="absolute inset-0 bg-garnet/45 animate-pulse" aria-hidden="true" />}
                {isSelected && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-brass/35 ring-4 ring-brass shadow-[inset_0_0_12px_rgba(217,119,6,0.5)] z-10"
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
                      key={`${cell.color}${cell.type}`}
                      layoutId={`piece-${square}`}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 30,
                        mass: 0.8,
                      }}
                      className="w-[82%] h-[82%] pointer-events-none drop-shadow-md z-10"
                    >
                      <PieceSVG type={cell.type} palette={palette} className="w-full h-full" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legal move destination indicator: Clear solid centered dot */}
                {isLegalTarget && !cell && (
                  <span
                    className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/40 dark:bg-white/50 ring-2 ring-black/10 dark:ring-white/20 shadow pointer-events-none z-20"
                    aria-hidden="true"
                  />
                )}

                {/* Legal capture target indicator: Clear bold outer ring */}
                {isLegalTarget && cell && (
                  <span
                    className="absolute inset-1 rounded-full ring-4 ring-black/40 dark:ring-white/50 bg-black/10 dark:bg-white/15 pointer-events-none z-20"
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
