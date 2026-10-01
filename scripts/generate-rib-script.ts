// Generates content/demo/wing-rib.json, the session the home-page demo replays.
// Dev tool: run `bun scripts/generate-rib-script.ts` after changing anything below, then commit
// the JSON. Geometry is in millimetres with y up and the leading edge at the origin.
import { writeFileSync } from "node:fs";
import { camberAt, halfThickness, naca4Outline, parseNaca4, type Pt } from "../src/lib/naca";
import { sessionScriptSchema, type SessionEvent } from "../src/lib/session-script";

const CHORD = 180;
const AIRFOIL = parseNaca4("2412");
const PER_SIDE = 24; // 48 unique outline points
const CHAR_MS = 18;

const r2 = (v: number) => Math.round(v * 100) / 100;
const f1 = (v: number) => v.toFixed(1);
const f2 = (v: number) => v.toFixed(2);
const at = (xc: number) => ({
  y: camberAt(AIRFOIL, xc).yc * CHORD,
  thickness: 2 * halfThickness(AIRFOIL, xc) * CHORD,
});

// Outline
const outline: Pt[] = naca4Outline(AIRFOIL, PER_SIDE).map((p) => ({ x: r2(p.x * CHORD), y: r2(p.y * CHORD) }));
const area = Math.abs(
  outline.reduce((s, p, i) => {
    const q = outline[(i + 1) % outline.length];
    return s + p.x * q.y - q.x * p.y;
  }, 0) / 2,
);

// Spar slots, centred on the camber line. Square spruce spars: 1/2" front, 1/4" rear.
const spars = [
  { xc: 0.25, size: 12.7 },
  { xc: 0.65, size: 6.4 },
].map(({ xc, size }) => {
  const cx = xc * CHORD;
  const cy = at(xc).y;
  return { cx, cy, size, corner: { x: r2(cx - size / 2), y: r2(cy - size / 2) } };
});

// Lightening holes: half the local thickness, clear of both spars.
const holes = [21.6, 62, 82, 101, 140].map((x) => {
  const { y, thickness } = at(x / CHORD);
  return { cx: r2(x), cy: r2(y), r: r2(Math.round(thickness * 0.5 * 10) / 20) };
});
const diameters = holes.map((h) => h.r * 2);
const biggest = holes.reduce((a, b) => (b.r > a.r ? b : a));

// Centerlines: chord reference line plus a cross on every hole and slot centre.
const cross = (cx: number, cy: number, arm: number) => [
  [r2(cx - arm), r2(cy), r2(cx + arm), r2(cy)],
  [r2(cx), r2(cy - arm), r2(cx), r2(cy + arm)],
];
const centerlines = [
  [-6, 0, CHORD + 6, 0],
  ...holes.flatMap((h) => cross(h.cx, h.cy, h.r + 1.6)),
  ...spars.flatMap((s) => cross(s.cx, s.cy, s.size / 2 + 1.6)),
];

// Dimensions
const lowest = Math.min(...outline.map((p) => p.y));
const highest = Math.max(...outline.map((p) => p.y));
const chordDim = { from: [0, 0], to: [CHORD, 0], offset: [0, r2(lowest - 14)] };
const sparDims = spars.map((s, i) => ({
  from: [0, 0],
  to: [r2(s.cx), r2(s.cy + s.size / 2)],
  offset: [0, r2(highest + 10 + i * 9)],
}));
const angle = Math.PI / 4;
const leaderTip = { x: r2(biggest.cx + biggest.r * Math.cos(angle)), y: r2(biggest.cy + biggest.r * Math.sin(angle)) };
const leaderKnee = { x: r2(leaderTip.x + 11), y: r2(highest + 6) };
const leaderEnd = { x: r2(leaderKnee.x + 14), y: leaderKnee.y };

// Session
const prompt =
  "Draft the station-3 wing rib for our SAE Aero plane: NACA 2412, 180 mm chord, spar slots at 25% and 65%, lightening holes, and dimensions.";
const events: SessionEvent[] = [];
const push = (e: SessionEvent) => events.push(e);

push({ t: 0, kind: "prompt", text: prompt });
const t0 = prompt.length * CHAR_MS + 300;

push({ t: t0, kind: "thinking", text: `Sampling NACA 2412 at ${PER_SIDE * 2} points over a ${CHORD} mm chord` });

let t = t0 + 600;
push({ t, kind: "tool_call", tool: "autocad - draw_polyline (MCP)", args: `(layer: "RIB-OUTLINE", points: ${PER_SIDE * 2}, closed: true)` });
push({ t: t + 50, kind: "command_echo", text: `PLINE Specify start point: ${f2(outline[0].x)},${f2(outline[0].y)}` });
push({ t: t + 100, kind: "geometry", op: "polyline", layer: "RIB-OUTLINE", params: outline.map((p) => [p.x, p.y]), drawMs: 1800 });
push({ t: t + 300, kind: "command_echo", text: "PLINE Specify next point or [Arc/Halfwidth/Length/Undo]:" });
push({ t: t + 2000, kind: "tool_result", text: `Closed polyline on RIB-OUTLINE, area ${Math.round(area).toLocaleString("en-US")} mm²` });

t += 2300;
push({ t, kind: "tool_call", tool: "autocad - rectang (MCP)", args: `(layer: "RIB-CUTOUTS", count: 2, at: [25%, 65%])` });
spars.forEach((s, i) => {
  const ts = t + 50 + i * 650;
  push({ t: ts, kind: "command_echo", text: `RECTANG Specify first corner point: ${f2(s.corner.x)},${f2(s.corner.y)}` });
  push({ t: ts + 50, kind: "geometry", op: "rect", layer: "RIB-CUTOUTS", params: [[s.corner.x, s.corner.y], [s.size, s.size]], drawMs: 550 });
  push({ t: ts + 300, kind: "command_echo", text: `RECTANG Specify other corner point or [Area/Dimensions/Rotation]: @${f1(s.size)},${f1(s.size)}` });
});
push({ t: t + 1500, kind: "tool_result", text: `Spar slots ${f1(spars[0].size)} mm at ${f1(spars[0].cx)} and ${f1(spars[1].size)} mm at ${f1(spars[1].cx)}, centred on the camber line` });

t += 1800;
push({ t, kind: "tool_call", tool: "autocad - circle (MCP)", args: `(layer: "RIB-CUTOUTS", count: ${holes.length}, diameter: "0.5 × local thickness")` });
holes.forEach((h, i) => {
  const th = t + 50 + i * 260;
  push({ t: th, kind: "command_echo", text: `CIRCLE Specify center point for circle: ${f2(h.cx)},${f2(h.cy)}` });
  push({ t: th + 50, kind: "geometry", op: "circle", layer: "RIB-CUTOUTS", params: [[h.cx, h.cy], [h.r]], drawMs: 450 });
});
push({ t: t + 1700, kind: "tool_result", text: `${holes.length} lightening holes, ⌀${f1(Math.min(...diameters))} to ⌀${f1(Math.max(...diameters))}` });

t += 2000;
push({ t, kind: "tool_call", tool: "autocad - dimension (MCP)", args: `(layers: ["DIMS", "CENTER"], chord: true, spars: true, holes: "largest")` });
push({ t: t + 50, kind: "command_echo", text: "DIMLINEAR Specify first extension line origin or <select object>:" });
push({ t: t + 100, kind: "geometry", op: "centerline", layer: "CENTER", params: centerlines, drawMs: 600 });
push({ t: t + 400, kind: "geometry", op: "dim", layer: "DIMS", dimStyle: "linear", params: [chordDim.from, chordDim.to, chordDim.offset], drawMs: 700, label: f2(CHORD) });
push({ t: t + 700, kind: "command_echo", text: "DIMLINEAR Specify dimension line location:" });
sparDims.forEach((d, i) => {
  push({ t: t + 900 + i * 400, kind: "geometry", op: "dim", layer: "DIMS", dimStyle: "linear", params: [d.from, d.to, d.offset], drawMs: 600, label: f2(spars[i].cx) });
});
push({ t: t + 1700, kind: "command_echo", text: "DIMDIAMETER Select arc or circle:" });
push({ t: t + 1750, kind: "geometry", op: "dim", layer: "DIMS", dimStyle: "leader", params: [[leaderTip.x, leaderTip.y], [leaderKnee.x, leaderKnee.y], [leaderEnd.x, leaderEnd.y]], drawMs: 500, label: `⌀${f1(biggest.r * 2)}` });
push({ t: t + 2400, kind: "tool_result", text: `${sparDims.length + 2} dimensions on DIMS, ${centerlines.length} centerlines on CENTER` });

t += 2800;
const entities = 1 + spars.length + holes.length + sparDims.length + 2 + centerlines.length;
push({ t, kind: "command_echo", text: "Command: QSAVE" });
push({ t: t + 100, kind: "done", text: `Station-3 rib drafted: ${entities} entities on 4 layers, saved to SAE-Rib-Station3.dwg` });

events.sort((a, b) => a.t - b.t);
const script = sessionScriptSchema.parse(events);
// One event per line keeps diffs of the committed script readable.
writeFileSync("content/demo/wing-rib.json", `[\n${script.map((e) => `  ${JSON.stringify(e)}`).join(",\n")}\n]\n`);
console.log(`wrote ${script.length} events, ends at ${script.at(-1)!.t} ms, area ${Math.round(area)} mm²`);
