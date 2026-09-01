export interface ChessPuzzle {
  id: string;
  title: string;
  fen: string;
  rating: number;
  theme: "Mate in 1" | "Mate in 2" | "Fork" | "Pin" | "Discovery" | "Endgame" | "Tactics";
  description: string;
  playerColor: "w" | "b";
  // Sequence of moves in UCI format (e.g. ["e2e4", "e7e5"]) or SAN
  solution: { from: string; to: string; promotion?: "q" | "r" | "b" | "n" }[];
}

export const PUZZLES: ChessPuzzle[] = [
  {
    id: "puz-001",
    title: "Back Rank Deliverance",
    fen: "6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1",
    rating: 800,
    theme: "Mate in 1",
    description: "Find the decisive move to checkmate the black king on the back rank.",
    playerColor: "w",
    solution: [{ from: "e2", to: "e8" }],
  },
  {
    id: "puz-002",
    title: "Smothered Echo",
    fen: "6k1/5ppp/8/8/8/8/1Q6/6K1 w - - 0 1",
    rating: 850,
    theme: "Mate in 1",
    description: "Deliver an unstoppable back-rank mate with your Queen.",
    playerColor: "w",
    solution: [{ from: "b2", to: "b8" }],
  },
  {
    id: "puz-003",
    title: "Opera House Mate",
    fen: "rn2kb1r/ppp2ppp/4b3/8/4n3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 6",
    rating: 1100,
    theme: "Tactics",
    description: "White to move and pin down the active black knight or win material.",
    playerColor: "w",
    solution: [
      { from: "d1", to: "e2" },
      { from: "d7", to: "d5" },
      { from: "d2", to: "d3" },
    ],
  },
  {
    id: "puz-004",
    title: "Anastasia's Trap",
    fen: "5rk1/1p3ppp/pb6/3N4/8/8/PPP3PP/2KR4 w - - 0 20",
    rating: 1050,
    theme: "Fork",
    description: "White has a tactical strike to win a piece.",
    playerColor: "w",
    solution: [{ from: "d5", to: "b6" }],
  },
  {
    id: "puz-005",
    title: "Bishop & Queen Battery",
    fen: "r1b2rk1/pp3ppp/2n1p3/3p4/8/1BP1qN2/PP2Q1PP/R4R1K w - - 0 15",
    rating: 950,
    theme: "Tactics",
    description: "White to trade Queens and seize control of the open file.",
    playerColor: "w",
    solution: [{ from: "e2", to: "e3" }],
  },
  {
    id: "puz-006",
    title: "The Greek Gift Finish",
    fen: "5rk1/ppp2ppp/8/8/3Q4/8/PPP2PPP/4R1K1 w - - 0 1",
    rating: 900,
    theme: "Mate in 1",
    description: "Find the single move that seals the game immediately.",
    playerColor: "w",
    solution: [{ from: "d4", to: "d8" }],
  },
  {
    id: "puz-007",
    title: "Royal Fork",
    fen: "r3k2r/pppq1ppp/2n5/3N4/1b1P4/4P3/PP3PPP/R1BQK2R w KQkq - 1 11",
    rating: 1150,
    theme: "Fork",
    description: "Black is in check. Resolve the check while keeping active tension.",
    playerColor: "w",
    solution: [{ from: "d5", to: "c3" }],
  },
  {
    id: "puz-008",
    title: "Corridor Mate",
    fen: "r5k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    rating: 800,
    theme: "Mate in 1",
    description: "A clean mate-in-one down the open a-file.",
    playerColor: "w",
    solution: [{ from: "a1", to: "a8" }],
  },
  {
    id: "puz-009",
    title: "Knight Outpost Mate",
    fen: "r1b3k1/pp3ppp/2p5/8/8/2N5/PP3PPP/3R2K1 w - - 0 1",
    rating: 850,
    theme: "Mate in 1",
    description: "Rook invades the vulnerable 8th rank.",
    playerColor: "w",
    solution: [{ from: "d1", to: "d8" }],
  },
  {
    id: "puz-010",
    title: "Queen Infiltration",
    fen: "r4rk1/ppp2ppp/8/8/8/8/q5PP/4RR1K b - - 0 1",
    rating: 950,
    theme: "Tactics",
    description: "Black to move: centralize the rook to maintain dynamic pressure.",
    playerColor: "b",
    solution: [{ from: "a8", to: "e8" }],
  },
  {
    id: "puz-011",
    title: "Pawn Break Breakthrough",
    fen: "8/5p2/4p1k1/3pP1p1/6P1/4K3/8/8 w - - 0 1",
    rating: 1200,
    theme: "Endgame",
    description: "King activity is decisive. Improve your king position.",
    playerColor: "w",
    solution: [{ from: "e3", to: "d4" }],
  },
  {
    id: "puz-012",
    title: "Discovered Check Threat",
    fen: "r1bqkb1r/pppp1ppp/2n5/4P3/3Pn3/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 5",
    rating: 1050,
    theme: "Discovery",
    description: "White plays Bishop d3 to attack the undefended knight on e4.",
    playerColor: "w",
    solution: [{ from: "f1", to: "d3" }],
  },
  {
    id: "puz-013",
    title: "Scholar's Echo",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3",
    rating: 700,
    theme: "Mate in 1",
    description: "Spot the classic f7 mating square with Queen and Bishop.",
    playerColor: "w",
    solution: [{ from: "f3", to: "f7" }],
  },
  {
    id: "puz-014",
    title: "Rook Lift Dominance",
    fen: "3r2k1/p4ppp/8/8/3R4/8/5PPP/6K1 w - - 0 1",
    rating: 850,
    theme: "Mate in 1",
    description: "Trade rooks on the back rank to checkmate.",
    playerColor: "w",
    solution: [{ from: "d4", to: "d8" }],
  },
];

// Deterministically picks a daily puzzle based on date string "YYYY-MM-DD"
export function getDailyPuzzle(dateString: string): ChessPuzzle {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PUZZLES.length;
  return PUZZLES[index];
}

// Get random puzzle for infinite training mode
export function getRandomPuzzle(excludeId?: string): ChessPuzzle {
  const filtered = excludeId ? PUZZLES.filter((p) => p.id !== excludeId) : PUZZLES;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}
