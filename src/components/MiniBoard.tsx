import { col, parseFen, row } from "@/lib/chess/engine";
import { pieceSrc } from "@/lib/chess/pieces";

/** A small, static picture of a chess position (server-rendered, no interaction). */
export function MiniBoard({ fen, className = "" }: { fen: string; className?: string }) {
  const pos = parseFen(fen);
  const flipped = pos.turn === "b";
  return (
    <div aria-hidden className={`relative grid aspect-square grid-cols-8 overflow-hidden rounded-[2px] ${className}`}>
      {Array.from({ length: 64 }, (_, i) => {
        const sq = flipped ? 63 - i : i;
        const p = pos.board[sq];
        const dark = (row(sq) + col(sq)) % 2 === 1;
        return (
          <span key={i} className={`relative ${dark ? "chess-dark" : "chess-light"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs */}
            {p && <img src={pieceSrc(p)} alt="" className="absolute inset-0 h-full w-full" />}
          </span>
        );
      })}
    </div>
  );
}
