// Frame-accurate capture of reel.html → MP4 (H.264) [+ WebM (VP9)].
//
//   node showreel/render.mjs --ffmpeg <ffmpeg with libx264> [--webm] [--spacing 2.5] [--max 48]
//   node showreel/render.mjs --stills 1,3.5,7.2          (PNG stills only, no ffmpeg needed)
//
// Motion blur: each output frame averages N renders across a 180° shutter, where N comes from
// how far anything moves on screen during that shutter (window.__motion) — 2 samples when calm,
// up to --max on the whip, so fast moves read as blur rather than ghosted copies. Samples are
// averaged here and streamed to ffmpeg as raw RGB (fixed-size frames, nothing to mis-parse);
// the encode is then verified to hold exactly FRAMES frames. The page is a pure function of t.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import zlib from "node:zlib";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= "0";
const { chromium } = await import("playwright");

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] == null ? true : all[i + 1]]] : acc), []),
);
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
mkdirSync(out, { recursive: true });
const W = 1920, H = 1080, FPS = 60, DUR = 15, SHUTTER = 0.5;
const FRAMES = args.limit ? Number(args.limit) : FPS * DUR; // --limit N: quick pipeline check
const SPACING = Number(args.spacing ?? 2.5), MAX = Number(args.max ?? 48);

// Minimal PNG decoder (8-bit, non-interlaced RGB/RGBA — what Chrome's screenshots are) that adds
// each pixel's RGB into acc. Filters are resolved per row, so the inner loops stay branch-free.
function addPNG(buf, acc) {
  let o = 8, w = 0, h = 0, bpp = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString("ascii", o + 4, o + 8), data = buf.subarray(o + 8, o + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0) throw new Error("unsupported PNG (bit depth / interlace)");
      bpp = { 2: 3, 6: 4 }[data[9]];
      if (!bpp) throw new Error("unsupported PNG colour type " + data[9]);
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    o += 12 + len;
  }
  if (w !== W || h !== H) throw new Error(`screenshot is ${w}×${h}`);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp;
  let prev = new Uint8Array(stride), cur = new Uint8Array(stride);
  for (let y = 0, pos = 0; y < h; y++, pos += stride + 1) {
    const f = raw[pos], row = raw.subarray(pos + 1, pos + 1 + stride);
    if (f === 0) cur.set(row);
    else if (f === 1) { for (let x = 0; x < stride; x++) cur[x] = row[x] + (x >= bpp ? cur[x - bpp] : 0); }
    else if (f === 2) { for (let x = 0; x < stride; x++) cur[x] = row[x] + prev[x]; }
    else if (f === 3) { for (let x = 0; x < stride; x++) cur[x] = row[x] + (((x >= bpp ? cur[x - bpp] : 0) + prev[x]) >> 1); }
    else if (f === 4) {
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        cur[x] = row[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
    } else throw new Error("bad PNG filter " + f);
    let i = y * w * 3;
    if (bpp === 3) for (let x = 0; x < stride; x++) acc[i + x] += cur[x];
    else for (let x = 0; x < stride; x += 4, i += 3) { acc[i] += cur[x]; acc[i + 1] += cur[x + 1]; acc[i + 2] += cur[x + 2]; }
    const t = prev; prev = cur; cur = t;
  }
}

function ff(bin, argv, input) {
  return new Promise((res, rej) => {
    const p = spawn(bin, argv, { stdio: [input ? "pipe" : "ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) => (c === 0 ? res(err) : rej(new Error(`ffmpeg exited ${c}\n${err.slice(-2000)}`))));
    if (input) Promise.resolve(input(p.stdin)).catch((e) => { p.kill(); rej(e); });
  });
}
async function countFrames(bin, file) {
  const log = await ff(bin, ["-v", "error", "-stats", "-i", file, "-map", "0:v", "-f", "null", "-"]);
  const all = [...log.matchAll(/frame=\s*(\d+)/g)];
  return all.length ? Number(all[all.length - 1][1]) : 0;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(pathToFileURL(path.join(here, "reel.html")).href + "?capture", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60_000 });
  const cdp = await page.context().newCDPSession(page);
  const shot = async (t) => {
    await page.evaluate((t) => window.__render(t), t);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
    return Buffer.from(data, "base64");
  };

  if (args.stills) {
    const dir = path.join(out, "stills");
    mkdirSync(dir, { recursive: true });
    for (const t of String(args.stills).split(",").map(Number)) {
      const file = path.join(dir, `t${t.toFixed(2).padStart(5, "0")}.png`);
      writeFileSync(file, await shot(t));
      console.log(file);
    }
  } else {
    const bin = args.ffmpeg ?? process.env.FFMPEG;
    if (!bin) throw new Error("pass --ffmpeg <path> (needs libx264)");
    const half = SHUTTER / 2 / FPS;
    const counts = await page.evaluate(({ n, half, sp, max }) => {
      const c = [];
      for (let f = 0; f < n; f++) c.push(Math.min(max, Math.max(2, Math.ceil(window.__motion(f / 60 - half, f / 60 + half) / sp))));
      return c;
    }, { n: FRAMES, half, sp: SPACING, max: MAX });
    const total = counts.reduce((a, b) => a + b, 0);
    console.log(`${total} samples for ${FRAMES} frames (max ${Math.max(...counts)} per frame)`);

    const mp4 = path.join(out, args.limit ? "limit-test.mp4" : "showreel-1080p60.mp4");
    const acc = new Uint32Array(W * H * 3), rgb = Buffer.alloc(W * H * 3);
    const started = Date.now();
    let done = 0;
    await ff(bin, [
      "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-framerate", String(FPS), "-i", "-",
      "-frames:v", String(FRAMES), "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
      "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-tune", "animation", "-profile:v", "high",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
      "-movflags", "+faststart", mp4,
    ], async (stdin) => {
      // Flatten every sample, and always have the next screenshot in flight while decoding the last.
      const times = [];
      for (let f = 0; f < FRAMES; f++) for (let k = 0; k < counts[f]; k++)
        times.push(Math.min(DUR, Math.max(0, f / FPS + ((k + 0.5) / counts[f] - 0.5) * 2 * half)));
      let next = shot(times[0]), si = 0;
      for (let f = 0; f < FRAMES; f++) {
        const n = counts[f];
        acc.fill(0);
        for (let k = 0; k < n; k++, si++) {
          const buf = await next;
          if (si + 1 < times.length) next = shot(times[si + 1]);
          addPNG(buf, acc);
        }
        for (let i = 0; i < acc.length; i++) rgb[i] = (acc[i] + (n >> 1)) / n;
        if (!stdin.write(Buffer.from(rgb))) await new Promise((r) => stdin.once("drain", r));
        done += n;
        if (f % 60 === 59) {
          const el = (Date.now() - started) / 1000, eta = (el / done) * (total - done);
          console.log(`frame ${f + 1}/${FRAMES} · ${el.toFixed(0)}s elapsed · ~${eta.toFixed(0)}s left`);
        }
      }
      stdin.end();
    });
    const n = await countFrames(bin, mp4);
    if (n !== FRAMES) throw new Error(`${mp4} holds ${n} frames, expected ${FRAMES}`);
    console.log(`${mp4} · ${n} frames ✓`);
    writeFileSync(path.join(out, "poster.png"), await shot(DUR));

    if (args.webm) {
      const webm = path.join(out, "showreel-1080p60.webm");
      console.log("encoding VP9…");
      await ff(bin, ["-y", "-v", "error", "-i", mp4, "-c:v", "libvpx-vp9", "-crf", "22", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", webm]);
      const w = await countFrames(bin, webm);
      if (w !== FRAMES) throw new Error(`${webm} holds ${w} frames, expected ${FRAMES}`);
      console.log(`${webm} · ${w} frames ✓`);
    }
  }
} finally {
  await browser.close();
}
