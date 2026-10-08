/* score — layout, the route of the one line, its timing, and the camera. The whole reel's timeline. */
(function (R) {
  "use strict";
  const { lerp, ramp, E, zoomPath, clamp, PI } = R.core;

  // World units ≈ px at zoom 1. The sheet is 16:9 so the final pull-back frames it exactly.
  const F = 190, base = 640;
  R.layout = {
    sheet: [0, 0, 8120, 4568],
    F, base, ul: base + 32,
    cols: [480, 2200, 4120, 6040],
    fig: { y: 960, w: 1600, h: 900, s: 1600 / 1920 },
    corridor: 2090,
    rail: { x: 480, top: 2330, y0: 2520, dy: 230, end: 3640 },
    bottom: 4080,
    tb: { x: 4120, y: 2380, w: 3520, h: 1520 },
  };

  R.score = function (ctx, P) {
    const L = ctx.L, r = ctx.route, UL = L.ul;
    const pc = P.thesis.pieces, c = P.fig1.corners;
    const endDrawing = pc[1].x1, endTrading = pc[2].x1, endFlying = pc[3].x1;
    const gut1 = (L.cols[1] + L.fig.w + L.cols[2]) / 2, gut2 = (L.cols[2] + L.fig.w + L.cols[3]) / 2;

    // ---- the route -----------------------------------------------------------------------
    r.start(P.thesis.P0);
    r.leg("ul1").mark("p0").to([endDrawing + 30, UL]).mark("ul1.end");
    r.leg("dive1").curve([endDrawing + 300, UL], [c.tr[0], c.tr[1] - 250], c.tr).mark("box.start");
    r.leg("box").to(c.br).to(c.bl).to(c.tl).to(c.tr).mark("box.end");
    const te = P.fig1.te;
    r.leg("enter").curve([c.tr[0] - 20, c.tr[1] + 170], [te[0] + 120, te[1] - 10], te).mark("te");
    r.leg("airfoil").poly(P.fig1.outlineWorld).mark("af.end");
    const ex = P.fig1.exitWorld;
    r.leg("exit1").to(ex).curve([gut1 + 60, ex[1]], [gut1 - 80, UL], [L.cols[2] - 40, UL]).mark("ul2.start");
    r.leg("ul2").to([endTrading + 30, UL]).mark("ul2.end");
    const hp = UL + 150, st = P.fig2.start;
    r.leg("hairpin").curve([endTrading + 210, UL], [endTrading + 210, hp], [endTrading, hp])
      .to([L.cols[2] + 200, hp]).curve([L.cols[2] + 40, hp], [st[0] - 90, st[1]], st).mark("series.start");
    r.leg("series").poly(P.fig2.seriesWorld).mark("series.end");
    const se = P.fig2.seriesWorld[P.fig2.seriesWorld.length - 1];
    r.leg("takeoff").curve([se[0] + 170, se[1] - 90], [gut2 - 60, UL], [L.cols[3] - 40, UL]).mark("ul3.start");
    r.leg("ul3").to([endFlying + 40, UL]).mark("ul3.end");
    const lr = 170, la = 52, lp = R.geo.loop(endFlying + 40, UL, lr, la, 120);
    const loopC = [endFlying + 40 + la * PI, UL - lr];
    r.leg("loop").poly(lp.slice(0, 61)).mark("loop.apex").poly(lp.slice(61)).mark("loop.end");
    const sw = P.fig3.streamWorld, s0 = sw[0], le = lp[lp.length - 1];
    r.leg("descend").curve([le[0] + 260, le[1]], [s0[0] + 280, s0[1]], s0).mark("stream.start");
    r.leg("stream").poly(sw).mark("stream.end");
    const e3 = sw[sw.length - 1], cy = L.corridor, rx = L.rail.x;
    r.leg("glide")
      .curve([gut2 + 60, e3[1]], [gut2, e3[1] + 50], [gut2, e3[1] + 220])
      .to([gut2, cy - 170]).curve([gut2, cy - 40], [gut2 - 40, cy], [gut2 - 170, cy])
      .to([rx + 280, cy]).curve([rx + 80, cy], [rx, cy + 60], [rx, L.rail.top]).mark("rail.start");
    r.leg("rail");
    for (let i = 0; i < 5; i++) {
      const y = L.rail.y0 + i * L.rail.dy;
      r.to([rx, y]).to([rx + 64, y]).mark("tick" + i).to([rx, y]);
    }
    r.to([rx, L.rail.end]).mark("rail.end");
    const nm = P.sheet.name, by = L.bottom, tbx = L.tb.x;
    r.leg("tail").curve([rx, by - 140], [rx + 100, by], [rx + 300, by]).to([tbx - 330, by])
      .curve([tbx - 130, by], [tbx - 170, nm.ul], [nm.x - 60, nm.ul]).mark("ul4.start");
    r.leg("ul4").to([nm.end + 40, nm.ul]).mark("ul4.end");
    const dot = [nm.dotX, nm.base - nm.dotR];
    r.leg("coda").curve([nm.end + 175, nm.ul], [nm.end + 175, nm.ul - 165], [nm.end + 100, nm.ul - 165])
      .curve([nm.end + 35, nm.ul - 165], [dot[0], dot[1] - 120], dot).mark("end");
    r.finalize();

    // ---- timing: three gestures, smooth speed through every knot -----------------------------
    r.move([["p0", 0.85], ["ul1.end", 1.98], ["box.start", 2.22], ["box.end", 2.74], ["te", 3.02]], { v0: 1.5 });
    r.move([["te", 3.08], ["af.end", 3.85]]);
    r.move([
      ["af.end", 5.35], ["ul2.start", 5.95], ["ul2.end", 6.25], ["series.start", 6.62], ["series.end", 7.9],
      ["ul3.start", 8.25], ["ul3.end", 8.6], ["loop.apex", 8.95], ["loop.end", 9.25], ["stream.start", 9.55],
      ["stream.end", 10.08], ["rail.start", 10.74], ["tick0", 10.98], ["tick1", 11.32], ["tick2", 11.6],
      ["tick3", 11.83], ["tick4", 12.02], ["rail.end", 12.22], ["ul4.start", 13.0], ["ul4.end", 13.55], ["end", 13.98],
    ]);

    // ---- camera -------------------------------------------------------------------------------
    const fit = (x, y, w, h, m = 1) => [x + w / 2, y + h / 2, Math.max(w, (h * 16) / 9) * m];
    const [bx, by0, bw, bh] = P.fig1.box;
    const f2 = fit(L.cols[2], L.fig.y, L.fig.w, L.fig.h, 1.2), f3 = fit(L.cols[3], L.fig.y, L.fig.w, L.fig.h, 1.1);
    const P0 = P.thesis.P0, S = L.sheet;
    const idx = fit(L.rail.x - 140, L.rail.top - 120, 3560, 1500, 1.04);
    const over = fit(S[0], S[1], S[2], S[3], 1.06);
    const pen = (t) => r.lag(t, 0.16);
    const soft = (t, knee, tau) => (t < knee ? t : knee + tau * (1 - Math.exp(-(t - knee) / tau)));
    const segs = [
      { t0: 0, t1: 0.85, a: [P0[0] + 560, UL - 150, 2080], b: [P0[0] + 600, UL - 150, 2000], ease: E.sineInOut },
      // follow the underline, then glide to rest (soft-clamped time) instead of chasing the pen round the box
      { t0: 0.85, t1: 2.05, b: (t) => { const p = pen(soft(t, 1.75, 0.22)); return [p[0] + 420, UL - 140, lerp(2000, 2900, ramp(t, 0.9, 2.1, E.sineInOut))]; }, ease: E.sineInOut },
      { t0: 2.1, t1: 3.0, b: [bx + bw / 2, by0 + bh / 2, bw], ease: E.quintInOut, vw: true },
      { t0: 2.98, t1: 5.35, b: [bx + bw / 2, by0 + bh / 2, bw * 0.975], ease: E.sineInOut },
      { t0: 5.35, t1: 6.25, b: [gut1 + 760, UL + 330, 2500], ease: E.cubicInOut, vw: true },
      { t0: 6.2, t1: 6.8, b: f2, ease: E.sineInOut },
      { t0: 6.8, t1: 7.9, b: (t) => [lerp(f2[0], pen(t)[0], 0.08), f2[1], f2[2] * 0.975], ease: E.sineInOut },
      { t0: 7.9, t1: 8.5, b: (t) => { const p = pen(t); return [p[0] + 200, p[1] + 200, 2250]; }, ease: E.sineInOut },
      { t0: 8.5, t1: 9.25, b: [loopC[0] - 380, loopC[1] + 430, 2350], ease: E.sineInOut },
      { t0: 9.25, t1: 9.8, b: f3, ease: E.cubicInOut },
      { t0: 9.95, t1: 10.95, b: idx, ease: E.quintInOut, vw: true },
      { t0: 10.9, t1: 12.25, b: [idx[0], idx[1] + 60, idx[2] * 0.975], ease: E.sineInOut },
      { t0: 12.25, t1: 13.6, b: over, ease: E.cubicInOut, vw: true },
      { t0: 13.6, t1: 15.2, b: [over[0], over[1], over[2] * 0.975], ease: E.sineInOut },
    ];
    const val = (v, t) => (typeof v === "function" ? v(t) : v);
    // Layered blending: each segment eases from the *live* camera beneath it to its own target,
    // so a moving follow-cam hands its velocity over instead of freezing into a snapshot.
    function upTo(i, t) {
      const sg = segs[i];
      if (i > 0 && t < sg.t0) return upTo(i - 1, t);
      const b = val(sg.b, t), u = sg.ease(clamp((t - sg.t0) / (sg.t1 - sg.t0)));
      if (u >= 1) return b;
      const a = i === 0 ? val(sg.a, t) : upTo(i - 1, t);
      if (sg.vw) return zoomPath(a, b)(u);
      return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), u))];
    }
    const view = (t) => upTo(segs.length - 1, t);
    const rotKeys = [[0, 0], [7.95, 0], [8.5, -3.5], [9.15, -2], [9.8, 0]];
    function rot(t) {
      let i = 0;
      while (i < rotKeys.length - 1 && t > rotKeys[i + 1][0]) i++;
      if (i === rotKeys.length - 1) return rotKeys[i][1];
      const [t0, a] = rotKeys[i], [t1, b] = rotKeys[i + 1];
      return lerp(a, b, E.sineInOut(clamp((t - t0) / (t1 - t0))));
    }
    const flipT0 = r.tAt("loop.apex") - 0.05;
    return {
      camera(t) {
        const [cx, cy_, w] = view(t);
        return { cx, cy: cy_, w, z: 1920 / w, rot: rot(t) };
      },
      flip: { t0: flipT0, t1: flipT0 + 0.62, center: loopC },
    };
  };
})(window.R);
