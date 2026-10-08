/* main — builds the reel, exposes a pure render(t), and drives preview playback or capture. */
(async function (R) {
  "use strict";
  const { ramp, E, spring, lerp, hypot, clamp } = R.core;
  const { el, put, op, tf, stroke } = R.dom;
  const DURATION = 15;

  const capture = new URLSearchParams(location.search).has("capture");
  if (capture) document.body.classList.add("capture");
  await Promise.all(
    [
      "200 100px Inter",
      "250 100px Inter",
      "300 100px Inter",
      "400 100px Inter",
      "400 20px 'JetBrains Mono'",
      "500 20px 'JetBrains Mono'",
    ].map((f) => document.fonts.load(f)),
  );
  await document.fonts.ready;

  const $ = (id) => document.getElementById(id);
  const world = $("world"),
    layerA = $("layerA"),
    layerB = $("layerB"),
    stage = $("stage");
  const layers = {};
  for (const k of ["grid", "sheet", "figs", "text", "index", "line", "dot"]) layers[k] = el("g", null, world);

  const ctx = { L: R.layout, route: new R.Route(), layers, hud: $("hud") };
  const grid = R.grid(layers.grid);
  const thesis = R.thesis(ctx);
  const fig1 = R.drawing(ctx);
  const fig2 = R.trading(ctx);
  const fig3 = R.flying(ctx);
  const work = R.work(ctx);
  const sheet = R.sheet(ctx);
  const score = R.score(ctx, { thesis, fig1, fig2, fig3, sheet });
  const route = ctx.route.mount(layers.line);
  const hud = R.hudBuild(ctx);

  // The pen: the Line's tip. Squash on wind-up, stretch with speed, lands as the period.
  const dotG = el("g", null, layers.dot);
  const land = el("circle", { r: 1, style: stroke("var(--line)", 1.5) }, layers.dot);
  const dot = el("circle", { r: 1, style: { fill: "var(--line)", filter: "var(--line-filter)" } }, dotG);
  const tEnd = route.tAt("end"),
    nm = sheet.name;

  const toScreen = (p, c) => {
    const a = (c.rot * Math.PI) / 180,
      x = (p[0] - c.cx) * c.z,
      y = (p[1] - c.cy) * c.z;
    return [960 + x * Math.cos(a) - y * Math.sin(a), 540 + x * Math.sin(a) + y * Math.cos(a)];
  };

  function render(t) {
    t = clamp(t, 0, DURATION);
    const cam = score.camera(t);
    const T = `translate(960,540) rotate(${cam.rot.toFixed(3)}) scale(${cam.z.toFixed(5)}) translate(${(-cam.cx).toFixed(2)},${(-cam.cy).toFixed(2)})`;
    put($("camA"), "transform", T);
    put($("camB"), "transform", T);
    stage.style.setProperty("--gz", (1 / cam.z).toFixed(4));

    // light → dark: a circular wipe out of the loop's centre
    const fl = score.flip;
    if (t < fl.t0 || t >= fl.t1) {
      put(layerA, "class", t < fl.t0 ? "theme-light" : "theme-dark");
      layerB.style.display = "none";
    } else {
      put(layerA, "class", "theme-light");
      layerB.style.display = "";
      const c = toScreen(fl.center, cam),
        u = E.cubicInOut(ramp(t, fl.t0, fl.t1));
      const far = Math.max(
        hypot(c[0], c[1]),
        hypot(1920 - c[0], c[1]),
        hypot(c[0], 1080 - c[1]),
        hypot(1920 - c[0], 1080 - c[1]),
      );
      const circ = $("flipCircle");
      put(circ, "cx", c[0].toFixed(1));
      put(circ, "cy", c[1].toFixed(1));
      put(circ, "r", (u * far + 1).toFixed(1));
    }

    grid.update(t, cam);
    thesis.update(t);
    fig1.update(t, cam);
    fig2.update(t);
    fig3.update(t);
    work.update(t);
    sheet.update(t);
    route.render(t);

    // pen tip
    const p = route.at(t),
      q = route.at(Math.max(0, t - 1 / 120));
    const speed = hypot(p[0] - q[0], p[1] - q[1]) * 120 * cam.z;
    const ang = (Math.atan2(p[1] - q[1], p[0] - q[0]) * 180) / Math.PI;
    const born = spring(t - 0.15);
    const wu = t < 0.85 ? E.sineInOut(ramp(t, 0.48, 0.82)) : 0;
    const st = 1 + Math.min(0.9, speed / 2600);
    let r = (7 * born) / cam.z,
      sx = st * (1 + 0.38 * wu),
      sy = (1 - 0.3 * wu) / Math.sqrt(st);
    let px = p[0] - (16 * wu) / cam.z,
      py = p[1];
    if (t >= tEnd) {
      const k = spring(t - tEnd, 2.1, 0.38);
      r = lerp(7 / cam.z, nm.dotR, k);
      sx = sy = 1;
    }
    put(dot, "r", Math.max(0, r).toFixed(3));
    tf(
      dotG,
      `translate(${px.toFixed(2)},${py.toFixed(2)}) rotate(${(speed > 40 ? ang : 0).toFixed(1)}) scale(${sx.toFixed(3)},${sy.toFixed(3)})`,
    );
    const lu = ramp(t, tEnd, tEnd + 0.9, E.expoOut);
    put(land, "cx", p[0].toFixed(1));
    put(land, "cy", p[1].toFixed(1));
    put(land, "r", (nm.dotR + lu * 420).toFixed(1));
    op(land, t >= tEnd ? (1 - lu) * 0.9 : 0);

    const fillOn = ramp(t, 2.62, 2.95) * (1 - ramp(t, 5.4, 5.9));
    const imm = fillOn * clamp((2300 - cam.w) / 600);
    hud.update(t, cam, p, imm);
  }

  // How far anything moves on screen across [t0, t1], in px — drives adaptive motion-blur sampling.
  const fromScreen = (s, c) => {
    const a = (-c.rot * Math.PI) / 180,
      x = (s[0] - 960) / c.z,
      y = (s[1] - 540) / c.z;
    return [c.cx + x * Math.cos(a) - y * Math.sin(a), c.cy + x * Math.sin(a) + y * Math.cos(a)];
  };
  const flipR = (t) => E.cubicInOut(ramp(t, score.flip.t0, score.flip.t1)) * 2203;
  window.__motion = (t0, t1) => {
    t0 = clamp(t0, 0, DURATION);
    t1 = clamp(t1, 0, DURATION);
    const a = score.camera(t0),
      b = score.camera(t1);
    let m = 0;
    for (const sx of [0, 480, 960, 1440, 1920])
      for (const sy of [0, 270, 540, 810, 1080]) {
        const s = toScreen(fromScreen([sx, sy], a), b);
        m = Math.max(m, hypot(s[0] - sx, s[1] - sy));
      }
    const pa = toScreen(route.at(t0), a),
      pb = toScreen(route.at(t1), b);
    m = Math.max(m, hypot(pa[0] - pb[0], pa[1] - pb[1]), Math.abs(flipR(t1) - flipR(t0)));
    return m;
  };

  window.__render = render;
  window.__duration = DURATION;
  window.__ready = true;
  render(0);
  if (capture) return;

  // ---- preview player ------------------------------------------------------------------
  const scrub = $("scrub"),
    time = $("time"),
    btn = $("play");
  const q = new URLSearchParams(location.search);
  let playing = !q.has("t"),
    t = q.has("t") ? parseFloat(q.get("t")) : 0,
    last = performance.now();
  const HOLD = 1.2;
  function show() {
    render(Math.min(t, DURATION));
    const f = Math.min(899, Math.floor(Math.min(t, DURATION) * 60));
    scrub.value = f;
    time.textContent = `${Math.min(t, DURATION).toFixed(2)}s · frame ${String(f).padStart(3, "0")}`;
    btn.textContent = playing ? "pause" : "play";
  }
  function frame(now) {
    if (playing) {
      t += (now - last) / 1000;
      if (t > DURATION + HOLD) t = 0;
    }
    last = now;
    show();
    requestAnimationFrame(frame);
  }
  btn.onclick = () => {
    playing = !playing;
    if (t >= DURATION) t = 0;
  };
  scrub.oninput = () => {
    playing = false;
    t = scrub.value / 60;
  };
  addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      btn.onclick();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      playing = false;
      t = clamp(t + ((e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1)) / 60, 0, DURATION);
    } else if (e.key === "Home") {
      t = 0;
    }
  });
  requestAnimationFrame(frame);
})(window.R);
