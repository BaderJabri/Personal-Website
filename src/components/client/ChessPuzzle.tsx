"use client";
import { useState } from "react";
import { NAME, PUZZLES, judge, pieceSrc, type Square } from "@/lib/chess";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type Verdict = { kind: "mate" | "stalemate" | "wrong"; from: Square; to: Square } | null;

export function ChessPuzzle() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const puzzle = PUZZLES[index];
  const solved = verdict?.kind === "mate";

  // After the solving move, show the board with the piece moved.
  const board = { ...puzzle.board };
  if (solved) {
    board[puzzle.solution.to] = board[puzzle.solution.from];
    delete board[puzzle.solution.from];
  }

  const click = (sq: Square) => {
    if (solved) return;
    const piece = board[sq];
    if (piece && piece === piece.toUpperCase()) {
      setSelected(sq === selected ? null : sq);
      setVerdict(null);
      return;
    }
    if (!selected) return;
    setVerdict({ kind: judge(puzzle, selected, sq), from: selected, to: sq });
    setSelected(null);
  };

  const next = () => {
    setIndex((i) => (i + 1) % PUZZLES.length);
    setSelected(null);
    setVerdict(null);
  };

  return (
    <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-x-10">
      <div
        role="grid"
        aria-label={`${puzzle.name}: white to move and mate in one`}
        className="grid w-[min(376px,calc(100vw-40px))] grid-cols-8 overflow-hidden rounded-[2px] border border-rule"
      >
        {RANKS.map((r) => (
          <div role="row" key={r} className="contents">
            {FILES.map((f, fi) => {
              const sq = `${f}${r}`;
              const piece = board[sq];
              const dark = (fi + r) % 2 === 1;
              const isFrom = selected === sq || (verdict && verdict.from === sq && !solved);
              const isTo = solved && sq === puzzle.solution.to;
              return (
                <button
                  key={sq}
                  type="button"
                  role="gridcell"
                  onClick={() => click(sq)}
                  aria-label={`${sq}${piece ? `, ${piece === piece.toUpperCase() ? "white" : "black"} ${NAME[piece.toLowerCase()]}` : ""}`}
                  aria-selected={selected === sq}
                  className={`chess-sq relative aspect-square  ${dark ? "chess-dark" : "chess-light"} ${isFrom ? "chess-from" : ""} ${isTo ? "chess-to" : ""}`}
                >
                  {piece && (
                    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs
                    <img src={pieceSrc(piece)} alt="" width={45} height={45} draggable={false} className="pointer-events-none absolute inset-[6%] h-[88%] w-[88%]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="max-w-[36ch]">
        <p className="text-sm text-pencil">
          Puzzle {index + 1} of {PUZZLES.length}: {puzzle.name.toLowerCase()}
        </p>
        <p className="wide mt-2 text-xl font-semibold leading-tight">White to move. Mate in one.</p>
        <p aria-live="polite" className="mt-4 min-h-[4.5em] leading-snug">
          {verdict === null && (selected ? "Now pick a square to move to." : "Pick a white piece, then where it goes.")}
          {verdict?.kind === "mate" && (
            <>
              <span className="font-semibold text-accent">Checkmate.</span> {puzzle.explain}
            </>
          )}
          {verdict?.kind === "stalemate" && (
            <>
              <span className="font-semibold">Stalemate.</span> Black has no legal move but isn&apos;t in check, so
              it&apos;s a draw. So close.
            </>
          )}
          {verdict?.kind === "wrong" && "That isn't mate. Try another move."}
        </p>
        <button type="button" className="btn btn-quiet mt-4 h-9 px-3 text-[13px]" onClick={next}>
          {solved ? "Next puzzle" : "Skip"}
        </button>
      </div>
    </div>
  );
}
