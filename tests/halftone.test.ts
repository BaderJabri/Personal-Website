import { expect, test } from "bun:test";
import { halftoneDots, dateSeed } from "../src/lib/halftone";

test("deterministic for same seed", () => {
  expect(halftoneDots(42, 10, 5)).toEqual(halftoneDots(42, 10, 5));
});

test("differs across seeds", () => {
  expect(halftoneDots(1, 10, 5)).not.toEqual(halftoneDots(2, 10, 5));
});

test("radii bounded for 7px grid", () => {
  for (const d of halftoneDots(7, 20, 10)) {
    expect(d.r).toBeGreaterThanOrEqual(0.4);
    expect(d.r).toBeLessThanOrEqual(1.6);
  }
});

test("date seed = yyyymmdd", () => {
  expect(dateSeed(new Date(2026, 6, 3))).toBe(20260703);
});
