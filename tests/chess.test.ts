import { describe, expect, test } from "bun:test";
import { PUZZLES, judge, pieceAt } from "../src/lib/chess";

describe("chess puzzles", () => {
  test("each position has exactly one king per side", () => {
    for (const p of PUZZLES) {
      const pieces = Object.values(p.board);
      expect(pieces.filter((x) => x === "K")).toHaveLength(1);
      expect(pieces.filter((x) => x === "k")).toHaveLength(1);
    }
  });

  test("each solution moves a white piece", () => {
    for (const p of PUZZLES) {
      const piece = pieceAt(p, p.solution.from);
      expect(piece).toBeDefined();
      expect(piece!.toUpperCase()).toBe(piece!);
    }
  });

  test("the solution is judged mate", () => {
    for (const p of PUZZLES) expect(judge(p, p.solution.from, p.solution.to)).toBe("mate");
  });

  test("a known trap is called out as stalemate", () => {
    const queen = PUZZLES.find((p) => p.traps?.length)!;
    const trap = queen.traps![0];
    expect(judge(queen, trap.from, trap.to)).toBe("stalemate");
  });

  test("anything else is simply not mate", () => {
    expect(judge(PUZZLES[0], "g1", "h1")).toBe("wrong");
  });
});
