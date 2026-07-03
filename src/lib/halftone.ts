function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function halftoneDots(seed: number, cols: number, rows: number) {
  const rnd = mulberry32(seed);
  const dots: { x: number; y: number; r: number }[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      dots.push({ x: i * 7 + 3.5, y: j * 7 + 3.5, r: 0.7 + rnd() * 0.8 });
  return dots;
}
