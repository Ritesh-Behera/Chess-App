import { UseChessGame } from "../../hooks/useChessGame";
import { useTheme } from "../../context/ThemeContext";
import PieceSVG from "../board/PieceSVG";
import { PieceType } from "../../types/chess";

const ORDER: PieceType[] = ["q", "r", "b", "n", "p"];
const VALUE: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function sortPieces(pieces: PieceType[]) {
  return [...pieces].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
}

function total(pieces: PieceType[]) {
  return pieces.reduce((sum, p) => sum + VALUE[p], 0);
}

export default function CapturedPieces({ game }: { game: UseChessGame }) {
  const { whitePalette, blackPalette } = useTheme();
  const advantage = total(game.captured.w) - total(game.captured.b);

  return (
    <div className="rounded-panel bg-surface-raised shadow-panel px-4 py-3 space-y-2.5">
      <Row
        label="Captured by White"
        pieces={sortPieces(game.captured.b)}
        palette={blackPalette}
        bonus={advantage > 0 ? `+${advantage}` : undefined}
      />
      <Row
        label="Captured by Black"
        pieces={sortPieces(game.captured.w)}
        palette={whitePalette}
        bonus={advantage < 0 ? `+${-advantage}` : undefined}
      />
    </div>
  );
}

function Row({
  label,
  pieces,
  palette,
  bonus,
}: {
  label: string;
  pieces: PieceType[];
  palette: { primary: string; secondary: string; outline: string };
  bonus?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-faint w-28 shrink-0">{label}</span>
      <div className="flex flex-wrap items-center gap-0.5 min-h-[1.5rem] flex-1">
        {pieces.length === 0 ? (
          <span className="text-xs text-ink-faint">—</span>
        ) : (
          pieces.map((p, i) => (
            <PieceSVG key={i} type={p} palette={palette} className="w-5 h-5" />
          ))
        )}
        {bonus && <span className="text-xs font-semibold text-felt ml-1">{bonus}</span>}
      </div>
    </div>
  );
}
