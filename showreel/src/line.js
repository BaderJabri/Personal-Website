/* line — the one continuous stroke. A route of legs, timed by monotone speed splines. */
(function (R) {
  "use strict";
  const { Poly, cubic, monotone, clamp, hypot } = R.core;
  const { el, put, stroke } = R.dom;

  class Route {
    constructor() {
      this.legs = [];
      this.marks = {};
      this.moves = [];
      this.byName = {};
    }
    start(p) {
      this.cur = p.slice();
      return this;
    }
    leg(name, opts = {}) {
      const L = { name, pts: [this.cur.slice()], opts };
      this.legs.push(L);
      this.byName[name] = L;
      this.L = L;
      return this;
    }
    to(p) {
      this.L.pts.push(p.slice());
      this.cur = p.slice();
      return this;
    }
    curve(c1, c2, p, n = 40) {
      const pts = cubic(this.cur, c1, c2, p, n);
      for (let i = 1; i < pts.length; i++) this.L.pts.push(pts[i]);
      this.cur = p.slice();
      return this;
    }
    poly(pts) {
      for (const q of pts) {
        if (hypot(q[0] - this.cur[0], q[1] - this.cur[1]) < 1e-6) continue;
        this.L.pts.push(q.slice());
        this.cur = q.slice();
      }
      return this;
    }
    mark(name) {
      this.marks[name] = { leg: this.legs.length - 1, i: this.L.pts.length - 1 };
      return this;
    }

    finalize() {
      let s = 0;
      for (const L of this.legs) {
        L.poly = new Poly(L.pts);
        L.s0 = s;
        s += L.poly.len;
        L.s1 = s;
      }
      this.len = s;
      for (const k in this.marks) {
        const m = this.marks[k],
          L = this.legs[m.leg];
        m.s = L.s0 + L.poly.cum[m.i];
      }
      return this;
    }
    S(name) {
      if (!(name in this.marks)) throw new Error("unknown mark " + name);
      return this.marks[name].s;
    }
    // A move is one continuous gesture: knots [[mark, time], ...]; speed is smooth through every knot.
    move(knots, { v0 = 0, v1 = 0 } = {}) {
      const kk = knots.map(([m, t]) => [t, typeof m === "number" ? m : this.S(m)]);
      const sec = (i) => (kk[i + 1][1] - kk[i][1]) / (kk[i + 1][0] - kk[i][0]);
      const f = monotone(kk, v0 * sec(0), v1 * sec(kk.length - 2));
      this.moves.push({ t0: kk[0][0], t1: kk[kk.length - 1][0], s0: kk[0][1], s1: kk[kk.length - 1][1], f });
      this.moves.sort((a, b) => a.t0 - b.t0);
      return this;
    }
    sAt(t) {
      let s = 0;
      for (const m of this.moves) {
        if (t < m.t0) break;
        s = t >= m.t1 ? m.s1 : m.f(t);
      }
      return s;
    }
    tAtS(s) {
      for (const m of this.moves) {
        if (s > m.s1 + 1e-6) continue;
        if (s <= m.s0) return m.t0;
        let lo = m.t0,
          hi = m.t1;
        for (let i = 0; i < 48; i++) {
          const mid = (lo + hi) / 2;
          if (m.f(mid) < s) lo = mid;
          else hi = mid;
        }
        return hi;
      }
      return Infinity;
    }
    tAt(name) {
      return this.tAtS(this.S(name));
    }
    tAtX(legName, x) {
      const L = this.byName[legName];
      return this.tAtS(L.s0 + L.poly.sAtX(x));
    }
    pos(s) {
      for (const L of this.legs) if (s <= L.s1) return L.poly.at(s - L.s0);
      const L = this.legs[this.legs.length - 1];
      return L.poly.at(L.poly.len);
    }
    at(t) {
      return this.pos(this.sAt(t));
    }
    // Lagged pen position — the camera's sense of where the pen has been.
    lag(t, span = 0.22, n = 7) {
      let x = 0,
        y = 0,
        w = 0;
      for (let i = 0; i < n; i++) {
        const k = 1 - i / n,
          p = this.at(Math.max(0, t - (span * i) / (n - 1)));
        x += p[0] * k;
        y += p[1] * k;
        w += k;
      }
      return [x / w, y / w];
    }

    mount(parent) {
      this.g = el("g", null, parent);
      for (const L of this.legs) {
        L.el = el(
          "path",
          { style: stroke("var(--line)", L.opts.width || 3, { filter: "var(--line-filter)" }) },
          this.g,
        );
        L.drawn = -1;
      }
      return this;
    }
    render(t) {
      const s = this.sAt(t);
      for (const L of this.legs) {
        const local = clamp(s - L.s0, 0, L.poly.len);
        if (local === L.drawn) continue;
        L.drawn = local;
        put(L.el, "d", local > 0 ? L.poly.d(0, local) : "");
      }
      return s;
    }
  }

  R.Route = Route;
})(window.R);
