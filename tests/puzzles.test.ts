import { describe, expect, test } from "bun:test";
import { isCheckmate, legalMoves, makeMove, moveFromUci, parseFen, toUci } from "../src/lib/chess/engine";
import data from "../content/chess/puzzles.json";
import { puzzleSchema } from "../src/lib/chess/puzzle-schema";
import { PUZZLES, attempt, playReply, puzzleTitle, startSession, type Session } from "../src/lib/chess/puzzles";

// Plays the stored line: our moves through attempt(), the opponent's through playReply().
function solve(s: Session): Session {
  while (s.status === "playing") {
    const r = attempt(s, s.puzzle.solution[s.ply]);
    expect(r.result === "correct" || r.result === "solved").toBe(true);
    s = r.session;
    if (s.status === "playing") s = playReply(s);
  }
  return s;
}

describe("stored puzzles", () => {
  test("the JSON matches the puzzle schema", () => {
    expect(() => puzzleSchema.array().parse(data)).not.toThrow();
  });

  test("there are ten, rated from easiest to hardest", () => {
    expect(PUZZLES).toHaveLength(10);
    for (let i = 1; i < PUZZLES.length; i++) expect(PUZZLES[i].rating).toBeGreaterThan(PUZZLES[i - 1].rating);
  });

  test("they start at mate in one and include longer lines", () => {
    expect(PUZZLES[0].mateIn).toBe(1);
    expect(Math.max(...PUZZLES.map((p) => p.solution.length))).toBeGreaterThanOrEqual(5);
  });

  test("every puzzle is a real-game position with spectators on the board", () => {
    for (const p of PUZZLES) {
      const pieces = parseFen(p.fen).board.filter(Boolean).length;
      expect(pieces).toBeGreaterThanOrEqual(8);
    }
  });

  test("every puzzle can be solved by its own line, and mates end in mate", () => {
    for (const p of PUZZLES) {
      const end = solve(startSession(p));
      expect(end.status).toBe("solved");
      if (p.goal === "mate") expect(isCheckmate(end.pos)).toBe(true);
    }
  });
});

describe("attempt", () => {
  const mateIn1 = PUZZLES[0];

  test("a legal move that isn't the answer is wrong and leaves the board as it was", () => {
    const s = startSession(mateIn1);
    const wrong = legalMoves(s.pos)
      .map(toUci)
      .find((u) => u !== mateIn1.solution[0] && !isCheckmate(makeMove(s.pos, moveFromUci(s.pos, u)!)))!;
    const r = attempt(s, wrong);
    expect(r.result).toBe("wrong");
    expect(r.session.pos).toBe(s.pos);
    expect(r.session.mistakes).toBe(1);
  });

  test("an illegal move is refused", () => {
    expect(attempt(startSession(mateIn1), "a1a1").result).toBe("illegal");
  });

  test("any mate counts in a mate puzzle, even if it isn't the stored move", () => {
    // back-rank position with two different mates: Ra8# and Re8#
    const twoMates = {
      ...mateIn1,
      fen: "6k1/5ppp/8/8/8/8/8/R3R1K1 w - - 0 1",
      solution: ["a1a8"],
      mateIn: 1,
      goal: "mate" as const,
    };
    expect(attempt(startSession(twoMates), "e1e8").result).toBe("solved");
  });

  test("a correct move mid-line waits for the opponent's reply", () => {
    const longer = PUZZLES.find((p) => p.solution.length >= 3)!;
    const r = attempt(startSession(longer), longer.solution[0]);
    expect(r.result).toBe("correct");
    expect(r.session.status).toBe("playing");
    const after = playReply(r.session);
    expect(after.ply).toBe(2);
    expect(after.lastMove).toBe(longer.solution[1]);
  });
});

describe("puzzleTitle", () => {
  const base = PUZZLES[0];

  test("names short mates in words and long ones in digits", () => {
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: 1 })).toBe("Mate in one");
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: 3 })).toBe("Mate in three");
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: 7 })).toBe("Mate in 7");
  });

  test("a mate puzzle without a length still reads naturally", () => {
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: undefined })).toBe("Find the mate");
  });

  test("material puzzles", () => {
    expect(puzzleTitle({ ...base, goal: "material", mateIn: undefined })).toBe("Win material");
  });
});
