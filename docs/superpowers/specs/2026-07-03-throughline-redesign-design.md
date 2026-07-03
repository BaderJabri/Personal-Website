# BaderJabri.ca redesign — "The Throughline"

**Date:** 2026-07-03
**Status:** Draft for review
**Mockups (committed):** `docs/superpowers/specs/mockups/throughline-v2-full.html` (site), `docs/superpowers/specs/mockups/autocad-demo-v2.html` (full-fidelity demo) — open in any browser; animations loop on a 16s timer standing in for scroll.

## 1. Overview

Complete replacement of the current single-page portfolio. The new site is a minimalist,
professional one-page-plus-project-pages site built around two signature elements:

1. **The Line** — a single International-Klein-Blue SVG line that runs the full length of
   the homepage. It arrives at the top, threads every section along a left rail, ticks each
   work-index row, hands off to the demo, underlines the email, and terminates in a period.
   Its draw progress is scrubbed by scroll position. It is the only structural ornament on
   the site.
2. **The Demo** — a scripted replay of a Claude Code + AutoCAD session in which Claude
   drafts an SAE aero wing rib (NACA profile, spar slots, lightening holes, dimensions),
   with the terminal transcript and the CAD geometry appearing in sync.

Everything else is deliberately quiet: white space, hairline rules, featherweight type.

### Goals

- Unique and memorable without gimmickry; minimalist and professional.
- Personality-first for a mixed audience (recruiters + builder community).
- A living site: new projects and experiments slot in without redesign.
- Good UI/UX with tasteful micro-animations (rules in §6).
- Static, fast, cheap to host (Cloudflare Pages, domain BaderJabri.ca).

### Non-goals

- **No notes/blog/posts system.** The stack-reference repo's content machinery for
  notes/posts/showcases/tags is explicitly out of scope. Content types are projects and
  playground experiments only. (A writing section may be a future project; nothing in this
  design blocks it, nothing anticipates it.)
- No contact form (mailto + copy button; removes EmailJS dependency).
- No CMS, no comments, no shader/WebGL backgrounds.

## 2. Design language

### Layout

Single scrolling homepage; fixed max-width column (~1100px), generous vertical rhythm.
Left rail at a constant x-position carries the Line. Content indents right of the rail.

Sections in order:

| # | Section | Content |
|---|---------|---------|
| 0 | Nav | Small-caps text links: index · work · play · contact + theme toggle. No pill, no bar — just text. |
| 1 | Hero | Name (54px, weight 200), one sentence ("Software for drawing, trading, and flying."), 4 topic chips, halftone artwork behind name, faint IKB ambient wash. |
| 2 | Currently drafting | The Demo in a hairline frame with faint IKB glow; caption + link to project page. |
| 3 | Selected work | 5-row index: number, name, year, status chip. Row hover: line tick slides to row + row glows in its status hue. Click → project page. |
| 4 | About | Exactly three sentences. Small-caps label left, prose right. |
| 5 | Play | Plain text links with hue underlines; one dashed "next experiment — reserved" slot. |
| 6 | Contact | "available for W27 co-op" (green), email at 24px — the Line crosses the page, underlines it, loops once, ends in a 3px IKB dot. |
| 7 | Footer | "© 2026 bader aljabri — drawn in one line" · colophon ↗ · source ↗ · theme toggle. |

### Color system

- **Paper:** light `#fcfcfa` / dark `#0a0a0b` (warm black). Text: light `#17171a` / dark `#f0ebe3` (warm off-white).
- **The Line:** light `#002fa7` (IKB) / dark `#4d6bff` with a soft glow (`drop-shadow`).
- **Chips — one-hue-three-alphas formula (OKLCH):** each status/topic gets a hue; lightness
  and chroma are constant so all colors read as one family.
  - Dark mode (reference-exact): text `oklch(0.74 0.14 H)`, bg same `/0.094`, border same `/0.188`.
  - Light mode: text `oklch(0.45–0.5 0.13 H)`, bg `oklch(0.74 0.14 H / 0.1)`, border `/ 0.3`.
  - Hues: in draft = 60 (amber), active = 155 (green), shipped = 240 (blue), ongoing = 300 (violet).
- **Content-derived glows:** demo frame glows faint IKB; each index row's hover glow uses its
  own status hue (`radial-gradient`, ≤ 13% alpha).
- **Halftone artwork:** dot-grid in Line blue behind the name, masked to fade; generated on a
  small `<canvas>`, seeded by the current date (subtle daily variation). CSS fallback:
  `radial-gradient` dot pattern.
- **AutoCAD viewport:** always authentic `#212830` regardless of theme.

### Typography

- Body/name: humanist sans variable font (final pick at build: Inter Variable or Geist Sans),
  name at weight 200.
- Labels: 10px small-caps mono (JetBrains Mono), letter-spacing 0.22em, ~45% opacity.
- Terminal/CAD text: monospace, faithful to each app's conventions.
- Fonts self-hosted via `next/font`; subset latin.

### Dark mode

Class-strategy toggle (`next-themes` or 20-line equivalent), default follows system. Every
section flips: warm black paper, warm text, Line glows, chip formula switches to dark values,
glow alphas roughly double. Toggle lives in nav + footer.

## 3. The Demo (flagship component)

### Fidelity requirements (from approved mockup `autocad-demo-v2.html`)

- **Claude Code pane:** window chrome, `✻ connected` header, `>` typed prompt (character
  typing), `✻ Thinking…` italic, `⏺ autocad — tool_name(args)` calls, `⎿ result` lines,
  green `✓` completion, bordered input box with blinking cursor.
- **AutoCAD window (2026, dark theme):** title bar with QAT, ribbon tabs (Home active:
  Draw / Modify / Annotation / Layers panels with icons), file tabs, model space `#212830`
  with minor/major grid, crosshair + pickbox, dynamic-input tooltip, ViewCube, UCS icon,
  command line with scrolling history (PLINE → RECTANG → ARRAYPATH → DIMLINEAR) and
  current-prompt row, Model/Layout tabs, status bar (coords + GRID/SNAP/ORTHO/POLAR/OSNAP/LWT, active toggles blue).
- **Drawing:** station-3 wing rib — airfoil outline (white, layer RIB-OUTLINE), inner web
  offset (gray), 2 spar slots + 5 tapering lightening holes (cyan, RIB-CUTOUTS), dash-dot
  centerlines + hole crosses (red, CENTER), dimensions with extension lines, arrows,
  `180.00`, `⌀18.0 TYP (5)`, thickness callout (yellow, DIMS). ACAD layer-color conventions
  are non-negotiable.

### Session-script format

The demo replays a JSON script; the component knows nothing about the specific drawing.

```ts
type SessionEvent =
  | { t: number; kind: "prompt"; text: string }            // typed char-by-char
  | { t: number; kind: "thinking"; text: string }
  | { t: number; kind: "tool_call"; tool: string; args: string }
  | { t: number; kind: "tool_result"; text: string }
  | { t: number; kind: "command_echo"; text: string }       // AutoCAD command line
  | { t: number; kind: "geometry"; op: "polyline"|"rect"|"circle"|"line"|"dim"|"centerline";
      layer: string; params: number[][]; drawMs: number }
  | { t: number; kind: "done"; text: string };
```

- v1 ships a hand-authored script of the wing-rib session (~16s, loops with a 2s hold).
- Future (out of scope for v1 build, format designed for it now): claude-autocad exports
  real sessions to this format; the site replays reality.

### Behavior

- Plays when scrolled into view; loops; pauses off-screen (IntersectionObserver).
- Replay button appears on hover (bottom-right of frame).
- `prefers-reduced-motion`: renders the final frame statically with a play button.
- No-JS fallback: static final-frame SVG (server-rendered).

## 4. Content model & site map

### Routes

- `/` — the one-page home (all sections above).
- `/projects/<slug>` — one page per project: title, status chip, year, prose (MDX), links
  (GitHub/live), optional embedded media. The Line renders a short static rail on these
  pages (no scroll scrubbing) for continuity.
- `/colophon` — how the site is built (stack, the Line, the demo format). Low priority.
- 404 — the Line drawn into a "404", flat-line gag optional.

### Projects collection (`content/projects/<slug>/index.mdx`)

Frontmatter (zod-validated):

```yaml
title: string          # "Claude × AutoCAD"
summary: string        # one line for the index row
year: number           # index row display
status: in-draft | active | shipped | ongoing
hue: number            # OKLCH hue for chip/glow (defaults by status)
order: number          # index row position
links: { github?, live?, writeup? }
draft: boolean         # excluded from build when true
```

Initial entries: claude-autocad, watstreet-volatility, watarrow-portal,
startup-lab-marketplace, patterned-ai. Archive projects (Whisper4Windows, Plotit, Integration
Bee) appear only if given entries later — index shows exactly what the collection contains.

### Playground registry (`src/playground/registry.ts`)

Experiments are code, not content: a typed array of `{ slug, name, status: runnable|wip|shipped,
hue, href | component }`. The reserved slot is a design element, always rendered last.

### About / contact

Hardcoded in the page component. Three sentences, no more — enforced by review, not schema.

## 5. Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript strict. Chosen over Astro
  for familiarity (StartUp Lab uses the identical toolchain) and because the stack-reference
  repo proves the MDX pipeline; Astro's philosophy is imported as budget rules (§7).
- **Build/deploy:** `output: 'export'` (pure static) → Cloudflare Pages, domain BaderJabri.ca.
  Day-one spike: verify static export with build-time `compileMDX` + OG image routes; if OG
  generation conflicts with export, pre-render OG images at build via script instead.
- **Package manager:** Bun.
- **Styling:** Tailwind CSS v4 + CSS custom properties for tokens (colors in OKLCH). Demo
  timeline in plain CSS keyframes where possible.
- **Content:** MDX compiled at build (`next-mdx-remote/rsc`), `gray-matter` + zod frontmatter.
  Only the projects collection — no notes/posts/tags/reading-time machinery.
- **Motion:** `framer-motion` (`motion`) solely for the scroll-scrubbed Line
  (`useScroll` + `useTransform` → `pathLength`/`stroke-dashoffset`); everything else is CSS.
- **Icons:** none beyond a handful of inline SVGs (external-link arrow, theme toggle). No icon library unless needed.
- **Dev tooling:** **agentation** rendered dev-only (`NODE_ENV === "development"`) — visual
  annotate → structured markdown → paste to Claude Code. Its animation-pause feature is the
  standard way to review Line/demo states.
- **SEO/meta:** sitemap, robots, OG images restyled in Throughline language (line + halftone + title).
- **Analytics:** Cloudflare Web Analytics (deferred until after launch).
- **New repo:** yes — fresh repository (working name `baderjabri.ca`), clean history. The old
  repo stays as archive. Stack-reference patterns are re-implemented, not copied, unless its
  license is confirmed permissive (open question §9).

### Explicitly excluded

`@paper-design/shaders-react`, `interface-kit`, EmailJS, Lenis/smooth-scroll, cmdk (revisit
post-launch), Pagefind (site too small), RSS (no feed-able content type), reading-time,
tags system.

## 6. Micro-animation rules

Adopted philosophy: **colors move, layout doesn't.**

- All hover/focus transitions: 150ms, standard ease, color/background/border/opacity only.
- The Line (and its row tick) is the sole element that translates. Tick slide: 150ms.
- Scroll scrubbing: Line draw progress mapped to scroll; 60fps via single rAF writer.
- One-time entrances: name fades up once on load (300ms); email underline draws on first
  view. No re-triggering on re-scroll.
- `prefers-reduced-motion: reduce` → Line renders fully drawn, demo shows final frame,
  all entrances disabled. This is a first-class rendering path, not an afterthought.
- Nothing scales, bounces, or parallaxes. No animation longer than 400ms except the Line
  scrub (user-controlled) and the demo loop (16s, content).

## 7. Performance & quality budgets

- First-load JS ≤ 80KB gzipped; homepage works with JS disabled except Line draw + demo playback (both have static fallbacks).
- LCP < 1.5s on Fast 3G throttle; CLS = 0 (all media sized).
- Lighthouse ≥ 95 across categories on `/`.
- Fonts: ≤ 2 families, subset, `font-display: swap` with metric-compatible fallback.

## 8. Error handling & testing

- Static site: error surface is build-time. zod frontmatter failures fail the build with the
  offending file path.
- Demo script validated against the SessionEvent schema at build.
- No-JS: `<noscript>`-safe hero and final-frame demo; nav is plain anchors.
- **Playwright smoke suite:** home renders; Line reaches 100% at scroll bottom; demo loops
  and pauses off-screen; reduced-motion renders static; theme toggle persists; project pages
  build for every collection entry.
- CI (GitHub Actions): typecheck → lint → build → Playwright → deploy preview per PR →
  production on main.

## 9. Open questions (to resolve before/while building)

1. **Stack-reference repo license/origin** — determines re-implement vs adapt. Default: re-implement patterns.
2. **Contact email** — `hello@baderjabri.ca` (needs Cloudflare Email Routing) vs existing address.
3. **Font final pick** — Inter Variable vs Geist Sans (decide in first build session against the 200-weight name).
4. **Resume** — the design intentionally has no resume button; decide whether a quiet `resume ↗` joins the contact links.
5. **Mobile Line behavior** — rail at 24px with simplified curves (design intent); validate on real viewport during build; fallback is a straight rail with ticks.
6. **Demo copy** — final prompt/tool-call text should be checked against the real claude-autocad tool names once that project stabilizes.

## 10. Build phases (for the implementation plan)

1. **P1 — Skeleton:** new repo, Next 16 static export → CF Pages pipeline, tokens, fonts, dark mode, hero + about + contact static, agentation wired.
2. **P2 — The Line:** scroll-scrubbed rail through all sections, reduced-motion path, mobile behavior.
3. **P3 — The Demo:** session-script schema, wing-rib script, full-fidelity AutoCAD + Claude panes, replay/pause behavior.
4. **P4 — Content:** projects collection, index rows + chips + glows, project pages, playground registry.
5. **P5 — Polish & launch:** OG images, colophon, 404, Playwright suite, budgets enforced, DNS cutover.
