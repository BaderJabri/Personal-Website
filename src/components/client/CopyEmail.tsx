"use client";
import { useRef, useState } from "react";
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  return (
    <button
      className="chip ml-3 align-middle cursor-pointer"
      style={{ "--h": 240 } as React.CSSProperties}
      data-island="copy-email"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
