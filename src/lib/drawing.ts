import type { GeometryEvent } from "./session-script";

// Dimension layout in drawing units (mm, y up), following AutoCAD's defaults closely enough to
// read as a real drawing: a small gap where extension lines leave the object, a short overshoot
// past the dimension line, closed filled arrowheads, text centred above the line.

export type P = [number, number];

const GAP = 0.8;
const OVERSHOOT = 1.25;
const ARROW_LEN = 2.5;
const ARROW_HALF = 0.55;
const TEXT_LIFT = 1.1;
const LANDING_GAP = 0.9;

export interface TextSpot {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  rotate?: number;
  /** "central" centres the text on y instead of sitting it on y */
  baseline?: "central";
}

export interface LinearDim {
  orientation: "horizontal" | "vertical";
  extLines: [P, P][];
  dimLine: [P, P];
  /** each arrow is [tip, left, right] */
  arrows: [P, P, P][];
  text: TextSpot;
}

function arrow(tip: P, toward: P): [P, P, P] {
  const dx = toward[0] - tip[0];
  const dy = toward[1] - tip[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const bx = tip[0] + ux * ARROW_LEN;
  const by = tip[1] + uy * ARROW_LEN;
  return [tip, [bx - uy * ARROW_HALF, by + ux * ARROW_HALF], [bx + uy * ARROW_HALF, by - ux * ARROW_HALF]];
}

/** DIMLINEAR: two measured points and the point the dimension line passes through. */
export function linearDim(p1: number[], p2: number[], loc: number[]): LinearDim {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const horizontal = loc[1] > Math.max(y1, y2) || loc[1] < Math.min(y1, y2);

  if (horizontal) {
    const yl = loc[1];
    const ext = ([x, y]: number[]): [P, P] => {
      const dir = Math.sign(yl - y) || 1;
      return [
        [x, y + dir * GAP],
        [x, yl + dir * OVERSHOOT],
      ];
    };
    const a: P = [x1, yl];
    const b: P = [x2, yl];
    return {
      orientation: "horizontal",
      extLines: [ext(p1), ext(p2)],
      dimLine: [a, b],
      arrows: [arrow(a, b), arrow(b, a)],
      text: { x: (x1 + x2) / 2, y: yl + TEXT_LIFT, anchor: "middle" },
    };
  }

  const xl = loc[0];
  const ext = ([x, y]: number[]): [P, P] => {
    const dir = Math.sign(xl - x) || 1;
    return [
      [x + dir * GAP, y],
      [xl + dir * OVERSHOOT, y],
    ];
  };
  const a: P = [xl, y1];
  const b: P = [xl, y2];
  return {
    orientation: "vertical",
    extLines: [ext(p1), ext(p2)],
    dimLine: [a, b],
    arrows: [arrow(a, b), arrow(b, a)],
    text: { x: xl - TEXT_LIFT, y: (y1 + y2) / 2, anchor: "middle", rotate: -90 },
  };
}

export interface LeaderDim {
  path: P[];
  arrow: [P, P, P];
  text: TextSpot;
}

/** MLEADER: arrow tip on the feature, a knee, a short landing, then the text centred on the landing. */
export function leaderDim(tip: number[], knee: number[], end: number[]): LeaderDim {
  const t: P = [tip[0], tip[1]];
  const k: P = [knee[0], knee[1]];
  return {
    path: [t, k, [end[0], end[1]]],
    arrow: arrow(t, k),
    text: { x: end[0] + LANDING_GAP, y: end[1], anchor: "start", baseline: "central" },
  };
}

export interface OrdinateDim {
  line: [P, P];
  text: TextSpot;
}

/** DIMORDINATE (X datum): a leader from the feature up to the endpoint, text reading up beside its top. */
export function ordinateDim(feature: number[], end: number[]): OrdinateDim {
  const [x, y] = feature;
  return {
    line: [
      [x, y + GAP],
      [x, end[1]],
    ],
    text: { x: x - TEXT_LIFT, y: end[1], anchor: "end", rotate: -90 },
  };
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function eventPoints(ev: GeometryEvent): number[][] {
  switch (ev.op) {
    case "circle": {
      const [[cx, cy], [r]] = ev.params;
      return [
        [cx - r, cy - r],
        [cx + r, cy + r],
      ];
    }
    case "rect": {
      const [[x, y], [w, h]] = ev.params;
      return [
        [x, y],
        [x + w, y + h],
      ];
    }
    case "centerline":
    case "line":
      // each param is a flat run of points: x1, y1, x2, y2, ...
      return ev.params.flatMap(pairs);
    default:
      return ev.params;
  }
}

export function pairs(flat: number[]): P[] {
  return Array.from({ length: flat.length >> 1 }, (_, i) => [flat[2 * i], flat[2 * i + 1]] as P);
}

export function drawingBounds(events: GeometryEvent[], pad: number): Bounds {
  const pts = events.flatMap(eventPoints);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return {
    minX: Math.min(...xs) - pad,
    maxX: Math.max(...xs) + pad,
    minY: Math.min(...ys) - pad,
    maxY: Math.max(...ys) + pad,
  };
}
