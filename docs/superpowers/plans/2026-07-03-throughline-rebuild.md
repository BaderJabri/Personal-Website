# Throughline Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild BaderJabri.ca as the Throughline design — a static one-page-plus-project-pages site whose two signature elements are a scroll-scrubbed IKB Line and a full-fidelity Claude×AutoCAD demo replayer — meeting every budget in spec §7.

**Architecture:** Next.js 16 (App Router, `output: 'export'`) renders 100% of the HTML at build time with the standard client runtime retained (Bader's D1 decision, 2026-07-03: relax the JS budget rather than strip React). Interactivity ships as small `"use client"` leaf components (theme toggle, Line scrub, demo player, halftone canvas, copy-email), each enhancing server-rendered HTML that already works without it — the no-JS/reduced-motion posture spec §6–§8 demand.

**Tech Stack:** Next.js 16.2 + React 19 + TS strict · Tailwind CSS v4 + OKLCH custom properties · Bun (packages, test runner) · framer-motion (`motion` — the Line only) · next-themes · next-mdx-remote/rsc + gray-matter + zod · Playwright (e2e + screenshots) · GitHub Actions CI · Cloudflare Pages (project `personal-website`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-03-throughline-redesign-design.md`. **§2 §3 §6 §7 are non-negotiable.**
- Static export only (`output: 'export'`). No server runtime, no forms.
- Budgets (merge gates at every phase end): **≤ 180 KB gz first-load JS (AMENDED 2026-07-03 by Bader from 80 KB — Next 16 framework baseline alone is 148.7 KB) · LCP < 1.5 s throttled · CLS 0 · Lighthouse ≥ 95**.
- Motion: the Line and its tick are the ONLY translating elements; all other transitions 150 ms color/background/border/opacity only; entrances one-time (name fade 300 ms, email underline first-view); nothing scales/bounces/parallaxes; no animation > 400 ms except Line scrub + demo loop.
- `prefers-reduced-motion: reduce` → Line fully drawn, demo final frame + play button, entrances disabled. Built alongside, never after.
- Tokens: paper `#fcfcfa`/`#0a0a0b` · ink `#17171a`/`#f0ebe3` · Line `#002fa7`/`#4d6bff` (+glow dark). Chips one-hue-three-alphas: dark text `oklch(.74 .14 H)`, bg `/0.094`, border `/0.188`; light text `oklch(.45–.5 .13 H)`, bg `oklch(.74 .14 H/0.1)`, border `/0.3`. Hues: in-draft 60 · active 155 · shipped 240 · ongoing 300. AutoCAD viewport always `#212830`.
- Content scope: projects collection + playground registry ONLY. No notes/blog/tags/RSS/reading-time.
- Dependencies: only the spec §5 list. Nothing new without asking (no shader libs, icon packs, smooth-scroll, CMS). `framer-motion` (`motion` package) solely for the Line (`useScroll` + `useTransform`, via `LazyMotion`/mini imports to limit weight); `next-themes` for dark mode per spec §2.
- Skills: load `session-script` before touching anything in the demo frame (Tasks 14–20). Run `visual-review` before claiming any visual work done (its matrix = `scripts/visual-check.ts`). `verification-before-completion` before any "done" claim. `/code-review` at each phase end.
- Commits: small, imperative, plain. **No Co-Authored-By.** Never merge to `main`.
- Contact email `Baderjabri.15@gmail.com` (mailto + copy chip). Resume: quiet `resume ↗` → `/Bader-Aljabri-2025.pdf` — link path defined in ONE place (`src/lib/site.ts`).
- Checkpoints (STOP and wait for Bader): plan approval · end of P1 (preview URL) · end of P3 (demo side-by-side vs `autocad-demo-v2.html`) · pre-merge.

## Decisions locked by the day-one spike (2026-07-03)

- MDX at build (`next-mdx-remote/rsc` + gray-matter + zod) works under `output: 'export'` — proven, committed (`1fd4df8`).
- OG images via `ImageResponse` route + `generateStaticParams` prerender to static PNGs at build — **no conflict with export**; no pre-render script needed. (Satori rule: any multi-child div needs explicit `display: flex`.)
- Cloudflare Pages builds this branch clean (GitHub check-run: success; project name `personal-website`). Known issue: **all `*.pages.dev` URLs 522 instantly** (even old production deploys) while `baderjabri.ca` serves fine — account/project-level, needs Bader's dashboard.
- Framework baseline measured at 148.7 KB gz first-load (modern browsers) on an empty page.

## Decisions resolved with plan approval (Bader, 2026-07-03)

- **D1 — REJECTED runtime-strip islands; budget amended instead.** Keep the standard Next client runtime and React client components; §7's first-load JS budget amended 80 KB → **180 KB gz** (Bader chose "relax §7"; 180 = 149 baseline + motion + app headroom). All other §7 gates unchanged. Interactivity = `"use client"` leaf components; server components still render complete HTML first (no-JS fallbacks stay mandatory).
- **D2 — moot** (React runtime present): the Line uses `framer-motion`'s `useScroll`/`useTransform` per spec §5, `LazyMotion` + `m` to keep the import lean.
- **D3 — APPROVED:** optional `label?: string` on `geometry` events (backwards-compatible superset; real sessions may omit it).
- **D4 — open, resolved inside Task 6** by rendering the name at weight 200 in both Geist and Inter and screenshotting; result shown at the P1 checkpoint.

## File structure (final state)

```
src/
  app/
    layout.tsx                       # fonts, metadata, ThemeProvider wrap, agentation (dev)
    page.tsx                         # home — composes section components in spec §2 order
    globals.css                      # tokens, chip formula, rails, keyframes, reduced-motion overrides
    not-found.tsx                    # 404 — Line drawn into "404"
    colophon/page.tsx
    opengraph-image.tsx              # home OG (Throughline language)
    sitemap.ts · robots.ts
    projects/[slug]/page.tsx · opengraph-image.tsx
  components/
    Nav.tsx Hero.tsx DemoSection.tsx WorkIndex.tsx About.tsx Play.tsx Contact.tsx Footer.tsx
    StatusChip.tsx ThemeToggle.tsx TheLine.tsx
    demo/DemoFrame.tsx demo/ClaudePane.tsx demo/AutocadWindow.tsx demo/FinalFrame.tsx
  lib/
    site.ts                          # email, resume path, social links, base URL — one place
    projects.ts                      # collection loader (exists; gets tests in Task 21)
    line-progress.ts                 # scroll→segment math (pure, TDD)
    session-script.ts                # SessionEvent zod schema (pure, TDD)
    demo-state.ts                    # stateAt(script, t) player core (pure, TDD)
    halftone.ts                      # date-seeded dot grid (pure, TDD)
    budget.ts                        # firstLoadJsPaths(html) (pure, TDD)
    naca.ts                          # NACA 2412 sampling (pure, TDD)
  components/client/                 # "use client" leaves (replaces the pre-D1 islands/ dir)
    ThemeProvider.tsx LineController.tsx DemoPlayer.tsx HalftoneCanvas.tsx CopyEmail.tsx Entrances.tsx
  playground/registry.ts
content/
  projects/{claude-autocad,watstreet-volatility,watarrow-portal,startup-lab-marketplace,patterned-ai}/index.mdx
  demo/wing-rib.json                 # imported directly by DemoSection (server) + DemoPlayer props
scripts/
  check-budget.ts generate-rib-geometry.ts visual-check.ts
tests/                               # bun test — one file per lib module
e2e/smoke.spec.ts                    # Playwright suite (spec §8 list)
.github/workflows/ci.yml
```

Client-component contract: every `"use client"` component is a leaf that decorates server-rendered content — it must render the same DOM shape on first paint as the server HTML (no hydration mismatch, no layout creation → CLS 0 by construction). Where the plan's task text says "island", read: client component in `src/components/client/`; `data-island`/`data-ev` attribute contracts stay as written (they double as e2e selectors).

---

# Phase P1 — Skeleton

## Task 1: Build pipeline — first-load JS budget gate

**Files:**
- Create: `src/lib/budget.ts`, `tests/budget.test.ts`, `scripts/check-budget.ts`
- Modify: `package.json` (build script chain)

**Interfaces:**
- Produces: `firstLoadJsPaths(html: string): string[]` (dedupes, excludes `noModule` legacy chunks) · build command `bun run build` = `next build && bun scripts/check-budget.ts` — the gate fails any build over **180 KB gz** (amended budget, D1).

- [ ] **Step 1: Write failing test**

```ts
// tests/budget.test.ts
import { expect, test } from "bun:test";
import { firstLoadJsPaths } from "../src/lib/budget";

test("finds script srcs, dedupes, ignores nomodule", () => {
  const html = `<script src="/_next/static/chunks/a.js" async=""></script>
    <script src="/_next/static/chunks/a.js"></script>
    <script src="/_next/static/chunks/legacy.js" noModule=""></script>`;
  expect(firstLoadJsPaths(html)).toEqual(["/_next/static/chunks/a.js"]);
});
```

- [ ] **Step 2: Run to verify failure** — `bun test tests/budget.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// src/lib/budget.ts
export function firstLoadJsPaths(html: string): string[] {
  const out = new Set<string>();
  for (const m of html.matchAll(/<script([^>]*)\bsrc="([^"]+\.js)"([^>]*)>/g)) {
    if (/noModule/i.test(m[1] + m[3])) continue;
    out.add(m[2]);
  }
  return [...out];
}
```

```ts
// scripts/check-budget.ts
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { firstLoadJsPaths } from "../src/lib/budget";
const BUDGET = 180 * 1024; // amended from 80KB — Bader, 2026-07-03 (D1)
const html = readFileSync("out/index.html", "utf8");
let total = 0;
for (const p of firstLoadJsPaths(html)) {
  const gz = gzipSync(readFileSync(join("out", p))).length;
  total += gz;
  console.log(`${(gz / 1024).toFixed(1).padStart(7)} KB gz  ${p}`);
}
console.log(`first-load JS: ${(total / 1024).toFixed(1)} KB gz (budget 180)`);
if (total > BUDGET) process.exit(1);
```

`package.json` scripts: `"build": "next build && bun scripts/check-budget.ts"`, `"test": "bun test"`.

- [ ] **Step 4: Run tests** — `bun test` → PASS. Then `bun run build` → exports and prints ≈ **148.7 KB gz** (framework baseline; headroom ≈ 31 KB for motion + app code — watch it every phase).
- [ ] **Step 5: Commit** — `git commit -m "add first-load js budget gate"`

## Task 2: Design tokens + global CSS (spec §2 verbatim)

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces CSS custom props consumed by every later component: `--paper --ink --line --line-glow`; chip utility classes `.chip` + `style="--h: <hue>"`; `.mono10` label style; `.rail path` base; reduced-motion overrides.

- [ ] **Step 1: Implement tokens** (no unit test — verified visually in Task 7):

```css
@import "tailwindcss";

:root {
  --paper: #fcfcfa; --ink: #17171a;
  --line: #002fa7; --line-glow: none;
  --chip-text: oklch(0.47 0.13 var(--h));
  --chip-bg: oklch(0.74 0.14 var(--h) / 0.1);
  --chip-border: oklch(0.74 0.14 var(--h) / 0.3);
  --hairline: rgba(23, 23, 26, 0.1);
}
.dark {
  --paper: #0a0a0b; --ink: #f0ebe3;
  --line: #4d6bff; --line-glow: drop-shadow(0 0 5px rgba(77, 107, 255, 0.55));
  --chip-text: oklch(0.74 0.14 var(--h));
  --chip-bg: oklch(0.74 0.14 var(--h) / 0.094);
  --chip-border: oklch(0.74 0.14 var(--h) / 0.188);
  --hairline: rgba(240, 235, 227, 0.1);
}
@theme inline {
  --color-paper: var(--paper); --color-ink: var(--ink); --color-line: var(--line);
  --font-sans: var(--font-sans-var); --font-mono: var(--font-mono-var);
}
body { background: var(--paper); color: var(--ink); font-family: var(--font-sans), system-ui, sans-serif; }

.mono10 { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.22em; opacity: 0.45; text-transform: uppercase; }
.chip { font-family: var(--font-mono), monospace; font-size: 10px; padding: 2.5px 9px; border-radius: 999px; letter-spacing: 0.02em; color: var(--chip-text); background: var(--chip-bg); border: 1px solid var(--chip-border); }

.rail path { stroke: var(--line); stroke-width: 1.6; fill: none; stroke-dasharray: 100; stroke-dashoffset: 100; filter: var(--line-glow); }
.rail circle { fill: var(--line); }

a, button { transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease; }

@media (prefers-reduced-motion: reduce) {
  .rail path { stroke-dashoffset: 0 !important; }
  * { animation: none !important; }
}
```

Status→hue map lives in TS (`STATUS_HUES` in `src/lib/projects.ts`, already exists: in-draft 60, active 155, shipped 240, ongoing 300).

- [ ] **Step 2: Build + eyeball** — `bun run build`; serve `out/`; chips section not yet present, so verify vars exist in devtools. Commit `git commit -m "add design tokens and chip formula"`.

## Task 3: Dark mode — next-themes, toggle, persistence

**Files:**
- Create: `src/components/client/ThemeProvider.tsx`, `src/components/client/ThemeToggle.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `<ThemeProvider>` wrapping `{children}` in layout — `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange` · `<ThemeToggle />` `"use client"` button `◐` / `◑` using `useTheme()`, `aria-label="toggle theme"`, `data-island="theme"` (e2e selector), reused in nav + footer. next-themes injects its own FOUC-free init script and persists to `localStorage.theme`.

- [ ] **Step 1:** `bun add next-themes`; implement both components:

```tsx
// src/components/client/ThemeProvider.tsx
"use client";
import { ThemeProvider as NextThemes } from "next-themes";
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}
```

```tsx
// src/components/client/ThemeToggle.tsx
"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      className="mono10 cursor-pointer"
      aria-label="toggle theme"
      data-island="theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? "◑ light" : "◐ dark"}
    </button>
  );
}
```

Layout: `<html lang="en" suppressHydrationWarning>` (next-themes mutates the class) and wrap body children in `<ThemeProvider>`.

- [ ] **Step 2:** `bun run build`; serve `out/`; toggle flips every token, reload persists, system default respected, no FOUC.
- [ ] **Step 3: Commit** — `git commit -m "add dark mode via next-themes"`

## Task 4: Site constants + halftone core

**Files:**
- Create: `src/lib/site.ts`, `src/lib/halftone.ts`, `tests/halftone.test.ts`, `src/components/client/HalftoneCanvas.tsx`

**Interfaces:**
- Produces: `SITE = { email: "Baderjabri.15@gmail.com", resumePath: "/Bader-Aljabri-2025.pdf", github: "https://github.com/BaderJabri", linkedin: <Bader confirms handle at checkpoint>, baseUrl: "https://baderjabri.ca" }` · `halftoneDots(seed: number, cols: number, rows: number): { x: number; y: number; r: number }[]` deterministic · `dateSeed(d: Date): number` · `<HalftoneCanvas className>` (`"use client"`) draws dots on a `<canvas data-island="halftone">` in `--line` color.

- [ ] **Step 1: Failing test**

```ts
// tests/halftone.test.ts
import { expect, test } from "bun:test";
import { halftoneDots, dateSeed } from "../src/lib/halftone";
test("deterministic for same seed", () => {
  expect(halftoneDots(42, 10, 5)).toEqual(halftoneDots(42, 10, 5));
});
test("differs across seeds", () => {
  expect(halftoneDots(1, 10, 5)).not.toEqual(halftoneDots(2, 10, 5));
});
test("radii bounded for 7px grid", () => {
  for (const d of halftoneDots(7, 20, 10)) {
    expect(d.r).toBeGreaterThanOrEqual(0.4);
    expect(d.r).toBeLessThanOrEqual(1.6);
  }
});
test("date seed = yyyymmdd", () => {
  expect(dateSeed(new Date(2026, 6, 3))).toBe(20260703);
});
```

- [ ] **Step 2:** run → FAIL. **Step 3: Implement** (mulberry32 PRNG; 7 px grid pitch; base radius 1.1 ± jitter):

```ts
// src/lib/halftone.ts
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
export function halftoneDots(seed: number, cols: number, rows: number) {
  const rnd = mulberry32(seed);
  const dots: { x: number; y: number; r: number }[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      dots.push({ x: i * 7 + 3.5, y: j * 7 + 3.5, r: 0.7 + rnd() * 0.8 });
  return dots;
}
```

`HalftoneCanvas` (`"use client"`, `useEffect` + `useRef`): size canvas to element box × dpr, fill dots with `getComputedStyle(document.documentElement).getPropertyValue("--line")`, re-render on theme change (`useTheme().resolvedTheme` dependency). Renders `null`-painting canvas over the CSS-gradient fallback block, so no-JS/first-paint is already correct.

- [ ] **Step 4:** `bun test` PASS. **Step 5:** `git commit -m "add site constants and seeded halftone"`

## Task 5: Static sections — Nav, Hero, About, Contact, Footer (+ copy-email island)

**Files:**
- Create: `src/components/{Nav,Hero,About,Contact,Footer}.tsx`, `src/components/client/CopyEmail.tsx`
- Modify: `src/app/page.tsx` (compose: Nav → Hero → [demo placeholder] → [work placeholder] → About → Play placeholder → Contact → Footer), `src/app/layout.tsx`

Copy source of truth: `docs/superpowers/specs/mockups/throughline-v2-full.html` lines 56–68 (hero), 131–138 (about, exactly three sentences), 163–167 (contact), 171–176 (footer) — **except** email is `Baderjabri.15@gmail.com` from `SITE`, and contact links gain quiet `resume ↗` → `SITE.resumePath`.

**Interfaces:**
- Produces: section components taking no props (content from `SITE`/literals); each section root `<section id="{index|work|play|contact}">` for nav anchors; hero halftone = CSS `radial-gradient` dot block (no-JS fallback) with `<canvas data-island="halftone">` layered over; contact email 24 px weight-300 with `<CopyEmail email={SITE.email} />` chip.

- [ ] **Step 1: Implement components.** Key structures (complete files in repo follow these skeletons exactly):

```tsx
// src/components/Contact.tsx
import { SITE } from "@/lib/site";
export function Contact() {
  return (
    <section id="contact" className="relative px-11">
      <div className="ml-[66px] pb-8">
        <p className="mono10">
          05 — contact · <span className="text-[oklch(.45_.13_155)] dark:text-[oklch(.74_.14_155)]">available for W27 co-op</span>
        </p>
        <p className="mt-9 text-2xl font-light">
          <a href={`mailto:${SITE.email}`} data-underline-target>{SITE.email}</a>
          <CopyEmail email={SITE.email} />
        </p>
        <p className="mono10 mt-6">
          <a href={SITE.github}>github / baderjabri</a> · <a href={SITE.linkedin}>linkedin / baderaljabri</a> · <a href={SITE.resumePath}>resume ↗</a> · the line ends here.
        </p>
      </div>
    </section>
  );
}
```

```tsx
// src/components/client/CopyEmail.tsx
"use client";
import { useRef, useState } from "react";
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  return (
    <button
      className="chip ml-3 align-middle cursor-pointer"
      style={{ "--h": 240 } as React.CSSProperties}
      data-island="copy-email"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
```

Nav: `mono10` text links `index work play contact` + `<ThemeToggle/>`, no pill/bar. Hero: name 54 px weight-200 tracking `-0.02em`, sentence, 4 chips (`#drafting` h60 · `#markets` h155 · `#aero` h240 · `#patterns` h300), halftone block masked `linear-gradient(115deg, #000 20%, transparent 75%)`, faint IKB ambient wash `radial-gradient` top-right. About: `03 — about` label left, three sentences right (mockup copy verbatim). Footer: `© 2026 bader aljabri — drawn in one line` · `colophon ↗` · `source ↗` · ThemeToggle.

- [ ] **Step 2:** `bun run build` → budget gate prints (framework baseline + these components); serve `out/`; sections render in both themes; email copies.
- [ ] **Step 3: Commit** — `git commit -m "add nav, hero, about, contact, footer sections"`

## Task 6: Font decision (D4) — Geist vs Inter at weight 200

- [ ] Render the hero name in both (`next/font/google` Geist and Inter, latin subset, `display: "swap"`, weights variable), screenshot both at 1280 px in both themes, pick the one whose 200-weight reads closest to the mockup's featherweight name (thin but not fragile; compare terminals/aperture). Keep ≤ 2 families total: winner + JetBrains Mono (10 px small-caps labels, terminal). Wire `--font-sans-var`/`--font-mono-var` in layout. Save both screenshots to attach at the P1 checkpoint. Commit `git commit -m "pick body font, wire jetbrains mono labels"`.

## Task 7: visual-check script + agentation + first visual review

**Files:**
- Create: `scripts/visual-check.ts`
- Modify: `src/app/layout.tsx` (agentation dev-only)

**Interfaces:**
- Produces: `bun scripts/visual-check.ts [url]` — Playwright matrix exactly per `visual-review` skill: 1280×800 and 390×844 × scroll 0/25/50/75/100% × light/dark + one reduced-motion pass → `screenshots/<viewport>-<scroll>-<theme>[-rm].png` (gitignored).

- [ ] **Step 1: Implement** (dev-dep `@playwright/test` + `bun add -d playwright`):

```ts
// scripts/visual-check.ts
import { chromium } from "playwright";
const url = process.argv[2] ?? "http://localhost:4173";
const browser = await chromium.launch();
for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
  for (const theme of ["light", "dark"] as const) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, colorScheme: theme });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    for (const pct of [0, 25, 50, 75, 100]) {
      await page.evaluate((p) => scrollTo(0, (document.body.scrollHeight - innerHeight) * (p / 100)), pct);
      await page.waitForTimeout(250);
      await page.screenshot({ path: `screenshots/${vp.w}-${pct}-${theme}.png` });
    }
    await ctx.close();
  }
}
const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const p = await rm.newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.screenshot({ path: "screenshots/1280-0-light-rm.png", fullPage: true });
await browser.close();
console.log("matrix written to screenshots/");
```

- [ ] **Step 2: Agentation dev-only.** `bun add -d agentation`; in layout: `{process.env.NODE_ENV === "development" && <Agentation />}` (check the package README for the actual export name at install time; it renders nothing in production builds by the env gate regardless). Verify `bun run build` output contains no agentation code (`grep -ri agentation out/ → nothing`).
- [ ] **Step 3: Run visual review** (serve `out/` with `bunx serve out -l 4173` or equivalent), run matrix, compare against mockup hero/about/contact/footer. Fix deviations. Commit `git commit -m "add visual-check matrix and dev-only agentation"`.

## Task 8: CI + P1 gate  → **CHECKPOINT (b)**

**Files:**
- Create: `.github/workflows/ci.yml`, `e2e/smoke.spec.ts`, `playwright.config.ts`
- Modify: `CLAUDE.md` (Commands list is now real)

- [ ] **Step 1: CI workflow**

```yaml
name: ci
on:
  push: { branches: ["**"] }
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run typecheck
      - run: bun run lint
      - run: bun test
      - run: bun run build          # includes strip + budget gate
      - run: bunx playwright install --with-deps chromium
      - run: bunx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report }
```

Playwright config: `webServer: { command: "bunx serve out -l 4173", url: "http://localhost:4173" }` (add `serve` as dev-dep or use `python3 -m http.server` on CI). First smoke test:

```ts
// e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";
test("home renders with sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Bader Aljabri");
  for (const id of ["work", "play", "contact"]) await expect(page.locator(`#${id}`)).toBeAttached();
});
```

- [ ] **Step 2:** Run everything locally: `bun run typecheck && bun run lint && bun test && bun run build && bunx playwright test` → all green. Update CLAUDE.md Commands. Commit `git commit -m "add ci workflow and smoke test"`, push, confirm GitHub Actions + CF Pages check both green.
- [ ] **Step 3: /code-review** on the P1 diff; fix findings; verify budgets (`check-budget` output in build log).
- [ ] **STOP — checkpoint (b):** present preview URL (or the CF 522 dashboard issue + deployment deep-link), font-pick screenshots (D4), budget printout. Wait for Bader.

---

# Phase P2 — The Line

## Task 9: line-progress math (pure, TDD)

**Files:**
- Create: `src/lib/line-progress.ts`, `tests/line-progress.test.ts`

**Interfaces:**
- Produces: `buildWindows(heights: number[]): { start: number; end: number }[]` (cumulative-normalized, guards zero-total) · `segmentProgress(p: number, w: { start: number; end: number }): number` (clamped 0–1) · `pageProgress(scrollY: number, docH: number, viewH: number): number`.
- Consumed by: Task 10 island; segment order = [hero, demo, work, about, play, contact].

- [ ] **Step 1: Failing tests**

```ts
// tests/line-progress.test.ts
import { describe, expect, test } from "bun:test";
import { buildWindows, segmentProgress, pageProgress } from "../src/lib/line-progress";

describe("buildWindows", () => {
  test("normalizes cumulative heights", () => {
    expect(buildWindows([100, 300])).toEqual([
      { start: 0, end: 0.25 },
      { start: 0.25, end: 1 },
    ]);
  });
  test("zero total → all-drawn windows", () => {
    expect(buildWindows([0, 0])).toEqual([
      { start: 0, end: 0 },
      { start: 0, end: 0 },
    ]);
  });
});
describe("segmentProgress", () => {
  const w = { start: 0.25, end: 0.75 };
  test("clamps below/above", () => {
    expect(segmentProgress(0, w)).toBe(0);
    expect(segmentProgress(1, w)).toBe(1);
  });
  test("interpolates", () => expect(segmentProgress(0.5, w)).toBeCloseTo(0.5));
  test("degenerate window snaps", () => {
    expect(segmentProgress(0.1, { start: 0.5, end: 0.5 })).toBe(0);
    expect(segmentProgress(0.6, { start: 0.5, end: 0.5 })).toBe(1);
  });
});
describe("pageProgress", () => {
  test("0 at top, 1 at bottom, clamped", () => {
    expect(pageProgress(0, 2000, 800)).toBe(0);
    expect(pageProgress(1200, 2000, 800)).toBe(1);
    expect(pageProgress(9999, 2000, 800)).toBe(1);
  });
  test("unscrollable page is fully drawn", () => {
    expect(pageProgress(0, 500, 800)).toBe(1);
  });
});
```

- [ ] **Step 2:** run → FAIL. **Step 3: Implement:**

```ts
// src/lib/line-progress.ts
export interface Window { start: number; end: number }
export function buildWindows(heights: number[]): Window[] {
  const total = heights.reduce((a, b) => a + b, 0);
  if (total <= 0) return heights.map(() => ({ start: 0, end: 0 }));
  let acc = 0;
  return heights.map((h) => {
    const start = acc / total;
    acc += h;
    return { start, end: acc / total };
  });
}
export function segmentProgress(p: number, w: Window): number {
  if (w.end <= w.start) return p >= w.end ? 1 : 0;
  return Math.min(1, Math.max(0, (p - w.start) / (w.end - w.start)));
}
export function pageProgress(scrollY: number, docH: number, viewH: number): number {
  const scrollable = docH - viewH;
  if (scrollable <= 0) return 1;
  return Math.min(1, Math.max(0, scrollY / scrollable));
}
```

- [ ] **Step 4:** `bun test` PASS. **Step 5:** `git commit -m "add line progress math"`

## Task 10: TheLine SVG rails (server) + scrub controller

**Files:**
- Create: `src/components/TheLine.tsx`, `src/components/client/LineController.tsx`
- Modify: each section component (rail slot), `src/app/globals.css` (tick), `package.json` (`bun add motion`)

**Geometry — exact `d` strings from the canonical mockup (`throughline-v2-full.html` lines 53–162), one `<svg class="rail" data-line-seg="N" viewBox="0 0 1000 <H>" preserveAspectRatio="none">` per section:**

| seg | section | path(s) |
|---|---|---|
| 0 | hero | `M 520,0 C 520,100 46,70 46,170 L 46,300` |
| 1 | demo | `M 46,0 L 46,60 C 46,90 120,90 150,90` + `M 46,60 L 46,430` |
| 2 | work | `M 46,0 L 46,96 L 60,96 L 46,96 L 46,143 L 60,143 L 46,143 L 46,190 L 60,190 L 46,190 L 46,237 L 60,237 L 46,237 L 46,284 L 60,284 L 46,284 L 46,310` |
| 3 | about | `M 46,0 L 46,180` |
| 4 | play | `M 46,0 L 46,150` |
| 5 | contact | `M 46,0 L 46,90 C 46,120 90,120 130,120 L 434,120 C 452,120 452,96 436,96 C 420,96 424,120 446,120 L 470,120` + `<circle cx="482" cy="120" r="3">` (dot: opacity 0 → 1 when seg 5 ≥ 0.98) |

All paths `pathLength="100"`; base CSS from Task 2 sets dasharray/offset; reduced-motion CSS already forces offset 0. `<noscript><style>.rail path{stroke-dashoffset:0}.rail circle{opacity:1}</style></noscript>` in layout for the no-JS fallback.

**Interfaces:**
- Consumes: Task 9 functions.
- Produces: `<LineController>{children}</LineController>` (`"use client"`) wrapping all home sections in `page.tsx` with a `<div data-island="line">`; uses framer-motion's `useScroll()` (whole-page progress) and applies offsets in a single `scrollYProgress.on("change")` writer (motion batches to rAF): each seg's paths get `style.strokeDashoffset = String(100 - 100 * segmentProgress(p, windows[i]))`; windows from measured section `offsetHeight`s at mount + `ResizeObserver`; respects `useReducedMotion()` (render children untouched — CSS keeps rails fully drawn). Also exposes tick: `.line-tick` element absolutely positioned at rail x, `translateY` set on work-row hover (150 ms CSS transition — the ONLY other translating element).

- [ ] **Step 1: Implement controller** (`bun add motion` first — import from `"motion/react"`)

```tsx
// src/components/client/LineController.tsx
"use client";
import { useEffect, useRef } from "react";
import { useScroll, useReducedMotion } from "motion/react";
import { buildWindows, segmentProgress } from "@/lib/line-progress";

export function LineController({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return; // CSS owns the fully-drawn state
    const sections = [...root.current.querySelectorAll<HTMLElement>("[data-line-section]")];
    const segs = sections.map((s) => [...s.querySelectorAll<SVGPathElement>(".rail path")]);
    const dot = root.current.querySelector<SVGCircleElement>(".rail circle");
    let windows = buildWindows(sections.map((s) => s.offsetHeight));
    const ro = new ResizeObserver(() => {
      windows = buildWindows(sections.map((s) => s.offsetHeight));
      apply(scrollYProgress.get());
    });
    ro.observe(document.body);
    const apply = (p: number) => {
      segs.forEach((paths, i) => {
        const off = 100 - 100 * segmentProgress(p, windows[i]);
        paths.forEach((el) => (el.style.strokeDashoffset = String(off)));
      });
      if (dot) dot.style.opacity = segmentProgress(p, windows[windows.length - 1]) >= 0.98 ? "1" : "0";
    };
    apply(scrollYProgress.get());
    const unsub = scrollYProgress.on("change", apply);
    return () => { unsub(); ro.disconnect(); };
  }, [reduced, scrollYProgress]);

  return <div ref={root} data-island="line">{children}</div>;
}
```

- [ ] **Step 2: e2e**

```ts
test("line reaches 100% at scroll bottom", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const offsets = await page.$$eval(".rail path", (els) => els.map((e) => parseFloat((e as SVGPathElement).style.strokeDashoffset || "100")));
  for (const o of offsets) expect(o).toBeLessThanOrEqual(0.5);
});
test("reduced motion renders line fully drawn without js scrub", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const off = await page.$eval(".rail path", (e) => getComputedStyle(e).strokeDashoffset);
  expect(parseFloat(off)).toBe(0);
});
```

- [ ] **Step 3:** `bunx playwright test` PASS; `bun run build` budget still green. Commit `git commit -m "add scroll-scrubbed line rails"`.

## Task 11: One-time entrances + mobile rail

**Files:**
- Create: `src/components/client/Entrances.tsx` (only if logic beyond CSS is needed — prefer pure CSS)
- Modify: `src/app/globals.css`, `src/components/Hero.tsx`, `src/components/Contact.tsx`, `src/components/TheLine.tsx`

- [ ] **Step 1:** Name fade-up once on load: CSS `@keyframes rise { from { opacity: 0; transform: translateY(6px) } }` `.hero-name { animation: rise 300ms ease-out both }` — permitted as a one-time entrance (spec §6); killed by the reduced-motion `* { animation: none }` override. Email underline draw on first view: underline is part of seg 5's path — entrance handled by scroll scrub already (scrub is monotonic with scroll, acceptable per spec "scrubbed"). `Entrances` gates the name class if `sessionStorage.entered` set (no re-run on client-side revisits) — implement only if the pure-CSS `animation` re-runs objectionably on MPA navigation back to home.
- [ ] **Step 2: Mobile (§9.5):** at `max-width: 640px` rail x = 24 px: emit each section's SVG with a `--rail-x` translate… simplest faithful approach: two `viewBox` variants per segment (desktop `d` above; mobile simplified `d` with all x=46→24, curves collapsed to `L`), toggled by Tailwind `hidden sm:block` / `sm:hidden`. Fallback per spec: straight rail with ticks.
- [ ] **Step 3:** Run `scripts/visual-check.ts` full matrix (both viewports); verify: ticks align to (placeholder) work rows at 390 px; no content overlap; nothing translates but Line/tick. Commit `git commit -m "add entrances and mobile rail"`.

## Task 12: P2 gate

- [ ] `bun test && bun run build && bunx playwright test` all green; budget printout ≤ 80 KB; run **visual-review** (attach matrix paths); **/code-review**; fix findings; commit. No checkpoint — continue to P3.

---

# Phase P3 — The Demo  *(load the `session-script` skill before every task in this phase)*

## Task 13: SessionEvent schema (TDD)

**Files:**
- Create: `src/lib/session-script.ts`, `tests/session-script.test.ts`

**Interfaces:**
- Produces: `sessionEventSchema` (zod discriminated union on `kind`, spec §3 verbatim + optional `label?: string` on geometry per **D3**) · `sessionScriptSchema = z.array(sessionEventSchema).min(1)` with `.superRefine` asserting non-decreasing `t` and exactly one `done` (last) · `type SessionEvent = z.infer<...>`.

- [ ] **Step 1: Failing tests**

```ts
// tests/session-script.test.ts
import { describe, expect, test } from "bun:test";
import { sessionScriptSchema } from "../src/lib/session-script";

const ok = [
  { t: 0, kind: "prompt", text: "draft the rib" },
  { t: 800, kind: "thinking", text: "sampling…" },
  { t: 1200, kind: "tool_call", tool: "autocad", args: "draw_polyline(48 pts)" },
  { t: 1250, kind: "command_echo", text: "PLINE Specify start point: 0,0" },
  { t: 1300, kind: "geometry", op: "polyline", layer: "RIB-OUTLINE", params: [[30, 65], [128, 34]], drawMs: 2000 },
  { t: 3400, kind: "tool_result", text: "closed polyline · area 9 812 mm²" },
  { t: 4000, kind: "done", text: "rib drafted" },
];

describe("sessionScriptSchema", () => {
  test("accepts a valid script", () => {
    expect(sessionScriptSchema.parse(ok)).toHaveLength(7);
  });
  test("rejects unknown geometry op", () => {
    const bad = [{ ...ok[4], op: "spline" }, ok[6]];
    expect(() => sessionScriptSchema.parse(bad)).toThrow();
  });
  test("rejects decreasing t", () => {
    expect(() => sessionScriptSchema.parse([ok[1], { ...ok[0], t: 5000 }, ok[6]])).toThrow(/non-decreasing/);
  });
  test("rejects missing done", () => {
    expect(() => sessionScriptSchema.parse(ok.slice(0, 3))).toThrow(/done/);
  });
  test("geometry label optional (D3)", () => {
    const withLabel = [...ok.slice(0, 6), { t: 3500, kind: "geometry", op: "dim", layer: "DIMS", params: [[30, 100], [282, 100]], drawMs: 800, label: "180.00" }, { t: 4600, kind: "done", text: "x" }];
    expect(sessionScriptSchema.parse(withLabel)).toHaveLength(8);
  });
});
```

- [ ] **Step 2:** FAIL. **Step 3: Implement** (discriminated union; ops enum `["polyline","rect","circle","line","dim","centerline"]`; `params: z.array(z.array(z.number()))`; `drawMs: z.number().nonnegative()`; refine loops events checking `t[i] >= t[i-1]` else issue "t must be non-decreasing", and `events.at(-1)?.kind === "done"` with exactly one done else issue "script must end with a single done event"). **Step 4:** PASS. **Step 5:** `git commit -m "add session script schema"`

## Task 14: NACA 2412 geometry + wing-rib script generation

**Files:**
- Create: `src/lib/naca.ts`, `tests/naca.test.ts`, `scripts/generate-rib-geometry.ts`, `content/demo/wing-rib.json`, `tests/wing-rib-script.test.ts`

**Interfaces:**
- Produces: `naca2412(nPoints: number): { x: number; y: number }[]` — unit-chord closed outline, TE→upper→LE→lower→TE · the committed `wing-rib.json` (script is the artifact; generator is a dev tool, rerun manually).

- [ ] **Step 1: Failing tests**

```ts
// tests/naca.test.ts
import { expect, test } from "bun:test";
import { naca2412 } from "../src/lib/naca";
test("closed profile: first ≈ last", () => {
  const pts = naca2412(48);
  expect(Math.hypot(pts[0].x - pts.at(-1)!.x, pts[0].y - pts.at(-1)!.y)).toBeLessThan(1e-3);
});
test("max thickness ≈ 12% near 30% chord", () => {
  const pts = naca2412(200);
  const t = Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y));
  expect(t).toBeGreaterThan(0.115);
  expect(t).toBeLessThan(0.135);
});
test("camber positive (2%)", () => {
  const pts = naca2412(200);
  expect(Math.max(...pts.map((p) => p.y))).toBeGreaterThan(Math.abs(Math.min(...pts.map((p) => p.y))));
});
```

- [ ] **Step 2:** FAIL. **Step 3: Implement** standard NACA 4-digit equations (m=0.02, p=0.4, t=0.12, closed TE −0.1036 coefficient, cosine spacing).
- [ ] **Step 4: Generator** maps unit chord → viewport coords (chord 180 mm → x 30→282, y centered 65, y-down like the mockup's `viewBox 0 0 300 130`), then emits the full event list. Timeline (ms, 16 000 total + 2 000 hold — convention from `session-script` skill; transcript text and command echoes verbatim from `autocad-demo-v2.html`; event order per op: `tool_call → command_echo → geometry → tool_result`):

| t | events |
|---|---|
| 0–1280 | `prompt` "Draft the station-3 wing rib for the SAE aero build: NACA 2412, 180 mm chord, spar slots at 25% & 65%, lightening holes, dims." |
| 1600 | `thinking` "sampling NACA 2412 → 48 pts @ 180 mm" |
| 2080 | `tool_call` autocad `draw_polyline(layer: RIB-OUTLINE, pts: 48, close: true)` · `command_echo` "PLINE Specify start point: 0,0" · `geometry` polyline RIB-OUTLINE (48 pts) drawMs 2500 |
| 4700 | `tool_result` "closed polyline · area 9 812 mm²" |
| 5000 | `tool_call` `offset(dist: 3.2, side: inboard)` · `command_echo` "OFFSET Specify offset distance: 3.2" · `geometry` polyline (inner web, gray→layer RIB-OUTLINE at 40% — render note: inner offset strokes `#9aa3ad`) drawMs 1800 |
| 7000 | `tool_call` `rectang ×2(spar slots @ 25% / 65% chord)` · `command_echo` "RECTANG Specify first corner point: 45.0,-10.9" · 2× `geometry` rect RIB-CUTOUTS drawMs 700 each · `tool_result` "2 slots, snapped to camber line" |
| 9000 | `tool_call` `circle + arraypath(n: 5, ⌀ taper 18→6)` · `command_echo` "ARRAYPATH Select objects: 1 found" · 5× `geometry` circle RIB-CUTOUTS (staggered t, drawMs 500, radii 9/8/6.5/5/3 at stations along camber) · `tool_result` "5 lightening holes on RIB-CUTOUTS" |
| 11500 | `tool_call` `dimlinear / dimdia + centerline(layer: DIMS)` · `command_echo` "DIMLINEAR Specify first extension line origin:" · `geometry` centerline CENTER (camber axis + hole crosses, fade-in per skill: dash-dot NEVER dash-animates) · `geometry` dim DIMS `label: "180.00"` (x 30→282 at y 100, extension lines + arrows) drawMs 900 · `geometry` dim DIMS `label: "⌀18.0 TYP (5)"` (leader to hole 1) · `geometry` dim DIMS `label: "t=21.6"` |
| 15400 | `done` "Station-3 rib drafted — 15 entities · 4 layers · ready for DXF" |

- [ ] **Step 5: Script validation test** (this is the build-time gate spec §8 demands):

```ts
// tests/wing-rib-script.test.ts
import { expect, test } from "bun:test";
import { sessionScriptSchema } from "../src/lib/session-script";
import script from "../content/demo/wing-rib.json";
test("wing-rib script validates", () => {
  const events = sessionScriptSchema.parse(script);
  expect(events.at(-1)!.t).toBeLessThanOrEqual(16000);
  expect(events.filter((e) => e.kind === "geometry").length).toBeGreaterThanOrEqual(10);
});
```

- [ ] **Step 6:** all green → `git commit -m "add naca math and wing-rib session script"`

## Task 15: demo-state player core (pure, TDD)

**Files:**
- Create: `src/lib/demo-state.ts`, `tests/demo-state.test.ts`

**Interfaces:**
- Produces: `stateAt(events: SessionEvent[], t: number): DemoState` where

```ts
interface DemoState {
  promptChars: number;          // chars of prompt visible (typing 30ms/char, capped at text length)
  visibleEvents: number[];      // indices of non-prompt terminal events with event.t <= t
  geometry: { index: number; progress: number }[];  // progress = clamp((t - ev.t)/drawMs)
  commandLine: { history: string[]; current: string | null }; // last 1 echo in history row, current prompt row
  done: boolean;
  loopT(rawT: number, total: number, holdMs: number): number; // rawT % (total + holdMs), clamped to total during hold
}
```

- [ ] **Step 1: Failing tests** — typing progresses at 30 ms/char and caps; event visible iff `t ≥ event.t`; geometry progress 0 before, interpolated during, 1 after `drawMs`; `loopT(17000, 16000, 2000) === 16000` (hold) and `loopT(18500, 16000, 2000) === 500` (wrapped); `done` true only after done event. Write ~8 asserts against a 5-event fixture.
- [ ] **Step 2:** FAIL. **Step 3:** implement (pure functions, no DOM). **Step 4:** PASS. **Step 5:** `git commit -m "add demo player state core"`

## Task 16: Demo frame markup — ClaudePane + AutocadWindow + FinalFrame

**Files:**
- Create: `src/components/demo/{DemoFrame,ClaudePane,AutocadWindow,FinalFrame}.tsx`
- Modify: `src/components/DemoSection.tsx` (replace placeholder)

Fidelity ground truth = `docs/superpowers/specs/mockups/autocad-demo-v2.html` (read it in full first) + the chrome checklist in the `session-script` skill. Server-renders **the final frame state** (every transcript line, completed drawing) so no-JS shows the finished session; the island rewinds and plays.

- [ ] **Step 1: ClaudePane** — window chrome (traffic dots, `claude — ~/claude-autocad`), `✻ claude-autocad-mcp connected · 14 tools`, transcript list rendered from the script events (server maps events → lines: `>` prompt, italic gray `✻ Thinking…` (pulsing ✻), `⏺` orange `#d97757` `autocad — tool(args)`, `⎿` gray results, green `#4be38a` ✓ done), bordered input box + blinking cursor, `claude-autocad-mcp ✓ · ? for shortcuts` footer. Every line carries `data-ev="<index>"` so the island can show/hide.
- [ ] **Step 2: AutocadWindow** — per checklist: title bar (`Autodesk AutoCAD 2026 — SAE-Rib-Station3.dwg`) + QAT icons · ribbon tabs (Home active: Draw/Modify/Annotation/Layers panels, icon glyphs as inline SVGs) · file tabs (`Start | SAE-Rib-Station3* ×`) · model space `#212830` (both themes) with minor/major grid (repeating-linear-gradients) · crosshair + pickbox · dynamic-input tooltip (`data-ev`-bound) · ViewCube (TOP) · UCS icon · command line: history row + current prompt row, both `data-cmd` targets · Model/Layout tabs · status bar `142.5027, 63.8214, 0.0000` + `MODEL GRID SNAP ORTHO POLAR OSNAP LWT 1:1`, active toggles `#4a90d9`. Drawing `<svg>` renders geometry events as elements keyed `data-ev`, `pathLength="100"`, layer colors from the skill table (RIB-OUTLINE `#f0f0f0`, RIB-CUTOUTS `#00ffff`, CENTER `#ff4d4d` dash-dot `stroke-dasharray:6 2 1.5 2` + fade-in class, DIMS `#ffd21f` incl. extension lines/arrowheads/label `<text>`).
- [ ] **Step 3: DemoFrame** — hairline border, `#0a0d12` gutter, faint IKB glow shadow (`0 8px 40px -8px oklch(.45 .17 262 / .18)`), root `data-island="demo"`; the section (server) does `import script from "@/../content/demo/wing-rib.json"`, validates with `sessionScriptSchema.parse` at render (build) time, and passes the parsed events to both the server-rendered final frame and `<DemoPlayer events={...}>`; replay button `↺` absolute bottom-right opacity-0 → hover opacity-1 (color-only transition), caption + `full project ↗` link to `/projects/claude-autocad/`. Section label `01 — currently drafting` + amber chip.
- [ ] **Step 4:** `bun run build`; serve; final frame renders complete and identical-ish to mockup t=17s screenshot; both themes (viewport stays `#212830`). Commit `git commit -m "add demo frame markup at final state"`.

## Task 17: DemoPlayer client component

**Files:**
- Create: `src/components/client/DemoPlayer.tsx`
- Modify: `src/app/globals.css` (blink/pulse keyframes)

**Interfaces:**
- Consumes: `stateAt`, `loopT`, `SessionEvent[]` via props (already validated server-side), Task 16 `data-ev`/`data-cmd` DOM contract (the player manipulates the server-rendered frame through a ref — it renders no drawing markup itself, keeping server HTML = final frame for no-JS).
- Produces behavior: on mount, if `useReducedMotion()` leave final frame and show play button (click = one full play, no loop) → else rewind (hide all `data-ev`, dashoffset 100) and drive rAF: `state = stateAt(events, loopT(now - start, 16000, 2000))`, apply diffs (prompt substring, line visibility, `strokeDashoffset`, centerline fade class, command rows, dynamic-input tooltip). IntersectionObserver (threshold 0.35): out → cancel rAF (freeze), in → resume. Replay button click → `start = now`. Loop reset happens during the 2 s hold (opacity fade 150 ms, then rewind — no flash). Dev-only: honors a `data-t` attribute set on the frame to seek to a fixed ms (used by the P3 side-by-side).

- [ ] **Step 1:** implement component (~140 lines; all state math already tested — the component is pure DOM application via refs, `useEffect` for observer/rAF lifecycle).
- [ ] **Step 2: e2e**

```ts
test("demo plays in view, pauses off-screen, loops", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-island="demo"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const chars = await page.locator("[data-prompt]").textContent();
  expect(chars!.length).toBeGreaterThan(10);        // typing progressed
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  const a = await page.locator("[data-prompt]").textContent();
  await page.waitForTimeout(700);
  expect(await page.locator("[data-prompt]").textContent()).toBe(a); // frozen
});
test("reduced-motion shows final frame + play button", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator('[data-island="demo"] [data-done]')).toBeVisible();
  await expect(page.locator('[data-island="demo"] [data-play]')).toBeVisible();
});
```

- [ ] **Step 3:** green; budget check (script events ride the RSC payload — watch total stays ≤ 180 KB). Commit `git commit -m "add demo player component"`.

## Task 18: P3 gate → **CHECKPOINT (c)**

- [ ] Run full suite + build + budget. Run visual-review matrix. Then the side-by-side: serve mockups (`python -m http.server` on `docs/superpowers/specs/mockups` **with UTF-8 handler** — plain http.server serves mojibake; reuse the session's `serve_mockups.py` approach) and the built site; screenshot demo at matched loop timestamps (seek mockup CSS animations via `document.getAnimations()`, seek site demo via exposed `data-t` debug attribute the island honors in dev) at t = 3 s / 8 s / 13.5 s / 17 s; compose side-by-side images.
- [ ] **/code-review** the P3 diff; fix findings.
- [ ] **STOP — checkpoint (c):** present side-by-sides + loop videos if useful. Wait for Bader's demo-parity sign-off.

---

# Phase P4 — Content

## Task 19: projects.ts hardening (tests for existing loader)

**Files:**
- Create: `tests/projects.test.ts` (+ fixtures `tests/fixtures/projects/*`)
- Modify: `src/lib/projects.ts` (accept `dir` param for testability: `getAllProjects(dir = CONTENT_DIR)`)

- [ ] **Step 1: Failing tests** — hue defaults by status (in-draft→60, active→155, shipped→240, ongoing→300); explicit hue wins; draft excluded; sorted by order; invalid frontmatter throws with file path in message; missing links ok; bad URL rejected. Use fixture dirs with minimal index.mdx files.
- [ ] **Step 2–4:** FAIL → implement (small refactor) → PASS. **Step 5:** `git commit -m "test and harden project loader"`

## Task 20: Five project entries

**Files:**
- Create: `content/projects/{watstreet-volatility,watarrow-portal,startup-lab-marketplace,patterned-ai}/index.mdx`
- Modify: `content/projects/claude-autocad/index.mdx` (real prose, drop spike note)

- [ ] Frontmatter per the mockup index rows: claude-autocad "Claude × AutoCAD — drafting agent" 2026 in-draft order 1 · watstreet-volatility "WatStreet — volatility contagion (GAT)" 2026 active order 2 · watarrow-portal "WatArrow — SAE aero member portal" 2025 shipped order 3 · startup-lab-marketplace "StartUp Lab — consulting marketplace" 2026 active order 4 · patterned-ai "Patterned AI — pattern tooling" year 2026 status ongoing order 5 (index row shows the literal text `work` in the year column for ongoing-work rows — render rule in Task 21, not schema). Prose: 2–4 short paragraphs each, links where public. Build fails on any schema violation (already wired). Commit `git commit -m "add five project entries"`.

## Task 21: Work index — rows, chips, glows, tick

**Files:**
- Create: `src/components/WorkIndex.tsx`, `src/components/StatusChip.tsx`
- Modify: `src/app/page.tsx`, `src/components/client/LineController.tsx` (tick hover), `src/app/globals.css`

- [ ] **Step 1:** `StatusChip({ status, hue })` → `<span class="chip" style="--h:{hue}">{status label}</span>` (label text: `in draft` for in-draft, else status verbatim). `WorkIndex` maps `getAllProjects()`: number `01…`, name (weight 500), year (or `work` when ongoing), chip; row = `<a href="/projects/{slug}/">` with `border-bottom: 1px solid var(--hairline)`; hover glow `background: radial-gradient(ellipse 70% 130% at 8% 50%, oklch(.74 .14 var(--h) / .13), transparent 70%)` via `.idxrow:hover` (color-only, 150 ms); row exposes `data-row-index` for the tick.
- [ ] **Step 2:** tick behavior in line island: on row `mouseenter`, set `.line-tick` `transform: translateY(<rowCenter>px)`; CSS `transition: transform 150ms ease`. e2e: hovering row 3 moves tick; assert `getComputedStyle` transform changes; nothing else on the page translates (spot-check two hover targets' computed transform = none).
- [ ] **Step 3:** e2e “project pages build for every collection entry”:

```ts
test("every index row navigates to a built page", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.$$eval("#work a[href^='/projects/']", (as) => as.map((a) => (a as HTMLAnchorElement).pathname));
  expect(hrefs.length).toBe(5);
  for (const h of hrefs) {
    const res = await page.goto(h);
    expect(res!.status()).toBe(200);
  }
});
```

- [ ] **Step 4:** green + visual-review rows/chips vs mockup in both themes. Commit `git commit -m "add work index with chips glows and tick"`.

## Task 22: Project page layout + static rail

**Files:**
- Modify: `src/app/projects/[slug]/page.tsx`
- Create: none (uses `TheLine` static variant: prop `static` renders a short fully-drawn rail, no island mount)

- [ ] Title (36 px weight 200), StatusChip + year, prose (MDX, max 65ch, weight 300 line-height 1.8), links row (`github ↗ live ↗ writeup ↗` — only those present), back link `← index`. Short static rail on the left for continuity (spec §4: no scroll scrubbing here). Verify all 5 pages in export; visual pass; commit `git commit -m "add project page layout"`.

## Task 23: Playground registry + Play section

**Files:**
- Create: `src/playground/registry.ts`, `tests/registry.test.ts`
- Modify: `src/components/Play.tsx` (replace placeholder)

- [ ] **Step 1: Failing test** — registry entries match `{ slug, name, status: "runnable" | "wip" | "shipped", hue, href }`; reserved slot NOT in registry (design element rendered by component); slugs unique.
- [ ] **Step 2–3:** implement registry with the three mockup entries: `tile-pattern` "tile → pattern ↗" hue 300 href (Bader supplies URL; placeholder `#` fails the test — use real links or omit href → renders unlinked) · `attention-visualizer` "attention visualizer" wip hue 155 · `whisper-live` "whisper live ↗" hue 240. Play section: text links with 1.5 px hue underlines (`border-bottom: 1.5px solid oklch(.6 .16 var(--h))`), `wip` mono tag, then the dashed `next experiment — reserved` slot at 40% opacity, always last.
- [ ] **Step 4:** green; commit `git commit -m "add playground registry and play section"`.

## Task 24: P4 gate

- [ ] Full suite + build + budget + visual-review matrix (rows/chips/glows/tick both themes, mobile) + **/code-review**; fix; commit. Continue.

---

# Phase P5 — Polish & launch

## Task 25: OG images in Throughline language

**Files:**
- Modify: `src/app/projects/[slug]/opengraph-image.tsx`
- Create: `src/app/opengraph-image.tsx`

- [ ] Restyle: paper bg, halftone dot block (render dots as absolutely-positioned divs from `halftoneDots(fixed seed)` — Satori has no canvas), IKB line element, name/title weight 200, status chip colors for project OGs. Home OG: name + "Software for drawing, trading, and flying." Verify PNGs in `out/` visually. Commit `git commit -m "restyle og images"`.

## Task 26: SEO — sitemap, robots, metadata, favicon

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`
- Modify: `src/app/layout.tsx` (canonical, OpenGraph/Twitter meta), `src/app/favicon.ico` (replace template icon with a 3px-dot-on-paper mark)

- [ ] `sitemap.ts`: home + 5 project pages + colophon from `getAllProjects()` (works under static export; verify `out/sitemap.xml` exists after build — if export rejects the route, emit both files from a 20-line build script appended to the build chain instead). Meta: title template `%s — Bader Aljabri`, description, OG defaults. Commit `git commit -m "add sitemap robots and metadata"`.

## Task 27: 404 + colophon

**Files:**
- Create: `src/app/not-found.tsx`, `src/app/colophon/page.tsx`

- [ ] 404: the Line draws "404" — single SVG path spelling 404 in the rail style, fully drawn (no scrub), `flat-line` gag caption optional (`the line flatlined. — back to index`). Colophon: how it's built — stack list, the Line (one path, scroll-scrubbed), the demo (session-script replayer), budgets table, link to source. Both pages export statically (`out/404.html` — Next maps not-found to 404.html; CF Pages serves it natively). Commit `git commit -m "add 404 and colophon"`.

## Task 28: Full Playwright suite + theme persistence

**Files:**
- Modify: `e2e/smoke.spec.ts` (ensure the complete §8 list is present)

- [ ] Final checklist as tests (most exist from earlier tasks — fill gaps): home renders ✓(T8) · line 100% at bottom ✓(T10) · demo loops/pauses ✓(T17) · reduced-motion static ✓(T10/17) · **theme toggle persists across reload** (new: click toggle → `expect(html).toHaveClass(/dark/)` → `page.reload()` → still dark) · project pages for every entry ✓(T21). All green in CI. Commit `git commit -m "complete e2e suite"`.

## Task 29: Performance budgets — Lighthouse + LCP/CLS evidence

**Files:**
- Modify: `.github/workflows/ci.yml` (lighthouse job), `package.json`

- [ ] Add `@lhci/cli` dev-dep; CI job: build → `lhci autorun --collect.staticDistDir=out --collect.numberOfRuns=3 --assert.assertions.categories:performance=0.95 --assert.assertions.categories:accessibility=0.95 --assert.assertions.categories:best-practices=0.95 --assert.assertions.categories:seo=0.95` (lhci config file `lighthouserc.json`). Local evidence run: Lighthouse with Fast-3G throttle → record LCP < 1.5 s, CLS = 0; attach report to the checkpoint message. Fix regressions (typical: font swap flash → ensure metric-compatible fallback via `next/font` `adjustFontFallback`, image sizing, preload hero-critical only). Commit `git commit -m "add lighthouse ci gate"`.

## Task 30: Launch prep → **CHECKPOINT (d) — pre-merge, Bader-owned cutover**

- [ ] Final `verification-before-completion`: run every command (`typecheck · lint · bun test · build (budget) · playwright · lhci`), paste outputs. Full visual-review matrix attached. **/code-review** on the whole branch.
- [ ] Write the cutover runbook into the PR description (not executed by Claude): CF Pages `personal-website` → confirm build command `bun run build`, output `out/`; merge `redesign/throughline` → `main` deploys production; DNS untouched (already on Pages); pages.dev 522 issue status.
- [ ] **STOP.** Present PR + runbook. Merge and DNS/production are Bader's alone.

---

## Self-review notes (done at write time)

- Spec coverage: §2 sections/order→T5/16/21/23; color system→T2; halftone→T4/5; §3 fidelity+schema+behavior→T13–17; §4 routes/content→T20–22 (+colophon/404 T27); §5 stack→T1 (D1/D2 amendments flagged); §6 motion rules→T2/10/11/17 + visual-review gates; §7 budgets→T1 gate + T29; §8 testing→T8/13/14/21/28; §9 resolved→constants/T6; §10 phases→P1–P5. Gap check: none found; §9.1 (stack-reference license) moot — nothing copied.
- Types cross-check: `stripNextScripts`/`firstLoadJsPaths`/`buildWindows`/`segmentProgress`/`pageProgress`/`stateAt`/`loopT`/`halftoneDots`/`dateSeed`/`naca2412` names consistent everywhere they appear.
- No placeholder scan: every code step carries real code; markup tasks carry exact fidelity checklists + canonical source references (in-repo mockups), which the executing skills (`session-script`, `visual-review`) enforce.
