import { Router } from "express";
import db from "../db";
import { requireAuth } from "../middleware/auth";
import { GameRecord } from "../types";

const router = Router();

// List the signed-in user's own games
router.get("/", requireAuth, (req, res) => {
  const games = db
    .prepare("SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user!.id) as GameRecord[];
  res.json({ games });
});

router.get("/:id", requireAuth, (req, res) => {
  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(req.params.id) as
    | GameRecord
    | undefined;
  if (!game) return res.status(404).json({ error: "Game not found." });
  if (game.user_id !== req.user!.id && req.user!.role !== "admin") {
    return res.status(403).json({ error: "Not your game." });
  }
  res.json({ game });
});

// Save a finished (or in-progress, if the user wants to bookmark it) game
router.post("/", requireAuth, (req, res) => {
  const { whiteName, blackName, pgn, result, endReason, moveCount } = req.body || {};

  if (typeof pgn !== "string") {
    return res.status(400).json({ error: "pgn is required." });
  }

  const info = db
    .prepare(
      `INSERT INTO games (user_id, white_name, black_name, pgn, result, end_reason, move_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user!.id,
      whiteName || "White",
      blackName || "Black",
      pgn,
      result || "*",
      endReason || "in-progress",
      Number.isFinite(moveCount) ? moveCount : 0
    );

  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(info.lastInsertRowid) as GameRecord;
  res.status(201).json({ game });
});

router.delete("/:id", requireAuth, (req, res) => {
  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(req.params.id) as
    | GameRecord
    | undefined;
  if (!game) return res.status(404).json({ error: "Game not found." });
  if (game.user_id !== req.user!.id && req.user!.role !== "admin") {
    return res.status(403).json({ error: "Not your game." });
  }
  db.prepare("DELETE FROM games WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
