"use client";
import { useEffect, useRef } from "react";
import { scriptDuration, stateAt } from "@/lib/demo-state";
import type { SessionEvent } from "@/lib/session-script";

export const DEMO_OPTIONS = { charMs: 18 };

// Plays a session over the server-rendered finished frame. It never renders drawing or
// transcript markup itself: it hides, reveals and draws on the elements tagged `data-ev`.
// Plays once when scrolled into view, pauses while off screen, and offers Replay at the end.
// With reduced motion it leaves the finished frame alone until someone presses Replay.
// The player reports its state on the root as data-state (ready | playing | done); CSS keys
// the Replay button off data-state="done", so no React state is needed.
export function DemoPlayer({ events, children }: { events: SessionEvent[]; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const play = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const byIndex = new Map<number, HTMLElement[]>();
    el.querySelectorAll<HTMLElement>("[data-ev]").forEach((node) => {
      const i = Number(node.dataset.ev);
      byIndex.set(i, [...(byIndex.get(i) ?? []), node]);
    });
    const promptEl = el.querySelector<HTMLElement>("[data-prompt]");
    const cmdCurrent = el.querySelector<HTMLElement>('[data-cmd="current"]');
    const cmdPrevious = el.querySelector<HTMLElement>('[data-cmd="previous"]');
    const promptText = events.find((e) => e.kind === "prompt")?.text ?? "";
    const total = scriptDuration(events, DEMO_OPTIONS);

    const apply = (t: number) => {
      const s = stateAt(events, t, DEMO_OPTIONS);
      const shown = new Set(s.shown);
      byIndex.forEach((nodes, i) => {
        const ev = events[i];
        if (ev.kind === "geometry") {
          const p = s.progress[i] ?? 0;
          for (const g of nodes) {
            g.classList.toggle("is-hidden", p === 0);
            g.querySelectorAll<SVGElement>("[data-draw]").forEach((d) => {
              d.style.strokeDasharray = p < 1 ? "100" : "";
              d.style.strokeDashoffset = p < 1 ? String(100 * (1 - p)) : "";
            });
            // Centerlines fade with progress (animating a dash-dot pattern would march);
            // arrowheads and text arrive at the end of their dimension.
            const fade = ev.op === "centerline" ? p : Math.min(1, Math.max(0, (p - 0.7) / 0.3));
            g.querySelectorAll<SVGElement>("[data-fade]").forEach((f) => {
              f.style.opacity = fade < 1 ? String(fade) : "";
            });
          }
        } else {
          for (const n of nodes) n.classList.toggle("is-hidden", !shown.has(i));
        }
      });
      if (promptEl) promptEl.textContent = promptText.slice(0, s.promptChars);
      if (cmdCurrent) cmdCurrent.textContent = s.command.current ?? "Command:";
      if (cmdPrevious) cmdPrevious.textContent = s.command.previous ?? "";
    };

    let raf = 0;
    let start = 0;
    let elapsed = 0;
    let running = false;
    let visible = false;

    const tick = (now: number) => {
      elapsed = now - start;
      apply(Math.min(elapsed, total));
      if (elapsed < total) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        el.dataset.state = "done";
      }
    };
    const resume = () => {
      start = performance.now() - elapsed;
      raf = requestAnimationFrame(tick);
    };
    play.current = () => {
      cancelAnimationFrame(raf);
      elapsed = 0;
      running = true;
      el.dataset.state = "playing";
      apply(0);
      if (visible) resume();
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.dataset.state = "done";
    } else {
      apply(0);
      el.dataset.state = "ready";
    }

    let started = reduced;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(raf);
          return;
        }
        if (!started) {
          started = true;
          play.current();
        } else if (running) {
          resume();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [events]);

  return (
    <div ref={root} data-demo className="relative">
      {children}
      <button
        type="button"
        onClick={() => play.current()}
        className="demo-replay absolute right-2 top-[5px] z-10 rounded-[2px] border border-white/20 bg-[#15181d] px-2.5 py-0.5 font-mono text-[11.5px] text-[#d6dbe1] hover:border-white/50 hover:text-white"
      >
        Replay
      </button>
    </div>
  );
}
