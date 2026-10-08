// NACA 4-digit airfoils, unit chord. Standard equations with the closed-trailing-edge
// thickness coefficient (-0.1036) so the outline meets itself at x = 1.

export interface Pt {
  x: number;
  y: number;
}

export interface NacaParams {
  /** max camber, fraction of chord */
  m: number;
  /** position of max camber, fraction of chord */
  p: number;
  /** max thickness, fraction of chord */
  t: number;
}

export function parseNaca4(code: string): NacaParams {
  if (!/^\d{4}$/.test(code)) throw new Error(`Not a NACA 4-digit code: "${code}"`);
  return {
    m: Number(code[0]) / 100,
    p: Number(code[1]) / 10,
    t: Number(code.slice(2)) / 100,
  };
}

export function halfThickness({ t }: NacaParams, x: number): number {
  return 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1036 * x ** 4);
}

export function camberAt({ m, p }: NacaParams, x: number): { yc: number; slope: number } {
  if (m === 0 || p === 0) return { yc: 0, slope: 0 };
  if (x < p) {
    return { yc: (m / p ** 2) * (2 * p * x - x ** 2), slope: ((2 * m) / p ** 2) * (p - x) };
  }
  return {
    yc: (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x ** 2),
    slope: ((2 * m) / (1 - p) ** 2) * (p - x),
  };
}

/** Upper and lower surface points at chord station x (thickness applied normal to the camber line). */
export function surfaceAt(params: NacaParams, x: number): { upper: Pt; lower: Pt } {
  const yt = halfThickness(params, x);
  const { yc, slope } = camberAt(params, x);
  const th = Math.atan(slope);
  return {
    upper: { x: x - yt * Math.sin(th), y: yc + yt * Math.cos(th) },
    lower: { x: x + yt * Math.sin(th), y: yc - yt * Math.cos(th) },
  };
}

/**
 * Closed outline: trailing edge → upper surface → leading edge → lower surface → trailing edge.
 * `perSide` stations per surface, cosine-spaced so the leading edge gets the most points.
 */
export function naca4Outline(params: NacaParams, perSide: number): Pt[] {
  const xs = Array.from({ length: perSide + 1 }, (_, i) => 0.5 * (1 - Math.cos((Math.PI * i) / perSide)));
  const upper = xs.map((x) => surfaceAt(params, x).upper).reverse(); // TE → LE
  const lower = xs.slice(1).map((x) => surfaceAt(params, x).lower); // LE (skipped) → TE
  return [...upper, ...lower];
}
