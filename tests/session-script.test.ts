import { describe, expect, test } from "bun:test";
import { sessionScriptSchema } from "../src/lib/session-script";

const ok = [
  { t: 0, kind: "prompt", text: "draft the rib" },
  { t: 800, kind: "thinking", text: "sampling" },
  { t: 1200, kind: "tool_call", tool: "autocad", args: "draw_polyline(48 pts)" },
  { t: 1250, kind: "command_echo", text: "PLINE Specify start point: 0,0" },
  { t: 1300, kind: "geometry", op: "polyline", layer: "RIB-OUTLINE", params: [[0, 0], [10, 2]], drawMs: 2000 },
  { t: 3400, kind: "tool_result", text: "closed polyline" },
  { t: 4000, kind: "done", text: "rib drafted" },
];

describe("sessionScriptSchema", () => {
  test("accepts a valid script", () => {
    expect(sessionScriptSchema.parse(ok)).toHaveLength(7);
  });

  test("rejects an unknown geometry op", () => {
    expect(() => sessionScriptSchema.parse([{ ...ok[4], op: "spline" }, ok[6]])).toThrow();
  });

  test("rejects decreasing timestamps", () => {
    expect(() => sessionScriptSchema.parse([ok[1], { ...ok[0], t: 5000 }, ok[6]])).toThrow(/non-decreasing/);
  });

  test("requires exactly one done event, at the end", () => {
    expect(() => sessionScriptSchema.parse(ok.slice(0, 3))).toThrow(/done/);
    expect(() => sessionScriptSchema.parse([ok[0], ok[6], { ...ok[6], t: 5000 }])).toThrow(/done/);
  });

  test("geometry label and dimStyle are optional", () => {
    const dim = {
      t: 3500,
      kind: "geometry",
      op: "dim",
      layer: "DIMS",
      params: [[0, 0], [180, 0], [0, -20]],
      drawMs: 800,
      label: "180.00",
      dimStyle: "linear",
    };
    const parsed = sessionScriptSchema.parse([...ok.slice(0, 6), dim, { ...ok[6], t: 4600 }]);
    expect(parsed).toHaveLength(8);
  });

  test("rejects an unknown dimStyle", () => {
    const dim = { t: 3500, kind: "geometry", op: "dim", layer: "DIMS", params: [[0, 0]], drawMs: 1, dimStyle: "radial" };
    expect(() => sessionScriptSchema.parse([dim, { ...ok[6], t: 4600 }])).toThrow();
  });
});
