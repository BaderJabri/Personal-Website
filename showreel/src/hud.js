/* hud — screen-space instrument layer: crop marks, timecode, pen coordinates, chapter cards. */
(function (R) {
  "use strict";
  const { Poly, ramp, E, pad } = R.core;
  const { el, put, op, tf, stroke, text, chip } = R.dom;

  const CARDS = [
    { t0: 2.85, t1: 5.4, label: "01 — drawing", title: "Claude × AutoCAD", chip: ["in draft", 60] },
    { t0: 6.25, t1: 8.05, label: "02 — trading", title: "WatStreet · σ-contagion", chip: ["active", 155] },
    { t0: 8.5, t1: 10.1, label: "03 — flying", title: "WatArrow · SAE aero", chip: ["shipped", 240] },
  ];

  R.hudBuild = function (ctx) {
    const g = ctx.hud, H = "var(--hud)";
    const marks = [[36, 36, 1, 1], [1884, 36, -1, 1], [36, 1044, 1, -1], [1884, 1044, -1, -1]].map(([x, y, sx, sy]) => {
      const p = new Poly([[x, y + 30 * sy], [x, y], [x + 30 * sx, y]]);
      return { p, e: el("path", { style: stroke(H, 1.3, { strokeOpacity: 0.7 }) }, g) };
    });
    const T = (s, x, y, size, o) => text(g, s, x, y, size, Object.assign({ mono: true, fill: H }, o));
    const brand = T("BADERJABRI.CA", 72, 78, 15, { track: 0.22, alpha: 0.75 });
    const reel = T("SHOWREEL · 2026", 290, 78, 15, { track: 0.22, alpha: 0.38 });
    const tc = T("", 1848, 78, 15, { anchor: "end", track: 0.08, alpha: 0.75 });
    const foot = T("DRAWN IN ONE LINE · 1920 × 1080 · 60 FPS", 72, 1022, 13, { track: 0.16, alpha: 0.4 });
    const coords = T("", 1848, 1022, 13, { anchor: "end", alpha: 0.55 });
    const fixed = [brand, reel, tc, foot, coords];

    const cardsG = el("g", null, g);
    const cards = CARDS.map((c) => {
      const cg = el("g", null, cardsG);
      const parts = [T("", 0, 0, 14, { track: 0.22, alpha: 0.6 }), text(cg, c.title, 0, 48, 36, { fill: H, weight: 300 })];
      cg.appendChild(parts[0]);
      put(parts[0], "text", c.label.toUpperCase());
      if (c.chip) { const w = el("g", null, cg); chip(w, c.chip[0], c.chip[1], 14, 96, 15); parts.push(w); }
      tf(cg, "translate(72,132)");
      return { c, cg, parts };
    });

    return {
      update(t, cam, pen, imm) {
        g.style.setProperty("--hud", `color-mix(in srgb, var(--ink) ${(100 - imm * 100).toFixed(1)}%, #ece8e1)`);
        // inside the dark viewport, chips switch to their dark-mode formula
        if (imm > 0.5) { cardsG.style.setProperty("--chip-l", ".74"); cardsG.style.setProperty("--chip-c", ".14"); cardsG.style.setProperty("--chip-a", ".094"); cardsG.style.setProperty("--chip-b", ".188"); }
        else ["--chip-l", "--chip-c", "--chip-a", "--chip-b"].forEach((v) => cardsG.style.removeProperty(v));

        const clear = 1 - ramp(t, 12.3, 12.85, E.sineInOut);
        marks.forEach((m, i) => { put(m.e, "d", m.p.d(0, m.p.len * ramp(t, 0.02 + i * 0.05, 0.45 + i * 0.05, E.expoOut))); op(m.e, clear); });
        fixed.forEach((e, i) => op(e, ramp(t, 0.12 + i * 0.06, 0.4 + i * 0.06) * clear));
        const f = Math.min(899, Math.floor(t * 60 + 1e-6));
        put(tc, "text", `TC 00:00:${pad(Math.floor(f / 60))}:${pad(f % 60)}`);
        const sh = ctx.L.sheet[3];
        put(coords, "text", `${(pen[0] / 10).toFixed(4)}, ${((sh - pen[1]) / 10).toFixed(4)}, 0.0000`);

        for (const { c, parts } of cards) {
          parts.forEach((e, k) => {
            const a = c.t0 + k * 0.07, u = ramp(t, a, a + 0.55, E.expoOut), o = ramp(t, c.t1 + k * 0.03, c.t1 + k * 0.03 + 0.22);
            op(e, ramp(t, a, a + 0.16) * (1 - o));
            tf(e, `translate(0,${((1 - u) * 22 - o * 12).toFixed(2)})`);
          });
        }
      },
    };
  };
})(window.R);
