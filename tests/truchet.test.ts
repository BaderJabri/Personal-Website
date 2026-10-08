import { describe, expect, test } from "bun:test";
import { cellArcEnds, layoutTiles, mulberry32, randomTile, rotateCell } from "../src/lib/truchet";

describe("truchet tiles", () => {
  test("a seeded tile is deterministic", () => {
    expect(randomTile(4, mulberry32(7))).toEqual(randomTile(4, mulberry32(7)));
    expect(randomTile(4, mulberry32(7)).cells).toHaveLength(16);
  });

  test("rotating a cell flips only that cell", () => {
    const t = randomTile(4, mulberry32(1));
    const r = rotateCell(t, 5);
    expect(r.cells[5]).toBe(t.cells[5] === 0 ? 1 : 0);
    expect(r.cells.filter((c, i) => c !== t.cells[i])).toHaveLength(1);
  });

  test("every arc ends on the midpoint of a cell edge", () => {
    for (const o of [0, 1] as const) {
      for (const [a, b] of cellArcEnds(o)) {
        for (const [x, y] of [a, b]) {
          const onVertical = (x === 0 || x === 1) && y === 0.5;
          const onHorizontal = (y === 0 || y === 1) && x === 0.5;
          expect(onVertical || onHorizontal).toBe(true);
        }
      }
    }
  });

  test("each cell edge midpoint is used exactly once, so any arrangement tiles seamlessly", () => {
    for (const o of [0, 1] as const) {
      const ends = cellArcEnds(o)
        .flat()
        .map(([x, y]) => `${x},${y}`);
      expect(new Set(ends)).toEqual(new Set(["0.5,0", "1,0.5", "0.5,1", "0,0.5"]));
    }
  });
});

describe("layoutTiles", () => {
  test("grid repeats one tile", () => {
    expect(layoutTiles("grid")).toEqual({ w: 1, h: 1, at: [[0, 0]] });
  });
  test("brick offsets every other row by half a tile", () => {
    const l = layoutTiles("brick");
    expect(l.h).toBe(2);
    expect(l.at).toContainEqual([0.5, 1]);
  });
  test("half drop offsets every other column by half a tile", () => {
    const l = layoutTiles("halfdrop");
    expect(l.w).toBe(2);
    expect(l.at).toContainEqual([1, 0.5]);
  });
});
