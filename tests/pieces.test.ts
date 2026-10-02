import { expect, test } from "bun:test";
import fs from "node:fs";
import { moveFromUci, parseFen, squareIndex } from "../src/lib/chess/engine";
import { movePieces, pieceSrc, placePieces } from "../src/lib/chess/pieces";
import { PUZZLES } from "../src/lib/chess/puzzles";

test("every piece in every puzzle has an image", () => {
  const used = new Set(PUZZLES.flatMap((p) => parseFen(p.fen).board.filter((x) => x !== null)));
  for (const piece of used) expect(fs.existsSync(`public${pieceSrc(piece!)}`)).toBe(true);
});

test("a capture removes the captured piece and keeps the mover's id", () => {
  const pos = parseFen("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1");
  const before = placePieces(pos);
  const mover = before.find((p) => p.sq === squareIndex("e4"))!;
  const after = movePieces(before, moveFromUci(pos, "e4d5")!);
  expect(after).toHaveLength(before.length - 1);
  expect(after.find((p) => p.id === mover.id)!.sq).toBe(squareIndex("d5"));
});

test("castling moves the rook too", () => {
  const pos = parseFen("4k3/8/8/8/8/8/8/4K2R w K - 0 1");
  const after = movePieces(placePieces(pos), moveFromUci(pos, "e1g1")!);
  expect(after.find((p) => p.piece === "R")!.sq).toBe(squareIndex("f1"));
});

test("en passant removes the pawn beside, and promotion swaps the piece", () => {
  const ep = parseFen("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
  const afterEp = movePieces(placePieces(ep), moveFromUci(ep, "e5d6")!);
  expect(afterEp.some((p) => p.sq === squareIndex("d5"))).toBe(false);
  const promo = parseFen("8/P6k/8/8/8/8/8/K7 w - - 0 1");
  const afterPromo = movePieces(placePieces(promo), moveFromUci(promo, "a7a8q")!);
  expect(afterPromo.find((p) => p.sq === squareIndex("a8"))!.piece).toBe("Q");
});
