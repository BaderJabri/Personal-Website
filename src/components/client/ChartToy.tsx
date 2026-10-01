"use client";
import { useEffect, useRef, useState } from "react";
import { clampValue, niceMax, ticks } from "@/lib/chart";

// A pocket version of Plotit: a spreadsheet on one side, the chart it becomes on the other.
// Edit a number or drag a point; both stay in sync. Starts from the sample data in Plotit's
// own screenshot (monthly clicks, January to June).
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const START = [506, 116, 584, 217, 379, 100];
const W = 560;
const H = 300;
const PAD = { l: 44, r: 16, t: 16, b: 32 };

export function ChartToy() {
  const [values, setValues] = useState(START);
  const [kind, setKind] = useState<"line" | "bar">("line");
  const [drawn, setDrawn] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<number | null>(null);
  // While a point is being dragged the axis holds still; re-scaling under the pointer would
  // feed back into the value and run it to the top.
  const [frozenTop, setFrozenTop] = useState<number | null>(null);

  const top = frozenTop ?? niceMax(Math.max(...values));
  const x = (i: number) => PAD.l + ((W - PAD.l - PAD.r) * (i + 0.5)) / values.length;
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / top);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(values.length - 1).toFixed(1)},${H - PAD.b}L${x(0).toFixed(1)},${H - PAD.b}Z`;

  const set = (i: number, v: number) => setValues((vs) => vs.map((old, j) => (j === i ? clampValue(v) : old)));

  // Draw the line in the first time the chart scrolls into view.
  useEffect(() => {
    const el = svgRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setDrawn(false);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const valueAt = (clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const sy = ((clientY - r.top) / r.height) * H;
    return ((H - PAD.b - sy) / (H - PAD.t - PAD.b)) * top;
  };

  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-x-10">
      <table className="toy-table self-start text-sm md:order-2 md:col-span-4">
        <caption className="mb-3 text-left text-sm text-pencil">Your spreadsheet. Edit any number.</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col" className="text-right">
              Clicks
            </th>
          </tr>
        </thead>
        <tbody>
          {values.map((v, i) => (
            <tr key={MONTHS[i]}>
              <th scope="row" className="font-normal">
                {MONTHS[i]}
              </th>
              <td className="text-right">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999}
                  value={v}
                  aria-label={`${MONTHS[i]} clicks`}
                  onChange={(e) => set(i, Number(e.target.value))}
                  className="num w-20 text-right"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:order-1 md:col-span-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-pencil">Drag a point to change it.</p>
          <div className="inline-flex rounded-[2px] border border-rule p-0.5">
            {(["line", "bar"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className="rounded-[2px] px-3 py-1 text-sm aria-pressed:bg-ink aria-pressed:text-paper hover:bg-rule"
              >
                {k === "line" ? "Line" : "Bars"}
              </button>
            ))}
          </div>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="toy-chart mt-3 w-full touch-none select-none rounded-[2px] border border-rule"
          data-drawn={drawn ? "" : undefined}
          role="group"
          aria-label="Chart of monthly clicks"
          onPointerMove={(e) => {
            if (dragging.current !== null) set(dragging.current, Math.min(top, valueAt(e.clientY)));
          }}
          onPointerUp={() => {
            dragging.current = null;
            setFrozenTop(null);
          }}
          onPointerCancel={() => {
            dragging.current = null;
            setFrozenTop(null);
          }}
        >
          {ticks(top, 3).map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="toy-grid" />
              <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="toy-axis">
                {t}
              </text>
            </g>
          ))}
          {MONTHS.map((m, i) => (
            <text key={m} x={x(i)} y={H - 10} textAnchor="middle" className="toy-axis">
              {m}
            </text>
          ))}

          {kind === "line" ? (
            <>
              <path d={area} className="toy-area" />
              <path d={line} pathLength={1} className="toy-line" />
            </>
          ) : (
            values.map((v, i) => {
              const bw = ((W - PAD.l - PAD.r) / values.length) * 0.56;
              return <rect key={i} x={x(i) - bw / 2} y={y(v)} width={bw} height={H - PAD.b - y(v)} rx={2} className="toy-bar" />;
            })
          )}

          {values.map((v, i) => (
            <g key={i}>
              <circle
                cx={x(i)}
                cy={y(v)}
                r={7}
                tabIndex={0}
                role="slider"
                aria-label={`${MONTHS[i]} clicks`}
                aria-valuemin={0}
                aria-valuemax={999}
                aria-valuenow={v}
                className="toy-point"
                onPointerDown={(e) => {
                  dragging.current = i;
                  setFrozenTop(top);
                  (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId);
                }}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? 50 : 10;
                  if (e.key === "ArrowUp" || e.key === "ArrowRight") set(i, v + step);
                  else if (e.key === "ArrowDown" || e.key === "ArrowLeft") set(i, v - step);
                  else return;
                  e.preventDefault();
                }}
              />
              <text x={x(i)} y={y(v) - 14} textAnchor="middle" className="toy-label num">
                {v}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
