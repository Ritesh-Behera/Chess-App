import { useState, useMemo, useCallback } from "react";
import { getDailyPuzzle, getRandomPuzzle, ChessPuzzle } from "../lib/puzzles";
import { usePuzzleGame } from "../hooks/usePuzzleGame";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Board from "../components/board/Board";
import ActivityCalendar from "../components/calendar/ActivityCalendar";
import PieceThemeSwitcher from "../components/panel/PieceThemeSwitcher";

export default function PuzzlePage() {
  const { user } = useAuth();
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [isDaily, setIsDaily] = useState(true);
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle>(() => getDailyPuzzle(todayStr));
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  const handlePuzzleComplete = useCallback(
    async (puzzle: ChessPuzzle, attempts: number) => {
      // Sync to backend if logged in
      if (user) {
        try {
          await api.post("/api/activity/puzzle-complete", {
            puzzleId: puzzle.id,
            puzzleDate: todayStr,
            solved: true,
            attempts: attempts,
          });
        } catch {
          // ignore error
        }
      } else {
        // Save to localStorage for guest
        const todayKey = `chess_activity_${todayStr}`;
        const existingRaw = localStorage.getItem(todayKey);
        let existing = existingRaw ? JSON.parse(existingRaw) : { games: [], puzzles: [] };
        
        const existingPuzzleIdx = existing.puzzles.findIndex((p: any) => p.puzzle_id === puzzle.id);
        if (existingPuzzleIdx >= 0) {
          existing.puzzles[existingPuzzleIdx].solved = 1;
          existing.puzzles[existingPuzzleIdx].attempts += attempts;
        } else {
          existing.puzzles.push({
            id: Date.now(),
            puzzle_id: puzzle.id,
            puzzle_date: todayStr,
            solved: 1,
            attempts: attempts,
          });
        }
        localStorage.setItem(todayKey, JSON.stringify(existing));

        // Update guest streak
        const curStreak = parseInt(localStorage.getItem("chess_puzzle_streak") || "0", 10);
        const lastSolvedDate = localStorage.getItem("chess_puzzle_last_solved");
        if (lastSolvedDate !== todayStr) {
          localStorage.setItem("chess_puzzle_streak", String(curStreak + 1));
          localStorage.setItem("chess_puzzle_last_solved", todayStr);
        }
      }

      setCalendarRefreshKey((k) => k + 1);
    },
    [user, todayStr]
  );

  const game = usePuzzleGame(currentPuzzle, handlePuzzleComplete);

  const handleNextRandom = () => {
    setIsDaily(false);
    const nextPuz = getRandomPuzzle(currentPuzzle.id);
    setCurrentPuzzle(nextPuz);
    game.loadPuzzle(nextPuz);
  };

  const handleDailyMode = () => {
    setIsDaily(true);
    const daily = getDailyPuzzle(todayStr);
    setCurrentPuzzle(daily);
    game.loadPuzzle(daily);
  };

  // Universal Hint tracker: 3 hints per day
  const [hintsRemaining, setHintsRemaining] = useState<number>(() => {
    const saved = localStorage.getItem(`chess_hints_${todayStr}`);
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const handleGetHint = () => {
    if (hintsRemaining <= 0) return;
    game.requestHint();
    const nextCount = hintsRemaining - 1;
    setHintsRemaining(nextCount);
    localStorage.setItem(`chess_hints_${todayStr}`, String(nextCount));
  };

  const isFlipped = currentPuzzle.playerColor === "b";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">♟️</span>
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Chess Puzzles</h1>
            {isDaily && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brass/20 text-brass">
                Daily Challenge
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Solve tactical puzzles daily to build your streak and analyze your training history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDailyMode}
            className={[
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              isDaily
                ? "bg-brass text-white shadow-xs"
                : "bg-surface border border-black/10 dark:border-white/10 text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            Today's Daily
          </button>
          <button
            type="button"
            onClick={handleNextRandom}
            className={[
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              !isDaily
                ? "bg-brass text-white shadow-xs"
                : "bg-surface border border-black/10 dark:border-white/10 text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            Practice Next ↻
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
        {/* Left Column: Board & Instructions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-panel border border-black/10 dark:border-white/10">
            <div>
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {currentPuzzle.theme} • Rating {currentPuzzle.rating}
              </span>
              <h2 className="font-display text-base sm:text-lg">{currentPuzzle.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-ink-muted">To Move:</span>
              <div className="text-xs font-bold font-sans">
                {currentPuzzle.playerColor === "w" ? "⚪ White to Move" : "⚫ Black to Move"}
              </div>
            </div>
          </div>

          {/* Puzzle Chess Board */}
          <Board game={game as any} flipped={isFlipped} />

          {/* Action Feedback Banner */}
          {game.isSolved ? (
            <div className="p-4 rounded-xl bg-felt/15 border border-felt/30 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎉</span>
                <div>
                  <h4 className="font-display text-base text-felt font-bold">Puzzle Solved!</h4>
                  <p className="text-xs text-ink-muted">Great tactical vision. Your streak has been updated!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNextRandom}
                className="px-3 py-1.5 text-xs font-medium bg-felt text-white rounded-lg hover:brightness-110 transition shadow-xs"
              >
                Play Next Puzzle →
              </button>
            </div>
          ) : game.isFailed ? (
            <div className="p-4 rounded-xl bg-garnet/15 border border-garnet/30 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="font-display text-base text-garnet font-bold">That's not the best move</h4>
                  <p className="text-xs text-ink-muted">Give it another thought and try again.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={game.retry}
                className="px-3 py-1.5 text-xs font-medium bg-garnet text-white rounded-lg hover:brightness-110 transition shadow-xs"
              >
                Try Again ↻
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-surface border border-black/5 dark:border-white/5 text-xs text-ink text-center">
              <span className="font-semibold text-ink-muted uppercase mr-1">Objective:</span>
              <span>{currentPuzzle.description}</span>
            </div>
          )}

          {/* Hint Area */}
          {game.hint && (
            <div className="p-3 rounded-lg bg-brass/10 border border-brass/20 text-xs text-brass font-medium text-center animate-in fade-in">
              💡 {game.hint}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={game.retry}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-surface border border-black/10 dark:border-white/10 text-ink hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              Reset Position ↻
            </button>
            {!game.isSolved && (
              <button
                type="button"
                onClick={handleGetHint}
                disabled={hintsRemaining <= 0}
                className={[
                  "px-4 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5",
                  hintsRemaining > 0
                    ? "bg-surface border-brass/30 text-brass hover:bg-brass/10"
                    : "bg-surface/50 border-black/5 dark:border-white/5 text-ink-faint cursor-not-allowed",
                ].join(" ")}
              >
                <span>💡 Hint</span>
                <span className="px-1.5 py-0.2 text-[0.65rem] rounded-full bg-brass/20 text-brass font-semibold">
                  {hintsRemaining}/3 today
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Activity Calendar & Themes */}
        <div className="space-y-6">
          <ActivityCalendar refreshKey={calendarRefreshKey} />
          <PieceThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
