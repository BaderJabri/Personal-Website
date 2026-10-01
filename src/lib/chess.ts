// Mate-in-one puzzles for the About page. Each solution was checked by hand to be the only
// mating move in its position. White pieces are upper case, black lower case.

export type Square = string; // "a1".."h8"
export type Piece = "K" | "Q" | "R" | "B" | "N" | "P" | "k" | "q" | "r" | "b" | "n" | "p";

export interface Puzzle {
  name: string;
  board: Record<Square, Piece>;
  solution: { from: Square; to: Square };
  explain: string;
  traps?: { from: Square; to: Square; result: "stalemate" }[];
}

export const PUZZLES: Puzzle[] = [
  {
    name: "Back rank",
    board: { g1: "K", a1: "R", f2: "P", g2: "P", h2: "P", g8: "k", f7: "p", g7: "p", h7: "p" },
    solution: { from: "a1", to: "a8" },
    explain: "Black's own pawns box the king in, so a rook on the back rank is mate.",
  },
  {
    name: "Smothered",
    board: { b1: "K", g5: "N", h8: "k", g8: "r", g7: "p", h7: "p" },
    solution: { from: "g5", to: "f7" },
    explain: "The king is surrounded by its own pieces, and nothing can reach the knight on f7.",
  },
  {
    name: "Queen and king",
    board: { b6: "K", c1: "Q", a8: "k" },
    solution: { from: "c1", to: "c8" },
    explain: "The queen takes the back rank and the white king covers a7 and b7.",
    traps: [{ from: "c1", to: "c7", result: "stalemate" }],
  },
];

export function pieceAt(p: Puzzle, sq: Square): Piece | undefined {
  return p.board[sq];
}

export function judge(p: Puzzle, from: Square, to: Square): "mate" | "stalemate" | "wrong" {
  if (from === p.solution.from && to === p.solution.to) return "mate";
  if (p.traps?.some((t) => t.from === from && t.to === to)) return "stalemate";
  return "wrong";
}

/** Piece image (cburnett set, see public/images/chess/ATTRIBUTION.txt). Unicode chess glyphs
 *  fall back to colour emoji on Windows, so the board uses images instead. */
export function pieceSrc(p: Piece): string {
  return `/images/chess/${p === p.toUpperCase() ? "w" : "b"}${p.toUpperCase()}.svg`;
}

export const NAME: Record<string, string> = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
