import { describe, expect, test } from "bun:test";
import { clampValue, niceMax, ticks } from "../src/lib/chart";

describe("niceMax", () => {
  test("rounds the data maximum up to a readable axis top", () => {
    expect(niceMax(584)).toBe(600);
    expect(niceMax(861)).toBe(1000);
    expect(niceMax(42)).toBe(60);
    expect(niceMax(0)).toBe(10);
  });
});

describe("ticks", () => {
  test("splits the axis into even steps including both ends", () => {
    expect(ticks(600, 3)).toEqual([0, 200, 400, 600]);
  });
});

describe("clampValue", () => {
  test("keeps edited values whole and inside 0..999", () => {
    expect(clampValue(-5)).toBe(0);
    expect(clampValue(1200)).toBe(999);
    expect(clampValue(12.6)).toBe(13);
    expect(clampValue(Number.NaN)).toBe(0);
  });
});
