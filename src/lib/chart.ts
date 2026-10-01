// Axis math for the Plotit toy.

/** Smallest "nice" step (1, 2, 2.5 or 5 × 10ⁿ) that covers `max` in `steps` ticks. */
export function niceStep(max: number, steps = 3): number {
  const raw = Math.max(max, 1) / steps;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw)!;
}

/** Axis top: the data maximum rounded up to a whole number of nice steps. */
export function niceMax(max: number, steps = 3): number {
  if (max <= 0) return 10;
  const step = niceStep(max, steps);
  return Math.ceil(max / step) * step;
}

export function ticks(top: number, steps: number): number[] {
  return Array.from({ length: steps + 1 }, (_, i) => Math.round((top / steps) * i));
}

export function clampValue(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(999, Math.max(0, Math.round(v)));
}
