import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export interface DayDetailModalProps {
  date: string; // "YYYY-MM-DD"
  onClose: () => void;
}

export interface DayGame {
  id: number;
  white_name: string;
  black_name: string;
  result: string;
  end_reason: string;
  move_count: number;
  created_at: string;
}

export interface DayPuzzle {
  id: number;
  puzzle_id: string;
  puzzle_date: string;
  solved: number;
  attempts: number;
}

export default function DayDetailModal({ date, onClose }: DayDetailModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<DayGame[]>([]);
  const [puzzles, setPuzzles] = useState<DayPuzzle[]>([]);

  useEffect(() => {
    let active = true;

    async function fetchDayData() {
      setLoading(true);
      if (user) {
        try {
          const res = await api.get<{ games: DayGame[]; puzzles: DayPuzzle[] }>(`/api/activity/day/${date}`);
          if (active) {
            setGames(res.games || []);
            setPuzzles(res.puzzles || []);
          }
        } catch {
          if (active) {
            setGames([]);
            setPuzzles([]);
          }
        }
      } else {
        // Load from local storage for guest
        const guestData = localStorage.getItem(`chess_activity_${date}`);
        if (guestData) {
          try {
            const parsed = JSON.parse(guestData);
            setGames(parsed.games || []);
            setPuzzles(parsed.puzzles || []);
          } catch {
            setGames([]);
            setPuzzles([]);
          }
        } else {
          setGames([]);
          setPuzzles([]);
        }
      }
      if (active) setLoading(false);
    }

    fetchDayData();
    return () => {
      active = false;
    };
  }, [date, user]);

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-black/10 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div>
            <h3 className="font-display text-lg tracking-tight">{formattedDate}</h3>
            <p className="text-xs text-ink-muted">Daily Activity & Stats Breakdown</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-xl leading-none px-2 py-1 rounded transition"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-8 text-center text-sm text-ink-muted">Loading activity data...</div>
          ) : (
            <>
              {/* Summary stat cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface border border-black/5 dark:border-white/5">
                  <div className="text-xs text-ink-muted font-medium">Puzzles Solved</div>
                  <div className="text-xl font-display mt-0.5 flex items-center gap-1.5">
                    <span>{puzzles.filter((p) => p.solved).length}</span>
                    {puzzles.some((p) => p.solved) && <span className="text-xs text-felt font-sans font-semibold">✓ Completed</span>}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-black/5 dark:border-white/5">
                  <div className="text-xs text-ink-muted font-medium">Matches Played</div>
                  <div className="text-xl font-display mt-0.5">
                    {games.length}
                  </div>
                </div>
              </div>

              {/* Puzzles Section */}
              <div>
                <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2.5">
                  Puzzles
                </h4>
                {puzzles.length === 0 ? (
                  <p className="text-xs text-ink-faint italic bg-surface/50 p-3 rounded border border-dashed border-black/10 dark:border-white/10">
                    No puzzle attempts on this day.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {puzzles.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-surface border border-black/5 dark:border-white/5 text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">🧩</span>
                          <div>
                            <div className="font-medium text-xs sm:text-sm">Daily Puzzle #{p.puzzle_id}</div>
                            <div className="text-[0.7rem] text-ink-muted">
                              {p.attempts} attempt{p.attempts > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div>
                          {p.solved ? (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-felt/20 text-felt">
                              Solved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-garnet/20 text-garnet">
                              Attempted
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Games Section */}
              <div>
                <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2.5">
                  Matches Played ({games.length})
                </h4>
                {games.length === 0 ? (
                  <p className="text-xs text-ink-faint italic bg-surface/50 p-3 rounded border border-dashed border-black/10 dark:border-white/10">
                    No games recorded on this day.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {games.map((g) => {
                      const outcomeLabel =
                        g.result === "1-0"
                          ? "White Won"
                          : g.result === "0-1"
                          ? "Black Won"
                          : g.result === "1/2-1/2"
                          ? "Draw"
                          : "In Progress";

                      const outcomeColor =
                        g.result === "1-0" || g.result === "0-1"
                          ? "bg-brass/20 text-brass"
                          : g.result === "1/2-1/2"
                          ? "bg-felt/20 text-felt"
                          : "bg-ink-faint/20 text-ink-muted";

                      return (
                        <div
                          key={g.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-surface border border-black/5 dark:border-white/5 text-sm"
                        >
                          <div>
                            <div className="font-medium text-xs sm:text-sm flex items-center gap-1.5">
                              <span>{g.white_name || "White"}</span>
                              <span className="text-ink-faint font-normal text-xs">vs</span>
                              <span>{g.black_name || "Black"}</span>
                            </div>
                            <div className="text-[0.7rem] text-ink-muted mt-0.5">
                              {g.move_count} moves • {g.end_reason}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${outcomeColor}`}>
                            {outcomeLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-surface border border-black/10 dark:border-white/10 text-ink hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
