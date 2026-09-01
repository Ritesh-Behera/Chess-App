import { Request, Response, NextFunction } from "express";
import db from "../db";
import { verifyAuthToken } from "../routes/auth";
import { User } from "../types";

function extractUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = verifyAuthToken(token);
    if (userId) {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
      if (user) return user;
    }
  }
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return req.user as User;
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = extractUser(req);
  if (user) {
    req.user = user;
    return next();
  }
  return res.status(401).json({ error: "Sign in required." });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = extractUser(req);
  if (user && user.role === "admin") {
    req.user = user;
    return next();
  }
  return res.status(403).json({ error: "Admin access required." });
}
