"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// One observer for every [data-reveal] element on the page: when it scrolls into view it gets
// data-shown and CSS plays its entrance once. Without JS (or with reduced motion) nothing is hidden.
// Re-scans after each client-side navigation, and marks <html data-hydrated> so the early
// "js" flag in the layout knows scripts are running.
export function Reveals() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.shown = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px 40px 0px", threshold: 0 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
