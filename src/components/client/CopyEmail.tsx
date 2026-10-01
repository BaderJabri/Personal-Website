"use client";
import { useEffect, useRef, useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <button
      type="button"
      data-island="copy-email"
      className="btn btn-quiet h-9 px-3 text-[13px]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setState("copied");
        } catch {
          setState("failed");
        }
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("idle"), 1800);
      }}
    >
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed, select the address" : "Copy"}</span>
    </button>
  );
}
