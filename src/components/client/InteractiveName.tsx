"use client";
import { useEffect, useRef } from "react";

// The name responds to the pointer through Mona Sans's variable axes: letters near the cursor
// get heavier (and a touch narrower, so they keep roughly the same footprint), easing back as it
// leaves. Animation starts only on pointer input. Each letter's box is measured once and
// pinned, so nothing around the name ever moves (no layout shift).

const BASE = { wght: 620, wdth: 125 };
const PEAK = { wght: 900, wdth: 108 };
const RADIUS = 190; // px of pointer influence

export function InteractiveName({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h1 = ref.current;
    if (!h1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = [...h1.querySelectorAll<HTMLSpanElement>("[data-ch]")];
    const cur = letters.map(() => 0);
    let centers: { x: number; y: number }[] = [];
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;

    const pin = () => {
      for (const l of letters) l.style.width = "";
      const widths = letters.map((l) => l.getBoundingClientRect().width);
      letters.forEach((l, i) => (l.style.width = `${widths[i]}px`));
    };
    const locate = () => {
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const paint = (i: number, t: number) => {
      const l = letters[i];
      l.style.fontWeight = String(Math.round(BASE.wght + (PEAK.wght - BASE.wght) * t));
      l.style.fontVariationSettings = `"wdth" ${(BASE.wdth + (PEAK.wdth - BASE.wdth) * t).toFixed(1)}`;
      l.style.color = t > 0.02 ? `color-mix(in oklab, var(--ink), var(--accent) ${Math.round(t * 70)}%)` : "";
    };

    const frame = () => {
      locate();
      let moving = false;
      letters.forEach((_, i) => {
        let near = 0;
        if (pointer) {
          const d = Math.hypot(pointer.x - centers[i].x, (pointer.y - centers[i].y) * 1.6);
          near = Math.max(0, 1 - d / RADIUS);
          near = near * near * (3 - 2 * near); // smoothstep
        }
        const target = near;
        const next = cur[i] + (target - cur[i]) * 0.2;
        if (Math.abs(next - cur[i]) > 0.001 || Math.abs(target - next) > 0.001) moving = true;
        cur[i] = Math.abs(target - next) < 0.001 ? target : next;
        paint(i, cur[i]);
      });
      raf = moving ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      kick();
    };
    const onLeave = () => {
      pointer = null;
      kick();
    };

    pin();
    const ro = new ResizeObserver(pin);
    ro.observe(h1);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  return (
    <h1 ref={ref} aria-label={text} className={className}>
      {[...text].map((ch, i) =>
        ch === " " ? (
          " "
        ) : (
          <span key={i} data-ch aria-hidden className="inline-block text-center">
            {ch}
          </span>
        ),
      )}
    </h1>
  );
}
