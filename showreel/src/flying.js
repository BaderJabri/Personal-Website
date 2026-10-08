/* flying — FIG. 3: section A–A in potential flow. The Line joins the air as a streamline. */
(function (R) {
  "use strict";
  const { Poly, ramp, E } = R.core;
  const { el, put, op, stroke, text } = R.dom;

  R.flying = function (ctx) {
    const { L } = ctx;
    const s = L.fig.s, ox = L.cols[3], oy = L.fig.y;
    const W = (p) => [ox + p[0] * s, oy + p[1] * s];
    const root = el("g", { transform: `translate(${ox},${oy}) scale(${s})` }, ctx.layers.figs);

    const J = R.geo.joukowski({ alphaDeg: 5, seeds: 13, span: [-2.5, 2.7], lineOffset: 0.16 });
    const K = 205, CX = 990, CY = 560;
    const M = ([x, y]) => [CX - K * x, CY - K * y]; // mirror: air flows right → left, leading edge faces it

    const frame = el("g", null, root);
    for (const [cx, cy, sx, sy] of [[16, 16, 1, 1], [1904, 16, -1, 1], [16, 1064, 1, -1], [1904, 1064, -1, -1]])
      el("path", { d: `M${cx},${cy + 44 * sy}L${cx},${cy}L${cx + 44 * sx},${cy}`, style: stroke("var(--ink)", 1.2, { strokeOpacity: 0.4 }) }, frame);
    text(frame, `FIG. 3 — SECTION A–A · α ${J.alphaDeg.toFixed(1)}° · Γ ${J.gamma.toFixed(2)} · C_L ${J.cl.toFixed(2)}`, 1864, 110, 17, { mono: true, track: 0.16, alpha: 0.55, anchor: "end" });
    text(frame, "potential flow · kutta condition", 1864, 146, 15, { mono: true, alpha: 0.4, anchor: "end" });

    const cp = el("clipPath", { id: "flowclip" }, root);
    el("rect", { x: 0, y: 0, width: 1920, height: 1080 }, cp);
    const flow = el("g", { "clip-path": "url(#flowclip)" }, root);
    const lines = J.lines.map((ln) => {
      const pts = ln.pts.map(M);
      el("path", { d: new Poly(pts).d(), style: stroke("var(--ink)", 1, { strokeOpacity: 0.13 }) }, flow);
      return { pts, T: ln.times, comet: el("path", { style: stroke("var(--ink)", 1.8, { strokeOpacity: 0.6 }) }, flow) };
    });

    // section, hatched like a cut face
    const body = J.body.map(M), bodyD = new Poly(body).d() + "Z";
    const bc = el("clipPath", { id: "bodyclip" }, root);
    el("path", { d: bodyD }, bc);
    el("path", { d: bodyD, style: { fill: "var(--paper)", stroke: "none" } }, root);
    const hatch = el("g", { "clip-path": "url(#bodyclip)" }, root);
    for (let x = CX - 700; x < CX + 700; x += 16) el("line", { x1: x, y1: CY - 200, x2: x + 400, y2: CY + 200, style: stroke("var(--ink)", 1, { strokeOpacity: 0.28 }) }, hatch);
    el("path", { d: bodyD, style: stroke("var(--ink)", 1.8, { strokeOpacity: 0.8 }) }, root);

    function atTime(ln, tau) {
      const T = ln.T;
      if (tau <= 0) return ln.pts[0];
      if (tau >= T[T.length - 1]) return ln.pts[ln.pts.length - 1];
      let lo = 0, hi = T.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= tau) lo = m; else hi = m; }
      const u = (tau - T[lo]) / (T[hi] - T[lo] || 1), a = ln.pts[lo], b = ln.pts[hi];
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    }
    function cometD(ln, head, tail) {
      const Tmax = ln.T[ln.T.length - 1];
      if (head < 0 || head - tail > Tmax) return "";
      let d = "", n = 0;
      for (let k = 0; k <= 14; k++) {
        const tau = head - tail + (tail * k) / 14;
        if (tau < 0 || tau > Tmax) continue;
        const p = atTime(ln, tau);
        d += (n++ ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1);
      }
      return n > 1 ? d : "";
    }

    // the Line's own streamline, trimmed to the figure
    const lp = J.line.pts.map(M);
    let a = lp.findIndex((p) => p[0] < 1920), b = lp.length - 1;
    while (b > a && lp[b][0] < 0) b--;
    const streamWorld = lp.slice(Math.max(0, a - 1), b + 2).map(W);

    const V = 5.2, TAIL = 0.75, GAP = 2.4;
    return {
      streamWorld,
      update(t) {
        op(frame, ramp(t, 8.25, 8.7));
        op(flow, ramp(t, 8.1, 8.8, E.sineInOut));
        lines.forEach((ln, j) => {
          const base = (t - 6.5) * V + j * 0.83;
          let d = "";
          for (let k = 0; k < 9; k++) d += cometD(ln, (base % GAP) + k * GAP - GAP, TAIL);
          put(ln.comet, "d", d);
        });
      },
    };
  };
})(window.R);
