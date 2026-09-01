import { Router } from "express";
import db from "../db";
import { requireAuth } from "../middleware/auth";
import { GameRecord, PuzzleAttempt } from "../types";

const router = Router();

// Helper to compute user's streak based on puzzle completion dates
function calculateStreak(userId: number): { currentStreak: number; bestStreak: number } {
  const rows = db
    .prepare(
      `SELECT DISTINCT puzzle_date 
       FROM puzzle_attempts 
       WHERE user_id = ? AND solved = 1 
       ORDER BY puzzle_date DESC`
    )
    .all(userId) as { puzzle_date: string }[];

  if (rows.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const dates = rows.map((r) => r.puzzle_date);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let currentStreak = 0;
  let checkDate = new Date(now);

  // If user solved today, start checking backwards from today; otherwise from yesterday
  if (dates.includes(todayStr)) {
    checkDate = new Date(todayStr);
  } else if (dates.includes(yesterdayStr)) {
    checkDate = new Date(yesterdayStr);
  } else {
    checkDate = null as any;
  }

  if (checkDate) {
    while (true) {
      const dStr = checkDate.toISOString().slice(0, 10);
      if (dates.includes(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate best streak all time
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  // Sort ascending for best streak calculation
  const sortedAsc = [...dates].sort();
  for (const dStr of sortedAsc) {
    const curDate = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = curDate;
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
}

// GET /api/activity/calendar?year=2026&month=9
// Returns summary activity data for a given month + user streak
router.get("/calendar", requireAuth, (req, res) => {
  const userId = req.user!.id;
  const year = req.query.year ? String(req.query.year).padStart(4, "0") : new Date().getFullYear().toString();
  const month = req.query.month ? String(req.query.month).padStart(2, "0") : (new Date().getMonth() + 1).toString().padStart(2, "0");
  const monthPrefix = `${year}-${month}`;

  // Get games in month
  const games = db
    .prepare(
      `SELECT id, created_at, result, end_reason, move_count, white_name, black_name
       FROM games 
       WHERE user_id = ? AND strftime('%Y-%m', created_at) = ?`
    )
    .all(userId, monthPrefix) as (GameRecord & { created_at: string })[];

  // Get puzzle attempts in month
  const puzzles = db
    .prepare(
      `SELECT * FROM puzzle_attempts 
       WHERE user_id = ? AND puzzle_date LIKE ?`
    )
    .all(userId, `${monthPrefix}%`) as PuzzleAttempt[];

  // Group by day string "YYYY-MM-DD"
  const days: Record<string, { gamesCount: number; puzzlesSolved: number; wins: number; losses: number; draws: number }> = {};

  for (const g of games) {
    const day = g.created_at.slice(0, 10);
    if (!days[day]) {
      days[day] = { gamesCount: 0, puzzlesSolved: 0, wins: 0, losses: 0, draws: 0 };
    }
    days[day].gamesCount++;
    if (g.result === "1-0") days[day].wins++;
    else if (g.result === "0-1") days[day].losses++;
    else if (g.result === "1/2-1/2") days[day].draws++;
  }

  for (const p of puzzles) {
    const day = p.puzzle_date;
    if (!days[day]) {
      days[day] = { gamesCount: 0, puzzlesSolved: 0, wins: 0, losses: 0, draws: 0 };
    }
    if (p.solved) {
      days[day].puzzlesSolved++;
    }
  }

  const { currentStreak, bestStreak } = calculateStreak(userId);

  res.json({
    year,
    month,
    days,
    currentStreak,
    bestStreak,
  });
});

// GET /api/activity/day/:date (e.g., 2026-09-03)
// Returns detailed breakdown of a specific day
router.get("/day/:date", requireAuth, (req, res) => {
  const userId = req.user!.id;
  const date = req.params.date;

  const games = db
    .prepare(
      `SELECT * FROM games 
       WHERE user_id = ? AND date(created_at) = date(?) 
       ORDER BY created_at DESC`
    )
    .all(userId, date) as GameRecord[];

  const puzzles = db
    .prepare(
      `SELECT * FROM puzzle_attempts 
       WHERE user_id = ? AND puzzle_date = ?`
    )
    .all(userId, date) as PuzzleAttempt[];

  res.json({
    date,
    games,
    puzzles,
  });
});

// POST /api/activity/puzzle-complete
// Records a solved or attempted puzzle
router.post("/puzzle-complete", requireAuth, (req, res) => {
  const userId = req.user!.id;
  const { puzzleId, puzzleDate, solved, attempts } = req.body || {};

  if (!puzzleId || !puzzleDate) {
    return res.status(400).json({ error: "puzzleId and puzzleDate are required." });
  }

  const isSolved = solved ? 1 : 0;
  const attemptCount = typeof attempts === "number" ? attempts : 1;

  db.prepare(
    `INSERT INTO puzzle_attempts (user_id, puzzle_id, puzzle_date, solved, attempts)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, puzzle_date) DO UPDATE SET
       solved = MAX(solved, excluded.solved),
       attempts = attempts + excluded.attempts`
  ).run(userId, puzzleId, puzzleDate, isSolved, attemptCount);

  const { currentStreak, bestStreak } = calculateStreak(userId);

  res.json({
    ok: true,
    currentStreak,
    bestStreak,
  });
});

// GET /api/activity/stats
// Quick stats for profile/header/streak
router.get("/stats", requireAuth, (req, res) => {
  const userId = req.user!.id;
  const { currentStreak, bestStreak } = calculateStreak(userId);
  const totalSolved = (
    db.prepare("SELECT COUNT(*) AS c FROM puzzle_attempts WHERE user_id = ? AND solved = 1").get(userId) as any
  ).c;
  const totalGames = (
    db.prepare("SELECT COUNT(*) AS c FROM games WHERE user_id = ?").get(userId) as any
  ).c;

  res.json({
    currentStreak,
    bestStreak,
    totalSolved,
    totalGames,
  });
});

export default router;
