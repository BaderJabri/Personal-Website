/* drawing — FIG. 1: the AutoCAD viewport. The Line becomes a real NACA 2412 station-3 rib. */
(function (R) {
  "use strict";
  const { Poly, ramp, bump, clamp, lerp, E, PI } = R.core;
  const { el, put, op, tf, stroke, text } = R.dom;

  // ACAD layer colours — never restyle (session-script skill).
  const ACAD = { outline: "#f0f0f0", web: "#9aa4ad", cut: "#00ffff", center: "#ff4d4d", dims: "#ffd21f" };

  R.drawing = function (ctx) {
    const { L, route } = ctx;
    const s = L.fig.s,
      ox = L.cols[1],
      oy = L.fig.y;
    const W = (p) => [ox + p[0] * s, oy + p[1] * s];
    const loc = (w) => [(w[0] - ox) / s, (w[1] - oy) / s];

    const root = el("g", { transform: `translate(${ox},${oy}) scale(${s})` }, ctx.layers.figs);
    const cp = el("clipPath", { id: "vpclip" }, root);
    el("rect", { width: 1920, height: 1080 }, cp);
    const fill = el("rect", { width: 1920, height: 1080, style: { fill: "#212830" } }, root);
    const vp = el("g", { "clip-path": "url(#vpclip)" }, root);

    // --- model space chrome -------------------------------------------------------------
    const chrome = el("g", null, vp),
      gridMinor = el("g", null, chrome),
      gridMajor = el("g", null, chrome);
    for (let x = 0; x <= 1920; x += 24)
      el(
        "line",
        {
          x1: x,
          y1: 0,
          x2: x,
          y2: 1080,
          style: stroke(x % 120 ? "rgba(120,140,160,.07)" : "rgba(120,140,160,.14)", 1),
        },
        x % 120 ? gridMinor : gridMajor,
      );
    for (let y = 0; y <= 1080; y += 24)
      el(
        "line",
        {
          x1: 0,
          y1: y,
          x2: 1920,
          y2: y,
          style: stroke(y % 120 ? "rgba(120,140,160,.07)" : "rgba(120,140,160,.14)", 1),
        },
        y % 120 ? gridMinor : gridMajor,
      );
    const mono = (p, s_, x, y, size, fill, extra = {}) =>
      text(p, s_, x, y, size, Object.assign({ mono: true, fill }, extra));
    mono(chrome, "AutoCAD 2026 — SAE-Rib-Station3.dwg", 960, 62, 15, "#5b6674", { anchor: "middle" });
    // ViewCube + UCS
    const cube = el("g", { opacity: 0.6 }, chrome);
    el(
      "rect",
      {
        x: 1744,
        y: 150,
        width: 84,
        height: 84,
        rx: 7,
        style: {
          fill: "rgba(200,210,220,.08)",
          stroke: "#8b97a3",
          strokeWidth: "1.2px",
          vectorEffect: "non-scaling-stroke",
        },
      },
      cube,
    );
    mono(cube, "TOP", 1786, 198, 15, "#cfd6dd", { anchor: "middle" });
    mono(cube, "N", 1786, 136, 13, "#cfd6dd", { anchor: "middle" });
    const ucs = el("g", { opacity: 0.7 }, chrome);
    el("path", { d: "M74,940 L154,940 M74,940 L74,860", style: stroke("#cfd6dd", 1.6) }, ucs);
    el("path", { d: "M154,934 L168,940 L154,946 Z M68,860 L74,846 L80,860 Z", style: { fill: "#cfd6dd" } }, ucs);
    mono(ucs, "X", 146, 926, 14, "#cfd6dd");
    mono(ucs, "Y", 84, 868, 14, "#cfd6dd");

    // --- the rib ------------------------------------------------------------------------
    const C = 180,
      k = 1180 / C,
      X = (mm) => 620 + mm * k,
      Y = (mm) => 530 - mm * k;
    const sec = R.geo.naca4(0.02, 0.4, 0.12, 90);
    const P = ([x, y]) => [X(x * C), Y(y * C)];
    const outline = sec.outline.map(P);
    const webMM = 2,
      margin = 0.8;
    const web = new Poly(R.geo.inboardOffset(sec, webMM / C).map(P));
    const inside = (x) => 2 * sec.yt(x) * C - 2 * webMM - 2 * margin; // clear height inside the web, mm
    const holes = [0.335, 0.43, 0.525, 0.74, 0.8].map((x) => {
      const dia = Math.floor(inside(x) * 2) / 2,
        cx = X(x * C),
        cy = Y(sec.yc(x) * C),
        r = (dia / 2) * k;
      const pts = [];
      for (let i = 0; i <= 72; i++) {
        const a = -PI / 2 + (2 * PI * i) / 72;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return { x, dia, cx, cy, r, poly: new Poly(pts) };
    });
    const slots = [0.25, 0.65].map((x) => {
      const h = (inside(x) + 2 * margin - 1) * k,
        w = 4 * k,
        cx = X(x * C),
        cy = Y(sec.yc(x) * C);
      return new Poly([
        [cx - w / 2, cy - h / 2],
        [cx + w / 2, cy - h / 2],
        [cx + w / 2, cy + h / 2],
        [cx - w / 2, cy + h / 2],
        [cx - w / 2, cy - h / 2],
      ]);
    });
    const rib = el("g", null, vp);
    const outlineD = new Poly(outline).d();
    const flash = el("path", { d: outlineD, style: stroke("#ffffff", 7, { strokeOpacity: 0.35 }) }, rib);
    const white = el("path", { d: outlineD, style: stroke(ACAD.outline, 1.9) }, rib);
    const webEl = el("path", { style: stroke(ACAD.web, 1.2) }, rib);
    const slotEls = slots.map(() => el("path", { style: stroke(ACAD.cut, 1.7) }, rib));
    const holeEls = holes.map(() => el("path", { style: stroke(ACAD.cut, 1.7) }, rib));
    const marks = holes.map((h) => {
      const e = h.r + 9;
      return el(
        "path",
        {
          d: `M${h.cx - e},${h.cy}L${h.cx + e},${h.cy}M${h.cx},${h.cy - e}L${h.cx},${h.cy + e}`,
          style: stroke(ACAD.center, 1.1),
        },
        rib,
      );
    });
    const cl = el(
      "line",
      {
        x1: X(-10),
        y1: Y(0),
        x2: X(190),
        y2: Y(0),
        style: stroke(ACAD.center, 1.1, { strokeDasharray: "22 6 4 6", strokeLinecap: "butt" }),
      },
      rib,
    );

    // DIMS: chord 180.00, max thickness at 30 %, first hole diameter
    const dimY = 748,
      midX = X(90);
    const ext = [
      new Poly([
        [X(0), 552],
        [X(0), 766],
      ]),
      new Poly([
        [X(C), 540],
        [X(C), 766],
      ]),
    ];
    const dimL = [
      new Poly([
        [midX, dimY],
        [X(0), dimY],
      ]),
      new Poly([
        [midX, dimY],
        [X(C), dimY],
      ]),
    ];
    const tx = X(0.3 * C),
      tTop = Y((sec.yc(0.3) + sec.yt(0.3)) * C);
    const tdim = new Poly([
      [tx, tTop - 8],
      [tx, 372],
    ]);
    const h0 = holes[0],
      e0 = [h0.cx + h0.r * 0.7071, h0.cy - h0.r * 0.7071],
      sh = [e0[0] + 74, 404];
    const leader = new Poly([e0, sh, [sh[0] + 44, 404]]);
    const dimEls = [...ext, ...dimL, tdim, leader].map(() => el("path", { style: stroke(ACAD.dims, 1.2) }, rib));
    const arrows = el("g", { style: { fill: ACAD.dims } }, rib);
    el("path", { d: `M${X(0)},${dimY}l20,-6v12z M${X(C)},${dimY}l-20,-6v12z` }, arrows);
    const ang = Math.atan2(sh[1] - e0[1], sh[0] - e0[0]);
    el(
      "path",
      {
        d: `M${e0[0]},${e0[1]}l${20 * Math.cos(ang) - 6 * Math.sin(ang)},${20 * Math.sin(ang) + 6 * Math.cos(ang)}l${12 * Math.sin(ang)},${-12 * Math.cos(ang)}z`,
      },
      arrows,
    );
    const dimText = el("g", null, rib);
    el("rect", { x: midX - 52, y: dimY - 16, width: 104, height: 30, style: { fill: "#212830" } }, dimText);
    mono(dimText, "180.00", midX, dimY + 8, 22, ACAD.dims, { anchor: "middle" });
    const tText = mono(rib, "t = " + (2 * sec.yt(0.3) * C).toFixed(1), tx + 10, 364, 20, ACAD.dims);
    const dText = mono(rib, "⌀" + h0.dia.toFixed(1), sh[0] + 52, 411, 20, ACAD.dims);
    const entities = 1 + 1 + slots.length + holes.length + holes.length + 1 + 3;

    // --- crosshair cursor ---------------------------------------------------------------
    const cursor = el("g", null, vp);
    const chH = el("line", { x1: 0, x2: 1920, style: stroke("rgba(220,230,240,.3)", 1) }, cursor);
    const chV = el("line", { y1: 0, y2: 1080, style: stroke("rgba(220,230,240,.3)", 1) }, cursor);
    const pick = el("rect", { width: 12, height: 12, style: stroke("rgba(220,230,240,.7)", 1) }, cursor);
    const tip = el("g", null, cursor);
    el(
      "rect",
      {
        x: 18,
        y: 14,
        width: 250,
        height: 30,
        style: {
          fill: "rgba(43,49,58,.94)",
          stroke: "#4a5563",
          strokeWidth: "1px",
          vectorEffect: "non-scaling-stroke",
        },
      },
      tip,
    );
    const tipLabel = mono(tip, "", 28, 34, 14, "#cfd6dd");
    const tipVal = mono(tip, "", 258, 34, 14, "#7ec3e8", { anchor: "end" });

    const T = {
      commit: 3.85,
      web: [3.92, 4.2],
      slots: [4.12, 4.36],
      holes: 4.36,
      hdt: 0.075,
      hdur: 0.2,
      cl: [4.72, 4.95],
      ext: [4.8, 4.96],
      dim: [4.9, 5.1],
      note: [5.0, 5.2],
      done: 5.25,
    };
    const holeT = holes.map((_, i) => T.holes + i * T.hdt);
    const cursorKeys = [
      [T.commit, outline[0]],
      [3.95, web.pts[0]],
      [4.13, slots[0].pts[0]],
      [4.24, slots[1].pts[0]],
      ...holes.map((h, i) => [holeT[i] - 0.02, [h.cx, h.cy - h.r]]),
      [4.8, [X(0), 766]],
      [4.95, [X(C), 766]],
      [5.08, [midX, dimY]],
      [5.22, sh],
      [5.45, [X(C) + 70, 470]],
    ];
    function cursorAt(t) {
      if (t < T.commit) return loc(route.at(t));
      let i = 0;
      while (i < cursorKeys.length - 1 && t >= cursorKeys[i + 1][0]) i++;
      if (i === cursorKeys.length - 1) return cursorKeys[i][1];
      const [t0, a] = cursorKeys[i],
        [t1, b] = cursorKeys[i + 1];
      const u = E.expoOut(clamp((t - t0) / Math.min(0.12, t1 - t0)));
      return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    }

    // --- Claude Code pane ---------------------------------------------------------------
    const pane = el("g", null, vp);
    el(
      "rect",
      {
        x: 48,
        y: 250,
        width: 500,
        height: 450,
        rx: 10,
        style: {
          fill: "#101010",
          fillOpacity: 0.95,
          stroke: "#2c2c2c",
          strokeWidth: "1px",
          vectorEffect: "non-scaling-stroke",
        },
      },
      pane,
    );
    [
      ["#ff5f57", 72],
      ["#febc2e", 92],
      ["#28c840", 112],
    ].forEach(([c, x]) => el("circle", { cx: x, cy: 276, r: 6, style: { fill: c } }, pane));
    mono(pane, "claude — ~/claude-autocad", 134, 281, 13, "#8a8a8a");
    el("line", { x1: 48, y1: 298, x2: 548, y2: 298, style: stroke("#262626", 1) }, pane);
    const area = Math.round(sec.area * C * C)
      .toLocaleString("en-US")
      .replace(",", " ");
    const O = "#d97757",
      G = "#8a8a8a",
      Wt = "#e8e6e3";
    const script = [
      { t: 2.78, parts: [["✻ claude-autocad-mcp connected", G]] },
      {
        t: 2.86,
        t1: 3.12,
        parts: [
          ["> ", "#7aa2f7"],
          ["draft station-3 rib — NACA 2412,", "#d8d5d0"],
        ],
      },
      { t: 3.12, t1: 3.26, parts: [["  180 mm chord, spars 25 / 65 %", "#d8d5d0"]] },
      {
        t: 3.3,
        parts: [
          ["✻ ", O],
          [`Thinking… ${outline.length} pts sampled`, G, true],
        ],
        pulse: true,
      },
      {
        t: 3.36,
        parts: [
          ["⏺ ", O],
          ["draw_polyline", Wt],
          ["(RIB-OUTLINE, close)", G],
        ],
      },
      { t: 3.88, parts: [["  ⎿ closed · " + area + " mm²", G]] },
      {
        t: T.web[0],
        parts: [
          ["⏺ ", O],
          ["offset", Wt],
          [`(${webMM.toFixed(1)}, inboard)`, G],
        ],
      },
      {
        t: T.slots[0],
        parts: [
          ["⏺ ", O],
          ["rectang ×2", Wt],
          ["(spars 25 · 65 %)", G],
        ],
      },
      {
        t: T.holes,
        parts: [
          ["⏺ ", O],
          ["circle + arraypath", Wt],
          [`(n 5, ⌀${holes[0].dia}→${holes[4].dia})`, G],
        ],
      },
      {
        t: T.ext[0],
        parts: [
          ["⏺ ", O],
          ["dimlinear · centerline", Wt],
          ["(DIMS)", G],
        ],
      },
      { t: T.done, parts: [[`✓ rib drafted — ${entities} entities · 4 layers`, "#4be38a"]] },
    ].map((ln, i) => {
      const e = text(pane, "", 72, 338 + i * 31, 15, { mono: true });
      ln.spans = ln.parts.map(([, fill, italic]) =>
        el("tspan", { text: "", style: { fill, fontStyle: italic ? "italic" : "normal" } }, e),
      );
      ln.total = ln.parts.reduce((n, p) => n + p[0].length, 0);
      ln.el = e;
      return ln;
    });

    // --- command line -------------------------------------------------------------------
    const cmd = el("g", null, vp);
    el(
      "rect",
      {
        x: 560,
        y: 986,
        width: 820,
        height: 38,
        rx: 4,
        style: {
          fill: "#2e2e2e",
          fillOpacity: 0.96,
          stroke: "#474747",
          strokeWidth: "1px",
          vectorEffect: "non-scaling-stroke",
        },
      },
      cmd,
    );
    const hist = [
      mono(cmd, "", 572, 968, 14, "#b8b8b8", { alpha: 0.7 }),
      mono(cmd, "", 572, 944, 14, "#b8b8b8", { alpha: 0.4 }),
    ];
    const cur = mono(cmd, "", 584, 1011, 15, "#e0e0e0");
    const cmds = [
      [0, "Type a command"],
      [3.05, "PLINE  Specify start point: 180,0"],
      [3.14, "PLINE  Specify next point or [Arc/Halfwidth/Length/Undo]:"],
      [T.web[0], "OFFSET  Specify offset distance or [Through/Erase/Layer] <2.0>:"],
      [T.slots[0], "RECTANG  Specify first corner point or [Chamfer/Fillet/Width]:"],
      [T.holes, "ARRAYPATH  Select path curve:"],
      [T.ext[0], "DIMLINEAR  Specify first extension line origin or <select object>:"],
      [T.done, "Command:"],
    ];

    return {
      box: [ox, oy, L.fig.w, L.fig.h],
      corners: { tl: W([0, 0]), tr: W([1920, 0]), br: W([1920, 1080]), bl: W([0, 1080]) },
      te: W(outline[0]),
      outlineWorld: outline.map(W),
      exitWorld: W([1920, outline[0][1]]),
      update(t, cam) {
        op(fill, ramp(t, 2.62, 2.95, E.sineInOut));
        op(vp, ramp(t, 2.75, 3.0));
        const zs = s * cam.z;
        op(gridMinor, clamp((zs - 0.45) / 0.35));

        // commit: the IKB trace becomes the RIB-OUTLINE polyline
        const c = ramp(t, T.commit, T.commit + 0.12);
        op(white, c);
        op(flash, 0.9 * bump(t, T.commit - 0.02, T.commit + 0.3));
        const afLeg = route.byName.airfoil.el;
        op(afLeg, 1 - c);

        put(webEl, "d", web.d(0, web.len * ramp(t, T.web[0], T.web[1], E.cubicInOut)));
        slots.forEach((p, i) =>
          put(slotEls[i], "d", p.d(0, p.len * ramp(t, T.slots[0] + i * 0.1, T.slots[0] + i * 0.1 + 0.14, E.cubicOut))),
        );
        holes.forEach((h, i) => {
          put(holeEls[i], "d", h.poly.d(0, h.poly.len * ramp(t, holeT[i], holeT[i] + T.hdur, E.cubicInOut)));
          op(marks[i], ramp(t, holeT[i] + T.hdur - 0.04, holeT[i] + T.hdur + 0.1));
        });
        op(cl, ramp(t, T.cl[0], T.cl[1]));
        [...ext, ...dimL, tdim, leader].forEach((p, i) => {
          const w = i < 2 ? T.ext : i < 4 ? T.dim : T.note;
          put(dimEls[i], "d", p.d(0, p.len * ramp(t, w[0], w[1], E.cubicOut)));
        });
        op(arrows, ramp(t, T.dim[1] - 0.03, T.dim[1] + 0.05));
        op(dimText, ramp(t, T.dim[1] - 0.04, T.dim[1] + 0.08));
        op(tText, ramp(t, T.note[1] - 0.05, T.note[1] + 0.06));
        op(dText, ramp(t, T.note[1] - 0.03, T.note[1] + 0.08));

        // crosshair follows the pen while tracing, then hops entity to entity
        const cc = cursorAt(t);
        op(cursor, ramp(t, 2.9, 3.05) * (1 - ramp(t, 5.4, 5.6)));
        put(chH, "y1", cc[1].toFixed(1));
        put(chH, "y2", cc[1].toFixed(1));
        put(chV, "x1", cc[0].toFixed(1));
        put(chV, "x2", cc[0].toFixed(1));
        put(pick, "x", (cc[0] - 6).toFixed(1));
        put(pick, "y", (cc[1] - 6).toFixed(1));
        tf(tip, `translate(${cc[0].toFixed(1)},${cc[1].toFixed(1)})`);
        const tracing = t >= 3.1 && t < T.commit,
          dimming = t >= T.dim[0] && t < T.dim[1] + 0.1;
        op(tip, tracing || dimming ? 1 : 0);
        if (tracing) {
          put(tipLabel, "text", "Specify next point:");
          const af = route.byName.airfoil;
          put(tipVal, "text", (clamp(route.sAt(t) - af.s0, 0, af.poly.len) / s / k).toFixed(1));
        } else if (dimming) {
          put(tipLabel, "text", "Dimension text =");
          put(tipVal, "text", "180.0000");
        }

        // Claude pane
        op(pane, ramp(t, 2.72, 2.9));
        for (const ln of script) {
          const shown = ln.t1 ? Math.round(ln.total * ramp(t, ln.t, ln.t1)) : t >= ln.t ? ln.total : 0;
          let left = shown;
          ln.parts.forEach((p, j) => {
            const n = Math.max(0, Math.min(p[0].length, left));
            left -= n;
            put(ln.spans[j], "text", p[0].slice(0, n));
          });
          op(ln.el, ln.t1 ? 1 : ramp(t, ln.t, ln.t + 0.1));
          tf(ln.el, `translate(${((1 - ramp(t, ln.t, ln.t + 0.25, E.expoOut)) * 10).toFixed(2)},0)`);
          if (ln.pulse) op(ln.spans[0], 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 7)));
        }

        // command line
        let ci = 0;
        while (ci < cmds.length - 1 && t >= cmds[ci + 1][0]) ci++;
        put(cur, "text", cmds[ci][1]);
        put(hist[0], "text", ci > 0 ? cmds[ci - 1][1] : "");
        put(hist[1], "text", ci > 1 ? cmds[ci - 2][1] : "");
        op(cmd, ramp(t, 2.72, 2.9));
      },
    };
  };
})(window.R);
