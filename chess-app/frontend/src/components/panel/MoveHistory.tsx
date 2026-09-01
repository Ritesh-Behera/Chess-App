import { useEffect, useRef } from "react";
import { UseChessGame } from "../../hooks/useChessGame";

export default function MoveHistory({ game }: { game: UseChessGame }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [game.history.length]);

  const pairs: { number: number; white?: string; black?: string }[] = [];
  game.history.forEach((entry, i) => {
    if (entry.color === "w") {
      pairs.push({ number: entry.moveNumber, white: entry.san });
    } else {
      const last = pairs[pairs.length - 1];
      if (last && last.number === entry.moveNumber && !last.black) {
        last.black = entry.san;
      } else {
        pairs.push({ number: entry.moveNumber, black: entry.san });
      }
    }
  });

  return (
    <div className="rounded-panel bg-surface-raised shadow-panel flex-1 flex flex-col min-h-0">
      <h2 className="font-display text-sm px-4 pt-3 pb-2 text-ink-muted">Moves</h2>
      <div ref={scrollRef} className="overflow-y-auto scrollbar-thin px-4 pb-3 flex-1">
        {pairs.length === 0 ? (
          <p className="text-sm text-ink-faint italic">No moves yet — make the first move.</p>
        ) : (
          <ol className="grid grid-cols-[2rem_1fr_1fr] gap-y-1 text-sm">
            {pairs.map((p) => (
              <li key={p.number} className="contents">
                <span className="text-ink-faint tabular-nums">{p.number}.</span>
                <span className="font-medium">{p.white ?? ""}</span>
                <span className="font-medium">{p.black ?? ""}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
