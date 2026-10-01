import { describe, expect, test } from "bun:test";
import { drawingBounds, leaderDim, linearDim } from "../src/lib/drawing";
import type { GeometryEvent } from "../src/lib/session-script";

describe("linearDim", () => {
  test("a location below both points makes a horizontal dimension", () => {
    const d = linearDim([0, 0], [180, 0], [0, -20]);
    expect(d.orientation).toBe("horizontal");
    expect(d.dimLine).toEqual([[0, -20], [180, -20]]);
    // extension lines leave a gap at the object and overshoot the dimension line
    expect(d.extLines[0][0][1]).toBeLessThan(0);
    expect(d.extLines[0][1][1]).toBeLessThan(-20);
  });

  test("a location beside both points makes a vertical dimension", () => {
    const d = linearDim([50, 10], [50, -8], [-12, 3]);
    expect(d.orientation).toBe("vertical");
    expect(d.dimLine).toEqual([[-12, 10], [-12, -8]]);
  });

  test("arrowheads point outward at both ends of the dimension line", () => {
    const d = linearDim([0, 0], [100, 0], [0, 30]);
    const [left, right] = d.arrows;
    expect(left[0]).toEqual([0, 30]); // tip first
    expect(left[1][0]).toBeGreaterThan(0); // body sits inside the line
    expect(right[0]).toEqual([100, 30]);
    expect(right[1][0]).toBeLessThan(100);
  });

  test("text sits centred just above a horizontal dimension line", () => {
    const d = linearDim([0, 0], [100, 0], [0, 30]);
    expect(d.text.x).toBe(50);
    expect(d.text.y).toBeGreaterThan(30);
    expect(d.text.anchor).toBe("middle");
  });
});

describe("leaderDim", () => {
  test("runs tip, knee, shoulder with an arrow at the tip and text on the shoulder", () => {
    const d = leaderDim([0, 0], [10, 10], [24, 10]);
    expect(d.path).toEqual([[0, 0], [10, 10], [24, 10]]);
    expect(d.arrow[0]).toEqual([0, 0]);
    expect(d.text.anchor).toBe("start");
    expect(d.text.y).toBeGreaterThan(10);
  });
});

describe("drawingBounds", () => {
  test("covers every point and dimension location, with padding", () => {
    const geo = (params: number[][], op: GeometryEvent["op"] = "polyline"): GeometryEvent => ({
      t: 0, kind: "geometry", op, layer: "X", params, drawMs: 0,
    });
    const b = drawingBounds([geo([[0, 0], [180, 10]]), geo([[0, 0], [180, 0], [0, -20]], "dim")], 5);
    expect(b).toEqual({ minX: -5, maxX: 185, minY: -25, maxY: 15 });
  });
});
