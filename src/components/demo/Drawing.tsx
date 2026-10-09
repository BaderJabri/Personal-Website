import {
  drawingBounds,
  leaderDim,
  linearDim,
  ordinateDim,
  pairs,
  shapePath,
  svgPoly as poly,
  svgRound as round,
  type P,
  type TextSpot,
} from "@/lib/drawing";
import type { GeometryEvent, SessionEvent } from "@/lib/session-script";

// Renders the geometry events of a session as a finished drawing. Drawing units are mm with y up;
// SVG y runs down, so every point is flipped on the way out. Elements carry the index of their
// event (`data-ev`) so the demo player can rewind and replay them; `data-draw` strokes are drawn on
// with a dash, `data-fade` parts (centerlines, arrowheads, text) fade in.

// A "\n" in a label starts a new line below the first, as in multiline MTEXT.
function Label({ spot, children }: { spot: TextSpot; children: string }) {
  const x = round(spot.x);
  const y = round(-spot.y);
  const lines = children.split("\n");
  return (
    <text
      data-fade
      className="dim-text fill"
      x={x}
      y={y}
      textAnchor={spot.anchor}
      dominantBaseline={spot.baseline}
      transform={spot.rotate ? `rotate(${spot.rotate} ${x} ${y})` : undefined}
    >
      {lines.length === 1
        ? children
        : lines.map((line, i) => (
            <tspan key={i} x={x} dy={i === 0 ? undefined : "1.25em"}>
              {line}
            </tspan>
          ))}
    </text>
  );
}

const Arrow = ({ tri }: { tri: P[] }) => <path data-fade className="fill" d={poly(tri, true)} />;

function Entity({ ev }: { ev: GeometryEvent }) {
  switch (ev.op) {
    case "polyline":
    case "rect":
    case "circle":
      return <path data-draw className="geo" pathLength={100} d={shapePath(ev)!} />;
    case "line":
      return (
        <>
          {ev.params.map((s, i) => (
            <path key={i} data-draw className="geo" pathLength={100} d={poly(pairs(s))} />
          ))}
        </>
      );
    case "centerline":
      return (
        <g data-fade>
          {ev.params.map((s, i) => (
            <path key={i} className="geo centerline" d={poly(pairs(s))} />
          ))}
        </g>
      );
    case "dim": {
      const label = ev.label ?? "";
      if (ev.dimStyle === "ordinate") {
        const d = ordinateDim(ev.params[0], ev.params[1]);
        return (
          <>
            <path data-draw className="geo thin" pathLength={100} d={poly(d.line)} />
            <Label spot={d.text}>{label}</Label>
          </>
        );
      }
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
    <svg
      className={`drawing ${className ?? ""}`}
      data-palette={palette}
      viewBox={viewBox}
      role="img"
      aria-label={title}
    >
      {geometry.map(({ ev, i }) => (
        <g key={i} data-ev={i} data-op={ev.op} data-layer={ev.layer}>
          <Entity ev={ev} />
        </g>
      ))}
    </svg>
  );
}
