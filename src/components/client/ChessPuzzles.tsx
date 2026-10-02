"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { col, inCheck, legalMoves, moveFromUci, row, squareIndex, squareName, type Move } from "@/lib/chess/engine";
import { PIECE_NAME, movePieces, pieceSrc, placePieces, type PlacedPiece } from "@/lib/chess/pieces";
import { PUZZLES, attempt, playReply, puzzleHint, puzzleTitle, startSession, type Session } from "@/lib/chess/puzzles";

// Ten puzzles from real Lichess games, easiest first. Click or drag to move. A wrong move slides
// in, flashes red and slides back; a right one flashes, then the opponent replies. Progress is
// remembered in this browser.

const STORE = "bj-chess-v1";
type Tone = "neutral" | "good" | "bad" | "done";
type Flash = { sq: number; kind: "wrong" | "right" } | null;

function intro(s: Session): string {
  return `${s.player === "w" ? "White" : "Black"} to move.`;
}
const WRONG = ["Not that one. Try again.", "Still not it. Look again.", "Not quite."];

export function ChessPuzzles() {
  const [index, setIndex] = useState(0);
  const [session, setSession] = useState<Session>(() => startSession(PUZZLES[0]));
  const [pieces, setPieces] = useState<PlacedPiece[]>(() => placePieces(startSession(PUZZLES[0]).pos));
  const [selected, setSelected] = useState<number | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [message, setMessage] = useState<{ tone: Tone; text: string }>({ tone: "neutral", text: intro(startSession(PUZZLES[0])) });
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sq: number; el: HTMLElement; x: number; y: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);

  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const load = useCallback((i: number) => {
    clearTimers();
    const s = startSession(PUZZLES[i]);
    setIndex(i);
    setSession(s);
    setPieces(placePieces(s.pos));
    setSelected(null);
    setFlash(null);
    setBusy(false);
    setHint(false);
    setMessage({ tone: "neutral", text: intro(s) });
  }, []);

  // restore progress
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as { solved?: string[]; revealed?: string[] } | null;
      if (saved) {
        const done = saved.solved ?? [];
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading saved progress on mount
        setSolved(done);
        setRevealed(saved.revealed ?? []);
        const next = PUZZLES.findIndex((p) => !done.includes(p.id) && !(saved.revealed ?? []).includes(p.id));
        if (next > 0) load(next);
      }
    } catch {}
    return clearTimers;
  }, [load]);

  const save = (s: string[], r: string[]) => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ solved: s, revealed: r }));
    } catch {}
  };

  const flipped = session.player === "b";
  const xy = (sq: number) => (flipped ? { x: 7 - col(sq), y: 7 - row(sq) } : { x: col(sq), y: row(sq) });
  const sqAt = (x: number, y: number) => (flipped ? (7 - y) * 8 + (7 - x) : y * 8 + x);
  const playing = session.status === "playing" && !busy;
  const mine = (sq: number) => {
    const p = session.pos.board[sq];
    return !!p && (p === p.toUpperCase() ? "w" : "b") === session.player;
  };
  const targets = selected === null ? [] : legalMoves(session.pos).filter((m) => m.from === selected);
  const expected = session.puzzle.solution[session.ply];
  const expectedFrom = expected ? squareIndex(expected.slice(0, 2)) : null;

  function tryMove(from: number, to: number, help = false) {
    const options = legalMoves(session.pos).filter((m) => m.from === from && m.to === to);
    if (!options.length) {
      setSelected(mine(to) && to !== from ? to : null);
      return;
    }
    // promotions follow the stored line when it promotes here, otherwise queen
    const uci =
      expected && expected.startsWith(squareName(from) + squareName(to))
        ? expected
        : `${squareName(from)}${squareName(to)}${options[0].promotion ? "q" : ""}`;
    const move = moveFromUci(session.pos, uci) as Move;
    const r = attempt(session, uci);
    setSelected(null);

    if (r.result === "wrong") {
      const before = pieces;
      setBusy(true);
      setPieces(movePieces(pieces, move));
      setFlash({ sq: to, kind: "wrong" });
      setMessage({ tone: "bad", text: WRONG[Math.min(r.session.mistakes - 1, WRONG.length - 1)] });
      if (r.session.mistakes >= 2) setHint(true);
      later(520, () => setPieces(before));
      later(900, () => {
        setFlash(null);
        setBusy(false);
        setSession(r.session);
      });
      return;
    }
    if (r.result !== "correct" && r.result !== "solved") return;

    setPieces(movePieces(pieces, move));
    setSession(r.session);
    setFlash({ sq: to, kind: "right" });
    later(650, () => setFlash(null));

    if (r.result === "solved") {
      const id = session.puzzle.id;
      const nextSolved = help || solved.includes(id) ? solved : [...solved, id];
      const nextRevealed = help && !revealed.includes(id) ? [...revealed, id] : revealed;
      setSolved(nextSolved);
      setRevealed(nextRevealed);
      save(nextSolved, nextRevealed);
      setMessage({
        tone: "done",
        text: help ? "That was the move. Have a look, then try the next one." : session.puzzle.goal === "mate" ? "Checkmate. Nicely done." : "That wins it. Nicely done.",
      });
      return;
    }

    setMessage({ tone: "good", text: help ? "That's the move. Your turn next." : "Good. Keep going." });
    setBusy(true);
    later(600, () => {
      const replied = playReply(r.session);
      const reply = moveFromUci(r.session.pos, replied.lastMove);
      if (reply) setPieces((p) => movePieces(p, reply));
      setSession(replied);
      setBusy(false);
      setMessage({ tone: "neutral", text: "Your move." });
    });
  }

  function clickSquare(sq: number) {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!playing) return;
    if (selected !== null && targets.some((m) => m.to === sq)) tryMove(selected, sq);
    else setSelected(mine(sq) && sq !== selected ? sq : null);
  }

  // drag and drop, on top of click-to-move
  function pointerDown(e: React.PointerEvent) {
    if (!playing || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 8);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 8);
    const sq = sqAt(x, y);
    if (!mine(sq)) return;
    const el = boardRef.current.querySelector<HTMLElement>(`[data-piece-sq="${sq}"]`);
    if (!el) return;
    // capture only once a drag starts, so a plain click still reaches the square button
    drag.current = { sq, el, x: e.clientX, y: e.clientY, active: false };
  }
  function pointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || !boardRef.current) return;
    if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
    if (!d.active) {
      d.active = true;
      boardRef.current.setPointerCapture(e.pointerId);
      setSelected(d.sq);
      d.el.dataset.dragging = "";
    }
    const rect = boardRef.current.getBoundingClientRect();
    const size = rect.width / 8;
    d.el.style.transform = `translate(${e.clientX - rect.left - size / 2}px, ${e.clientY - rect.top - size / 2}px)`;
  }
  function pointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.active || !boardRef.current) return;
    suppressClick.current = true;
    setTimeout(() => (suppressClick.current = false), 0);
    delete d.el.dataset.dragging;
    d.el.style.transform = "";
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 8);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 8);
    if (x < 0 || x > 7 || y < 0 || y > 7) return;
    const to = sqAt(x, y);
    if (to !== d.sq && legalMoves(session.pos).some((m) => m.from === d.sq && m.to === to)) tryMove(d.sq, to);
  }

  const checkSq = inCheck(session.pos) ? session.pos.board.indexOf(session.pos.turn === "w" ? "K" : "k") : -1;
  const last = session.lastMove ? [squareIndex(session.lastMove.slice(0, 2)), squareIndex(session.lastMove.slice(2, 4))] : [];
  const puzzle = session.puzzle;
  const done = session.status === "solved";

  return (
    <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-14">
      <div
        ref={boardRef}
        role="grid"
        aria-label={`Chess board, ${intro(session)}`}
        data-wrong={flash?.kind === "wrong" ? "" : undefined}
        className="chess-board relative grid aspect-square w-[min(540px,calc(100vw-40px))] touch-none select-none grid-cols-8 overflow-hidden rounded-[2px] border border-rule"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        {Array.from({ length: 64 }, (_, i) => {
          const y = Math.floor(i / 8);
          const x = i % 8;
          const sq = sqAt(x, y);
          const piece = session.pos.board[sq];
          const target = targets.find((m) => m.to === sq);
          const classes = [
            "chess-sq relative",
            (x + y) % 2 ? "chess-dark" : "chess-light",
            last.includes(sq) ? "chess-last" : "",
            selected === sq ? "chess-selected" : "",
            sq === checkSq ? "chess-check" : "",
            flash?.sq === sq ? `chess-flash-${flash.kind}` : "",
            hint && playing && sq === expectedFrom ? "chess-hint" : "",
          ].join(" ");
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              aria-selected={selected === sq}
              aria-label={`${squareName(sq)}${piece ? `, ${piece === piece.toUpperCase() ? "white" : "black"} ${PIECE_NAME[piece.toLowerCase()]}` : ""}`}
              onClick={() => clickSquare(sq)}
              className={classes}
            >
              {x === 0 && <span className="chess-coord left-[4%] top-[3%]">{squareName(sq)[1]}</span>}
              {y === 7 && <span className="chess-coord bottom-[2%] right-[5%]">{squareName(sq)[0]}</span>}
              {target && <span className={target.captured ? "chess-capture" : "chess-dot"} aria-hidden />}
              {flash?.sq === sq && flash.kind === "wrong" && <span className="chess-x" aria-hidden>✕</span>}
            </button>
          );
        })}
        {pieces.map((p) => {
          const { x, y } = xy(p.sq);
          return (
            // eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs
            <img
              key={`${index}-${p.id}`}
              src={pieceSrc(p.piece)}
              alt=""
              draggable={false}
              data-piece-sq={p.sq}
              className="chess-piece"
              style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}
            />
          );
        })}
      </div>

      <div className="max-w-[420px]">
        <div className="flex items-center justify-between gap-4">
          <p className="num text-sm text-pencil">
            Puzzle {index + 1} of {PUZZLES.length}
          </p>
          <ol className="flex gap-1.5" aria-label="Puzzles">
            {PUZZLES.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => load(i)}
                  aria-label={`Puzzle ${i + 1}${solved.includes(p.id) ? ", solved" : ""}`}
                  aria-current={i === index ? "step" : undefined}
                  className={`chess-step ${solved.includes(p.id) ? "is-solved" : revealed.includes(p.id) ? "is-revealed" : ""}`}
                />
              </li>
            ))}
          </ol>
        </div>

        <h2 className="display mt-6 text-[clamp(30px,3.6vw,40px)]">{puzzleTitle(puzzle)}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-pencil">
          <span aria-hidden className={`inline-block size-3 rounded-full border border-rule ${session.player === "w" ? "bg-[#fbfbf8]" : "bg-[#15181c]"}`} />
          Playing {session.player === "w" ? "white" : "black"}. Their last move is shaded.
        </p>

        <p aria-live="polite" data-tone={message.tone} className="chess-message mt-6 min-h-[3.2em] text-lg leading-snug">
          {message.text}
        </p>
        {hint && !done && puzzleHint(puzzle) && <p className="mt-2 text-sm text-pencil">Hint: {puzzleHint(puzzle)}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {done ? (
            index < PUZZLES.length - 1 ? (
              <button type="button" className="btn" onClick={() => load(index + 1)}>
                Next puzzle
              </button>
            ) : (
              <p className="text-sm">That was the last one. You worked through all ten.</p>
            )
          ) : (
            <>
              <button type="button" className="btn btn-quiet h-10" onClick={() => setHint(true)} disabled={hint}>
                Hint
              </button>
              <button
                type="button"
                className="btn btn-quiet h-10"
                disabled={!playing || !expected}
                onClick={() => expected && tryMove(squareIndex(expected.slice(0, 2)), squareIndex(expected.slice(2, 4)), true)}
              >
                Show me the move
              </button>
            </>
          )}
        </div>

        <p className="num mt-10 text-xs text-pencil">
          Rated {puzzle.rating} on Lichess.{" "}
          <a className="link" href={`https://lichess.org/training/${puzzle.id}`}>
            Open it there
          </a>
        </p>
      </div>
    </div>
  );
}
