import { col, isWhite, row, type Move, type Piece, type Position } from "./engine";

/** Piece image (cburnett set, see public/images/chess/ATTRIBUTION.txt). Unicode chess glyphs
 *  fall back to colour emoji on Windows, so the board uses images instead. */
export function pieceSrc(p: Piece): string {
  return `/images/chess/${isWhite(p) ? "w" : "b"}${p.toUpperCase()}.svg`;
}

export const PIECE_NAME: Record<string, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

/** A piece on the board with a stable id, so the UI can slide it from square to square. */
export interface PlacedPiece {
  id: number;
  piece: Piece;
  sq: number;
}

export function placePieces(pos: Position): PlacedPiece[] {
  const out: PlacedPiece[] = [];
  pos.board.forEach((p, sq) => p && out.push({ id: sq, piece: p, sq }));
  return out;
}

/** Applies a move to the placed pieces, keeping ids: captures vanish, castling moves the rook. */
export function movePieces(pieces: PlacedPiece[], m: Move): PlacedPiece[] {
  const captureSq = m.flag === "ep" ? row(m.from) * 8 + col(m.to) : m.to;
  const rook =
    m.flag === "k" ? { from: m.to + 1, to: m.to - 1 } : m.flag === "q" ? { from: m.to - 2, to: m.to + 1 } : null;
  return pieces
    .filter((p) => !(p.sq === captureSq && m.captured && p.sq !== m.from))
    .map((p) => {
      if (p.sq === m.from) return { ...p, sq: m.to, piece: m.promotion ?? p.piece };
      if (rook && p.sq === rook.from) return { ...p, sq: rook.to };
      return p;
    });
}
