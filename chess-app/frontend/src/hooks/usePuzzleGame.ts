import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Chess, Square as ChessSquare, Move } from "chess.js";
import { BoardPiece, GameStatus, PieceColor, PieceType } from "../types/chess";
import { ChessPuzzle } from "../lib/puzzles";

export interface UsePuzzleGame {
  board: (BoardPiece | null)[][];
  turn: PieceColor;
  selected: string | null;
  legalTargets: string[];
  lastMove: { from: string; to: string } | null;
  status: GameStatus;
  isSolved: boolean;
  isFailed: boolean;
  moveFeedback: "correct" | "incorrect" | "complete" | null;
  hint: string | null;
  attemptsCount: number;
  pendingPromotion: { from: string; to: string } | null;
  select: (square: string) => void;
  completePromotion: (piece: "q" | "r" | "b" | "n") => void;
  cancelPromotion: () => void;
  requestHint: () => void;
  retry: () => void;
  loadPuzzle: (puzzle: ChessPuzzle) => void;
}

function toBoard(chess: Chess): (BoardPiece | null)[][] {
  return chess.board().map((row) =>
    row.map((cell) => (cell ? { square: cell.square, type: cell.type, color: cell.color } : null))
  );
}

export function usePuzzleGame(
  initialPuzzle: ChessPuzzle,
  onComplete?: (puzzle: ChessPuzzle, attempts: number) => void
): UsePuzzleGame {
  const [puzzle, setPuzzle] = useState<ChessPuzzle>(initialPuzzle);
  const chessRef = useRef(new Chess(initialPuzzle.fen));
  const [, forceRender] = useState(0);

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [moveFeedback, setMoveFeedback] = useState<"correct" | "incorrect" | "complete" | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [attemptsCount, setAttemptsCount] = useState(1);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  const bump = () => forceRender((n) => n + 1);
  const chess = chessRef.current;

  // Load new puzzle
  const loadPuzzle = useCallback((newPuzzle: ChessPuzzle) => {
    setPuzzle(newPuzzle);
    chessRef.current = new Chess(newPuzzle.fen);
    setStepIndex(0);
    setSelected(null);
    setLastMove(null);
    setIsSolved(false);
    setIsFailed(false);
    setMoveFeedback(null);
    setHint(null);
    setAttemptsCount(1);
    setPendingPromotion(null);
    bump();
  }, []);

  const board = useMemo(() => toBoard(chess), [chess, selected, lastMove, pendingPromotion]);

  const legalTargets = useMemo(() => {
    if (!selected || isSolved) return [];
    const moves = chess.moves({ square: selected as ChessSquare, verbose: true }) as Move[];
    return moves.map((m) => m.to as string);
  }, [selected, chess, lastMove, isSolved]);

  const turn = chess.turn() as PieceColor;

  const status: GameStatus = useMemo(() => {
    if (chess.isCheckmate()) return "checkmate";
    if (chess.isStalemate()) return "stalemate";
    if (chess.isDraw()) return "draw";
    if (chess.isCheck()) return "check";
    return "playing";
  }, [chess, lastMove]);

  // Execute a player move and check against solution
  const applyMove = useCallback(
    (from: string, to: string, promotion?: "q" | "r" | "b" | "n") => {
      const expectedMove = puzzle.solution[stepIndex];
      if (!expectedMove) return false;

      const isCorrect =
        expectedMove.from.toLowerCase() === from.toLowerCase() &&
        expectedMove.to.toLowerCase() === to.toLowerCase() &&
        (!expectedMove.promotion || expectedMove.promotion === promotion);

      if (!isCorrect) {
        // Incorrect move feedback
        setIsFailed(true);
        setMoveFeedback("incorrect");
        setAttemptsCount((c) => c + 1);
        setSelected(null);
        return false;
      }

      // Valid solution move
      const res = chess.move({
        from: from as ChessSquare,
        to: to as ChessSquare,
        promotion: promotion || expectedMove.promotion,
      });

      if (!res) return false;

      setLastMove({ from, to });
      setSelected(null);
      setHint(null);

      const nextStepIndex = stepIndex + 1;

      // Check if puzzle is finished
      if (nextStepIndex >= puzzle.solution.length) {
        setIsSolved(true);
        setMoveFeedback("complete");
        bump();
        if (onComplete) {
          onComplete(puzzle, attemptsCount);
        }
        return true;
      }

      // If not finished, execute the opponent's counter move automatically after a brief delay
      setStepIndex(nextStepIndex);
      setMoveFeedback("correct");
      bump();

      const opponentMove = puzzle.solution[nextStepIndex];
      if (opponentMove) {
        setTimeout(() => {
          chess.move({
            from: opponentMove.from as ChessSquare,
            to: opponentMove.to as ChessSquare,
            promotion: opponentMove.promotion,
          });
          setLastMove({ from: opponentMove.from, to: opponentMove.to });
          setStepIndex(nextStepIndex + 1);
          setMoveFeedback(null);
          bump();
        }, 500);
      }

      return true;
    },
    [chess, puzzle, stepIndex, attemptsCount, onComplete]
  );

  const select = useCallback(
    (square: string) => {
      if (pendingPromotion || isSolved) return;

      // If moving selected piece to legal target
      if (selected && legalTargets.includes(square)) {
        const piece = chess.get(selected as ChessSquare);
        const isPromotion = piece?.type === "p" && (square[1] === "8" || square[1] === "1");
        if (isPromotion) {
          setPendingPromotion({ from: selected, to: square });
          return;
        }
        applyMove(selected, square);
        return;
      }

      // Select piece of player color only
      const piece = chess.get(square as ChessSquare);
      if (piece && piece.color === puzzle.playerColor && chess.turn() === puzzle.playerColor) {
        setSelected(square);
        if (moveFeedback === "incorrect") setMoveFeedback(null);
      } else {
        setSelected(null);
      }
    },
    [selected, legalTargets, chess, puzzle, applyMove, pendingPromotion, isSolved, moveFeedback]
  );

  const completePromotion = useCallback(
    (pieceType: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      applyMove(pendingPromotion.from, pendingPromotion.to, pieceType);
      setPendingPromotion(null);
    },
    [pendingPromotion, applyMove]
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelected(null);
  }, []);

  const retry = useCallback(() => {
    chessRef.current = new Chess(puzzle.fen);
    setStepIndex(0);
    setSelected(null);
    setLastMove(null);
    setIsFailed(false);
    setMoveFeedback(null);
    setHint(null);
    bump();
  }, [puzzle]);

  const requestHint = useCallback(() => {
    const nextExpected = puzzle.solution[stepIndex];
    if (nextExpected) {
      setHint(`Hint: Move piece on ${nextExpected.from.toUpperCase()} to ${nextExpected.to.toUpperCase()}`);
    }
  }, [puzzle, stepIndex]);

  return {
    board,
    turn,
    selected,
    legalTargets,
    lastMove,
    status,
    isSolved,
    isFailed,
    moveFeedback,
    hint,
    attemptsCount,
    pendingPromotion,
    select,
    completePromotion,
    cancelPromotion,
    requestHint,
    retry,
    loadPuzzle,
  };
}
