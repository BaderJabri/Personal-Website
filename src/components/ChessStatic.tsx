import { col, parseFen, row } from "@/lib/chess/engine";
import { pieceSrc } from "@/lib/chess/pieces";
import { PUZZLES, puzzleTitle } from "@/lib/chess/puzzles";

/**
 * Server-rendered picture of the first puzzle, laid out exactly like the interactive board.
 * It shows at once (and without JS); the real board replaces it when the section nears view.
 */
export function ChessStatic() {
  const puzzle = PUZZLES[0];
  const pos = parseFen(puzzle.fen);
  const flipped = pos.turn === "b";
  const last = [puzzle.lastMove.slice(0, 2), puzzle.lastMove.slice(2, 4)];
  const files = "abcdefgh";

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-8">
      <div className="chess-board relative grid aspect-square w-[min(320px,calc(100vw-40px))] grid-cols-8 overflow-hidden rounded-[6px] border border-rule">
        {Array.from({ length: 64 }, (_, i) => {
          const sq = flipped ? 63 - i : i;
          const name = `${files[col(sq)]}${8 - row(sq)}`;
          return (
            <span
              key={i}
              className={`chess-sq relative ${(Math.floor(i / 8) + (i % 8)) % 2 ? "chess-dark" : "chess-light"} ${last.includes(name) ? "chess-last" : ""}`}
            />
          );
        })}
        {pos.board.map((p, sq) => {
          if (!p) return null;
          const x = flipped ? 7 - col(sq) : col(sq);
          const y = flipped ? 7 - row(sq) : row(sq);
          return (
            // eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs
            <img
              key={sq}
              src={pieceSrc(p)}
              alt=""
              className="chess-piece"
              style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}
            />
          );
        })}
      </div>
      <div className="min-w-0">
        <p className="num text-sm text-pencil">
          Puzzle 1 of {PUZZLES.length}
        </p>
        <h3 className="wide mt-4 text-xl font-semibold leading-tight">{puzzleTitle(puzzle)}</h3>
        <p className="mt-1.5 text-sm text-pencil">Playing {pos.turn === "w" ? "white" : "black"}.</p>
        <p className="mt-4 leading-snug text-pencil">Loading the board…</p>
        <noscript><p className="mt-2 text-sm"><a className="link" href={`https://lichess.org/training/${puzzle.id}`}>Play this puzzle on Lichess</a></p></noscript>
      </div>
    </div>
  );
}
