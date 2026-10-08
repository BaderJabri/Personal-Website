/* geometry — real shapes: NACA 4-digit rib, Joukowski potential flow, GARCH volatility. */
(function (R) {
  "use strict";
  const { PI, sin, cos, sqrt, atan, atan2, hypot, log } = Math;
  const { gauss } = R.core;

  // NACA 4-digit section, closed trailing edge, chord = 1, y up.
  function naca4(m, p, t, n = 90) {
    const yt = (x) => 5 * t * (0.2969 * sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    const yc = (x) =>
      x < p ? (m / (p * p)) * (2 * p * x - x * x) : (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x * x);
    const dyc = (x) => (x < p ? ((2 * m) / (p * p)) * (p - x) : ((2 * m) / (1 - p) ** 2) * (p - x));
    const upper = [],
      lower = [];
    for (let i = 0; i <= n; i++) {
      const x = (1 - cos((i / n) * PI)) / 2,
        th = atan(dyc(x)),
        y = yt(x),
        c = yc(x);
      upper.push([x - y * sin(th), c + y * cos(th)]);
      lower.push([x + y * sin(th), c - y * cos(th)]);
    }
    // PLINE order: trailing edge → upper → leading edge → lower → trailing edge
    const outline = upper.slice().reverse().concat(lower.slice(1));
    let area = 0;
    for (let i = 0; i < outline.length - 1; i++)
      area += outline[i][0] * outline[i + 1][1] - outline[i + 1][0] * outline[i][1];
    return { yt, yc, outline, area: Math.abs(area) / 2 };
  }

  // Inboard offset of the closed outline by d (chord units), trimmed where the section gets too thin.
  function inboardOffset(sec, d) {
    const o = sec.outline,
      n = o.length,
      pts = [];
    for (let i = 0; i < n; i++) {
      const a = o[(i - 1 + n) % n],
        b = o[(i + 1) % n];
      const tx = b[0] - a[0],
        ty = b[1] - a[1],
        L = hypot(tx, ty) || 1;
      // outline runs counter-clockwise, so the interior is on the left
      pts.push({ x0: o[i][0], p: [o[i][0] - (ty / L) * d, o[i][1] + (tx / L) * d] });
    }
    let xcut = 1;
    for (let x = 0.3; x < 1; x += 0.002)
      if (2 * sec.yt(x) < 2.3 * d) {
        xcut = x;
        break;
      }
    const kept = pts.filter((q, i) => i > 0 && i < n - 1 && q.x0 < xcut).map((q) => q.p);
    kept.push(kept[0]);
    return kept;
  }

  // Joukowski section in potential flow with the Kutta condition. Returns streamlines with
  // physical time along them, so particles speed up over the suction side the way real air does.
  function joukowski({
    mux = -0.085,
    muy = 0.075,
    alphaDeg = 5,
    seeds = 12,
    span = [-2.3, 2.5],
    lineOffset = 0.14,
  } = {}) {
    const a = (alphaDeg * PI) / 180,
      U = 1;
    const R0 = hypot(1 - mux, -muy),
      thTE = atan2(-muy, 1 - mux);
    const G = -4 * PI * U * R0 * sin(thTE - a);
    const ca = cos(a),
      sa = sin(a);
    // conjugate velocity W = dF/dζ  (u - iv)
    function W(x, y) {
      const X = x - mux,
        Y = y - muy,
        r2 = X * X + Y * Y;
      // R²e^{ia}/(ζ-μ)²
      const q2x = (X * X - Y * Y) / (r2 * r2),
        q2y = (-2 * X * Y) / (r2 * r2);
      const tx = R0 * R0 * (ca * q2x - sa * q2y),
        ty = R0 * R0 * (ca * q2y + sa * q2x);
      // iΓ/(2π(ζ-μ))
      const cx = (G / (2 * PI)) * (Y / r2),
        cy = (G / (2 * PI)) * (X / r2);
      return [U * (ca - tx) + cx, U * (-sa - ty) + cy];
    }
    function psi(x, y) {
      const X = x - mux,
        Y = y - muy,
        r2 = X * X + Y * Y;
      // Im{ U[(ζ-μ)e^{-ia} + R²e^{ia}/(ζ-μ)] } + Γ/(2π) ln|ζ-μ|
      const t1 = Y * ca - X * sa,
        t2 = (R0 * R0 * (sa * X - ca * Y)) / r2;
      return U * (t1 + t2) + (G / (2 * PI)) * 0.5 * log(r2);
    }
    const toZ = (x, y) => {
      const r2 = x * x + y * y;
      return [x + x / r2, y - y / r2];
    };
    const rot = (p) => [p[0] * ca + p[1] * sa, -p[0] * sa + p[1] * ca]; // by -α: freestream horizontal
    const seed = (h) => [-7 * ca - h * sa, -7 * sa + h * ca];
    const psiBody = psi(mux + R0, muy);

    function trace(h) {
      let [x, y] = seed(h);
      const pts = [],
        times = [];
      let T = 0,
        prevZ = rot(toZ(x, y));
      pts.push(prevZ);
      times.push(0);
      const vel = (px, py) => {
        const w = W(px, py),
          u = w[0],
          v = -w[1],
          L = hypot(u, v) || 1e-9;
        return [u / L, v / L, L];
      };
      for (let k = 0; k < 6000; k++) {
        const ds = 0.012;
        const k1 = vel(x, y),
          k2 = vel(x + (ds / 2) * k1[0], y + (ds / 2) * k1[1]);
        const k3 = vel(x + (ds / 2) * k2[0], y + (ds / 2) * k2[1]),
          k4 = vel(x + ds * k3[0], y + ds * k3[1]);
        x += (ds / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
        y += (ds / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
        if (k1[2] < 1e-4 || hypot(x - mux, y - muy) < R0 * 1.001) break;
        const z = rot(toZ(x, y));
        // physical speed in the z-plane: |W| / |dz/dζ|
        const r2 = x * x + y * y,
          jx = 1 - (x * x - y * y) / (r2 * r2),
          jy = (2 * x * y) / (r2 * r2);
        const speed = k1[2] / (hypot(jx, jy) || 1e-9);
        T += hypot(z[0] - prevZ[0], z[1] - prevZ[1]) / Math.max(speed, 0.05);
        pts.push(z);
        times.push(T);
        prevZ = z;
        if (x * ca + y * sa > 7) break;
      }
      return { pts, times };
    }
    function hForPsi(target) {
      let lo = -4,
        hi = 4;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2,
          s = seed(mid);
        if (psi(s[0], s[1]) < target) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    const lines = [];
    for (let i = 0; i < seeds; i++) {
      let h = span[0] + ((span[1] - span[0]) * i) / (seeds - 1);
      const s = seed(h);
      if (Math.abs(psi(s[0], s[1]) - psiBody) < 0.07) h += 0.09;
      lines.push(trace(h));
    }
    const line = trace(hForPsi(psiBody + lineOffset)); // the Line joins the flow just above the section
    const body = [];
    for (let i = 0; i <= 200; i++) {
      const th = thTE + (2 * PI * i) / 200;
      body.push(rot(toZ(mux + R0 * cos(th), muy + R0 * sin(th))));
    }
    let chord = 0;
    for (const p of body) chord = Math.max(chord, hypot(p[0] - body[0][0], p[1] - body[0][1]));
    return { lines, line, body, alphaDeg, gamma: G, cl: (2 * G) / (U * chord) };
  }

  // GARCH(1,1) log-returns with injected shocks; returns cumulative log price and σ.
  function garch(
    rng,
    n,
    { omega = 2e-6, a = 0.12, b = 0.85, s0 = 0.01, shocks = {}, drift = 0, rallyFrom = n, rallyMu = 0 } = {},
  ) {
    let s2 = s0 * s0,
      e = 0,
      lp = 0;
    const p = [],
      sig = [];
    for (let i = 0; i < n; i++) {
      s2 = omega + a * e * e + b * s2;
      const s = sqrt(s2),
        z = shocks[i] != null ? shocks[i] : gauss(rng);
      e = s * z;
      lp += e + drift + (i >= rallyFrom ? rallyMu * ((i - rallyFrom) / (n - rallyFrom)) ** 1.6 : 0);
      p.push(lp);
      sig.push(s);
    }
    return { p, sig };
  }

  // Prolate trochoid: a single upward loop that advances by 2πa.
  function loop(x0, y0, r, a, n = 120) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const th = (2 * PI * i) / n;
      out.push([x0 + a * th + r * sin(th), y0 - r * (1 - cos(th))]);
    }
    return out;
  }

  R.geo = { naca4, inboardOffset, joukowski, garch, loop };
})(window.R);
