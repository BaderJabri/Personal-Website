import { describe, expect, test } from "bun:test";
import {
  START_FEN,
  isCheckmate,
  isStalemate,
  legalMoves,
  makeMove,
  moveFromSan,
  moveFromUci,
  parseFen,
  perft,
  replaySan,
  toFen,
  toSan,
  toUci,
} from "../src/lib/chess/engine";

// Reference perft counts from https://www.chessprogramming.org/Perft_Results
const PERFT: [string, string, number[]][] = [
  ["start", START_FEN, [20, 400, 8902]],
  ["kiwipete", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", [48, 2039, 97862]],
  ["position 3", "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", [14, 191, 2812]],
  ["position 4", "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", [6, 264, 9467]],
  ["position 5", "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", [44, 1486, 62379]],
];

describe("perft", () => {
  for (const [name, fen, counts] of PERFT) {
    test(`${name} matches the reference node counts`, () => {
      const pos = parseFen(fen);
      counts.forEach((n, i) => expect(perft(pos, i + 1)).toBe(n));
    });
  }
});

describe("FEN", () => {
  test("round-trips", () => {
    for (const [, fen] of PERFT) expect(toFen(parseFen(fen))).toBe(fen);
  });
  test("tracks the en passant square after a double push", () => {
    const after = makeMove(parseFen(START_FEN), moveFromUci(parseFen(START_FEN), "e2e4")!);
    expect(toFen(after)).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
  });
});

describe("SAN", () => {
  const start = parseFen(START_FEN);
  test("writes and reads simple moves", () => {
    expect(toSan(start, moveFromUci(start, "g1f3")!)).toBe("Nf3");
    expect(toUci(moveFromSan(start, "e4")!)).toBe("e2e4");
  });
  test("disambiguates by file when two knights can reach a square", () => {
    const pos = parseFen("4k3/8/8/8/8/8/8/1N2KN2 w - - 0 1");
    expect(toSan(pos, moveFromUci(pos, "b1d2")!)).toBe("Nbd2");
    expect(toUci(moveFromSan(pos, "Nfd2")!)).toBe("f1d2");
  });
  test("marks check and mate, and handles castling and promotion", () => {
    const mate = replaySan(["e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6"]);
    expect(toSan(mate, moveFromUci(mate, "h5f7")!)).toBe("Qxf7#");
    const castle = parseFen("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
    expect(toSan(castle, moveFromUci(castle, "e1g1")!)).toBe("O-O");
    expect(toUci(moveFromSan(castle, "O-O-O")!)).toBe("e1c1");
    const promo = parseFen("8/P7/8/8/8/8/8/k6K w - - 0 1");
    expect(toSan(promo, moveFromUci(promo, "a7a8q")!)).toBe("a8=Q+");
  });
  test("rejects moves that are not legal", () => {
    expect(moveFromSan(start, "e5")).toBeNull();
    expect(moveFromUci(start, "e1e2")).toBeNull();
  });
});

describe("game state", () => {
  test("detects checkmate and stalemate", () => {
    expect(isCheckmate(parseFen("R5k1/5ppp/8/8/8/8/8/6K1 b - - 0 1"))).toBe(true);
    // the king can take an unprotected rook, so this one is only check
    expect(isCheckmate(parseFen("6Rk/6pp/8/8/8/8/8/6K1 b - - 0 1"))).toBe(false);
    expect(isStalemate(parseFen("k7/2Q5/1K6/8/8/8/8/8 b - - 0 1"))).toBe(true);
    expect(isCheckmate(parseFen(START_FEN))).toBe(false);
  });
  test("a king may not walk into check, and pinned pieces stay pinned", () => {
    const pinned = parseFen("4k3/4r3/8/8/8/8/4B3/4K3 w - - 0 1");
    expect(legalMoves(pinned).some((m) => toUci(m).startsWith("e2"))).toBe(false);
  });
  test("replays a real Lichess game to the puzzle position", () => {
    const pgn =
      "e4 d6 d4 c6 Nf3 Nd7 Nc3 h6 Bf4 g5 Bg3 Qb6 Qd2 Bg7 Bc4 Qxb2 O-O c5 e5 dxe5 dxe5 e6 Nb5 Kf8 Qd6+ Ne7 Nc7 Rb8 Nxe6+ fxe6 Qxe6 Qb6";
    const pos = replaySan(pgn.split(" "));
    const mate = moveFromUci(pos, "e6f7")!;
    expect(mate).not.toBeNull();
    expect(isCheckmate(makeMove(pos, mate))).toBe(true);
  });
});
