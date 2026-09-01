import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Chess, Square as ChessSquare, Move } from "chess.js";
import { BoardPiece, GameStatus, PieceColor, PieceType } from "../types/chess";
import { AIDifficulty, getAIMove } from "../lib/aiEngine";

export type GameMode = "pvp" | "ai";

export interface MoveHistoryEntry {
  san: string;
  color: PieceColor;
  moveNumber: number;
}

export interface UseChessGame {
  board: (BoardPiece | null)[][];
  turn: PieceColor;
  selected: string | null;
  legalTargets: string[];
  lastMove: { from: string; to: string } | null;
  status: GameStatus;
  statusLabel: string;
  history: MoveHistoryEntry[];
  captured: { w: PieceType[]; b: PieceType[] };
  isGameOver: boolean;
  isAiThinking: boolean;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  aiColor: PieceColor;
  setGameMode: (mode: GameMode) => void;
  setAiDifficulty: (diff: AIDifficulty) => void;
  setAiColor: (color: PieceColor) => void;
  pendingPromotion: { from: string; to: string } | null;
  select: (square: string) => void;
  completePromotion: (piece: "q" | "r" | "b" | "n") => void;
  cancelPromotion: () => void;
  undo: () => void;
  reset: () => void;
  pgn: () => string;
  resultCode: () => string;
}

function toBoard(chess: Chess): (BoardPiece | null)[][] {
  return chess.board().map((row) =>
    row.map((cell) => (cell ? { square: cell.square, type: cell.type, color: cell.color } : null))
  );
}

export function useChessGame(): UseChessGame {
  const chessRef = useRef(new Chess());
  const [, forceRender] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [captured, setCaptured] = useState<{ w: PieceType[]; b: PieceType[] }>({ w: [], b: [] });
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(
    null
  );

  // Computer AI state
  const [gameMode, setGameMode] = useState<GameMode>("pvp");
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium");
  const [aiColor, setAiColor] = useState<PieceColor>("b");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const bump = () => forceRender((n) => n + 1);

  const chess = chessRef.current;
  const board = useMemo(() => toBoard(chess), [chess, selected, lastMove, pendingPromotion]);

  const legalTargets = useMemo(() => {
    if (!selected || isAiThinking) return [];
    const moves = chess.moves({ square: selected as ChessSquare, verbose: true }) as Move[];
    return moves.map((m) => m.to as string);
  }, [selected, chess, lastMove, isAiThinking]);

  const status: GameStatus = useMemo(() => {
    if (chess.isCheckmate()) return "checkmate";
    if (chess.isStalemate()) return "stalemate";
    if (chess.isThreefoldRepetition()) return "threefold";
    if (chess.isInsufficientMaterial()) return "insufficient";
    if (chess.isDraw()) return "draw";
    if (chess.isCheck()) return "check";
    return "playing";
  }, [chess, lastMove]);

  const turn = chess.turn() as PieceColor;

  const statusLabel = useMemo(() => {
    if (isAiThinking) return "Computer is thinking...";
    const mover = turn === "w" ? "White" : "Black";
    switch (status) {
      case "checkmate":
        return `Checkmate — ${turn === "w" ? "Black" : "White"} wins`;
      case "stalemate":
        return "Stalemate — draw";
      case "threefold":
        return "Draw by threefold repetition";
      case "insufficient":
        return "Draw — insufficient material";
      case "draw":
        return "Draw";
      case "check":
        return `${mover} is in check`;
      default:
        return `${mover} to move`;
    }
  }, [status, turn, isAiThinking]);

  const history: MoveHistoryEntry[] = useMemo(() => {
    const verbose = chess.history({ verbose: true }) as Move[];
    return verbose.map((m, i) => ({
      san: m.san,
      color: m.color as PieceColor,
      moveNumber: Math.floor(i / 2) + 1,
    }));
  }, [chess, lastMove]);

  const applyMove = useCallback(
    (from: string, to: string, promotion?: "q" | "r" | "b" | "n") => {
      const result = chess.move({
        from: from as ChessSquare,
        to: to as ChessSquare,
        promotion,
      });
      if (!result) return false;
      if (result.captured) {
        const capturedColor = result.color === "w" ? "b" : "w";
        setCaptured((prev) => ({
          ...prev,
          [capturedColor]: [...prev[capturedColor], result.captured as PieceType],
        }));
      }
      setLastMove({ from, to });
      setSelected(null);
      bump();
      return true;
    },
    [chess]
  );

  // Trigger computer move when it's AI's turn
  useEffect(() => {
    if (gameMode !== "ai" || chess.isGameOver() || chess.turn() !== aiColor) {
      return;
    }

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const aiMove = getAIMove(chess, aiDifficulty);
      if (aiMove) {
        applyMove(aiMove.from, aiMove.to, aiMove.promotion as any);
      }
      setIsAiThinking(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [gameMode, aiColor, aiDifficulty, turn, applyMove, chess]);

  const select = useCallback(
    (square: string) => {
      if (pendingPromotion || isAiThinking) return;

      // Prevent human player from selecting or moving during computer's turn in AI mode
      if (gameMode === "ai" && chess.turn() === aiColor) {
        return;
      }

      // If a piece is already selected and this square is a legal target, move there.
      if (selected && legalTargets.includes(square)) {
        const piece = chess.get(selected as ChessSquare);
        const isPromotion =
          piece?.type === "p" && (square[1] === "8" || square[1] === "1");
        if (isPromotion) {
          setPendingPromotion({ from: selected, to: square });
          return;
        }
        applyMove(selected, square);
        return;
      }

      const piece = chess.get(square as ChessSquare);
      if (piece && piece.color === chess.turn()) {
        setSelected(square);
      } else {
        setSelected(null);
      }
    },
    [selected, legalTargets, chess, applyMove, pendingPromotion, isAiThinking, gameMode, aiColor]
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

  const undo = useCallback(() => {
    const undone = chess.undo();
    if (undone && undone.captured) {
      const capturedColor = undone.color === "w" ? "b" : "w";
      setCaptured((prev) => {
        const list = [...prev[capturedColor]];
        const idx = list.lastIndexOf(undone.captured as PieceType);
        if (idx >= 0) list.splice(idx, 1);
        return { ...prev, [capturedColor]: list };
      });
    }
    const verbose = chess.history({ verbose: true }) as Move[];
    const prevMove = verbose[verbose.length - 1];
    setLastMove(prevMove ? { from: prevMove.from, to: prevMove.to } : null);
    setSelected(null);
    setPendingPromotion(null);
    bump();
  }, [chess]);

  const reset = useCallback(() => {
    chess.reset();
    setSelected(null);
    setLastMove(null);
    setCaptured({ w: [], b: [] });
    setPendingPromotion(null);
    bump();
  }, [chess]);

  const pgn = useCallback(() => chess.pgn(), [chess, lastMove]);

  const resultCode = useCallback(() => {
    if (chess.isCheckmate()) return turn === "w" ? "0-1" : "1-0";
    if (chess.isDraw() || chess.isStalemate()) return "1/2-1/2";
    return "*";
  }, [chess, turn]);

  return {
    board,
    turn,
    selected,
    legalTargets,
    lastMove,
    status,
    statusLabel,
    history,
    captured,
    isGameOver: chess.isGameOver(),
    isAiThinking,
    gameMode,
    aiDifficulty,
    aiColor,
    setGameMode,
    setAiDifficulty,
    setAiColor,
    pendingPromotion,
    select,
    completePromotion,
    cancelPromotion,
    undo,
    reset,
    pgn,
    resultCode,
  };
}
