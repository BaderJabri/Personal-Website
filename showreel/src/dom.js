/* dom — tiny SVG helpers. put() skips writes when a value has not changed between frames. */
(function (R) {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (k === "style") {
        for (const s in v) {
          if (s.startsWith("--")) e.style.setProperty(s, v[s]);
          else e.style[s] = v[s];
        }
      }
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v);
    }
    if (parent) parent.appendChild(e);
    return e;
  }

  function put(e, name, value) {
    const cache = e.__v || (e.__v = {});
    if (cache[name] === value) return;
    cache[name] = value;
    if (name === "text") e.textContent = value;
    else e.setAttribute(name, value);
  }
  const op = (e, v) => put(e, "opacity", v <= 0.001 ? "0" : v >= 0.999 ? "1" : v.toFixed(3));
  const tf = (e, v) => put(e, "transform", v);

  // Hairline/solid stroke styles that keep their screen width at any camera zoom.
  function stroke(color, width, extra) {
    return Object.assign({ stroke: color, strokeWidth: width + "px", fill: "none", vectorEffect: "non-scaling-stroke", strokeLinecap: "round", strokeLinejoin: "round" }, extra || {});
  }

  const SANS = "Inter, system-ui, sans-serif";
  const MONO = "'JetBrains Mono', Consolas, monospace";

  function text(parent, str, x, y, size, opts = {}) {
    return el("text", {
      x, y, text: str,
      style: Object.assign({
        fontFamily: opts.mono ? MONO : SANS,
        fontSize: size + "px",
        fontWeight: opts.weight || (opts.mono ? 400 : 300),
        fill: opts.fill || "var(--ink)",
        fillOpacity: opts.alpha != null ? opts.alpha : 1,
        letterSpacing: opts.track ? opts.track + "em" : "normal",
        textAnchor: opts.anchor || "start",
        fontVariantNumeric: "tabular-nums",
      }, opts.style || {}),
    }, parent);
  }

  // Status chip, one-hue-three-alphas formula straight from the site tokens.
  function chip(parent, label, hue, x, y, size) {
    const g = el("g", { style: { "--h": hue } }, parent);
    const t = text(g, label, 0, 0, size, { mono: true, fill: "oklch(var(--chip-l) var(--chip-c) var(--h))" });
    const w = t.getComputedTextLength(), padX = size * 0.9, h = size * 1.75;
    const r = el("rect", {
      x: -padX, y: -h * 0.68, width: w + 2 * padX, height: h, rx: h / 2,
      style: { fill: "oklch(0.74 0.14 var(--h) / var(--chip-a))", stroke: "oklch(0.74 0.14 var(--h) / var(--chip-b))", strokeWidth: "1.2px", vectorEffect: "non-scaling-stroke" },
    });
    g.insertBefore(r, t);
    tf(g, `translate(${x},${y})`);
    g.__w = w + 2 * padX;
    return g;
  }

  // Split a string into per-glyph <text> nodes at their true typeset positions.
  function glyphs(parent, str, x, y, size, opts = {}) {
    const probe = text(parent, str, x, y, size, opts);
    const out = [];
    for (let i = 0; i < str.length; i++) {
      if (str[i] === " ") continue;
      const px = probe.getStartPositionOfChar(i).x;
      const g = text(parent, str[i], px, y, size, opts);
      out.push({ el: g, x: px, i, ch: str[i] });
    }
    const width = probe.getComputedTextLength();
    probe.remove();
    return { glyphs: out, width };
  }

  R.dom = { NS, el, put, op, tf, stroke, text, chip, glyphs, SANS, MONO };
})(window.R);
