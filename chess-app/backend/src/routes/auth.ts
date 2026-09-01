import { Router } from "express";
import passport from "passport";

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${CLIENT_URL}/login?error=google_not_configured`);
  }
  return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=auth_failed`,
  }),
  (_req, res) => {
    res.redirect(`${CLIENT_URL}/`);
  }
);

router.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  return res.json({ user: null });
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
});

export default router;
