import { ImageResponse } from "next/og";
import { getRibSession } from "./demo";
import { drawingBounds, shapePath } from "./drawing";

// Social cards: paper, ink, the rib's outline and cutouts plotted in the corner.
// Satori (ImageResponse) needs explicit flex on any multi-child div and inline SVG attributes.

export const OG_SIZE = { width: 1200, height: 630 };

function ribPaths() {
  const geo = getRibSession().flatMap((e) =>
    e.kind === "geometry" && (e.layer === "RIB-OUTLINE" || e.layer === "RIB-CUTOUTS") ? [e] : [],
  );
  const b = drawingBounds(geo, 4);
  const paths = geo.map((e) => ({ d: shapePath(e)!, cut: e.layer === "RIB-CUTOUTS" }));
  return { paths, viewBox: `${b.minX} ${-b.maxY} ${b.maxX - b.minX} ${b.maxY - b.minY}` };
}

export function ogImage({ title, subtitle, kicker }: { title: string; subtitle: string; kicker: string }) {
  const rib = ribPaths();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#f3f4f1",
        color: "#15181c",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#50565e" }}>{kicker}</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 24, maxWidth: 760, lineHeight: 1.3, color: "#50565e" }}>
          {subtitle}
        </div>
      </div>
      <svg width="520" height="150" viewBox={rib.viewBox} style={{ position: "absolute", right: 64, bottom: 64 }}>
        {rib.paths.map((path, i) => (
          <path key={i} d={path.d} fill="none" stroke={path.cut ? "#00707f" : "#15181c"} strokeWidth={0.6} />
        ))}
      </svg>
    </div>,
    OG_SIZE,
  );
}
