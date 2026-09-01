import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import DayDetailModal from "./DayDetailModal";

interface DaySummary {
  gamesCount: number;
  puzzlesSolved: number;
  wins: number;
  losses: number;
  draws: number;
}

interface CalendarResponse {
  year: string;
  month: string;
  days: Record<string, DaySummary>;
  currentStreak: number;
  bestStreak: number;
}

export default function ActivityCalendar({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, DaySummary>>({});
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  useEffect(() => {
    let active = true;

    async function loadCalendar() {
      setLoading(true);
      const yStr = String(year);
      const mStr = String(month + 1).padStart(2, "0");

      if (user) {
        try {
          const res = await api.get<CalendarResponse>(`/api/activity/calendar?year=${yStr}&month=${mStr}`);
          if (active) {
            setCalendarData(res.days || {});
            setStreak({ currentStreak: res.currentStreak || 0, bestStreak: res.bestStreak || 0 });
          }
        } catch {
          if (active) setCalendarData({});
        }
      } else {
        // Guest local storage parsing
        const daysMap: Record<string, DaySummary> = {};
        const prefix = `chess_activity_${yStr}-${mStr}`;
        for (let i = 1; i <= 31; i++) {
          const dStr = `${yStr}-${mStr}-${String(i).padStart(2, "0")}`;
          const localItem = localStorage.getItem(`chess_activity_${dStr}`);
          if (localItem) {
            try {
              const parsed = JSON.parse(localItem);
              const pCount = (parsed.puzzles || []).filter((p: any) => p.solved).length;
              const gCount = (parsed.games || []).length;
              if (pCount > 0 || gCount > 0) {
                daysMap[dStr] = {
                  gamesCount: gCount,
                  puzzlesSolved: pCount,
                  wins: 0,
                  losses: 0,
                  draws: 0,
                };
              }
            } catch {
              // ignore
            }
          }
        }
        if (active) {
          setCalendarData(daysMap);
          const guestStreak = parseInt(localStorage.getItem("chess_puzzle_streak") || "0", 10);
          setStreak({ currentStreak: guestStreak, bestStreak: guestStreak });
        }
      }
      if (active) setLoading(false);
    }

    loadCalendar();
    return () => {
      active = false;
    };
  }, [year, month, user, refreshKey]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Month rendering calculations
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toISOString().slice(0, 10);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div className="bg-panel border border-black/10 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header & Streak overview */}
      <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-3">
        <div>
          <h3 className="font-display text-base sm:text-lg flex items-center gap-2">
            <span>Activity Calendar</span>
          </h3>
          <p className="text-xs text-ink-muted">Track your daily games & puzzle streaks</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brass/10 border border-brass/20 text-brass text-xs font-semibold">
            <span>🔥</span>
            <span>{streak.currentStreak} Day{streak.currentStreak === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold font-display">
          {monthName} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-ink-muted transition"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 text-ink-muted transition"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1 select-none">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] font-medium text-ink-faint uppercase tracking-wider py-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1">
          {leadingBlanks.map((b) => (
            <div key={`blank-${b}`} className="aspect-square" />
          ))}

          {daysArray.map((dayNum) => {
            const dayKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const summary = calendarData[dayKey];
            const isToday = dayKey === todayStr;
            const hasPuzzles = summary && summary.puzzlesSolved > 0;
            const hasGames = summary && summary.gamesCount > 0;
            const hasActivity = hasPuzzles || hasGames;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayKey)}
                className={[
                  "relative aspect-square flex flex-col items-center justify-center rounded-lg border text-xs transition-all",
                  isToday
                    ? "border-brass font-bold bg-brass/5"
                    : "border-transparent hover:border-black/10 dark:hover:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
                  hasActivity ? "bg-surface shadow-xs font-medium" : "text-ink-muted",
                ].join(" ")}
                title={`${dayKey}: ${summary ? `${summary.puzzlesSolved} puzzles, ${summary.gamesCount} games` : "No activity"}`}
              >
                <span>{dayNum}</span>

                {/* Activity indicator dots */}
                <div className="flex items-center gap-0.5 mt-0.5 h-1">
                  {hasPuzzles && <span className="w-1.5 h-1.5 rounded-full bg-felt" title="Puzzle solved" />}
                  {hasGames && <span className="w-1.5 h-1.5 rounded-full bg-brass" title="Games played" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & hint */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[0.7rem] text-ink-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-felt inline-block" />
            <span>Puzzle</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brass inline-block" />
            <span>Match</span>
          </div>
        </div>
        <span className="italic text-ink-faint">Click any date for details</span>
      </div>

      {/* Modal Popup */}
      {selectedDay && (
        <DayDetailModal date={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </div>
  );
}
