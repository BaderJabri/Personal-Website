// Generates content/demo/wing-rib.json, the session the home-page demo replays.
// Dev tool: run `bun scripts/generate-rib-script.ts` after changing anything below, then commit
// the JSON. Geometry is in millimetres with y up and the leading edge at the origin.
// The part and its annotation follow the drawing the plugin produced for this prompt
// (SAE_Aero_Wing_Rib_STA3.pdf, rev P1): ordinate dimensions from the leading edge along the top,
// tagged leaders underneath.
import { writeFileSync } from "node:fs";
import { camberAt, naca4Outline, parseNaca4, type Pt } from "../src/lib/naca";
import { sessionScriptSchema, type SessionEvent } from "../src/lib/session-script";

const CHORD = 180;
const AIRFOIL = parseNaca4("2412");
const PER_SIDE = 24; // 48 unique outline points
const CHAR_MS = 18;
const MIN_WEB = 4; // mm of rib left between any cutout and the skin

const r2 = (v: number) => Math.round(v * 100) / 100;
const f1 = (v: number) => v.toFixed(1);
const f2 = (v: number) => v.toFixed(2);
const camberY = (x: number) => camberAt(AIRFOIL, x / CHORD).yc * CHORD;
const scale = (p: Pt) => ({ x: p.x * CHORD, y: p.y * CHORD });

// Outline as drawn, plus a dense copy of the true contour to measure webs against
const outline: Pt[] = naca4Outline(AIRFOIL, PER_SIDE).map(scale).map((p) => ({ x: r2(p.x), y: r2(p.y) }));
const contour = naca4Outline(AIRFOIL, 2000).map(scale);
const area = Math.abs(
  outline.reduce((s, p, i) => {
    const q = outline[(i + 1) % outline.length];
    return s + p.x * q.y - q.x * p.y;
  }, 0) / 2,
);

function distanceToContour(x: number, y: number) {
  let min = Infinity;
  contour.forEach((a, i) => {
    const b = contour[(i + 1) % contour.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
    min = Math.min(min, Math.hypot(x - a.x - t * dx, y - a.y - t * dy));
  });
  return min;
}
const holeWeb = (cx: number, cy: number, d: number) => distanceToContour(cx, cy) - d / 2;
const slotWeb = (cx: number, cy: number, w: number, h: number) =>
  Math.min(
    ...contour.map((p) => Math.hypot(Math.max(0, Math.abs(p.x - cx) - w / 2), Math.max(0, Math.abs(p.y - cy) - h / 2))),
  );

// Spar slots on the camber line, nominal spar size (width along the chord × depth)
const slots = [
  { tag: "S1", xc: 0.25, w: 6, h: 12, spar: "MAIN SPAR" },
  { tag: "S2", xc: 0.65, w: 6, h: 6, spar: "REAR SPAR" },
].map((s) => {
  const cx = s.xc * CHORD;
  const cy = camberY(cx);
  return { ...s, cx, cy, corner: { x: r2(cx - s.w / 2), y: r2(cy - s.h / 2) }, web: slotWeb(cx, cy, s.w, s.h) };
});

// Lightening holes on the camber line: the largest whole-mm diameter that keeps the web.
// None aft of the rear spar, where the rib is too shallow for one to be worth cutting.
const holes = [
  { tag: "H1", cx: 26 },
  { tag: "H2", cx: 62 },
  { tag: "H3", cx: 82 },
  { tag: "H4", cx: 101 },
].map(({ tag, cx }) => {
  const cy = camberY(cx);
  let d = 1;
  while (holeWeb(cx, cy, d + 1) >= MIN_WEB) d++;
  return { tag, cx, cy: r2(cy), d, r: d / 2, web: holeWeb(cx, cy, d) };
});
const minWeb = (webs: number[]) => f2(Math.min(...webs));

// Centerlines: the chord datum, a centre mark on every hole and slot, and the mean camber line
const cross = (cx: number, cy: number, armX: number, armY: number) => [
  [r2(cx - armX), r2(cy), r2(cx + armX), r2(cy)],
  [r2(cx), r2(cy - armY), r2(cx), r2(cy + armY)],
];
const centerMarks = [
  [-5, 0, CHORD + 5, 0],
  ...holes.flatMap((h) => cross(h.cx, h.cy, h.r + 1.8, h.r + 1.8)),
  ...slots.flatMap((s) => cross(s.cx, s.cy, s.w / 2 + 1.8, s.h / 2 + 1.8)),
];
const camberLine = [Array.from({ length: 19 }, (_, i) => i * 10).flatMap((x) => [x, r2(camberY(x))])];

// Ordinate dimensions: x from the leading edge, read off the top of each feature
const ORDINATE_TOP = 25.5;
const features = [
  ...holes.map((h) => ({ x: h.cx, top: h.cy + h.r })),
  ...slots.map((s) => ({ x: s.cx, top: s.cy + s.h / 2 })),
].sort((a, b) => a.x - b.x);
const ordinates = [{ x: 0, top: 0 }, ...features].map((f) => ({
  params: [[r2(f.x), r2(f.top)], [r2(f.x), ORDINATE_TOP]],
  label: String(r2(f.x)),
}));
const overall = { params: [[0, 0], [CHORD, 0], [0, 31]], label: String(CHORD) };

// Tagged leaders, left to right in three rows under the part. Hole leaders point at the
// centre; slot leaders land on the slot's lower edge.
const LANDING = 1.9;
const leaderTo = (tip: number[], knee: number[], label: string) => ({
  params: [tip.map(r2), knee, [knee[0] + LANDING, knee[1]]],
  label,
});
const holeLeader = (h: (typeof holes)[number], knee: number[]) => {
  const len = Math.hypot(knee[0] - h.cx, knee[1] - h.cy);
  const tip = [h.cx + (h.r * (knee[0] - h.cx)) / len, h.cy + (h.r * (knee[1] - h.cy)) / len];
  return { x: h.cx, ...leaderTo(tip, knee, `${h.tag} Ø${h.d}`) };
};
const slotLeader = (s: (typeof slots)[number], knee: number[]) => ({
  x: s.cx,
  ...leaderTo([s.cx + 0.5, s.cy - s.h / 2], knee, `${s.tag} SLOT ${s.w} x ${s.h}\n${s.spar}, ${Math.round(s.xc * 100)}% C`),
});
const leaders = [
  holeLeader(holes[0], [28.5, -13]),
  holeLeader(holes[1], [71.5, -19]),
  holeLeader(holes[2], [101.5, -19]),
  holeLeader(holes[3], [103.5, -13]),
  slotLeader(slots[0], [57, -25.8]),
  slotLeader(slots[1], [131, -25.8]),
].sort((a, b) => a.x - b.x);

// Session
const prompt =
  "Draft the station-3 wing rib for our SAE Aero plane: NACA 2412, 180 mm chord, spar slots at 25% and 65%, lightening holes, and dimensions.";
const events: SessionEvent[] = [];
const push = (e: SessionEvent) => events.push(e);

push({ t: 0, kind: "prompt", text: prompt });
const t0 = prompt.length * CHAR_MS + 300;

push({ t: t0, kind: "thinking", text: `Sampling NACA 2412 at ${PER_SIDE * 2} points over a ${CHORD} mm chord` });

let t = t0 + 500;
push({ t, kind: "tool_call", tool: "autocad.draw_polyline", args: `(layer: "RIB-OUTLINE", points: ${PER_SIDE * 2}, closed: true)` });
push({ t: t + 50, kind: "command_echo", text: `PLINE Specify start point: ${f2(outline[0].x)},${f2(outline[0].y)}` });
push({ t: t + 100, kind: "geometry", op: "polyline", layer: "RIB-OUTLINE", params: outline.map((p) => [p.x, p.y]), drawMs: 1500 });
push({ t: t + 300, kind: "command_echo", text: "PLINE Specify next point or [Arc/Halfwidth/Length/Undo]:" });
push({ t: t + 1700, kind: "tool_result", text: `Closed polyline on RIB-OUTLINE, area ${Math.round(area).toLocaleString("en-US")} mm²` });
// visual feedback loop: the agent looks at the drawing before building on it
push({ t: t + 1850, kind: "tool_call", tool: "autocad.capture_view", args: `(fit: "RIB-OUTLINE")` });
push({ t: t + 2200, kind: "tool_result", text: "Looked at the render: outline closed and smooth. Continuing." });

t += 2400;
push({ t, kind: "tool_call", tool: "autocad.rectang", args: `(layer: "RIB-CUTOUTS", count: 2, at: [25%, 65%])` });
slots.forEach((s, i) => {
  const ts = t + 50 + i * 600;
  push({ t: ts, kind: "command_echo", text: `RECTANG Specify first corner point: ${f2(s.corner.x)},${f2(s.corner.y)}` });
  push({ t: ts + 50, kind: "geometry", op: "rect", layer: "RIB-CUTOUTS", params: [[s.corner.x, s.corner.y], [s.w, s.h]], drawMs: 450 });
  push({ t: ts + 250, kind: "command_echo", text: `RECTANG Specify other corner point or [Area/Dimensions/Rotation]: @${f1(s.w)},${f1(s.h)}` });
});
push({
  t: t + 1250,
  kind: "tool_result",
  text: `Spar slots ${slots.map((s) => `${s.w} x ${s.h} at ${f1(s.cx)}`).join(" and ")} on the camber line, min web ${minWeb(slots.map((s) => s.web))} mm`,
});

t += 1450;
push({ t, kind: "tool_call", tool: "autocad.circle", args: `(layer: "RIB-CUTOUTS", count: ${holes.length}, diameter: "largest whole mm with a ${MIN_WEB} mm web")` });
holes.forEach((h, i) => {
  const th = t + 50 + i * 230;
  push({ t: th, kind: "command_echo", text: `CIRCLE Specify center point for circle: ${f2(h.cx)},${f2(h.cy)}` });
  push({ t: th + 50, kind: "geometry", op: "circle", layer: "RIB-CUTOUTS", params: [[h.cx, h.cy], [h.r]], drawMs: 400 });
});
const diameters = holes.map((h) => h.d);
push({
  t: t + 1350,
  kind: "tool_result",
  text: `${holes.length} lightening holes, Ø${Math.min(...diameters)} to Ø${Math.max(...diameters)}, min web ${minWeb(holes.map((h) => h.web))} mm`,
});

t += 1550;
push({ t, kind: "tool_call", tool: "autocad.dimension", args: `(layers: ["CENTER", "CAMBER", "DIMS"], ordinate: "from LE", overall: true)` });
push({ t: t + 50, kind: "command_echo", text: "CENTERMARK Select circle or arc to add centermark:" });
push({ t: t + 100, kind: "geometry", op: "centerline", layer: "CENTER", params: centerMarks, drawMs: 500 });
push({ t: t + 250, kind: "geometry", op: "centerline", layer: "CAMBER", params: camberLine, drawMs: 500 });
push({ t: t + 600, kind: "command_echo", text: "DIMORDINATE Specify feature location:" });
ordinates.forEach((o, i) => {
  push({ t: t + 650 + i * 110, kind: "geometry", op: "dim", layer: "DIMS", dimStyle: "ordinate", params: o.params, drawMs: 350, label: o.label });
});
push({ t: t + 900, kind: "command_echo", text: "DIMORDINATE Specify leader endpoint or [Xdatum/Ydatum/Mtext/Text/Angle]:" });
push({ t: t + 1400, kind: "command_echo", text: "DIMLINEAR Specify first extension line origin or <select object>:" });
push({ t: t + 1450, kind: "geometry", op: "dim", layer: "DIMS", dimStyle: "linear", params: overall.params, drawMs: 500, label: overall.label });
push({ t: t + 1700, kind: "command_echo", text: "DIMLINEAR Specify dimension line location or [Mtext/Text/Angle/Horizontal/Vertical/Rotated]:" });
push({
  t: t + 2050,
  kind: "tool_result",
  text: `Chord datum, camber line, ${features.length} centre marks; ${ordinates.length} ordinates from the leading edge, ${CHORD} overall`,
});

t += 2250;
push({ t, kind: "tool_call", tool: "autocad.mleader", args: `(layer: "DIMS", tags: ${leaders.length})` });
push({ t: t + 50, kind: "command_echo", text: "MLEADER Specify leader arrowhead location or [leader Landing first/Content first/Options] <Options>:" });
leaders.forEach((l, i) => {
  push({ t: t + 100 + i * 190, kind: "geometry", op: "dim", layer: "DIMS", dimStyle: "leader", params: l.params, drawMs: 450, label: l.label });
});
push({ t: t + 400, kind: "command_echo", text: "MLEADER Specify leader landing location:" });
push({ t: t + 1600, kind: "tool_result", text: `Tagged ${holes.map((h) => h.tag).join(", ")} and ${slots.map((s) => s.tag).join(", ")}, spar callouts on the slots` });
push({ t: t + 1750, kind: "tool_call", tool: "autocad.capture_view", args: `(fit: "extents")` });
push({ t: t + 2150, kind: "tool_result", text: "Looked at the render: tags clear of the part and of each other." });

t += 2400;
const entities = 1 + slots.length + holes.length + centerMarks.length + camberLine.length + ordinates.length + 1 + leaders.length;
const layers = new Set(events.flatMap((e) => (e.kind === "geometry" ? [e.layer] : [])));
push({ t, kind: "command_echo", text: "Command: QSAVE" });
push({ t: t + 100, kind: "done", text: `Station-3 rib drafted: ${entities} entities on ${layers.size} layers, saved to SAE_Aero_Wing_Rib_STA3.dwg` });

events.sort((a, b) => a.t - b.t);
const script = sessionScriptSchema.parse(events);
// One event per line keeps diffs of the committed script readable.
writeFileSync("content/demo/wing-rib.json", `[\n${script.map((e) => `  ${JSON.stringify(e)}`).join(",\n")}\n]\n`);
console.log(`wrote ${script.length} events, ends at ${script.at(-1)!.t} ms, area ${Math.round(area)} mm²`);
console.log(holes.map((h) => `${h.tag} Ø${h.d} web ${f2(h.web)}`).join(" · "), "·", slots.map((s) => `${s.tag} web ${f2(s.web)}`).join(" · "));
