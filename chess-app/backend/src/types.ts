export type UserRole = "admin" | "user";

export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  created_at: string;
}

export interface GameRecord {
  id: number;
  user_id: number;
  white_name: string;
  black_name: string;
  pgn: string;
  result: string; // "1-0" | "0-1" | "1/2-1/2" | "*"
  end_reason: string; // "checkmate" | "stalemate" | "draw" | "resignation" | "in-progress"
  move_count: number;
  created_at: string;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      google_id: string;
      email: string;
      name: string;
      avatar: string | null;
      role: UserRole;
      created_at: string;
    }
  }
}
