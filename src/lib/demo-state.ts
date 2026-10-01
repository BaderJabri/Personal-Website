import type { SessionEvent } from "./session-script";

// Pure player core: what the demo looks like `t` ms into the script. The client component
// only applies this to the DOM, so every timing rule lives (and is tested) here.

export interface DemoOptions {
  /** ms per typed prompt character */
  charMs: number;
}

export interface DemoState {
  promptChars: number;
  /** indices of events whose time has come (all kinds) */
  shown: number[];
  /** geometry event index → draw progress 0..1 */
  progress: Record<number, number>;
  command: { current: string | null; previous: string | null };
  done: boolean;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function stateAt(events: SessionEvent[], t: number, { charMs }: DemoOptions): DemoState {
  const state: DemoState = {
    promptChars: 0,
    shown: [],
    progress: {},
    command: { current: null, previous: null },
    done: false,
  };

  events.forEach((ev, i) => {
    const reached = t >= ev.t;
    if (reached) state.shown.push(i);
    switch (ev.kind) {
      case "prompt":
        state.promptChars = Math.min(ev.text.length, Math.max(0, Math.floor((t - ev.t) / charMs)));
        break;
      case "geometry":
        state.progress[i] = ev.drawMs === 0 ? (reached ? 1 : 0) : clamp01((t - ev.t) / ev.drawMs);
        break;
      case "command_echo":
        if (reached) state.command = { current: ev.text, previous: state.command.current };
        break;
      case "done":
        if (reached) state.done = true;
        break;
    }
  });

  return state;
}

/** The last moment anything in the script is still changing. */
export function scriptDuration(events: SessionEvent[], { charMs }: DemoOptions): number {
  return events.reduce((end, ev) => {
    if (ev.kind === "prompt") return Math.max(end, ev.t + ev.text.length * charMs);
    if (ev.kind === "geometry") return Math.max(end, ev.t + ev.drawMs);
    return Math.max(end, ev.t);
  }, 0);
}
