// Builds content/chess/puzzles.json from the Lichess puzzle database (CC0; positions from real
// games). Dev tool: `bun scripts/fetch-puzzles.ts`, then review and commit the JSON.
//
// It downloads only the first few MB of database.lichess.org/lichess_db_puzzle.csv.zst (a random
// slice of ~100k puzzles), keeps popular, heavily played ones, and picks one per slot of a ladder
// so ratings climb steadily. Each pick is replayed with our engine: every solution move must be
// legal, and mate themes must end in mate.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { isCheckmate, makeMove, moveFromUci, parseFen, toFen } from "../src/lib/chess/engine";
import type { Puzzle } from "../src/lib/chess/puzzles";

const SAMPLE_BYTES = 9_200_000; // the first pzstd frame is ~9.05 MB
const SLOTS: { theme: string; target: number }[] = [
  { theme: "mateIn1", target: 650 },
  { theme: "mateIn1", target: 900 },
  { theme: "mateIn2", target: 1100 },
  { theme: "fork", target: 1250 },
  { theme: "mateIn2", target: 1400 },
  { theme: "pin", target: 1550 },
  { theme: "discoveredAttack", target: 1700 },
  { theme: "mateIn3", target: 1850 },
  { theme: "sacrifice", target: 2000 },
  { theme: "mateIn3", target: 2200 },
];

function sampleRows(): string[] {
  // decompression runs in Node (see scripts/sample-puzzle-db.mjs for why)
  const csv = execFileSync("node", ["scripts/sample-puzzle-db.mjs", String(SAMPLE_BYTES)], {
    maxBuffer: 256 * 1024 * 1024,
    encoding: "utf8",
  });
  return csv.split("\n").filter(Boolean);
}

export function fromRow(cols: string[]): Puzzle {
  const [id, fen, moves, rating, , , , themes] = cols;
  const [setup, ...solution] = moves.split(" ");
  const before = parseFen(fen);
  const last = moveFromUci(before, setup);
  if (!last) throw new Error(`${id}: illegal setup move ${setup}`);
  const start = makeMove(before, last);
  let pos = start;
  for (const uci of solution) {
    const m = moveFromUci(pos, uci);
    if (!m) throw new Error(`${id}: illegal solution move ${uci}`);
    pos = makeMove(pos, m);
  }
  const list = themes.split(" ");
  const mateTheme = list.find((t) => /^mateIn\d$/.test(t));
  if (mateTheme && !isCheckmate(pos)) throw new Error(`${id}: tagged ${mateTheme} but not mate`);
  return {
    id,
    rating: Number(rating),
    fen: toFen(start),
    lastMove: setup,
    solution,
    themes: list,
    goal: mateTheme ? "mate" : "material",
    ...(mateTheme ? { mateIn: Number(mateTheme.slice(-1)) } : {}),
  };
}

if (import.meta.main) {
  const rows = sampleRows();
  const header = rows.shift()!;
  if (!header.startsWith("PuzzleId,FEN,Moves,Rating")) throw new Error(`unexpected header: ${header}`);
  console.log(`sampled ${rows.length} puzzles`);

  const good = rows
    .map((r) => r.split(","))
    .filter((c) => Number(c[5]) >= 92 && Number(c[6]) >= 3000 && Number(c[4]) <= 80);
  console.log(`${good.length} popular, well-played, stable-rated`);

  const chosen: Puzzle[] = [];
  for (const slot of SLOTS) {
    const floor = chosen.at(-1)?.rating ?? 0;
    const pool = good
      .filter((c) => c[7].split(" ").includes(slot.theme) && Number(c[3]) > floor + 40)
      .filter((c) => !chosen.some((p) => p.id === c[0]))
      .sort((a, b) => Math.abs(Number(a[3]) - slot.target) - Math.abs(Number(b[3]) - slot.target));
    let pick: Puzzle | undefined;
    for (const c of pool) {
      try {
        pick = fromRow(c);
        break;
      } catch (e) {
        console.warn(String(e));
      }
    }
    if (!pick) throw new Error(`no usable ${slot.theme} puzzle above ${floor}`);
    chosen.push(pick);
    console.log(`${slot.theme.padEnd(16)} ${pick.rating}  ${pick.id}  ${pick.solution.length} plies`);
  }
  writeFileSync("content/chess/puzzles.json", `[\n${chosen.map((p) => `  ${JSON.stringify(p)}`).join(",\n")}\n]\n`);
  console.log(`wrote ${chosen.length} puzzles`);
}
