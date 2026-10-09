# BaderJabri.ca — project rules for Claude

## What this repo is

Bader's personal website. **`main` = the live old site** (Cloudflare Pages → BaderJabri.ca).
**`redesign/throughline` = ground-up rebuild** per the approved spec. During rebuild P1 the
old site code (`app/`, `components/`, `styles/`, old configs) is deleted on this branch —
always keep `public/Bader-Aljabri-Resume.pdf`, `docs/`, `.claude/`, and this file.

## The contract

- **Current design (v1, 2026-10-01):** `docs/superpowers/specs/2026-10-01-v1-design.md` — multi-page,
  interactive, not CAD-themed. Bader set this direction himself; it supersedes the Throughline
  spec's §2 (visual language) and §6 (motion rules).
- **Still binding from** `2026-07-03-throughline-redesign-design.md`: §3 demo schema, §7 budgets,
  static export, contact facts. The Throughline mockups in `docs/superpowers/specs/mockups/` are
  history, not targets.

## Commands (post-scaffold — update this list when they exist)

- `bun install` · `bun dev` · `bun run build` (static export → `out/`, then
  `scripts/flatten-segments.ts` fixes Next 16's prefetch file names, then the budget gate) · `bun test`
- `bun run format` (Prettier, width 120) · `bun run format:check` runs in CI; `content/`, `docs/`, `public/` and
  Markdown are ignored on purpose (generators write one JSON entry per line)
- `bun run e2e` / `npx playwright test` — run from `C:/Users/Bader-A/Code/Personal-Website` (capital C,
  the real folder name); from the lowercase path Playwright loads twice and finds no tests
- `bun scripts/generate-rib-script.ts` regenerates `content/demo/wing-rib.json` (commit the JSON)
- `bun scripts/fetch-puzzles.ts` rebuilds `content/chess/puzzles.json` from a ~9 MB slice of the Lichess
  puzzle database (CC0); every puzzle is replayed through `src/lib/chess/engine.ts` (perft-tested)
- `bun run visual-check` — screenshot matrix (runs via node; direct `bun scripts/visual-check.ts` hangs on Windows); run before any visual sign-off
- Showreel (standalone, not in the site bundle): open `showreel/reel.html` to preview/scrub;
  `node showreel/render.mjs --ffmpeg <ffmpeg w/ libx264> [--webm]` → `showreel/out/` (gitignored);
  `--stills 1,4.5,…` for PNG stills without ffmpeg

## Non-negotiables

- Static export only (`output: 'export'`). No server runtime, no forms.
- Budgets are merge gates: ≤ 180KB gz first-load JS (amended 2026-07-03 from 80KB — Next 16
  baseline is 148.7KB; Bader chose standard runtime over runtime-strip) · LCP < 1.5s throttled ·
  CLS 0 · Lighthouse ≥ 95.
- Motion: every animation and interaction has a reduced-motion path built alongside it, and
  none may move layout (CLS measured 0.0000 — keep it there; pin sizes, animate transforms).
  The background dot field must stay subtle: low alpha, throttled when idle.
- **Load the `session-script` skill before touching anything inside the demo frame.**
- Content scope: projects (`content/projects/`), experience (`src/lib/experience.ts`), chess puzzles
  (`content/chess/puzzles.json`). No notes, no blog, no tags. Every number must come from the résumé,
  a README, the geometry generator, or the Lichess data — plus GitHub for Whisper4Windows stars and
  installer downloads (Bader, 2026-10-08), written as floors ("50+", "1,700+") so they don't go stale.

## Design tokens (quick ref — source of truth is the v1 design doc and `src/app/globals.css`)

- Paper `#f3f4f1` / `#101317` · ink `#15181c` / `#e7e9eb` · pencil `#50565e` / `#9aa2ab` ·
  accent `#00707f` / `#5fd4e0` (one accent). Radius 2px.
- Mona Sans (variable width) everywhere; B612 Mono only inside the replay and drawings.
- The replay keeps AutoCAD's colours (model space `#212830`) in both themes.

## Workflow

- Superpowers flow: writing-plans → execute; TDD for logic (session-script parsing,
  frontmatter zod, line scroll math); verification-before-completion before "done" claims;
  `/code-review` at each phase end.
- **Visual changes require the `visual-review` skill** — Playwright screenshots across
  scroll depths, themes, and reduced-motion. Its Line/chip criteria are from the old design;
  judge against the v1 design doc instead.
- Frontend design work uses the `taste-skill` (installed in `.claude/skills/` at Bader's request).
- Agentation is wired dev-only. When Bader pastes an annotation block, its selectors and
  element paths are ground truth for what he means.
- Checkpoints (stop and wait for Bader): implementation-plan approval · P1 preview URL ·
  P3 demo parity with mockup · before any merge to `main`.

## Facts

- Contact email: `Baderjabri.15@gmail.com` (mailto + copy chip in contact section).
- Resume: quiet `resume ↗` among contact links → PDF in `public/` (currently
  `Bader-Aljabri-Resume.pdf`; Bader will replace the file — keep the link one-place-to-update).
- Hosting: Cloudflare Pages. Branch pushes = preview URLs; `main` = production/DNS.

## What NOT to do

- **No `Co-Authored-By` lines in commits.** Small, imperative, plain messages.
- Never merge to `main` or touch DNS/production without Bader's explicit go.
- Reference repos/sites inform only the aspect Bader names — never import their features.
- No dependencies beyond the spec's stack list without asking (no shader libs, no icon
  packs, no smooth-scroll, no CMS).
- Don't commit `out/`, `screenshots/`, or `.playwright-mcp/`.
