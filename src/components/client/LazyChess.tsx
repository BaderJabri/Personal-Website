"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The chess engine and puzzles stay out of the home page's first-load JavaScript: the
// interactive board is fetched as the section approaches the viewport. Until then the
// server-rendered `fallback` (the same layout, as a picture) holds its place.
const ChessPuzzles = dynamic(() => import("./ChessPuzzles").then((m) => m.ChessPuzzles), { ssr: false });

export function LazyChess({ fallback }: { fallback: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="chess-frame">
      {near ? <ChessPuzzles /> : fallback}
    </div>
  );
}
