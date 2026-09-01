export type Square = string; // e.g. "e4"
export type PieceColor = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export interface BoardPiece {
  square: Square;
  type: PieceType;
  color: PieceColor;
}

export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "threefold"
  | "insufficient";
