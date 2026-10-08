"use client";
import { useEffect, useRef } from "react";

// A quiet family of contours at the edge of the page. Pointer motion bends the
// curves; the canvas sleeps once it settles, and stays still for reduced motion.
export function ContourField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      raf = 0;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0;
    let color = "",
      dark = false;
    let scroll = 0,
      targetScroll = 0,
      lastFrame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.75;
      for (let i = 0; i < 15; i++) {
        ctx.globalAlpha = (dark ? 0.13 : 0.1) * (1 - i / 23);
        const edge = width - 100 + i * 24;
        ctx.beginPath();
        ctx.moveTo(edge - 140, -80);
        ctx.bezierCurveTo(
          edge - 240 + x,
          height * 0.3 + y - scroll,
          edge + 190 + x,
          height * 0.48 - y - scroll,
          edge - 15,
          height + 80,
        );
        ctx.stroke();
        // A second, lower contour balances the composition without crossing the copy.
        const left = -240 + i * 22;
        ctx.globalAlpha *= 0.9;
        ctx.beginPath();
        ctx.moveTo(left - 110, height + 70);
        ctx.bezierCurveTo(
          left + 290 - x,
          height - 90 - scroll,
          left + 180 - x,
          height - 330 - scroll,
          left - 130,
          height - 480 - scroll,
        );
        ctx.stroke();
      }
    };
    const frame = (now: number) => {
      raf = 0;
      // Time-based damping keeps the same feel on 60 Hz and high-refresh displays.
      const elapsed = lastFrame ? Math.min(now - lastFrame, 64) : 1000 / 60;
      lastFrame = now;
      const pointerEase = 1 - Math.exp(-elapsed / 210);
      const scrollEase = 1 - Math.exp(-elapsed / 360);
      x += (tx - x) * pointerEase;
      y += (ty - y) * pointerEase;
      scroll += (targetScroll - scroll) * scrollEase;
      draw();
      if (Math.abs(targetScroll - scroll) + Math.abs(tx - x) + Math.abs(ty - y) > 0.1)
        raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && !document.hidden && !motion.matches) {
        lastFrame = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const refresh = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      dark = document.documentElement.classList.contains("dark");
      draw();
    };
    const move = (e: PointerEvent) => {
      if (motion.matches || e.pointerType !== "mouse") return;
      tx = (e.clientX / width - 0.5) * 65;
      ty = (e.clientY / height - 0.5) * 45;
      kick();
    };
    const onScroll = () => {
      if (motion.matches) return;
      // Ease toward the travel limit instead of stopping abruptly on long pages.
      targetScroll = height * 0.3 * (1 - Math.exp(-Math.max(0, window.scrollY) / (height * 3)));
      kick();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else onScroll();
    };
    const reduce = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      x = y = tx = ty = scroll = targetScroll = 0;
      draw();
      if (!motion.matches) onScroll();
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    refresh();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", reduce);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", reduce);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="contour-field" />;
}
