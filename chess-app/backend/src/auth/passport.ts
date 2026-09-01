import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../db";
import { User } from "../types";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: number, done) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
  done(null, user || false);
});

const clientID = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const callbackURL = process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback";

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() || "";
          const avatar = profile.photos?.[0]?.value || null;
          const name = profile.displayName || email;

          const existing = db
            .prepare("SELECT * FROM users WHERE google_id = ?")
            .get(profile.id) as User | undefined;

          if (existing) {
            const role = ADMIN_EMAILS.includes(email) ? "admin" : existing.role;
            db.prepare("UPDATE users SET name = ?, avatar = ?, email = ?, role = ? WHERE id = ?").run(
              name,
              avatar,
              email,
              role,
              existing.id
            );
            const refreshed = db.prepare("SELECT * FROM users WHERE id = ?").get(existing.id) as User;
            return done(null, refreshed as any);
          }

          const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";

          const info = db
            .prepare(
              "INSERT INTO users (google_id, email, name, avatar, role) VALUES (?, ?, ?, ?, ?)"
            )
            .run(profile.id, email, name, avatar, role);

          const created = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as User;
          return done(null, created as any);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set — Google sign-in is disabled until backend/.env is configured."
  );
}

export default passport;
