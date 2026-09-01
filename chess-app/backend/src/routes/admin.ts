import { Router } from "express";
import db from "../db";
import { requireAdmin } from "../middleware/auth";
import { GameRecord, User } from "../types";

const router = Router();
router.use(requireAdmin);

router.get("/stats", (_req, res) => {
  const users = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as any).c;
  const admins = (db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get() as any).c;
  const games = (db.prepare("SELECT COUNT(*) AS c FROM games").get() as any).c;
  const finished = (
    db.prepare("SELECT COUNT(*) AS c FROM games WHERE result != '*'").get() as any
  ).c;
  res.json({ users, admins, games, finished, inProgress: games - finished });
});

router.get("/users", (_req, res) => {
  const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as User[];
  res.json({ users });
});

router.patch("/users/:id/role", (req, res) => {
  const { role } = req.body || {};
  if (role !== "admin" && role !== "user") {
    return res.status(400).json({ error: "role must be 'admin' or 'user'." });
  }
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as
    | User
    | undefined;
  if (!target) return res.status(404).json({ error: "User not found." });

  if (target.id === req.user!.id && role === "user") {
    return res.status(400).json({ error: "You can't demote yourself." });
  }

  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as User;
  res.json({ user: updated });
});

router.delete("/users/:id", (req, res) => {
  if (Number(req.params.id) === req.user!.id) {
    return res.status(400).json({ error: "You can't delete your own account." });
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

router.get("/games", (_req, res) => {
  const games = db
    .prepare(
      `SELECT games.*, users.name AS owner_name, users.email AS owner_email
       FROM games JOIN users ON users.id = games.user_id
       ORDER BY games.created_at DESC`
    )
    .all() as (GameRecord & { owner_name: string; owner_email: string })[];
  res.json({ games });
});

router.delete("/games/:id", (req, res) => {
  db.prepare("DELETE FROM games WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// Wipe every game and every non-admin user — a full reset back to a clean slate.
router.post("/reset", (_req, res) => {
  const wipe = db.transaction(() => {
    db.prepare("DELETE FROM games").run();
    db.prepare("DELETE FROM users WHERE role != 'admin'").run();
  });
  wipe();
  res.json({ ok: true });
});

export default router;
