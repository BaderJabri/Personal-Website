---
name: visual-review
description: Use before claiming any visual change is complete (the Line, demo, themes, chips, motion) — the Playwright verification procedure and pass criteria for this site.
---

# Visual verification procedure

Code review cannot verify this site's core features. Drive a real browser every time.

## Procedure

1. Build the real artifact: `bun run build` and serve `out/` (falls back to `bun dev` only
   for mid-task iteration — sign-off screenshots come from the static build).
2. With the Playwright browser, at 1280×800 AND 390×844:
   - Screenshot at scroll positions 0% / 25% / 50% / 75% / 100%.
   - Repeat with `prefers-color-scheme: dark` emulated.
   - Repeat once with `prefers-reduced-motion: reduce` emulated (any viewport).
3. If `scripts/visual-check.ts` exists, run it instead — it automates the matrix above.
4. Compare against `docs/superpowers/specs/mockups/throughline-v2-full.html` (site) and
   `autocad-demo-v2.html` (demo). The mockups' 16s loop stands in for scroll scrubbing.

## Pass criteria

- **Line:** draw progress tracks scroll fraction; exactly 100% drawn at page bottom, ending
  in the dot after the email; ticks align to index rows; on mobile the rail sits at the
  reduced offset without overlapping content.
- **Chips/colors:** match the OKLCH formula in CLAUDE.md in BOTH themes; AutoCAD viewport
  `#212830` in both.
- **Demo:** paused while off-screen, playing in view, loops cleanly (no flash at reset);
  reduced-motion shows the final frame with a play button.
- **Motion:** nothing translates except the Line/tick; hover transitions are color-only;
  zero layout shift while scrolling (CLS 0).
- **Reduced motion:** line fully drawn, no entrance animations, page fully readable.

## Sign-off

Attach (or list paths of) the screenshot matrix in the message that claims completion.
If any criterion fails, the change is not done — no partial sign-offs.
