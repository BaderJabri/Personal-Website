import { z } from "zod";
import data from "../../../content/chess/puzzles.json";
import { isCheckmate, makeMove, moveFromUci, parseFen, type Color, type Position } from "./engine";

// Puzzle play, as pure functions over a Session. The board component only animates what these
// return. Puzzles come from the Lichess database (CC0) via scripts/fetch-puzzles.ts: the position
// is after the opponent's last move; `solution` alternates our moves and their replies.

const puzzleSchema = z.object({
  id: z.string().min(1),
  rating: z.number().int(),
  fen: z.string().min(1),
  lastMove: z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/),
  solution: z.array(z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/)).min(1),
  themes: z.array(z.string()),
  goal: z.enum(["mate", "material"]),
  mateIn: z.number().int().positive().optional(),
});
export type Puzzle = z.infer<typeof puzzleSchema>;
export const PUZZLES: Puzzle[] = z.array(puzzleSchema).parse(data);

export interface Session {
  puzzle: Puzzle;
  pos: Position;
  /** index into puzzle.solution of the next move to be played */
  ply: number;
  player: Color;
  status: "playing" | "solved";
  mistakes: number;
  lastMove: string;
}

export function startSession(puzzle: Puzzle): Session {
  const pos = parseFen(puzzle.fen);
  return { puzzle, pos, ply: 0, player: pos.turn, status: "playing", mistakes: 0, lastMove: puzzle.lastMove };
}

export type Attempt =
  | { result: "illegal"; session: Session }
  | { result: "wrong"; session: Session }
  | { result: "correct"; session: Session }
  | { result: "solved"; session: Session };

/** The player's move. Wrong-but-legal moves are counted and the position is left unchanged. */
export function attempt(s: Session, uci: string): Attempt {
  const move = moveFromUci(s.pos, uci);
  if (!move || s.status !== "playing") return { result: "illegal", session: s };
  const after = makeMove(s.pos, move);
  const expected = s.puzzle.solution[s.ply];
  // any mate solves a mate puzzle, as on Lichess
  const mates = s.puzzle.goal === "mate" && isCheckmate(after);
  if (uci !== expected && !mates) return { result: "wrong", session: { ...s, mistakes: s.mistakes + 1 } };

  const ply = s.ply + 1;
  const solved = mates || ply >= s.puzzle.solution.length;
  return {
    result: solved ? "solved" : "correct",
    session: { ...s, pos: after, ply, status: solved ? "solved" : "playing", lastMove: uci },
  };
}

/** The opponent's scripted reply, played after a correct move. */
export function playReply(s: Session): Session {
  const uci = s.puzzle.solution[s.ply];
  const move = uci && moveFromUci(s.pos, uci);
  if (!move) return s;
  return { ...s, pos: makeMove(s.pos, move), ply: s.ply + 1, lastMove: uci };
}

/** What to call the puzzle on screen. */
export function puzzleTitle(p: Puzzle): string {
  if (p.goal === "mate") return p.mateIn === 1 ? "Mate in one" : `Mate in ${["", "one", "two", "three", "four", "five"][p.mateIn ?? 0] ?? p.mateIn}`;
  return "Win material";
}

/** A gentle hint, shown after a couple of misses. */
export function puzzleHint(p: Puzzle): string | null {
  const named: Record<string, string> = {
    fork: "Look for a move that attacks two things at once.",
    pin: "Something can't move without exposing a bigger piece behind it.",
    discoveredAttack: "Move one piece out of the way to unleash another.",
    sacrifice: "It might be worth giving something up first.",
    backRankMate: "The king is stuck behind its own pawns.",
    smotheredMate: "The king is boxed in by its own pieces.",
    deflection: "Pull a defender away from its job.",
    hangingPiece: "Something is undefended.",
  };
  for (const t of p.themes) if (named[t]) return named[t];
  return p.goal === "mate" ? "Start with a check." : null;
}
