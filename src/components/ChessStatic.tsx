import { BOARD, BOARD_LAYOUT, squareShade } from "@/lib/chess/board";
import { col, parseFen, row, squareIndex } from "@/lib/chess/engine";
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
  const last = [squareIndex(puzzle.lastMove.slice(0, 2)), squareIndex(puzzle.lastMove.slice(2, 4))];

  return (
    <div className={BOARD_LAYOUT}>
      <div className={BOARD}>
        {Array.from({ length: 64 }, (_, i) => {
          const sq = flipped ? 63 - i : i;
          return (
            <span
              key={i}
              className={`chess-sq relative ${squareShade(i % 8, Math.floor(i / 8))} ${last.includes(sq) ? "chess-last" : ""}`}
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
        <p className="num text-sm text-pencil">Puzzle 1 of {PUZZLES.length}</p>
        <h3 className="wide mt-4 text-xl font-semibold leading-tight">{puzzleTitle(puzzle)}</h3>
        <p className="mt-1.5 text-sm text-pencil">Playing {pos.turn === "w" ? "white" : "black"}.</p>
        <p className="mt-4 leading-snug text-pencil">Loading the board…</p>
        <noscript>
          <p className="mt-2 text-sm">
            <a className="link" href={`https://lichess.org/training/${puzzle.id}`}>
              Play this puzzle on Lichess
            </a>
          </p>
        </noscript>
      </div>
    </div>
  );
}
