export type UserRole = "admin" | "user";

export interface AppUser {
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
  result: string;
  end_reason: string;
  move_count: number;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
}
