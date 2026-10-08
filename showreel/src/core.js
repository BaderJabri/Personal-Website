/* core — math, easing, polylines, timing splines, camera interpolation. Pure, no DOM. */
(function (R) {
  "use strict";
  const { PI, sin, cos, sqrt, exp, log, pow, min, max, abs, hypot, cosh, sinh, tanh } = Math;

  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, u) => a + (b - a) * u;
  const inv = (a, b, x) => clamp((x - a) / (b - a));
  const mix2 = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];

  // One easing vocabulary for the whole reel.
  const E = {
    linear: (u) => u,
    sineInOut: (u) => -(cos(PI * u) - 1) / 2,
    sineOut: (u) => sin((u * PI) / 2),
    quadOut: (u) => 1 - (1 - u) * (1 - u),
    cubicIn: (u) => u * u * u,
    cubicOut: (u) => 1 - pow(1 - u, 3),
    cubicInOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - pow(-2 * u + 2, 3) / 2),
    quintInOut: (u) => (u < 0.5 ? 16 * u ** 5 : 1 - pow(-2 * u + 2, 5) / 2),
    expoOut: (u) => (u >= 1 ? 1 : 1 - pow(2, -10 * u)),
    expoInOut: (u) =>
      u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? pow(2, 20 * u - 10) / 2 : (2 - pow(2, -20 * u + 10)) / 2,
  };

  // The one spring — under-damped for a single visible overshoot. Used only for the dot.
  function spring(t, freq = 2.3, zeta = 0.42) {
    if (t <= 0) return 0;
    const w = 2 * PI * freq, wd = w * sqrt(1 - zeta * zeta);
    return 1 - exp(-zeta * w * t) * (cos(wd * t) + ((zeta * w) / wd) * sin(wd * t));
  }

  const ramp = (t, a, b, ease = E.linear) => ease(inv(a, b, t));
  // 0 → 1 → 0 bump over [a, b] (sine lobe)
  const bump = (t, a, b) => (t <= a || t >= b ? 0 : sin(PI * inv(a, b, t)));

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rng) {
    const u = max(rng(), 1e-9), v = rng();
    return sqrt(-2 * log(u)) * cos(2 * PI * v);
  }

  const f2 = (n) => (Math.round(n * 100) / 100).toString();

  // Arc-length parametrised polyline. Everything that "draws on" is one of these.
  class Poly {
    constructor(pts) {
      this.pts = pts;
      const n = pts.length, cum = new Float64Array(n);
      for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      this.cum = cum;
      this.len = n ? cum[n - 1] : 0;
    }
    idx(s) {
      const c = this.cum;
      let lo = 0, hi = c.length - 1;
      if (s >= c[hi]) return hi;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (c[mid] <= s) lo = mid; else hi = mid; }
      return lo;
    }
    at(s) {
      const p = this.pts, c = this.cum;
      s = clamp(s, 0, this.len);
      const i = this.idx(s);
      if (i >= p.length - 1) return p[p.length - 1].slice();
      const seg = c[i + 1] - c[i];
      return mix2(p[i], p[i + 1], seg > 0 ? (s - c[i]) / seg : 0);
    }
    tangent(s) {
      const a = this.at(s - 2), b = this.at(s + 2);
      const d = hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
    }
    d(s0 = 0, s1 = this.len) {
      s0 = clamp(s0, 0, this.len); s1 = clamp(s1, 0, this.len);
      if (s1 - s0 < 1e-6) return "";
      const p = this.pts, i0 = this.idx(s0), i1 = this.idx(s1);
      const a = this.at(s0), b = this.at(s1);
      let out = "M" + f2(a[0]) + "," + f2(a[1]);
      for (let i = i0 + 1; i <= i1; i++) out += "L" + f2(p[i][0]) + "," + f2(p[i][1]);
      return out + "L" + f2(b[0]) + "," + f2(b[1]);
    }
    // First arc length where x crosses X (for monotone-in-x runs such as underlines).
    sAtX(X) {
      const p = this.pts;
      for (let i = 1; i < p.length; i++) {
        const x0 = p[i - 1][0], x1 = p[i][0];
        if ((x0 - X) * (x1 - X) <= 0 && x0 !== x1) return this.cum[i - 1] + ((X - x0) / (x1 - x0)) * (this.cum[i] - this.cum[i - 1]);
      }
      return X < p[0][0] ? 0 : this.len;
    }
  }

  function cubic(p0, c1, c2, p1, n = 48) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      out.push([
        v * v * v * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p1[0],
        v * v * v * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p1[1],
      ]);
    }
    return out;
  }

  // Monotone cubic Hermite (Fritsch–Carlson) through knots [[t, s], ...].
  // Speed is continuous across knots, s never runs backwards. v0/v1 = end speeds.
  function monotone(knots, v0 = 0, v1 = 0) {
    const n = knots.length, T = knots.map((k) => k[0]), S = knots.map((k) => k[1]);
    const d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d.push((S[i + 1] - S[i]) / (T[i + 1] - T[i]));
    m[0] = v0; m[n - 1] = v1;
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { const k = 3 / sqrt(h); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return function (t) {
      if (t <= T[0]) return S[0];
      if (t >= T[n - 1]) return S[n - 1];
      let i = 0;
      while (t > T[i + 1]) i++;
      const h = T[i + 1] - T[i], u = (t - T[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * S[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * S[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  }

  // van Wijk & Nuij smooth zoom-pan. Views are [cx, cy, w] with w = visible world width.
  function zoomPath(p0, p1, rho = 1.25) {
    const [ux0, uy0, w0] = p0, [ux1, uy1, w1] = p1;
    const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, r2 = rho * rho, r4 = r2 * r2;
    if (d2 < 1e-9) {
      const S = log(w1 / w0) / rho;
      return (u) => [ux0 + u * dx, uy0 + u * dy, w0 * exp(rho * u * S)];
    }
    const d1 = sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + r4 * d2) / (2 * w0 * r2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - r4 * d2) / (2 * w1 * r2 * d1);
    const r0 = log(sqrt(b0 * b0 + 1) - b0), r1 = log(sqrt(b1 * b1 + 1) - b1);
    const S = (r1 - r0) / rho;
    return (u) => {
      const s = u * S, c0 = cosh(r0);
      const k = (w0 / (r2 * d1)) * (c0 * tanh(rho * s + r0) - sinh(r0));
      return [ux0 + k * dx, uy0 + k * dy, (w0 * c0) / cosh(rho * s + r0)];
    };
  }

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mixHex(a, b, u) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return "rgb(" + A.map((x, i) => Math.round(lerp(x, B[i], u))).join(",") + ")";
  }

  const pad = (n, w = 2) => String(n).padStart(w, "0");

  R.core = { clamp, lerp, inv, mix2, E, spring, ramp, bump, mulberry32, gauss, f2, Poly, cubic, monotone, zoomPath, mixHex, pad, PI, min, max, abs, hypot };
})((window.R = window.R || {}));
