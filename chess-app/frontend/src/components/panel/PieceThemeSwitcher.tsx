import { PIECE_THEMES } from "../../lib/pieceThemes";
import { useTheme } from "../../context/ThemeContext";

export default function PieceThemeSwitcher() {
  const { whitePieceThemeId, blackPieceThemeId, setWhitePieceThemeId, setBlackPieceThemeId } =
    useTheme();

  return (
    <div className="rounded-panel bg-surface-raised shadow-panel px-4 py-3 space-y-3">
      <h2 className="font-display text-sm text-ink-muted">Piece colors</h2>
      <Selector label="White pieces" value={whitePieceThemeId} onChange={setWhitePieceThemeId} />
      <Selector label="Black pieces" value={blackPieceThemeId} onChange={setBlackPieceThemeId} />
    </div>
  );
}

function Selector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-ink-faint">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {PIECE_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            title={theme.label}
            aria-label={theme.label}
            aria-pressed={value === theme.id}
            className={[
              "h-8 rounded-md ring-1 ring-black/10 transition-transform",
              value === theme.id ? "ring-2 ring-brass scale-[1.04]" : "hover:scale-[1.03]",
            ].join(" ")}
            style={{ background: theme.swatch }}
          />
        ))}
      </div>
    </div>
  );
}
