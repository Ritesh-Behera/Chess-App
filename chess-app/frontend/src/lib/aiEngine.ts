import { Chess, Move, Square } from "chess.js";

export type AIDifficulty = "easy" | "medium" | "hard" | "master";

export const DIFFICULTY_LABELS: Record<AIDifficulty, { name: string; description: string; elo: number }> = {
  easy: { name: "Beginner (800)", description: "Casual play with frequent mistakes", elo: 800 },
  medium: { name: "Intermediate (1300)", description: "Solid tactics and captures", elo: 1300 },
  hard: { name: "Advanced (1700)", description: "Positional play & deeper tactical vision", elo: 1700 },
  master: { name: "Master (2100)", description: "Minimax depth 3-4 with minimax alpha-beta pruning", elo: 2100 },
};

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square table bonuses (for center control and development)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

function evaluateBoard(chess: Chess): number {
  let totalScore = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const sqIdx = r * 8 + c;
        let positional = 0;
        if (piece.type === "p") {
          positional = piece.color === "w" ? PAWN_TABLE[sqIdx] : PAWN_TABLE[63 - sqIdx];
        } else if (piece.type === "n") {
          positional = piece.color === "w" ? KNIGHT_TABLE[sqIdx] : KNIGHT_TABLE[63 - sqIdx];
        }

        const val = PIECE_VALUES[piece.type] + positional;
        totalScore += piece.color === "w" ? val : -val;
      }
    }
  }

  return totalScore;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true }) as Move[];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getAIMove(chess: Chess, difficulty: AIDifficulty): Move | null {
  const legalMoves = chess.moves({ verbose: true }) as Move[];
  if (legalMoves.length === 0) return null;

  // Easy: 60% random move, 40% simple capture
  if (difficulty === "easy") {
    if (Math.random() < 0.6) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
    // Prioritize captures if any
    const captures = legalMoves.filter((m) => m.captured);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Medium: Depth 1 + basic piece value evaluation
  if (difficulty === "medium") {
    const isAiWhite = chess.turn() === "w";
    let bestMoves: Move[] = [];
    let bestValue = isAiWhite ? -Infinity : Infinity;

    for (const move of legalMoves) {
      chess.move(move);
      const score = evaluateBoard(chess) + (Math.random() * 20 - 10);
      chess.undo();

      if (isAiWhite) {
        if (score > bestValue) {
          bestValue = score;
          bestMoves = [move];
        } else if (score === bestValue) {
          bestMoves.push(move);
        }
      } else {
        if (score < bestValue) {
          bestValue = score;
          bestMoves = [move];
        } else if (score === bestValue) {
          bestMoves.push(move);
        }
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)] || legalMoves[0];
  }

  // Hard & Master: Minimax with alpha-beta pruning (Depth 2 or 3)
  const isAiWhite = chess.turn() === "w";
  const depth = difficulty === "master" ? 3 : 2;
  let bestMoves: Move[] = [];
  let bestValue = isAiWhite ? -Infinity : Infinity;

  // Sort moves so captures and checks are evaluated first
  legalMoves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

  for (const move of legalMoves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isAiWhite);
    chess.undo();

    if (isAiWhite) {
      if (score > bestValue) {
        bestValue = score;
        bestMoves = [move];
      } else if (score === bestValue) {
        bestMoves.push(move);
      }
    } else {
      if (score < bestValue) {
        bestValue = score;
        bestMoves = [move];
      } else if (score === bestValue) {
        bestMoves.push(move);
      }
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || legalMoves[0];
}
