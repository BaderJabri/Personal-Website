"use client";
import { useEffect, useRef } from "react";

// Counts a metric like "1,500+" or "3 weeks" up from zero the first time it scrolls into view.
// The server renders the final value; values that are not a whole number with an optional
// suffix ("0.5 to 2 s") stay as they are. Anything already on screen at load is left alone.
const PATTERN = /^(\d{1,3}(?:,\d{3})*|\d+)(\+?(?:\s\S+)?)$/;

export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const m = value.match(PATTERN);
    if (!el || !m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = Number(m[1].replace(/,/g, ""));
    const suffix = m[2];
    const commas = m[1].includes(",");
    const show = (n: number) => {
      el.textContent = `${commas ? n.toLocaleString("en-US") : n}${suffix}`;
    };
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    show(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1100);
          show(Math.round(target * (1 - (1 - p) ** 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      show(target);
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
