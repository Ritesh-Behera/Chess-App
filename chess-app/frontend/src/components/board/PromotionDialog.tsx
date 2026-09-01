import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import PieceSVG from "./PieceSVG";
import { PieceColor } from "../../types/chess";

interface PromotionDialogProps {
  color: PieceColor;
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

const OPTIONS: { type: "q" | "r" | "b" | "n"; label: string }[] = [
  { type: "q", label: "Queen" },
  { type: "r", label: "Rook" },
  { type: "b", label: "Bishop" },
  { type: "n", label: "Knight" },
];

export default function PromotionDialog({ color, onSelect, onCancel }: PromotionDialogProps) {
  const { whitePalette, blackPalette } = useTheme();
  const palette = color === "w" ? whitePalette : blackPalette;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-label="Choose promotion piece"
        className="bg-surface-raised rounded-panel shadow-panel p-4 sm:p-5 flex flex-col items-center gap-3"
      >
        <p className="text-sm font-medium text-ink-muted">Promote pawn to</p>
        <div className="flex gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type)}
              aria-label={opt.label}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-surface-sunken hover:bg-brass/20 flex items-center justify-center transition-colors"
            >
              <PieceSVG type={opt.type} palette={palette} className="w-11 h-11 sm:w-12 sm:h-12" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-ink-faint hover:text-ink-muted mt-1"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
