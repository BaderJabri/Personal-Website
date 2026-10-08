/* sheet — the drawing the whole reel lives on: adaptive grid, border + zones, title block. */
(function (R) {
  "use strict";
  const { Poly, clamp, ramp, E } = R.core;
  const { el, put, op, tf, stroke, text, glyphs } = R.dom;

  // Adaptive grid: minor lines fade out as the camera pulls back, like model space does.
  R.grid = function (parent) {
    const g = el("g", null, parent),
      minor = el("g", null, g),
      major = el("g", null, g);
    const X0 = -2400,
      X1 = 10600,
      Y0 = -1800,
      Y1 = 6400;
    for (let x = X0; x <= X1; x += 40)
      el(
        "line",
        { x1: x, y1: Y0, x2: x, y2: Y1, style: stroke(x % 200 ? "var(--grid)" : "var(--grid2)", 1) },
        x % 200 ? minor : major,
      );
    for (let y = Y0; y <= Y1; y += 40)
      el(
        "line",
        { x1: X0, y1: y, x2: X1, y2: y, style: stroke(y % 200 ? "var(--grid)" : "var(--grid2)", 1) },
        y % 200 ? minor : major,
      );
    return {
      update(t, cam) {
        op(g, ramp(t, 0.05, 0.9, E.sineInOut));
        op(minor, clamp((cam.z - 0.3) / 0.35));
        op(major, 0.55 + 0.45 * clamp((cam.z - 0.18) / 0.3));
      },
    };
  };

  R.sheet = function (ctx) {
    const { L, route } = ctx;
    const g = el("g", null, ctx.layers.sheet);
    const [sx, sy, sw, sh] = L.sheet;
    const rectPoly = (x0, y0, x1, y1) =>
      new Poly([
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
        [x0, y0],
      ]);

    // Border — outer hairline, inner rule, zone ticks and labels between them.
    const outer = rectPoly(sx + 100, sy + 100, sw - 100, sh - 100),
      inner = rectPoly(sx + 190, sy + 190, sw - 190, sh - 190);
    const outerEl = el("path", { style: stroke("var(--ink)", 1, { strokeOpacity: 0.35 }) }, g);
    const innerEl = el("path", { style: stroke("var(--ink)", 1.6, { strokeOpacity: 0.55 }) }, g);
    const zones = el("g", null, g),
      zoneItems = [];
    const zw = (sw - 380) / 8,
      zh = (sh - 380) / 5;
    for (let i = 0; i < 8; i++) {
      const cx = 190 + zw * (i + 0.5);
      for (const y of [150, sh - 132])
        zoneItems.push(text(zones, String(8 - i), cx, y + 14, 44, { mono: true, anchor: "middle", alpha: 0.4 }));
      if (i)
        for (const [y0, y1] of [
          [100, 190],
          [sh - 190, sh - 100],
        ])
          el(
            "line",
            {
              x1: 190 + zw * i,
              y1: y0,
              x2: 190 + zw * i,
              y2: y1,
              style: stroke("var(--ink)", 1, { strokeOpacity: 0.3 }),
            },
            zones,
          );
    }
    for (let j = 0; j < 5; j++) {
      const cy = 190 + zh * (j + 0.5) + 16;
      for (const x of [145, sw - 145])
        zoneItems.push(text(zones, "EDCBA"[j], x, cy, 44, { mono: true, anchor: "middle", alpha: 0.4 }));
      if (j)
        for (const [x0, x1] of [
          [100, 190],
          [sw - 190, sw - 100],
        ])
          el(
            "line",
            {
              x1: x0,
              y1: 190 + zh * j,
              x2: x1,
              y2: 190 + zh * j,
              style: stroke("var(--ink)", 1, { strokeOpacity: 0.3 }),
            },
            zones,
          );
    }

    // Title block — bottom right, where every real drawing keeps its name.
    const tb = L.tb,
      x0 = tb.x,
      y0 = tb.y,
      x1 = tb.x + tb.w,
      y1 = tb.y + tb.h;
    const rA = y0 + 780,
      rB = rA + 360,
      colR = x1 - 760;
    const cellLines = [
      rectPoly(x0, y0, x1, y1),
      new Poly([
        [x0, rA],
        [x1, rA],
      ]),
      new Poly([
        [x0, rB],
        [x1, rB],
      ]),
      new Poly([
        [colR, y0],
        [colR, rA],
      ]),
      new Poly([
        [colR, y0 + 260],
        [x1, y0 + 260],
      ]),
      new Poly([
        [colR, y0 + 520],
        [x1, y0 + 520],
      ]),
      new Poly([
        [x0 + 1120, rA],
        [x0 + 1120, rB],
      ]),
      new Poly([
        [x0 + 2240, rA],
        [x0 + 2240, y1],
      ]),
    ];
    const tbg = el("g", null, g);
    const cellEls = cellLines.map((p, i) =>
      el("path", { style: stroke("var(--ink)", i ? 1 : 1.6, { strokeOpacity: i ? 0.3 : 0.6 }) }, tbg),
    );

    // Halftone behind the name — the site's hero artwork, developing as the name is written.
    const defs = el("defs", null, g);
    const pat = el("pattern", { id: "ht", width: 26, height: 26, patternUnits: "userSpaceOnUse" }, defs);
    el("circle", { cx: 13, cy: 13, r: 4.6, style: { fill: "var(--line)" } }, pat);
    const grad = el("linearGradient", { id: "htg", x1: 0, y1: 0, x2: 1, y2: 0.55 }, defs);
    el("stop", { offset: "0.1", "stop-color": "#fff" }, grad);
    el("stop", { offset: "0.8", "stop-color": "#000" }, grad);
    const mask = el("mask", { id: "htm", maskUnits: "userSpaceOnUse", x: x0, y: y0, width: 2800, height: 800 }, defs);
    const maskRect = el("rect", { x: x0, y: y0 + 40, width: 0, height: 740, fill: "url(#htg)" }, mask);
    el(
      "rect",
      { x: x0 + 20, y: y0 + 60, width: 2600, height: 700, fill: "url(#ht)", mask: "url(#htm)", opacity: 0.32 },
      tbg,
    );

    // Name, fitted to the cell, written glyph by glyph as the Line underlines it.
    const probe = text(tbg, "Bader Aljabri", 0, 0, 100, { weight: 200 });
    const F = Math.min(380, (100 * (colR - x0 - 360)) / probe.getComputedTextLength());
    probe.remove();
    const nameX = x0 + 90,
      base = y0 + 560;
    const name = glyphs(tbg, "Bader Aljabri", nameX, base, F, { weight: 200, style: { letterSpacing: "-0.02em" } });
    const label = (x, y, s) =>
      text(tbg, s, x, y, 40, { mono: true, track: 0.2, alpha: 0.45, style: { textTransform: "uppercase" } });
    const value = (x, y, s, size = 70, opts = {}) => {
      const e = text(tbg, "", x, y, size, opts);
      return { e, s };
    };
    const titleLabel = label(x0 + 90, y0 + 110, "title");
    const cells = [
      [label(colR + 50, y0 + 80, "sheet"), value(colR + 50, y0 + 200, "1 / 1", 64)],
      [label(colR + 50, y0 + 340, "rev"), value(colR + 50, y0 + 460, "2026.09", 64)],
      [label(colR + 50, y0 + 600, "scale"), value(colR + 50, y0 + 720, "1 : 1", 64)],
      [label(x0 + 90, rA + 90, "drawn by"), value(x0 + 90, rA + 250, "the line")],
      [label(x0 + 1210, rA + 90, "project"), value(x0 + 1210, rA + 250, "baderjabri.ca")],
      [
        label(x0 + 2330, rA + 90, "status"),
        value(x0 + 2330, rA + 250, "● available for W27 co-op", 64, { fill: "oklch(var(--chip-l) var(--chip-c) 155)" }),
      ],
      [label(x0 + 90, rB + 90, "contact"), value(x0 + 90, rB + 250, "Baderjabri.15@gmail.com")],
      [label(x0 + 2330, rB + 90, "frames"), value(x0 + 2330, rB + 250, "900 · 1 line · 0 cuts", 64)],
    ];
    const labels = [titleLabel].concat(cells.map((c) => c[0]));
    const ul = base + 0.13 * F;
    const nameEnd = nameX + name.width;

    return {
      name: { x: nameX, base, F, ul, end: nameEnd, dotR: 0.066 * F, dotX: nameEnd + 0.11 * F },
      update(t) {
        const bIn = ramp(t, 12.45, 13.35, E.cubicInOut);
        put(outerEl, "d", outer.d(0, outer.len * bIn));
        put(innerEl, "d", inner.d(0, inner.len * ramp(t, 12.55, 13.45, E.cubicInOut)));
        zoneItems.forEach((z, i) => op(z, ramp(t, 12.9 + i * 0.012, 13.2 + i * 0.012)));
        op(zones, ramp(t, 12.85, 13.1));
        cellLines.forEach((p, i) =>
          put(cellEls[i], "d", p.d(0, p.len * ramp(t, 12.7 + i * 0.05, 13.25 + i * 0.05, E.cubicInOut))),
        );
        labels.forEach((l, i) => op(l, ramp(t, 13.2 + i * 0.04, 13.45 + i * 0.04)));
        cells.forEach(([, v], i) => {
          const n = Math.round(v.s.length * ramp(t, 13.55 + i * 0.07, 13.85 + i * 0.07 + v.s.length * 0.012));
          put(v.e, "text", v.s.slice(0, n));
        });
        const tn = this._tn || (this._tn = name.glyphs.map((gl) => route.tAtX("ul4", gl.x + 0.1 * F)));
        name.glyphs.forEach((gl, i) => {
          const u = ramp(t, tn[i], tn[i] + 0.5, E.expoOut);
          op(gl.el, ramp(t, tn[i] - 0.02, tn[i] + 0.1));
          tf(gl.el, `translate(0,${((1 - u) * 0.22 * F).toFixed(2)})`);
        });
        const pen = route.at(t),
          dev = t >= route.tAt("ul4.start") - 0.05;
        put(maskRect, "width", (dev ? Math.max(0, pen[0] - x0 + 250) : 0).toFixed(1));
      },
    };
  };
})(window.R);
