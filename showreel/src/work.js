/* work — the selected-work index. The Line ticks each row; each row glows in its status hue. */
(function (R) {
  "use strict";
  const { Poly, ramp, E, spring } = R.core;
  const { el, put, op, tf, stroke, text, chip } = R.dom;

  const ROWS = [
    { no: "01", name: "Claude × AutoCAD — drafting agent", year: "2026", status: "in draft", h: 60 },
    { no: "02", name: "WatStreet — volatility contagion (GAT)", year: "2026", status: "active", h: 155 },
    { no: "03", name: "WatArrow — SAE aero member portal", year: "2025", status: "shipped", h: 240 },
    { no: "04", name: "StartUp Lab — consulting marketplace", year: "2026", status: "active", h: 155 },
    { no: "05", name: "Patterned AI — pattern tooling", year: "work", status: "ongoing", h: 300 },
  ];

  R.work = function (ctx) {
    const { L, route } = ctx;
    const g = el("g", null, ctx.layers.index);
    const X0 = L.rail.x + 120;
    const defs = el("defs", null, g);
    const f = el("filter", { id: "rowglow", x: "-20%", y: "-150%", width: "140%", height: "400%" }, defs);
    el("feGaussianBlur", { stdDeviation: 55 }, f);
    const label = text(g, "04 — selected work", X0, L.rail.top + 40, 44, {
      mono: true,
      track: 0.22,
      alpha: 0.45,
      style: { textTransform: "uppercase" },
    });

    const rows = ROWS.map((r, i) => {
      const y = L.rail.y0 + i * L.rail.dy,
        base = y + 32;
      const glow = el(
        "ellipse",
        {
          cx: X0 + 1150,
          cy: y,
          rx: 1450,
          ry: 105,
          filter: "url(#rowglow)",
          style: { fill: `oklch(0.74 0.14 ${r.h} / 0.34)` },
        },
        g,
      );
      const row = el("g", null, g);
      text(row, r.no, X0, base, 44, { mono: true, alpha: 0.4 });
      text(row, r.name, X0 + 130, base, 92, { weight: 400 });
      text(row, r.year, X0 + 2560, base, 44, { mono: true, alpha: 0.5 });
      const chipWrap = el("g", null, g);
      chip(chipWrap, r.status, r.h, 0, 0, 40);
      const sep = new Poly([
        [X0, y + 112],
        [X0 + 3200, y + 112],
      ]);
      const sepEl = el("path", { style: stroke("var(--ink)", 1, { strokeOpacity: 0.12 }) }, g);
      return { glow, row, chipWrap, chipAt: [X0 + 2800, base - 3], sep, sepEl };
    });

    let tt = null;
    return {
      update(t) {
        if (!tt) tt = rows.map((_, i) => route.tAt("tick" + i));
        op(label, ramp(t, 10.5, 10.85));
        rows.forEach((r, i) => {
          const tr = tt[i],
            next = i < rows.length - 1 ? tt[i + 1] : 12.3;
          op(r.row, ramp(t, tr - 0.05, tr + 0.1));
          tf(r.row, `translate(${(-(1 - ramp(t, tr - 0.05, tr + 0.55, E.expoOut)) * 70).toFixed(2)},0)`);
          op(r.glow, ramp(t, tr - 0.02, tr + 0.12) * (1 - 0.72 * ramp(t, next, next + 0.35)));
          const k = t < tr + 0.06 ? 0 : 0.7 + 0.3 * spring(t - tr - 0.06);
          op(r.chipWrap, ramp(t, tr + 0.06, tr + 0.14));
          tf(r.chipWrap, `translate(${r.chipAt[0]},${r.chipAt[1]}) scale(${k.toFixed(3)})`);
          put(r.sepEl, "d", r.sep.d(0, r.sep.len * ramp(t, tr, tr + 0.5, E.expoOut)));
        });
      },
    };
  };
})(window.R);
