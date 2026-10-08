// A small, complete chess move generator: legal moves (castling, en passant, promotion),
// check / mate / stalemate, FEN, UCI and SAN. Verified against the standard perft node counts
// (tests/chess-engine.test.ts). Squares are 0..63, row-major from a8 (0) to h1 (63).

export type Piece = "P" | "N" | "B" | "R" | "Q" | "K" | "p" | "n" | "b" | "r" | "q" | "k";
export type Color = "w" | "b";

export interface Position {
  board: (Piece | null)[];
  turn: Color;
  castling: { K: boolean; Q: boolean; k: boolean; q: boolean };
  ep: number | null;
  half: number;
  full: number;
}

export interface Move {
  from: number;
  to: number;
  piece: Piece;
  captured: Piece | null;
  promotion?: Piece;
  flag: "n" | "dbl" | "ep" | "k" | "q";
}

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const FILES = "abcdefgh";

export const isWhite = (p: Piece) => p === p.toUpperCase();
export const colorOf = (p: Piece): Color => (isWhite(p) ? "w" : "b");
export const row = (sq: number) => sq >> 3;
export const col = (sq: number) => sq & 7;
export const squareName = (sq: number) => `${FILES[col(sq)]}${8 - row(sq)}`;
export function squareIndex(name: string): number {
  const c = FILES.indexOf(name[0]);
  const r = 8 - Number(name[1]);
  if (c < 0 || r < 0 || r > 7 || Number.isNaN(r)) throw new Error(`Bad square: ${name}`);
  return r * 8 + c;
}

// ---------------------------------------------------------------- FEN

export function parseFen(fen: string): Position {
  const [placement, turn, castling, ep, half = "0", full = "1"] = fen.trim().split(/\s+/);
  const board: (Piece | null)[] = [];
  for (const ch of placement.replace(/\//g, "")) {
    if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) board.push(null);
    else board.push(ch as Piece);
  }
  if (board.length !== 64) throw new Error(`Bad FEN placement: ${fen}`);
  return {
    board,
    turn: turn === "b" ? "b" : "w",
    castling: {
      K: castling.includes("K"),
      Q: castling.includes("Q"),
      k: castling.includes("k"),
      q: castling.includes("q"),
    },
    ep: ep && ep !== "-" ? squareIndex(ep) : null,
    half: Number(half),
    full: Number(full),
  };
}

export function toFen(pos: Position): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let s = "";
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const p = pos.board[r * 8 + c];
      if (!p) empty++;
      else {
        if (empty) s += empty;
        empty = 0;
        s += p;
      }
    }
    rows.push(s + (empty || ""));
  }
  const { K, Q, k, q } = pos.castling;
  const cast = `${K ? "K" : ""}${Q ? "Q" : ""}${k ? "k" : ""}${q ? "q" : ""}` || "-";
  return `${rows.join("/")} ${pos.turn} ${cast} ${pos.ep === null ? "-" : squareName(pos.ep)} ${pos.half} ${pos.full}`;
}

// ---------------------------------------------------------------- attacks

const KNIGHT = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];
const KING = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
const DIAG = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];
const ORTHO = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const at = (r: number, c: number) => (r >= 0 && r < 8 && c >= 0 && c < 8 ? r * 8 + c : -1);

/** Is `sq` attacked by any piece of colour `by`? */
export function attacked(board: (Piece | null)[], sq: number, by: Color): boolean {
  const r = row(sq);
  const c = col(sq);
  const own = (p: Piece | null, type: string) => p !== null && colorOf(p) === by && p.toUpperCase() === type;

  // pawns attack diagonally forward, so look one row back from the target
  const pr = by === "w" ? r + 1 : r - 1;
  for (const dc of [-1, 1]) {
    const s = at(pr, c + dc);
    if (s >= 0 && own(board[s], "P")) return true;
  }
  for (const [dr, dc] of KNIGHT) {
    const s = at(r + dr, c + dc);
    if (s >= 0 && own(board[s], "N")) return true;
  }
  for (const [dr, dc] of KING) {
    const s = at(r + dr, c + dc);
    if (s >= 0 && own(board[s], "K")) return true;
  }
  const slide = (dirs: number[][], types: string) => {
    for (const [dr, dc] of dirs) {
      for (let k = 1; ; k++) {
        const s = at(r + dr * k, c + dc * k);
        if (s < 0) break;
        const p = board[s];
        if (p) {
          if (colorOf(p) === by && types.includes(p.toUpperCase())) return true;
          break;
        }
      }
    }
    return false;
  };
  return slide(DIAG, "BQ") || slide(ORTHO, "RQ");
}

export function inCheck(pos: Position, color: Color = pos.turn): boolean {
  const king = color === "w" ? "K" : "k";
  const sq = pos.board.indexOf(king);
  return sq >= 0 && attacked(pos.board, sq, color === "w" ? "b" : "w");
}

// ---------------------------------------------------------------- move generation

function pseudoMoves(pos: Position): Move[] {
  const moves: Move[] = [];
  const { board, turn } = pos;
  const enemy: Color = turn === "w" ? "b" : "w";
  const add = (from: number, to: number, flag: Move["flag"] = "n", promotion?: Piece) =>
    moves.push({
      from,
      to,
      piece: board[from]!,
      captured: flag === "ep" ? (turn === "w" ? "p" : "P") : board[to],
      flag,
      promotion,
    });

  for (let from = 0; from < 64; from++) {
    const p = board[from];
    if (!p || colorOf(p) !== turn) continue;
    const r = row(from);
    const c = col(from);
    const type = p.toUpperCase();

    if (type === "P") {
      const dir = turn === "w" ? -1 : 1;
      const startRow = turn === "w" ? 6 : 1;
      const lastRow = turn === "w" ? 0 : 7;
      const promos = (turn === "w" ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"]) as Piece[];
      const push = (to: number, flag: Move["flag"]) => {
        if (row(to) === lastRow) for (const pr of promos) add(from, to, flag, pr);
        else add(from, to, flag);
      };
      const one = at(r + dir, c);
      if (one >= 0 && !board[one]) {
        push(one, "n");
        const two = at(r + 2 * dir, c);
        if (r === startRow && !board[two]) add(from, two, "dbl");
      }
      for (const dc of [-1, 1]) {
        const to = at(r + dir, c + dc);
        if (to < 0) continue;
        const t = board[to];
        if (t && colorOf(t) === enemy) push(to, "n");
        else if (to === pos.ep) add(from, to, "ep");
      }
      continue;
    }

    const step = (dirs: number[][], slide: boolean) => {
      for (const [dr, dc] of dirs) {
        for (let k = 1; ; k++) {
          const to = at(r + dr * k, c + dc * k);
          if (to < 0) break;
          const t = board[to];
          if (t && colorOf(t) === turn) break;
          add(from, to);
          if (t || !slide) break;
        }
      }
    };
    if (type === "N") step(KNIGHT, false);
    else if (type === "B") step(DIAG, true);
    else if (type === "R") step(ORTHO, true);
    else if (type === "Q") step([...DIAG, ...ORTHO], true);
    else if (type === "K") {
      step(KING, false);
      // castling: rights, empty path, and the king may not start, cross or land in check
      const home = turn === "w" ? 60 : 4;
      if (from === home && !attacked(board, home, enemy)) {
        const rights =
          turn === "w" ? { k: pos.castling.K, q: pos.castling.Q } : { k: pos.castling.k, q: pos.castling.q };
        const rook = turn === "w" ? "R" : "r";
        if (
          rights.k &&
          !board[home + 1] &&
          !board[home + 2] &&
          board[home + 3] === rook &&
          !attacked(board, home + 1, enemy) &&
          !attacked(board, home + 2, enemy)
        ) {
          add(from, home + 2, "k");
        }
        if (
          rights.q &&
          !board[home - 1] &&
          !board[home - 2] &&
          !board[home - 3] &&
          board[home - 4] === rook &&
          !attacked(board, home - 1, enemy) &&
          !attacked(board, home - 2, enemy)
        ) {
          add(from, home - 2, "q");
        }
      }
    }
  }
  return moves;
}

export function makeMove(pos: Position, m: Move): Position {
  const board = pos.board.slice();
  const castling = { ...pos.castling };
  board[m.to] = m.promotion ?? m.piece;
  board[m.from] = null;
  if (m.flag === "ep") board[row(m.from) * 8 + col(m.to)] = null;
  if (m.flag === "k") {
    board[m.to - 1] = board[m.to + 1];
    board[m.to + 1] = null;
  }
  if (m.flag === "q") {
    board[m.to + 1] = board[m.to - 2];
    board[m.to - 2] = null;
  }
  if (m.piece === "K") castling.K = castling.Q = false;
  if (m.piece === "k") castling.k = castling.q = false;
  for (const sq of [m.from, m.to]) {
    if (sq === 63) castling.K = false;
    if (sq === 56) castling.Q = false;
    if (sq === 7) castling.k = false;
    if (sq === 0) castling.q = false;
  }
  const pawn = m.piece === "P" || m.piece === "p";
  return {
    board,
    turn: pos.turn === "w" ? "b" : "w",
    castling,
    ep: m.flag === "dbl" ? (m.from + m.to) / 2 : null,
    half: pawn || m.captured ? 0 : pos.half + 1,
    full: pos.turn === "b" ? pos.full + 1 : pos.full,
  };
}

export function legalMoves(pos: Position): Move[] {
  return pseudoMoves(pos).filter((m) => !inCheck(makeMove(pos, m), pos.turn));
}

export const isCheckmate = (pos: Position) => inCheck(pos) && legalMoves(pos).length === 0;
export const isStalemate = (pos: Position) => !inCheck(pos) && legalMoves(pos).length === 0;

export function perft(pos: Position, depth: number): number {
  if (depth === 0) return 1;
  const moves = legalMoves(pos);
  if (depth === 1) return moves.length;
  let n = 0;
  for (const m of moves) n += perft(makeMove(pos, m), depth - 1);
  return n;
}

// ---------------------------------------------------------------- notation

export const toUci = (m: Move) =>
  `${squareName(m.from)}${squareName(m.to)}${m.promotion ? m.promotion.toLowerCase() : ""}`;

export function moveFromUci(pos: Position, uci: string): Move | null {
  return legalMoves(pos).find((m) => toUci(m) === uci.toLowerCase()) ?? null;
}

export function toSan(pos: Position, m: Move): string {
  let san: string;
  if (m.flag === "k") san = "O-O";
  else if (m.flag === "q") san = "O-O-O";
  else {
    const type = m.piece.toUpperCase();
    const capture = m.captured !== null;
    if (type === "P") {
      san = `${capture ? `${FILES[col(m.from)]}x` : ""}${squareName(m.to)}${m.promotion ? `=${m.promotion.toUpperCase()}` : ""}`;
    } else {
      const rivals = legalMoves(pos).filter((o) => o.piece === m.piece && o.to === m.to && o.from !== m.from);
      let dis = "";
      if (rivals.length) {
        if (!rivals.some((o) => col(o.from) === col(m.from))) dis = FILES[col(m.from)];
        else if (!rivals.some((o) => row(o.from) === row(m.from))) dis = String(8 - row(m.from));
        else dis = squareName(m.from);
      }
      san = `${type}${dis}${capture ? "x" : ""}${squareName(m.to)}`;
    }
  }
  const after = makeMove(pos, m);
  if (isCheckmate(after)) san += "#";
  else if (inCheck(after)) san += "+";
  return san;
}

const bareSan = (s: string) =>
  s
    .replace(/[+#!?]/g, "")
    .replace(/0/g, "O")
    .replace(/=/g, "");

export function moveFromSan(pos: Position, san: string): Move | null {
  const want = bareSan(san.trim());
  return legalMoves(pos).find((m) => bareSan(toSan(pos, m)) === want) ?? null;
}

/** Plays a list of SAN moves from a FEN (start position by default). Throws on an illegal move. */
export function replaySan(sans: string[], fen: string = START_FEN): Position {
  let pos = parseFen(fen);
  for (const san of sans) {
    const m = moveFromSan(pos, san);
    if (!m) throw new Error(`Illegal move ${san} in ${toFen(pos)}`);
    pos = makeMove(pos, m);
  }
  return pos;
}
