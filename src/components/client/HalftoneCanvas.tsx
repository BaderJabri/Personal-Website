"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { halftoneDots, dateSeed } from "@/lib/halftone";

interface HalftoneCanvasProps {
  className?: string;
}

export function HalftoneCanvas({ className }: HalftoneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const box = canvas.getBoundingClientRect();
      // Skip if canvas has no size yet
      if (box.width === 0 || box.height === 0) return;

      const dpr = window.devicePixelRatio || 1;

      // Size canvas to element box × DPR
      canvas.width = box.width * dpr;
      canvas.height = box.height * dpr;
      ctx.scale(dpr, dpr);

      // Compute cols/rows from box at 7px pitch
      const cols = Math.ceil(box.width / 7);
      const rows = Math.ceil(box.height / 7);

      // Get line color from CSS variable
      const lineColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--line")
        .trim();

      // Draw halftone dots
      const dots = halftoneDots(dateSeed(new Date()), cols, rows);
      ctx.fillStyle = lineColor;
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();

    // Redraw on canvas size changes
    const observer = new ResizeObserver(() => {
      draw();
    });

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      data-island="halftone"
      className={className}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
