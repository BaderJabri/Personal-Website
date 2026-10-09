"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  PALETTES,
  cellPath,
  layoutTiles,
  mulberry32,
  randomTile,
  rotateCell,
  type Layout,
  type Tile,
} from "@/lib/truchet";

// A pocket version of Tile To Pattern: edit one tile, and the page fills with it.
const N = 4;
const TILE = 120; // tile size in pattern units
const CELL = TILE / N;
const LAYOUTS: { id: Layout; label: string }[] = [
  { id: "grid", label: "Grid" },
  { id: "brick", label: "Brick" },
  { id: "halfdrop", label: "Half drop" },
];

function TileArt({
  tile,
  palette,
  x = 0,
  y = 0,
}: {
  tile: Tile;
  palette: (typeof PALETTES)[number];
  x?: number;
  y?: number;
}) {
  const d = tile.cells.map((o, i) => cellPath(o, x + (i % N) * CELL, y + Math.floor(i / N) * CELL, CELL)).join("");
  const dots = [];
  for (let r = 0; r <= N; r++) for (let c = 0; c <= N; c++) dots.push([x + c * CELL, y + r * CELL]);
  return (
    <g>
      <rect x={x} y={y} width={TILE} height={TILE} fill={palette.bg} />
      <path d={d} fill="none" stroke={palette.arc} strokeWidth={CELL * 0.26} />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={CELL * 0.11} fill={palette.dot} />
      ))}
    </g>
  );
}

export function PatternToy() {
  const [tile, setTile] = useState<Tile>(() => randomTile(N, mulberry32(20250830)));
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [layout, setLayout] = useState<Layout>("brick");
  const [zoom, setZoom] = useState(80);
  const seed = useRef(1);
  const id = useId().replace(/:/g, "");
  const patternRef = useRef<SVGPatternElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const palette = PALETTES[paletteIndex];
  const { w, h, at } = layoutTiles(layout);

  // Pattern placement is written straight to the SVG: drags and the idle drift never re-render.
  const place = () => {
    const s = zoomRef.current / 100;
    patternRef.current?.setAttribute(
      "patternTransform",
      `translate(${offset.current.x.toFixed(2)} ${offset.current.y.toFixed(2)}) scale(${s})`,
    );
  };
  useEffect(() => {
    zoomRef.current = zoom;
    place();
  }, [zoom, layout]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let drifting = !reduced;
    let visible = false;
    let drag: { x: number; y: number; ox: number; oy: number } | null = null;

    const drift = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      offset.current.x += dt * 0.018;
      offset.current.y += dt * 0.009;
      place();
      raf = requestAnimationFrame(drift);
    };
    const startDrift = () => {
      if (drifting && visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(drift);
      }
    };
    const stopDrift = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const down = (e: PointerEvent) => {
      drifting = false;
      stopDrift();
      drag = { x: e.clientX, y: e.clientY, ox: offset.current.x, oy: offset.current.y };
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      offset.current = { x: drag.ox + (e.clientX - drag.x), y: drag.oy + (e.clientY - drag.y) };
      place();
    };
    const up = () => {
      drag = null;
      delete el.dataset.dragging;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startDrift();
      else stopDrift();
    });
    io.observe(el);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      io.disconnect();
      stopDrift();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-x-10">
      <div className="flex flex-col gap-6 md:col-span-4">
        <div>
          <p className="text-sm text-pencil">Your tile. Click a square to turn it.</p>
          <svg
            viewBox={`0 0 ${TILE} ${TILE}`}
            className="mt-3 w-full max-w-[240px] rounded-[2px] border border-rule"
            role="group"
            aria-label="Tile editor, 4 by 4 squares"
          >
            <TileArt tile={tile} palette={palette} />
            {tile.cells.map((_, i) => (
              <rect
                key={i}
                x={(i % N) * CELL}
                y={Math.floor(i / N) * CELL}
                width={CELL}
                height={CELL}
                role="button"
                tabIndex={0}
                aria-label={`Turn square ${i + 1}`}
                className="toy-cell"
                onClick={() => setTile((t) => rotateCell(t, i))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTile((t) => rotateCell(t, i));
                  }
                }}
              />
            ))}
          </svg>
        </div>

        <fieldset>
          <legend className="text-sm text-pencil">Layout</legend>
          <div className="mt-2 inline-flex rounded-[2px] border border-rule p-0.5">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={layout === l.id}
                onClick={() => setLayout(l.id)}
                className="rounded-[2px] px-3 py-1.5 text-sm aria-pressed:bg-ink aria-pressed:text-paper hover:bg-rule"
              >
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm text-pencil">Size</span>
          <input
            type="range"
            min={25}
            max={110}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="toy-range mt-2 block w-full max-w-[240px]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setTile(randomTile(N, mulberry32(++seed.current * 7919)))}
          >
            New tile
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setPaletteIndex((p) => (p + 1) % PALETTES.length)}
          >
            Colours: {palette.name}
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="toy-canvas relative h-[300px] overflow-hidden rounded-[2px] border border-rule md:col-span-8 md:h-[440px]"
        aria-label="Pattern preview. Drag to move it."
        role="img"
      >
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <pattern ref={patternRef} id={`pat-${id}`} patternUnits="userSpaceOnUse" width={w * TILE} height={h * TILE}>
              {at.map(([x, y], i) => (
                <TileArt key={i} tile={tile} palette={palette} x={x * TILE} y={y * TILE} />
              ))}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#pat-${id})`} />
        </svg>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-[2px] bg-paper/90 px-2 py-1 text-xs text-pencil">
          Drag to move
        </span>
      </div>
    </div>
  );
}
