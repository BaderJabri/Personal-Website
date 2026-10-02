"use client";
import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

// Bader's local time (Eastern), ticking. The box keeps a fixed width so nothing shifts when the
// time first appears after hydration.
export function LocalTime() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()).replace(/\./g, "").toLowerCase());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <time suppressHydrationWarning className="num inline-block min-w-[10.5ch]">
      {now ?? " "}
    </time>
  );
}
