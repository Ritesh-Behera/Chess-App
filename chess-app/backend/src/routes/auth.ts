import { Router } from "express";
import passport from "passport";
import db from "../db";
import crypto from "crypto";

const router = Router();
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

function generateAuthToken(userId: number): string {
  const timestamp = Date.now();
  const data = `${userId}:${timestamp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return Buffer.from(`${data}:${sig}`).toString("base64url");
}

export function verifyAuthToken(tokenStr: string): number | null {
  try {
    const raw = Buffer.from(tokenStr, "base64url").toString("utf-8");
    const [userIdStr, timestampStr, sig] = raw.split(":");
    if (!userIdStr || !timestampStr || !sig) return null;

    const data = `${userIdStr}:${timestampStr}`;
    const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      // Valid for 30 days
      const age = Date.now() - parseInt(timestampStr, 10);
      if (age > 1000 * 60 * 60 * 24 * 30) return null;
      return parseInt(userIdStr, 10);
    }
  } catch {
    return null;
  }
  return null;
}

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${getClientUrl()}/login?error=google_not_configured`);
  }
  return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${getClientUrl()}/login?error=auth_failed`,
  }),
  (req, res) => {
    const user = req.user as any;
    if (user && user.id) {
      const token = generateAuthToken(user.id);
      // Pass token in URL query parameter back to Vercel frontend
      return res.redirect(`${getClientUrl()}/?token=${token}`);
    }
    res.redirect(`${getClientUrl()}/`);
  }
);

router.get("/me", (req, res) => {
  // Check auth header first (token based)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = verifyAuthToken(token);
    if (userId) {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (user) return res.json({ user });
    }
  }

  // Fallback to cookie session
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  return res.json({ user: null });
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("chess.sid");
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

export default router;
