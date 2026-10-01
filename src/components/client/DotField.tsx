"use client";
import { useEffect, useRef } from "react";

// The site's background: a fine grid of faint dots behind every page.
// - Idle, the grid breathes very slowly (a long, low wave in dot size).
// - Near the pointer, dots swell a little, lean a few pixels away and tint toward the accent.
// - A click or tap sends one soft ripple outward.
// - It drifts at a quarter of the scroll speed for a sense of depth.
// Kept deliberately quiet: low alpha, ~30 fps when nothing is happening, stopped in background
// tabs, and a single static frame for reduced motion.

const GAP = 26;
const BASE_R = 0.9;
const RADIUS = 150;
const PUSH = 6;
const RIPPLE_SPEED = 0.42; // px per ms
const RIPPLE_LIFE = 1700;

function rgb(cssColor: string): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = cssColor;
  document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"];
  probe.remove();
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let ink: [number, number, number] = [0, 0, 0];
    let accent: [number, number, number] = [0, 0, 0];
    let baseAlpha = 0.1;
    const pointer = { x: -1e4, y: -1e4, sx: -1e4, sy: -1e4, presence: 0, active: false };
    const ripples: { x: number; y: number; t0: number }[] = [];
    let raf = 0;
    let lastFrame = 0;
    let lastInput = 0;
    let lastScroll = -1;

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      ink = rgb(s.getPropertyValue("--ink").trim());
      accent = rgb(s.getPropertyValue("--accent").trim());
      baseAlpha = document.documentElement.classList.contains("dark") ? 0.12 : 0.1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = reduced ? 0 : now;
      const oy = reduced ? 0 : -((window.scrollY * 0.25) % GAP);
      const px = pointer.sx;
      const py = pointer.sy;
      const pres = pointer.presence;

      // live ripples
      for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t0 > RIPPLE_LIFE) ripples.splice(i, 1);

      const quiet = new Path2D();
      const loud: { x: number; y: number; r: number; a: number; mix: number }[] = [];

      for (let y = oy + GAP / 2; y < h + GAP; y += GAP) {
        for (let x = GAP / 2; x < w + GAP; x += GAP) {
          const breathe = 0.5 + 0.5 * Math.sin(x * 0.011 + y * 0.007 + t * 0.00045);
          let r = BASE_R * (0.8 + 0.45 * breathe);
          let a = 0;
          let mix = 0;
          let dx = 0;
          let dy = 0;

          if (pres > 0.01) {
            const ddx = x - px;
            const ddy = y - py;
            const d = Math.hypot(ddx, ddy);
            if (d < RADIUS) {
              const f = (1 - d / RADIUS) ** 2 * pres;
              r += 1.5 * f;
              a += 0.3 * f;
              mix = Math.max(mix, f);
              if (d > 0.5) {
                dx += (ddx / d) * PUSH * f;
                dy += (ddy / d) * PUSH * f;
              }
            }
          }
          for (const rp of ripples) {
            const age = now - rp.t0;
            const ring = age * RIPPLE_SPEED;
            const d = Math.hypot(x - rp.x, y - rp.y);
            const band = Math.exp(-((d - ring) ** 2) / (2 * 26 ** 2)) * (1 - age / RIPPLE_LIFE);
            if (band > 0.02) {
              r += 1.3 * band;
              a += 0.25 * band;
              mix = Math.max(mix, band);
            }
          }

          if (a > 0.005) {
            loud.push({ x: x + dx, y: y + dy, r, a: baseAlpha + a, mix });
          } else {
            quiet.moveTo(x + r, y);
            quiet.arc(x, y, r, 0, Math.PI * 2);
          }
        }
      }

      ctx.fillStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},${baseAlpha})`;
      ctx.fill(quiet);
      for (const d of loud) {
        const c = ink.map((v, i) => Math.round(v + (accent[i] - v) * Math.min(1, d.mix * 1.4)));
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(0.55, d.a)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const scrolling = window.scrollY !== lastScroll;
      lastScroll = window.scrollY;
      const busy = scrolling || now - lastInput < 1500 || ripples.length > 0 || pointer.presence > 0.01;
      // ~30 fps when idle; full rate while something is happening
      if (!busy && now - lastFrame < 33) return;
      lastFrame = now;
      // the dots trail the pointer slightly, which reads as softness rather than lag
      pointer.sx += (pointer.x - pointer.sx) * 0.16;
      pointer.sy += (pointer.y - pointer.sy) * 0.16;
      pointer.presence += ((pointer.active ? 1 : 0) - pointer.presence) * 0.08;
      draw(now);
    };

    const start = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!pointer.active) {
        pointer.sx = e.clientX;
        pointer.sy = e.clientY;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      lastInput = performance.now();
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = (e: PointerEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
      if (ripples.length > 4) ripples.shift();
      lastInput = performance.now();
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      resize();
      if (reduced) draw(0);
    };

    readColors();
    resize();
    const themeWatch = new MutationObserver(() => {
      readColors();
      if (reduced) draw(0);
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", onResize);

    if (reduced) {
      draw(0);
      return () => {
        themeWatch.disconnect();
        window.removeEventListener("resize", onResize);
      };
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      themeWatch.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
