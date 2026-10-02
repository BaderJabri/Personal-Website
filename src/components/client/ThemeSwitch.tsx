"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// Light/dark switch. The thumb's position and icon follow the `.dark` class on <html> in CSS, so
// it is right on first paint. On click the new theme spreads from the switch in a circle (View
// Transitions API); without that API, or with reduced motion, it simply swaps.
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    const apply = () => {
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof document.startViewTransition !== "function") {
      apply();
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      data-island="theme"
      onClick={toggle}
      className="theme-switch"
    >
      <span className="theme-switch-thumb" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16">
          <mask id="theme-switch-moon">
            <rect width="24" height="24" fill="white" />
            <circle className="theme-switch-bite" cx="24" cy="9" r="6.5" fill="black" />
          </mask>
          <circle className="theme-switch-core" cx="12" cy="12" r="5" fill="currentColor" mask="url(#theme-switch-moon)" />
          <g className="theme-switch-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 1.5v2.2M12 20.3v2.2M1.5 12h2.2M20.3 12h2.2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" />
          </g>
        </svg>
      </span>
    </button>
  );
}
