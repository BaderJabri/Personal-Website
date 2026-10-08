import { describe, expect, test } from "bun:test";
import { scriptDuration, stateAt } from "../src/lib/demo-state";
import type { SessionEvent } from "../src/lib/session-script";

const events: SessionEvent[] = [
  { t: 0, kind: "prompt", text: "draft a rib now" }, // 15 chars
  { t: 600, kind: "tool_call", tool: "autocad", args: "pline" },
  { t: 650, kind: "command_echo", text: "PLINE" },
  {
    t: 700,
    kind: "geometry",
    op: "polyline",
    layer: "RIB-OUTLINE",
    params: [
      [0, 0],
      [1, 1],
    ],
    drawMs: 1000,
  },
  { t: 1800, kind: "command_echo", text: "RECTANG" },
  { t: 1900, kind: "tool_result", text: "ok" },
  { t: 2500, kind: "done", text: "done" },
];
const opts = { charMs: 20 };

describe("stateAt", () => {
  test("types the prompt one character per charMs and stops at its length", () => {
    expect(stateAt(events, 0, opts).promptChars).toBe(0);
    expect(stateAt(events, 200, opts).promptChars).toBe(10);
    expect(stateAt(events, 5000, opts).promptChars).toBe(15);
  });

  test("an event is shown once its time has come", () => {
    expect(stateAt(events, 599, opts).shown).not.toContain(1);
    expect(stateAt(events, 600, opts).shown).toContain(1);
  });

  test("geometry progress runs 0 to 1 over drawMs", () => {
    expect(stateAt(events, 600, opts).progress[3]).toBe(0);
    expect(stateAt(events, 1200, opts).progress[3]).toBeCloseTo(0.5);
    expect(stateAt(events, 9000, opts).progress[3]).toBe(1);
  });

  test("command line shows the latest echo and the one before it", () => {
    expect(stateAt(events, 100, opts).command).toEqual({ current: null, previous: null });
    expect(stateAt(events, 700, opts).command).toEqual({ current: "PLINE", previous: null });
    expect(stateAt(events, 2000, opts).command).toEqual({ current: "RECTANG", previous: "PLINE" });
  });

  test("done only after the done event", () => {
    expect(stateAt(events, 2499, opts).done).toBe(false);
    expect(stateAt(events, 2500, opts).done).toBe(true);
  });
});

describe("scriptDuration", () => {
  test("is the latest moment anything is still changing", () => {
    expect(scriptDuration(events, opts)).toBe(2500);
    const long: SessionEvent[] = [
      { t: 0, kind: "prompt", text: "x".repeat(200) },
      { t: 100, kind: "done", text: "d" },
    ];
    expect(scriptDuration(long, opts)).toBe(4000);
  });
});
