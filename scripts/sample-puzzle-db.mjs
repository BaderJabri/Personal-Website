// Prints the first complete rows from a byte-range slice of the Lichess puzzle database.
// Used by scripts/fetch-puzzles.ts. Usage: node scripts/sample-puzzle-db.mjs [bytes]
//
// The file is written by pzstd: each zstd frame is preceded by a 4-byte "skippable" frame holding
// that frame's compressed size. zlib's decoder rejects skippable frames, so this walks the frames
// itself and decompresses every complete data frame inside the downloaded slice.
import { zstdDecompressSync } from "node:zlib";

const DB = "https://database.lichess.org/lichess_db_puzzle.csv.zst";
const bytes = Number(process.argv[2]) || 9_200_000;

const res = await fetch(DB, { headers: { Range: `bytes=0-${bytes - 1}` } });
if (res.status !== 206 && res.status !== 200) throw new Error(`database responded ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());

const SKIPPABLE = (m) => (m & 0xfffffff0) === 0x184d2a50;
const ZSTD = 0xfd2fb528;
const parts = [];
let off = 0;
let nextSize = null;
while (off + 8 <= buf.length) {
  const magic = buf.readUInt32LE(off);
  if (SKIPPABLE(magic)) {
    const size = buf.readUInt32LE(off + 4);
    if (size === 4) nextSize = buf.readUInt32LE(off + 8);
    off += 8 + size;
  } else if (magic === ZSTD && nextSize !== null) {
    if (off + nextSize > buf.length) break; // frame continues past the slice
    parts.push(zstdDecompressSync(buf.subarray(off, off + nextSize)));
    off += nextSize;
    nextSize = null;
  } else {
    throw new Error(`unexpected data at byte ${off}`);
  }
}
const text = Buffer.concat(parts).toString("utf8");
process.stdout.write(text.slice(0, text.lastIndexOf("\n") + 1));
