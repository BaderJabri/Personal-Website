# BaderJabri.ca — project rules for Claude

## What this repo is

Bader's personal website. **`main` = the live old site** (Cloudflare Pages → BaderJabri.ca).
**`redesign/throughline` = ground-up rebuild** per the approved spec. During rebuild P1 the
old site code (`app/`, `components/`, `styles/`, old configs) is deleted on this branch —
always keep `public/Bader-Aljabri-2025.pdf`, `docs/`, `.claude/`, and this file.

## The contract

- **Spec (non-negotiable §2 §3 §6 §7):** `docs/superpowers/specs/2026-07-03-throughline-redesign-design.md`
- **Canonical mockups:** `docs/superpowers/specs/mockups/` — `throughline-v2-full.html` (site),
  `autocad-demo-v2.html` (demo). The 16s animation timer stands in for scroll scrubbing.
- **Kickoff prompt for the build session:** `docs/kickoff-prompt.md`

## Commands (post-scaffold — update this list when they exist)

- `bun install` · `bun dev` · `bun run build` (static export → `out/`) · `bun test`
- `bun scripts/visual-check.ts` — screenshot matrix; run before any visual sign-off

## Non-negotiables

- Static export only (`output: 'export'`). No server runtime, no forms.
- Budgets are merge gates: ≤ 180KB gz first-load JS (amended 2026-07-03 from 80KB — Next 16
  baseline is 148.7KB; Bader chose standard runtime over runtime-strip) · LCP < 1.5s throttled ·
  CLS 0 · Lighthouse ≥ 95.
- Motion: the Line and its tick are the ONLY translating elements; everything else is
  150ms color-only transitions. `prefers-reduced-motion` (line fully drawn, demo final
  frame) is a first-class path built alongside, never after.
- Demo fidelity per spec §3. **Load the `session-script` skill before touching anything
  inside the demo frame.**
- Content scope: projects collection + playground registry ONLY. No notes, no blog, no tags.

## Design tokens (quick ref — source of truth is spec §2)

- Paper `#fcfcfa` / `#0a0a0b` · ink `#17171a` / `#f0ebe3` · Line `#002fa7` / `#4d6bff` (+ glow in dark).
- Chips, one hue per status: dark = text `oklch(.74 .14 H)`, bg `/0.094`, border `/0.188`;
  light = text `oklch(.45–.5 .13 H)`, bg `/0.1`, border `/0.3`.
  Hues: in-draft 60 · active 155 · shipped 240 · ongoing 300.
- AutoCAD viewport is always `#212830`, both themes.

## Workflow

- Superpowers flow: writing-plans → execute; TDD for logic (session-script parsing,
  frontmatter zod, line scroll math); verification-before-completion before "done" claims;
  `/code-review` at each phase end.
- **Visual changes require the `visual-review` skill** — Playwright screenshots across
  scroll depths, themes, and reduced-motion; compare against the mockups.
- Agentation is wired dev-only. When Bader pastes an annotation block, its selectors and
  element paths are ground truth for what he means.
- Checkpoints (stop and wait for Bader): implementation-plan approval · P1 preview URL ·
  P3 demo parity with mockup · before any merge to `main`.

## Facts

- Contact email: `Baderjabri.15@gmail.com` (mailto + copy chip in contact section).
- Resume: quiet `resume ↗` among contact links → PDF in `public/` (currently
  `Bader-Aljabri-2025.pdf`; Bader will replace the file — keep the link one-place-to-update).
- Hosting: Cloudflare Pages. Branch pushes = preview URLs; `main` = production/DNS.

## What NOT to do

- **No `Co-Authored-By` lines in commits.** Small, imperative, plain messages.
- Never merge to `main` or touch DNS/production without Bader's explicit go.
- Reference repos/sites inform only the aspect Bader names — never import their features.
- No dependencies beyond the spec's stack list without asking (no shader libs, no icon
  packs, no smooth-scroll, no CMS).
- Don't commit `out/`, `screenshots/`, or `.playwright-mcp/`.
