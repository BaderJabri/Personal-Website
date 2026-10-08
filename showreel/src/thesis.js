/* thesis — "Software for drawing, trading, and flying." set across the sheet, written by the pen. */
(function (R) {
  "use strict";
  const { ramp, E } = R.core;
  const { el, op, tf, put, stroke, glyphs, text } = R.dom;

  R.thesis = function (ctx) {
    const { L, route } = ctx;
    const g = el("g", null, ctx.layers.text);
    // piece → column, which underline leg writes it, which glyphs take the chip hue
    const pieces = [
      { str: "Software for", col: 0, leg: "ul1" },
      { str: "drawing,", col: 1, leg: "ul1", hue: 60, verb: [0, 7] },
      { str: "trading,", col: 2, leg: "ul2", hue: 155, verb: [0, 7] },
      { str: "and flying.", col: 3, leg: "ul3", hue: 240, verb: [4, 10] },
    ];
    for (const p of pieces) {
      p.x0 = L.cols[p.col];
      const r = glyphs(g, p.str, p.x0, L.base, L.F, { weight: 250, style: { letterSpacing: "-0.015em" } });
      p.glyphs = r.glyphs; p.x1 = p.x0 + r.width;
      for (const gl of p.glyphs) {
        if (p.verb && gl.i >= p.verb[0] && gl.i < p.verb[1]) {
          gl.el.style.setProperty("--h", p.hue);
          gl.el.style.fill = "oklch(var(--chip-l) var(--chip-c) var(--h))";
        }
      }
    }

    // The origin: the point is born here with a ping and a coordinate readout.
    const P0 = [L.cols[0] - 70, L.ul];
    const ping = el("circle", { cx: P0[0], cy: P0[1], r: 1, style: stroke("var(--line)", 1.5) }, g);
    const origin = text(g, "0.0000, 0.0000", P0[0] + 34, P0[1] + 64, 30, { mono: true, alpha: 0.5 });

    let tg = null;
    return {
      pieces, P0,
      update(t) {
        if (!tg) tg = pieces.map((p) => p.glyphs.map((gl) => route.tAtX(p.leg, gl.x + 0.12 * L.F)));
        pieces.forEach((p, k) => p.glyphs.forEach((gl, i) => {
          const t0 = tg[k][i], u = ramp(t, t0, t0 + 0.55, E.expoOut);
          op(gl.el, ramp(t, t0 - 0.03, t0 + 0.09));
          tf(gl.el, `translate(0,${((1 - u) * 0.24 * L.F).toFixed(2)})`);
        }));
        const u = ramp(t, 0.18, 0.95, E.expoOut);
        put(ping, "r", (8 + u * 150).toFixed(1));
        op(ping, (1 - u) * ramp(t, 0.17, 0.2));
        op(origin, ramp(t, 0.3, 0.5) * (1 - ramp(t, 1.0, 1.25)));
      },
    };
  };
})(window.R);
