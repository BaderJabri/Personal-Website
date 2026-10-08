/* trading — FIG. 2: the Line becomes a GARCH price path; a shock propagates across assets. */
(function (R) {
  "use strict";
  const { Poly, ramp, clamp, E, mulberry32 } = R.core;
  const { el, put, op, tf, stroke, text } = R.dom;

  R.trading = function (ctx) {
    const { L, route } = ctx;
    const s = L.fig.s,
      ox = L.cols[2],
      oy = L.fig.y;
    const W = (p) => [ox + p[0] * s, oy + p[1] * s];
    const root = el("g", { transform: `translate(${ox},${oy}) scale(${s})` }, ctx.layers.figs);

    const N = 200,
      SHOCK = 118,
      x0 = 150,
      x1 = 1760,
      dx = (x1 - x0) / (N - 1);
    const rng = mulberry32(20260928);
    const main = R.geo.garch(rng, N, {
      omega: 3e-6,
      a: 0.11,
      b: 0.86,
      s0: 0.009,
      shocks: { [SHOCK]: -6.5, [SHOCK + 1]: -2.2 },
      drift: 0.0005,
      rallyFrom: 168,
      rallyMu: 0.03,
    });
    const lo = Math.min(...main.p),
      hi = Math.max(...main.p);
    const yOf = (lp) => 560 - ((lp - lo) / (hi - lo)) * 300;
    const pts = main.p.map((lp, i) => [x0 + i * dx, yOf(lp)]);
    const k = 300 / (hi - lo);
    const bandUp = main.p.map((lp, i) => [x0 + i * dx, yOf(lp) - 2.5 * main.sig[i] * k]);
    const bandDn = main.p.map((lp, i) => [x0 + i * dx, yOf(lp) + 2.5 * main.sig[i] * k]);
    const price = (lp) => (100 * Math.exp(lp)).toFixed(2);

    const assets = [
      { name: "SPY", lag: 4, z: -6.2, w: 0.41 },
      { name: "EFA", lag: 8, z: -5.4, w: 0.27 },
      { name: "HYG", lag: 13, z: -4.8, w: 0.19 },
      { name: "GLD", lag: 19, z: 4.4, w: 0.13 },
    ].map((a, j) => {
      const r = R.geo.garch(mulberry32(97 + j * 13), N, {
        omega: 3e-6,
        a: 0.1,
        b: 0.86,
        s0: 0.008,
        shocks: { [SHOCK + a.lag]: a.z },
      });
      const l = Math.min(...r.p),
        h = Math.max(...r.p),
        cy = 706 + j * 90;
      a.pts = r.p.map((lp, i) => [x0 + i * dx, cy + 32 - ((lp - l) / (h - l)) * 64]);
      a.poly = new Poly(a.pts);
      a.cy = cy;
      return a;
    });

    const ink = (a) => stroke("var(--ink)", 1, { strokeOpacity: a });
    // frame: corner marks + figure label
    const frame = el("g", null, root);
    for (const [cx, cy, sx, sy] of [
      [16, 16, 1, 1],
      [1904, 16, -1, 1],
      [16, 1064, 1, -1],
      [1904, 1064, -1, -1],
    ])
      el(
        "path",
        {
          d: `M${cx},${cy + 44 * sy}L${cx},${cy}L${cx + 44 * sx},${cy}`,
          style: stroke("var(--ink)", 1.2, { strokeOpacity: 0.4 }),
        },
        frame,
      );
    text(frame, "FIG. 2 — σ-CONTAGION · GRAPH ATTENTION", 1864, 110, 17, {
      mono: true,
      track: 0.16,
      alpha: 0.55,
      anchor: "end",
    });
    text(frame, "XLF · ±2.5σ", x0, 226, 16, { mono: true, alpha: 0.5 });

    // axes
    const axis = new Poly([
      [x0, 610],
      [x1 + 30, 610],
    ]);
    const axisEl = el("path", { style: ink(0.3) }, root);
    const ticks = el("g", null, root);
    for (let i = 0; i <= 7; i++)
      el("line", { x1: x0 + i * 230, y1: 610, x2: x0 + i * 230, y2: 622, style: ink(0.3) }, ticks);
    for (let i = 0; i <= 3; i++) {
      const lp = lo + ((hi - lo) * i) / 3,
        y = yOf(lp);
      el("line", { x1: x1 + 22, y1: y, x2: x1 + 34, y2: y, style: ink(0.3) }, ticks);
      text(ticks, price(lp), x1 + 44, y + 5, 14, { mono: true, alpha: 0.5 });
    }

    // ±2.5σ band, revealed behind the pen
    const cp = el("clipPath", { id: "bandclip" }, root);
    const cpr = el("rect", { x: 0, y: 0, width: 0, height: 1080 }, cp);
    const bandD = new Poly(bandUp.concat(bandDn.slice().reverse())).d() + "Z";
    el(
      "path",
      { d: bandD, "clip-path": "url(#bandclip)", style: { fill: "var(--line)", fillOpacity: 0.09, stroke: "none" } },
      root,
    );

    // correlated assets
    const assetEls = assets.map((a) => {
      text(root, a.name, 64, a.cy + 6, 15, { mono: true, alpha: 0.45 });
      el(
        "line",
        {
          x1: x0,
          y1: a.cy,
          x2: x1,
          y2: a.cy,
          style: stroke("var(--ink)", 1, { strokeOpacity: 0.08, strokeDasharray: "2 8" }),
        },
        root,
      );
      return el("path", { style: ink(0.42) }, root);
    });

    // shock → contagion graph
    const mNode = pts[SHOCK];
    const g = el("g", null, root);
    const edges = assets.map((a) => {
      const n = a.pts[SHOCK + a.lag],
        c = [mNode[0] + 150, (mNode[1] + n[1]) / 2];
      const q = [];
      for (let i = 0; i <= 30; i++) {
        const u = i / 30,
          v = 1 - u;
        q.push([
          v * v * mNode[0] + 2 * v * u * c[0] + u * u * n[0],
          v * v * mNode[1] + 2 * v * u * c[1] + u * u * n[1],
        ]);
      }
      const poly = new Poly(q),
        mid = poly.at(poly.len * 0.55);
      const hue = "oklch(0.64 0.15 155)";
      return {
        a,
        n,
        poly,
        path: el("path", { style: stroke(hue, 1.6, { strokeOpacity: 0.3 + a.w * 1.6 }) }, g),
        label: text(g, "α " + a.w.toFixed(2).slice(1), mid[0] + 14, mid[1] + 5, 14, { mono: true, fill: hue }),
        node: el(
          "circle",
          {
            cx: n[0],
            cy: n[1],
            r: 6,
            style: {
              fill: "var(--paper)",
              stroke: "var(--ink)",
              strokeWidth: "1.4px",
              vectorEffect: "non-scaling-stroke",
            },
          },
          g,
        ),
        ring: el("circle", { cx: n[0], cy: n[1], r: 1, style: stroke("var(--ink)", 1.2) }, g),
      };
    });
    const mRing = el("circle", { cx: mNode[0], cy: mNode[1], r: 1, style: stroke("var(--line)", 1.6) }, g);
    const mNodeEl = el(
      "circle",
      {
        cx: mNode[0],
        cy: mNode[1],
        r: 8,
        style: { fill: "var(--paper)", stroke: "var(--line)", strokeWidth: "2px", vectorEffect: "non-scaling-stroke" },
      },
      g,
    );

    // live value tag riding the pen
    const tag = el("g", null, root);
    el(
      "rect",
      {
        x: 16,
        y: -44,
        width: 96,
        height: 30,
        rx: 15,
        style: {
          fill: "var(--paper)",
          stroke: "var(--ink)",
          strokeOpacity: 0.25,
          strokeWidth: "1px",
          vectorEffect: "non-scaling-stroke",
        },
      },
      tag,
    );
    const tagText = text(tag, "", 64, -23, 15, { mono: true, anchor: "middle" });

    const worldPts = pts.map(W);
    let tn = null;
    return {
      seriesWorld: worldPts,
      start: worldPts[0],
      update(t) {
        if (!tn) tn = { m: route.tAtX("series", W(mNode)[0]), e: edges.map((e) => route.tAtX("series", W(e.n)[0])) };
        const leg = route.byName.series,
          sLocal = clamp(route.sAt(t) - leg.s0, 0, leg.poly.len);
        const pen = leg.poly.at(sLocal),
          px = (pen[0] - ox) / s;
        const drawing = route.sAt(t) > leg.s0;

        op(frame, ramp(t, 6.1, 6.45));
        put(axisEl, "d", axis.d(0, axis.len * ramp(t, 6.15, 6.75, E.expoOut)));
        op(ticks, ramp(t, 6.35, 6.7));
        put(cpr, "width", (drawing ? px : 0).toFixed(1));
        assets.forEach((a, j) => put(assetEls[j], "d", drawing ? a.poly.d(0, a.poly.sAtX(Math.min(px, x1))) : ""));

        const ur = ramp(t, tn.m, tn.m + 0.7, E.expoOut);
        put(mRing, "r", (8 + ur * 110).toFixed(1));
        op(mRing, (1 - ur) * (t >= tn.m ? 1 : 0));
        op(mNodeEl, ramp(t, tn.m - 0.02, tn.m + 0.06));
        edges.forEach((e, j) => {
          const te = tn.e[j],
            u = ramp(t, te, te + 0.6, E.expoOut);
          put(e.path, "d", e.poly.d(0, e.poly.len * ramp(t, te - 0.05, te + 0.2, E.cubicOut)));
          op(e.node, ramp(t, te, te + 0.06));
          put(e.ring, "r", (6 + u * 70).toFixed(1));
          op(e.ring, (1 - u) * (t >= te ? 0.8 : 0));
          op(e.label, ramp(t, te + 0.12, te + 0.3));
        });

        const onSeries = drawing && sLocal < leg.poly.len - 0.5;
        op(tag, onSeries ? ramp(t, 6.62, 6.75) : 0);
        if (onSeries) {
          const i = clamp(Math.round((px - x0) / dx), 0, N - 1);
          put(tagText, "text", price(main.p[i]));
          tf(tag, `translate(${px.toFixed(1)},${((pen[1] - oy) / s).toFixed(1)})`);
        }
      },
    };
  };
})(window.R);
