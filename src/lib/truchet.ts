// Truchet tiles: each cell holds two quarter-circle arcs joining the midpoints of its edges.
// Every edge midpoint is used exactly once, so any arrangement of cells tiles seamlessly,
// which is the property Tile To Pattern depends on.

export type Orientation = 0 | 1;
export type Layout = "grid" | "brick" | "halfdrop";

export interface Tile {
  n: number;
  cells: Orientation[];
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomTile(n: number, rnd: () => number): Tile {
  return { n, cells: Array.from({ length: n * n }, () => (rnd() < 0.5 ? 0 : 1)) };
}

export function rotateCell(tile: Tile, i: number): Tile {
  return { ...tile, cells: tile.cells.map((c, j) => (j === i ? ((1 - c) as Orientation) : c)) };
}

type Pt = [number, number];

/** Arc endpoints in a unit cell. Orientation 0 curls around the top-left and bottom-right corners. */
export function cellArcEnds(o: Orientation): [Pt, Pt][] {
  return o === 0
    ? [
        [
          [0.5, 0],
          [0, 0.5],
        ],
        [
          [1, 0.5],
          [0.5, 1],
        ],
      ]
    : [
        [
          [0.5, 0],
          [1, 0.5],
        ],
        [
          [0, 0.5],
          [0.5, 1],
        ],
      ];
}

/** SVG path for one cell's two arcs, in tile units where a cell is `size` wide at (x, y). */
export function cellPath(o: Orientation, x: number, y: number, size: number): string {
  const r = size / 2;
  return cellArcEnds(o)
    .map(
      ([[ax, ay], [bx, by]]) =>
        `M${x + ax * size},${y + ay * size}A${r},${r} 0 0 ${o === 0 ? 1 : 0} ${x + bx * size},${y + by * size}`,
    )
    .join("");
}

/** Where copies of the tile sit inside one repeat of each layout, in tile units. */
export function layoutTiles(layout: Layout): { w: number; h: number; at: Pt[] } {
  switch (layout) {
    case "grid":
      return { w: 1, h: 1, at: [[0, 0]] };
    case "brick":
      return {
        w: 1,
        h: 2,
        at: [
          [0, 0],
          [-0.5, 1],
          [0.5, 1],
        ],
      };
    case "halfdrop":
      return {
        w: 2,
        h: 1,
        at: [
          [0, 0],
          [1, -0.5],
          [1, 0.5],
        ],
      };
  }
}

export const PALETTES = [
  { name: "Lagoon", bg: "#0f3d3e", arc: "#f2c14e", dot: "#f78154" },
  { name: "Harbour", bg: "#1d2a44", arc: "#e8e3d3", dot: "#e4572e" },
  { name: "Mint", bg: "#dcebe6", arc: "#2f5d62", dot: "#df7861" },
  { name: "Ember", bg: "#2b2118", arc: "#d9a441", dot: "#7fb7be" },
  { name: "Signal", bg: "#f4d35e", arc: "#0d3b66", dot: "#ee964b" },
] as const;
