import { drawingBounds, leaderDim, linearDim, type P, type TextSpot } from "@/lib/drawing";
import type { GeometryEvent, SessionEvent } from "@/lib/session-script";

// Renders the geometry events of a session as a finished drawing. Drawing units are mm with y up;
// SVG y runs down, so every point is flipped on the way out. Elements carry the index of their
// event (`data-ev`) so the demo player can rewind and replay them; `data-draw` strokes are drawn on
// with a dash, `data-fade` parts (centerlines, arrowheads, text) fade in.

const pt = ([x, y]: number[]) => `${round(x)},${round(-y)}`;
const round = (v: number) => Math.round(v * 100) / 100;
const poly = (pts: number[][], close = false) => `M${pts.map(pt).join("L")}${close ? "Z" : ""}`;

function circlePath([cx, cy]: number[], r: number) {
  // Two arcs, starting at the top like AutoCAD's quadrant grip, so the draw-on reads clockwise.
  return `M${pt([cx, cy + r])}A${r},${r} 0 1 1 ${pt([cx, cy - r])}A${r},${r} 0 1 1 ${pt([cx, cy + r])}`;
}

function Label({ spot, children }: { spot: TextSpot; children: string }) {
  const x = round(spot.x);
  const y = round(-spot.y);
  return (
    <text
      data-fade
      className="dim-text fill"
      x={x}
      y={y}
      textAnchor={spot.anchor}
      transform={spot.rotate ? `rotate(${spot.rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

const Arrow = ({ tri }: { tri: P[] }) => <path data-fade className="fill" d={poly(tri, true)} />;

function Entity({ ev }: { ev: GeometryEvent }) {
  switch (ev.op) {
    case "polyline": {
      const first = ev.params[0];
      const last = ev.params.at(-1)!;
      const closed = first[0] === last[0] && first[1] === last[1];
      return <path data-draw className="geo" pathLength={100} d={poly(closed ? ev.params.slice(0, -1) : ev.params, closed)} />;
    }
    case "rect": {
      const [[x, y], [w, h]] = ev.params;
      return <path data-draw className="geo" pathLength={100} d={poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true)} />;
    }
    case "circle": {
      const [c, [r]] = ev.params;
      return <path data-draw className="geo" pathLength={100} d={circlePath(c, r)} />;
    }
    case "line":
      return (
        <>
          {ev.params.map((s, i) => (
            <path key={i} data-draw className="geo" pathLength={100} d={poly([[s[0], s[1]], [s[2], s[3]]])} />
          ))}
        </>
      );
    case "centerline":
      return (
        <g data-fade>
          {ev.params.map((s, i) => (
            <path key={i} className="geo centerline" d={poly([[s[0], s[1]], [s[2], s[3]]])} />
          ))}
        </g>
      );
    case "dim": {
      const label = ev.label ?? "";
      if (ev.dimStyle === "leader") {
        const d = leaderDim(ev.params[0], ev.params[1], ev.params[2]);
        return (
          <>
            <path data-draw className="geo thin" pathLength={100} d={poly(d.path)} />
            <Arrow tri={d.arrow} />
            <Label spot={d.text}>{label}</Label>
          </>
        );
      }
      const d = linearDim(ev.params[0], ev.params[1], ev.params[2]);
      return (
        <>
          {d.extLines.map((l, i) => (
            <path key={i} data-draw className="geo thin" pathLength={100} d={poly(l)} />
          ))}
          <path data-draw className="geo thin" pathLength={100} d={poly(d.dimLine)} />
          {d.arrows.map((a, i) => (
            <Arrow key={i} tri={a} />
          ))}
          <Label spot={d.text}>{label}</Label>
        </>
      );
    }
  }
}

export function Drawing({
  events,
  palette,
  title,
  pad = 6,
  className,
}: {
  events: SessionEvent[];
  palette: "model" | "paper";
  title: string;
  pad?: number;
  className?: string;
}) {
  const geometry = events.flatMap((ev, i) => (ev.kind === "geometry" ? [{ ev, i }] : []));
  const b = drawingBounds(
    geometry.map((g) => g.ev),
    pad,
  );
  const viewBox = `${round(b.minX)} ${round(-b.maxY)} ${round(b.maxX - b.minX)} ${round(b.maxY - b.minY)}`;

  return (
    <svg className={`drawing ${className ?? ""}`} data-palette={palette} viewBox={viewBox} role="img" aria-label={title}>
      {geometry.map(({ ev, i }) => (
        <g key={i} data-ev={i} data-op={ev.op} data-layer={ev.layer}>
          <Entity ev={ev} />
        </g>
      ))}
    </svg>
  );
}
