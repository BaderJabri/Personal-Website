import { describe, expect, test } from "bun:test";
import { halfThickness, naca4Outline, parseNaca4, surfaceAt } from "../src/lib/naca";

const n2412 = parseNaca4("2412");

describe("parseNaca4", () => {
  test("reads camber, camber position and thickness", () => {
    expect(n2412).toEqual({ m: 0.02, p: 0.4, t: 0.12 });
  });
  test("rejects anything that is not four digits", () => {
    expect(() => parseNaca4("24x2")).toThrow(/NACA/);
    expect(() => parseNaca4("241")).toThrow(/NACA/);
  });
});

describe("naca4Outline", () => {
  const pts = naca4Outline(n2412, 60);

  test("is closed: starts and ends at the trailing edge", () => {
    const a = pts[0];
    const b = pts.at(-1)!;
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(1e-6);
    expect(a.x).toBeCloseTo(1, 6);
  });

  test("runs trailing edge, upper surface, leading edge, lower surface", () => {
    const le = pts.reduce((best, p) => (p.x < best.x ? p : best), pts[0]);
    const iLe = pts.indexOf(le);
    expect(iLe).toBeGreaterThan(10);
    expect(iLe).toBeLessThan(pts.length - 10);
    expect(pts[Math.floor(iLe / 2)].y).toBeGreaterThan(0);
    expect(pts[iLe + Math.floor((pts.length - iLe) / 2)].y).toBeLessThan(0.02);
  });

  test("maximum thickness is about 12% of chord", () => {
    let max = 0;
    for (let i = 1; i < 200; i++) {
      const { upper, lower } = surfaceAt(n2412, i / 200);
      max = Math.max(max, upper.y - lower.y);
    }
    expect(max).toBeGreaterThan(0.115);
    expect(max).toBeLessThan(0.125);
  });

  test("leading edge is blunt and trailing edge is sharp", () => {
    expect(2 * halfThickness(n2412, 0.01)).toBeGreaterThan(0.03);
    expect(2 * halfThickness(n2412, 0.99)).toBeLessThan(0.01);
    expect(halfThickness(n2412, 1)).toBeCloseTo(0, 6);
  });

  test("camber lifts the upper surface more than it drops the lower", () => {
    const ys = pts.map((p) => p.y);
    expect(Math.max(...ys)).toBeGreaterThan(Math.abs(Math.min(...ys)));
  });
});
