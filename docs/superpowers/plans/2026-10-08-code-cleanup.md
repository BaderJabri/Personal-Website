# Code Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove leftovers from three design iterations, de-duplicate logic, put the stylesheet in order and move the home page onto Tailwind, without changing how any page looks except where noted.

**Architecture:** Every change is either a deletion, a move into an existing shared module (`src/lib/drawing.ts`, `src/lib/chess/*`, `src/components/Footer.tsx`, project frontmatter), or a CSS restructuring. A pixel-parity harness (Playwright screenshots captured before any change) gates every task that can affect rendering.

**Tech Stack:** Next 16 static export · React 19 · Tailwind 4 · zod 4 · Bun (unit tests) · Playwright (e2e and parity) · Prettier 3 (new, approved by Bader on 2026-10-08)

**Spec:** the findings from the 2026-10-07 code-quality analysis (summarised in Context below). The design contract is still `docs/superpowers/specs/2026-10-01-v1-design.md`.

## Context

A deep review of `codex/compact-portfolio` found:
- About 470 lines of dead code: `DotField`, `CountUp`, `LocalTime`, `MailIcon`, roughly 170 lines of CSS for removed features, unused props, two unused images, and three résumé PDFs.
- Duplicated logic: the puzzle type is declared three times, `og.tsx` repeats the drawing path helpers, the chess board markup appears twice, and the piece-colour check is repeated.
- Project-specific `slug ===` checks spread across components.
- A 910-line `globals.css` that has been appended to rather than organised.
- Two styling systems: `.home-*` CSS on the home page, Tailwind everywhere else.
- Stale docs.

While planning, I confirmed that the custom classes in `globals.css` are compiled outside Tailwind's layers (verified in `out/_next/static/chunks/*.css`), so they override utilities. As a result, the `h-9 px-3 text-[13px]` sizing on the chess and pattern buttons has never rendered.

Bader's decisions (2026-10-08):
- Keep only `Bader-Aljabri-Resume.pdf`.
- Convert the home page to Tailwind.
- Add Prettier.
- I commit the current uncommitted work first, as the baseline.

## Global Constraints

- Static export only (`output: 'export'`). No server runtime.
- First-load JS ≤ 180 KB gz on every page (`bun run build` enforces it). CLS stays 0.
- Every animation keeps its reduced-motion path. Nothing may move layout.
- No new dependencies beyond Prettier.
- Commit messages are small, imperative and plain. **No `Co-Authored-By` lines.** Stage explicit paths and never use `git add -A`, because the parity harness lives in the gitignored `screenshots/`.
- Load the `session-script` skill before touching anything inside the demo frame (`Drawing.tsx`, `DemoFrame.tsx`, `drawing.ts`).
- Visual changes need the `visual-review` skill, judged against the v1 design doc.
- Run Playwright from `C:/Users/Bader-A/Code/Personal-Website` (capital C).
- Never push, merge to `main`, or touch DNS. Stop for Bader at the end.

## Review Focus

1. Keyboard focus on the converted home elements (focus outline and radius on "View my projects", the chess summary, and nav links) must look as it does now. Task 7 adds a manual tab-through step.
2. The home page with JavaScript disabled must render fully: the chess disclosure opens natively and nothing stays hidden. The parity harness adds no-JS shots of `/` and `/projects/` (Task 0).
3. Dark-theme hover on the home projects button (`color-mix` background) must match. The harness hover shot runs in both themes (Task 0).
4. The social-card PNGs must still show the rib after the path-helper refactor. Task 4 includes a before/after image comparison.
5. Prettier must not touch generated or authored content: the one-entry-per-line JSON written by the generators, the MDX, and the docs. Task 1 includes an ignore list and a check that `content/` is unchanged.

---

### Task 0: Preconditions, baseline commits, parity harness

**Files:** Create (gitignored, never committed): `screenshots/parity/parity.config.ts`, `screenshots/parity/parity.spec.ts`. Copy this plan to `docs/superpowers/plans/2026-10-08-code-cleanup.md`.

- [ ] **Step 1: Confirm nothing else is editing the tree.** Another agent edited demo files until 17:37 on 10-07 and something rebuilt `out/` at 22:18. Ask Bader to confirm it has stopped, then check that `find src scripts tests e2e content docs -newermt "-30 minutes" -type f` prints nothing.
- [ ] **Step 2: Copy this plan** to `docs/superpowers/plans/2026-10-08-code-cleanup.md`.
- [ ] **Step 3: Verify the current tree is green.** Run `bun run typecheck && bun run lint && bun test && bun run build && bun run e2e`. If anything fails, stop and report it to Bader. Don't fix it inside the baseline.
- [ ] **Step 4: Commit the existing work as three baseline commits,** staging explicit paths:
  1. `add standalone showreel`: `showreel/`, `.gitignore`, `CLAUDE.md`. The CLAUDE.md diff is only the showreel commands.
  2. `redraw the wing rib with ordinate dimensions and tagged leaders`: `content/demo/wing-rib.json`, `scripts/generate-rib-script.ts`, `src/lib/drawing.ts`, `src/lib/session-script.ts`, `src/components/demo/Drawing.tsx`, `src/components/demo/DemoFrame.tsx`, `src/components/work/RibSheet.tsx`, `tests/drawing.test.ts`, `tests/wing-rib-script.test.ts`, `.claude/skills/session-script/SKILL.md`.
  3. `compact home, contour background, self-hosted fonts, dwg download and copy revision`: everything else that is modified or untracked, including `src/app/fonts/`, `scripts/optimize-font.py`, `public/downloads/`, `public/FD-Resume.pdf`, `docs/site-revision.md`, `docs/compact-portfolio.md` and the plan copy. Run `git status` afterwards and confirm the tree is clean.
- [ ] **Step 5: Write the parity harness.** These files live in the gitignored `screenshots/`.

`screenshots/parity/parity.config.ts`:
```ts
process.env.PLAYWRIGHT_BROWSERS_PATH ??= "0";

import { defineConfig } from "@playwright/test";

// Pixel-parity guard for the cleanup. Not committed (screenshots/ is gitignored).
export default defineConfig({
  testDir: ".",
  testMatch: "parity.spec.ts",
  snapshotPathTemplate: "{testDir}/snapshots/{arg}{ext}",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://localhost:4174" },
  webServer: { command: "node scripts/serve-out.mjs 4174", cwd: "../..", url: "http://localhost:4174", reuseExistingServer: false },
});
```
`screenshots/parity/parity.spec.ts`:
```ts
import { expect, test, type Browser } from "@playwright/test";

const ROUTES = ["/", "/projects/", "/experience/", "/projects/claude-autocad/", "/projects/tile-to-pattern/", "/projects/whisper4windows/", "/projects/plotit/", "/nowhere/"];
const name = (route: string) => route.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "home";
const shot = { fullPage: true, animations: "disabled" } as const;

// Reduced motion makes contours, reveals and the replay deterministic. The reload means
// font-display: optional always finds the fonts cached.
async function open(browser: Browser, route: string, opts: Parameters<Browser["newContext"]>[0]) {
  const ctx = await browser.newContext({ reducedMotion: "reduce", ...opts });
  const page = await ctx.newPage();
  const fontsReady = () => page.evaluate(() => document.fonts.ready).catch(() => {}); // no-op without JS
  await page.goto(route);
  await fontsReady();
  await page.reload();
  await fontsReady();
  return { ctx, page };
}

// Titles start with the page name ("home 320 light") so `-g home` re-baselines one page.
for (const colorScheme of ["light", "dark"] as const) {
  for (const width of [320, 390, 1280]) {
    for (const route of ROUTES) {
      test(`${name(route)} ${width} ${colorScheme}`, async ({ browser }) => {
        const { ctx, page } = await open(browser, route, { viewport: { width, height: 900 }, colorScheme });
        await expect(page).toHaveScreenshot(`${name(route)}-${width}-${colorScheme}.png`, shot);
        await ctx.close();
      });
    }
  }
  test(`home, chess open, projects link hovered, ${colorScheme}`, async ({ browser }) => {
    const { ctx, page } = await open(browser, "/", { viewport: { width: 1280, height: 900 }, colorScheme });
    await page.locator("main details > summary").click();
    await page.locator(".chess-board [role=gridcell]").first().waitFor();
    await page.getByRole("link", { name: /View my projects/ }).hover();
    await expect(page).toHaveScreenshot(`home-open-hover-${colorScheme}.png`, shot);
    await ctx.close();
  });
}

for (const route of ["/", "/projects/"]) {
  test(`${name(route)} without JavaScript`, async ({ browser }) => {
    const { ctx, page } = await open(browser, route, { viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    await expect(page).toHaveScreenshot(`${name(route)}-nojs.png`, shot);
    await ctx.close();
  });
}
```
- [ ] **Step 6: Capture the baseline and prove it is stable.** With `out/` from Step 3, run `npx playwright test -c screenshots/parity/parity.config.ts --update-snapshots`, then run the same command twice without `--update-snapshots`. Expected: all 52 tests pass both times. If a shot is flaky, add `maxDiffPixelRatio: 0.0005` to `shot` and re-run until it passes three times in a row.

**Parity gate (used by later tasks):** `bun run build && npx playwright test -c screenshots/parity/parity.config.ts`. Expected: PASS. On an intended change, review the diff images under `screenshots/parity/test-results/`. Then re-baseline only those tests with `--update-snapshots -g "<test name>"` and say so in the commit body.

### Task 1: Prettier

**Files:** Modify `package.json`, `bun.lock`, `.github/workflows/ci.yml`, `README.md`, `CLAUDE.md`. Create `.prettierrc.json`, `.prettierignore`, `.git-blame-ignore-revs`. Reformat the whole repo.

- [ ] **Step 1:** `bun add -d prettier`
- [ ] **Step 2:** Create `.prettierrc.json`. A width of 120 keeps churn low: 110 of 5,053 lines are longer today, compared with 617 over 80.
```json
{ "printWidth": 120 }
```
Prettier's defaults (double quotes, semicolons, trailing commas, 2 spaces) already match the code.
- [ ] **Step 3:** Create `.prettierignore`. Prettier 3 already skips `.gitignore` entries.
```
bun.lock
public/
content/
docs/
.claude/
*.md
*.mdx
```
`content/` is ignored because the generators write one JSON entry per line for readable diffs, and the MDX is authored prose.
- [ ] **Step 4:** In `package.json` scripts, add `"format": "prettier --write ."` and `"format:check": "prettier --check ."`. In `ci.yml`, add `- run: bun run format:check` after `bun run lint`. Add both commands to the README command block and the CLAUDE.md commands list.
- [ ] **Step 5:** Commit `add prettier` (package.json, bun.lock, .prettierrc.json, .prettierignore, ci.yml, README.md, CLAUDE.md).
- [ ] **Step 6:** Run `bun run format`, then check that `git diff --stat -- content docs public` is empty. Run `bun run typecheck && bun run lint && bun test && bun run build`, then the **parity gate**. Expected: all pass with no visual diff.
- [ ] **Step 7:** Commit `format with prettier`. The commit must contain only formatting changes.
- [ ] **Step 8:** Write that commit's full hash into `.git-blame-ignore-revs` with a `# prettier reformat` comment line above it. Commit `ignore the prettier reformat in blame`.

### Task 2: Delete dead code

**Files:**
- Delete: `src/components/client/{DotField,CountUp,LocalTime}.tsx`, `public/images/work/{portrait,whisper4windows-recorder}.webp`
- Move: `src/app/fonts/mona-sans-latin.woff2` → `scripts/fonts/mona-sans-latin.woff2`, plus a copy of `MonaSans-LICENSE.txt`
- Modify: `src/components/Icons.tsx`, `src/components/summary.tsx`, `src/components/work/{parts,Work}.tsx`, `src/components/client/ThemeSwitch.tsx`, `src/app/globals.css`, `scripts/optimize-font.py`, `docs/site-revision.md`

- [ ] **Step 1:** `git rm` the three components and two images. Delete `MailIcon` and change the Icons header comment to `// Brand marks from Simple Icons (CC0 1.0, simpleicons.org).`
- [ ] **Step 2: Remove unused props.**
  - `Logo`: drop `dashed`. The monogram branch keeps `border border-rule bg-ink text-paper`.
  - `Row`: drop `rightTone` and hard-code `text-pencil` on both date lines.
  - `Cover`: drop `className`.
  - `ThemeSwitch`: drop `data-island="theme"`.
  - `EntryHeading`: always an `h2` with a link. Change `Work.tsx` to call `<EntryHeading project={project} />`.
```tsx
export function EntryHeading({ project }: { project: Project }) {
  const fm = project.frontmatter;
  return (
    <header>
      <h2 id={`${project.slug}-title`} className="display text-[clamp(30px,3.6vw,40px)]">
        <Link prefetch={false} href={`/projects/${project.slug}/`} className="decoration-accent decoration-2 underline-offset-[0.12em] hover:text-accent hover:underline">
          {fm.title}
        </Link>
      </h2>
      <p className="num mt-4 text-sm leading-snug text-pencil">
        {fm.role}, {fm.year}
        {fm.status === "in-progress" && <span className="text-accent">, in progress</span>}
      </p>
    </header>
  );
}
```
The `<p>` above replaces the old `<p><span className="block">` pair. It renders the same box.
- [ ] **Step 3: Delete dead CSS by selector.** Line numbers moved after Prettier, so search for each one:
  - `.card` and `.card:hover`, along with the "raised, clickable panel" comment
  - `.pill` and its hover/`::after` rules, including `.card:hover .pill`
  - `.icon-link` and its hover rule
  - `.pulse-dot` and its `::after` rule, plus `@keyframes ping`
  - `main { animation: none; }`, the "each page fades up" comment, and `@keyframes page-in`
  - every `.toy-table…` and `.toy-chart…` rule
  - `.metric-value`, `.metric-reserve` and `.metric-animated`
  - the tokens `--color-model` and `--radius-sheet`
- [ ] **Step 4: Move the font source out of `src/app`.**
  - `git mv src/app/fonts/mona-sans-latin.woff2 scripts/fonts/mona-sans-latin.woff2`
  - Copy the license beside it.
  - Change the optimize-font.py usage line to `python scripts/optimize-font.py scripts/fonts/mona-sans-latin.woff2 src/app/fonts/portfolio-sans-latin.woff2`.
  - Fix the "original remains alongside it" sentence in `docs/site-revision.md`.
- [ ] **Step 5: Verify.** `grep -rn "DotField\|CountUp\|LocalTime\|MailIcon\|toy-chart\|metric-value\|\.pill\b" src` should print nothing. Then run `bun run typecheck && bun run lint && bun test && bun run e2e` and the **parity gate**. Expected: no visual diff.
- [ ] **Step 6:** Commit `remove dead components, css, props and assets`.

### Task 3: One résumé file

**Files:** Modify `src/lib/site.ts:6`, `e2e/smoke.spec.ts` (résumé test), `CLAUDE.md` (lines 8 and 72). Delete `public/FD-Resume.pdf` and `public/Bader-Aljabri-2025.pdf`.

- [ ] **Step 1:** In the e2e résumé test, change both `/FD-Resume.pdf` strings to `/Bader-Aljabri-Resume.pdf`. Run `bun run e2e -g "resume"`. Expected: FAIL, because the href is still the old one.
- [ ] **Step 2:** Set `resumePath: "/Bader-Aljabri-Resume.pdf"` and `git rm public/FD-Resume.pdf public/Bader-Aljabri-2025.pdf`.
- [ ] **Step 3:** Update CLAUDE.md: the "always keep" list on line 8 and the "currently …" note on line 72 should both name `Bader-Aljabri-Resume.pdf`.
- [ ] **Step 4:** `bun run build && bun run e2e`. Expected: PASS. Then run the parity gate (no visual diff) and `ls public/*.pdf`, which should list exactly one file.
- [ ] **Step 5:** Commit `keep a single resume file`.

### Task 4: Remove duplicated logic

**Files:**
- Modify: `src/lib/chess/{puzzles,pieces}.ts`, `scripts/fetch-puzzles.ts`, `src/lib/drawing.ts`, `src/components/demo/Drawing.tsx`, `src/lib/og.tsx`, `src/components/ChessStatic.tsx`, `src/components/client/ChessPuzzles.tsx`, `src/components/Footer.tsx`, `src/app/page.tsx`, `scripts/{check-budget,visual-check}.ts`, `e2e/smoke.spec.ts`, `src/app/experience/page.tsx`, `src/lib/experience.ts`, `src/components/client/InteractiveName.tsx`
- Create: `src/lib/chess/board.ts`
- Test: `tests/drawing.test.ts`, `tests/puzzles.test.ts`

**Interfaces produced:**
- `shapePath(ev: GeometryEvent): string | null` and `svgRound`, `svgPoint`, `svgPoly` in `src/lib/drawing.ts`
- `BOARD`, `BOARD_LAYOUT`, `squareShade(x, y)` in `src/lib/chess/board.ts`
- `FOOTER_LINKS: { label: string; href: string }[]` in `src/components/Footer.tsx`

- [ ] **Step 1: Define the puzzle type once.** In `puzzles.ts`, replace the `Puzzle` interface with a type-only import. It is erased at build time, so zod stays out of the home bundle:
```ts
import type { z } from "zod";
import type { puzzleSchema } from "./puzzle-schema";

export type Puzzle = z.infer<typeof puzzleSchema>;
```
In `fetch-puzzles.ts`, delete `StoredPuzzle` and use `import type { Puzzle } from "../src/lib/chess/puzzles";`. Run `bun run typecheck && bun test tests/puzzles.test.ts`. Expected: PASS.
- [ ] **Step 2: Write the failing tests for the shared SVG path helpers.** **Load the `session-script` skill first.** In `tests/drawing.test.ts`, move the `geo` helper to the top of the file, then add:
```ts
describe("svg paths", () => {
  test("points flip y and round to hundredths", () => {
    expect(svgPoint([1.234, 5.678])).toBe("1.23,-5.68");
  });
  test("a polyline that returns to its start closes with Z instead of repeating the point", () => {
    expect(shapePath(geo([[0, 0], [10, 0], [10, 5], [0, 0]]))).toBe("M0,0L10,0L10,-5Z");
  });
  test("an open polyline stays open", () => {
    expect(shapePath(geo([[0, 0], [10, 0]]))).toBe("M0,0L10,0");
  });
  test("a rect runs its four corners and closes", () => {
    expect(shapePath(geo([[1, 2], [3, 4]], "rect"))).toBe("M1,-2L4,-2L4,-6L1,-6Z");
  });
  test("a circle is two arcs starting at the top", () => {
    expect(shapePath(geo([[0, 0], [2]], "circle"))).toBe("M0,-2A2,2 0 1 1 0,2A2,2 0 1 1 0,-2");
  });
  test("lines, centerlines and dimensions are not shapes", () => {
    expect(shapePath(geo([[0, 0, 1, 1]], "line"))).toBeNull();
  });
});
```
Run `bun test tests/drawing.test.ts`. Expected: FAIL, because `svgPoint` and `shapePath` are not exported.
- [ ] **Step 3: Implement the helpers in `src/lib/drawing.ts`.** Move them from `Drawing.tsx`:
```ts
// Drawing units (mm, y up) to SVG user units (y down), rounded to hundredths.
export const svgRound = (v: number) => Math.round(v * 100) / 100;
export const svgPoint = ([x, y]: number[]) => `${svgRound(x)},${svgRound(-y)}`;
export const svgPoly = (pts: number[][], close = false) => `M${pts.map(svgPoint).join("L")}${close ? "Z" : ""}`;

/** The outline of a closed-shape entity (polyline, rect, circle); null for the other ops. */
export function shapePath(ev: GeometryEvent): string | null {
  switch (ev.op) {
    case "polyline": {
      const first = ev.params[0];
      const last = ev.params.at(-1)!;
      const closed = first[0] === last[0] && first[1] === last[1];
      return svgPoly(closed ? ev.params.slice(0, -1) : ev.params, closed);
    }
    case "rect": {
      const [[x, y], [w, h]] = ev.params;
      return svgPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
    }
    case "circle": {
      // Two arcs, starting at the top like AutoCAD's quadrant grip, so the draw-on reads clockwise.
      const [[cx, cy], [r]] = ev.params;
      return `M${svgPoint([cx, cy + r])}A${r},${r} 0 1 1 ${svgPoint([cx, cy - r])}A${r},${r} 0 1 1 ${svgPoint([cx, cy + r])}`;
    }
    default:
      return null;
  }
}
```
In `Drawing.tsx`:
  - Delete the local `pt`, `round`, `poly` and `circlePath`.
  - Use `svgRound` in `Label`, and `svgPoly` in `Arrow` and in the line, centerline and dim branches.
  - Collapse the polyline, rect and circle cases into a single case:
    `case "polyline": case "rect": case "circle": return <path data-draw className="geo" pathLength={100} d={shapePath(ev)!} />;`

In `og.tsx`, replace the body of `ribPaths()`'s map with `geo.map((e) => ({ d: shapePath(e)!, cut: e.layer === "RIB-CUTOUTS" }))` and delete the local `p`. Run `bun test`. Expected: PASS.
- [ ] **Step 4: Check the social cards.** Copy `out/opengraph-image` and `out/projects/claude-autocad/opengraph-image` aside before rebuilding. Run `bun run build`, then view the old and new images together. Expected: the rib looks the same. Run the parity gate; claude-autocad shows the finished drawing and should be unchanged.
- [ ] **Step 5: Share the chess board between the preview and the live board.** Create `src/lib/chess/board.ts`:
```ts
// Shared by the server-rendered preview (ChessStatic) and the live board (ChessPuzzles): they must
// line up exactly so swapping one for the other never moves the page.
export const BOARD_LAYOUT = "grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-8";
export const BOARD =
  "chess-board relative grid aspect-square w-[min(320px,calc(100vw-40px))] grid-cols-8 overflow-hidden rounded-[6px] border border-rule";
/** Square shade by screen position, counted from the top-left. */
export const squareShade = (x: number, y: number) => ((x + y) % 2 ? "chess-dark" : "chess-light");
```
Changes in `ChessStatic.tsx`:
  - Use `BOARD_LAYOUT`, `BOARD` and `squareShade(i % 8, Math.floor(i / 8))`.
  - Replace the local `files` and name comparison with indices: `const last = [squareIndex(puzzle.lastMove.slice(0, 2)), squareIndex(puzzle.lastMove.slice(2, 4))]` and `last.includes(sq)`.

Changes in `ChessPuzzles.tsx`:
  - Use `BOARD_LAYOUT`, `` `${BOARD} touch-none select-none` `` and `squareShade(x, y)`.
  - Replace both `p === p.toUpperCase()` checks with `colorOf(p) === session.player` and `isWhite(piece)`.
  - Start the session once and derive `index` from it:
```ts
const [first] = useState(() => startSession(PUZZLES[0]));
const [session, setSession] = useState(first);
const [pieces, setPieces] = useState(() => placePieces(first.pos));
const [message, setMessage] = useState<{ tone: Tone; text: string }>({ tone: "neutral", text: intro(first) });
const index = PUZZLES.indexOf(session.puzzle); // attempt/playReply keep the same puzzle object
```
Delete the `index` state and its `setIndex` call in `load`.
  - Replace the two copies of the pointer maths with one helper:
```ts
// The square under a pointer, or null when it falls outside the board.
function squareAt(e: React.PointerEvent): number | null {
  const rect = boardRef.current!.getBoundingClientRect();
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * 8);
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * 8);
  return x < 0 || x > 7 || y < 0 || y > 7 ? null : sqAt(x, y);
}
```
In `pointerDown`, use `const sq = squareAt(e); if (sq === null || !mine(sq)) return;`. In `pointerUp`, use `const to = squareAt(e); if (to === null) return;`.
  - Replace `as Move` with `const move = moveFromUci(session.pos, uci); if (!move) return;`.

In `pieces.ts`, use `isWhite(p)`.
- [ ] **Step 6: Make `puzzleTitle` simpler, test first.** Add to `tests/puzzles.test.ts`:
```ts
describe("puzzleTitle", () => {
  const base = PUZZLES[0];
  test("names short mates in words and long ones in digits", () => {
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: 1 })).toBe("Mate in one");
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: 3 })).toBe("Mate in three");
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: 7 })).toBe("Mate in 7");
  });
  test("a mate puzzle without a length still reads naturally", () => {
    expect(puzzleTitle({ ...base, goal: "mate", mateIn: undefined })).toBe("Find the mate");
  });
  test("material puzzles", () => {
    expect(puzzleTitle({ ...base, goal: "material", mateIn: undefined })).toBe("Win material");
  });
});
```
Run it. Expected: the "Find the mate" case fails, because today it returns `"Mate in "`. Then implement:
```ts
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five"];

/** What to call the puzzle on screen. */
export function puzzleTitle(p: Puzzle): string {
  if (p.goal !== "mate") return "Win material";
  return p.mateIn ? `Mate in ${NUMBER_WORDS[p.mateIn] ?? p.mateIn}` : "Find the mate";
}
```
Run `bun test tests/puzzles.test.ts`. Expected: PASS.
- [ ] **Step 7: Share the footer links.** This is a visible change: the home footer gains a "Résumé" link. In `Footer.tsx`:
```ts
export const FOOTER_LINKS = [
  { label: "GitHub", href: SITE.github },
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "Email", href: `mailto:${SITE.email}` },
  { label: "Résumé", href: SITE.resumePath },
  { label: "Source", href: SITE.source },
];
```
`Footer` maps over it with `<li key={l.label}><a className="hover:text-ink" href={l.href}>{l.label}</a></li>`. The home footer in `page.tsx` maps over the same list and keeps its current classes for now; Task 7 converts them.
- [ ] **Step 8: Derive route lists from the sitemap.**
  - In `e2e/smoke.spec.ts`, add the helpers below. Use them in "all pages fit narrow screens" (route list), "project bodies share a centered reading column" (slug list), "every project on /projects links to a built page" (both `4`s become `projectPaths(...).length`) and the no-JS test (`toHaveCount(4)`). Add `request` to each test's fixtures.
  - In `scripts/visual-check.ts`, replace the hard-coded route array with the sitemap function below.

`e2e/smoke.spec.ts` (add `type APIRequestContext` to the `@playwright/test` import):
```ts
async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}
const projectPaths = (paths: string[]) => paths.filter((p) => /^\/projects\/[^/]+\/$/.test(p));
```
`scripts/visual-check.ts`:
```ts
const routes = process.argv.length > 3 ? process.argv.slice(3) : await sitemapRoutes(url);

// Every page the site publishes, so a new project is captured without editing this script.
async function sitemapRoutes(base: string): Promise<string[]> {
  const xml = await (await fetch(new URL("/sitemap.xml", base))).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}
```
- [ ] **Step 9: Small fixes.**
  - `check-budget.ts`: add `const BUDGET_KB = 180;` and `const BUDGET = BUDGET_KB * 1024;`, and log `(budget ${BUDGET_KB})`. Keep the amendment comment.
  - `experience/page.tsx`: render the points list only when there are points: `{r.points.length > 0 && (<ul className="mt-5 space-y-3">…</ul>)}`.
  - `experience.ts`: remove `when: ""` from the AWS entry. The page already checks `r.when &&`.
  - `InteractiveName.tsx`: delete `const target = near;` and use `near`.
- [ ] **Step 10: Verify.** Run `bun run typecheck && bun run lint && bun test && bun run e2e && bun run visual-check`, then the parity gate. Expected: only the home snapshots differ, and only by the new footer link. Re-baseline the home tests with `-g "^/ "` and `-g "home"`.
- [ ] **Step 11:** Commit in four parts: `share drawing path helpers with the social cards`, `share chess board helpers and tidy the puzzle component`, `share footer links and read routes from the sitemap`, and `small cleanups in experience, budget and name`.

### Task 5: Move per-project special cases into frontmatter

**Files:** Modify `src/lib/projects.ts`, `content/projects/{claude-autocad,tile-to-pattern,whisper4windows}/index.mdx`, `src/components/work/{parts,Work}.tsx`, `src/app/projects/[slug]/page.tsx`. Test: `tests/projects.test.ts`.

- [ ] **Step 1: Write the failing tests.**
  - In the `valid` fixture, change `links` to `{ live: { href: "https://www.canva.com/apps", label: "Open in Canva" } }`.
  - Replace the "metrics, links and cover are optional" test with the last test below, and add the rest:
```ts
test("the media slot defaults to the cover image", () => {
  expect(projectFrontmatterSchema.parse(valid).visual).toBe("cover");
});
test("a cover visual needs a cover image", () => {
  expect(projectFrontmatterSchema.safeParse(without(valid, "cover")).success).toBe(false);
  expect(projectFrontmatterSchema.safeParse({ ...without(valid, "cover"), visual: "rib" }).success).toBe(true);
});
test("a live link names its destination", () => {
  expect(projectFrontmatterSchema.safeParse({ ...valid, links: { live: "https://x.com" } }).success).toBe(false);
  expect(projectFrontmatterSchema.safeParse({ ...valid, links: { live: { href: "https://x.com" } } }).success).toBe(false);
});
test("a playground must be one the site has", () => {
  expect(projectFrontmatterSchema.safeParse({ ...valid, playground: "chart" }).success).toBe(false);
  expect(projectFrontmatterSchema.safeParse({ ...valid, playground: "pattern" }).success).toBe(true);
});
test("a cover may name a smaller encode, as a site path", () => {
  expect(projectFrontmatterSchema.safeParse({ ...valid, cover: { ...valid.cover, small: "x.webp" } }).success).toBe(false);
  expect(projectFrontmatterSchema.safeParse({ ...valid, cover: { ...valid.cover, small: "/x-800.webp" } }).success).toBe(true);
});
test("metrics and links are optional", () => {
  expect(projectFrontmatterSchema.safeParse(without(valid, "metrics", "links")).success).toBe(true);
});
```
Run `bun test tests/projects.test.ts`. Expected: FAIL.
- [ ] **Step 2: Update the schema in `projects.ts`.**
  - Add `small: z.string().startsWith("/").optional()` inside `cover`.
  - Change `live` to `z.object({ href: z.url(), label: z.string().min(1) }).optional()`.
  - Add these fields, then chain `.refine((fm) => fm.visual !== "cover" || fm.cover, { message: "a cover visual needs a cover image", path: ["cover"] })` onto the object:
```ts
/** What the media slot shows: the cover image, or the rib drawing replayed from content/demo. */
visual: z.enum(["cover", "rib"]).default("cover"),
/** An interactive section under the media on the project page. */
playground: z.enum(["pattern"]).optional(),
```
  - Change the `transform` comment to `/** The large line on the project's social card, e.g. "Tiles into patterns". */`.

Run the test. Expected: PASS.
- [ ] **Step 3: Update the frontmatter.**
  - `claude-autocad`: add `visual: rib`.
  - `tile-to-pattern`: add `playground: pattern` and `small: "/images/work/tile-to-pattern-800.webp"` under `cover`, and change `live:` to an object with `href:` (the current URL) and `label: "Open in Canva"`.
  - `whisper4windows`: add `small: "/images/work/whisper4windows-800.webp"` under `cover`.
- [ ] **Step 4: Use the new fields in components.**
  - `parts.tsx`: delete the `SMALL` map and use `cover.small`. In `ProjectActions`, use `links.live.href` and `links.live.label`. The aria-label becomes `` `${links.live.label}: ${title}` `` and the link text is `{links.live.label}`.
  - `Work.tsx`: use `project.frontmatter.visual === "rib"`.
  - `[slug]/page.tsx`: add `const rib = fm.visual === "rib" ? getRibSession() : null;`. Render `rib ? (<>…<DemoFrame events={rib} /><RibSheet events={rib} className="mt-14" /></>) : fm.cover && <Cover … />`, and use `fm.playground === "pattern"` for the playground section. This also removes the duplicate `getRibSession()` call.
- [ ] **Step 5: Verify.** `grep -rn 'slug === "' src` should print nothing. Run `bun run typecheck && bun test && bun run e2e`, then the parity gate. Expected: no visual diff.
- [ ] **Step 6:** Commit `describe project media, playground and links in frontmatter`.

### Task 6: Layer and reorganise `globals.css`

**Files:** Modify `src/app/globals.css`, `src/components/client/{ChessPuzzles,PatternToy}.tsx`, `src/components/work/parts.tsx`.

The custom CSS is currently unlayered, so it beats every Tailwind utility. Putting it into `@layer base` and `@layer components` makes utilities override it as Tailwind intends, and Task 7 depends on that. Two utilities that are dead today would come to life, so remove or adjust them to keep pixels identical.

- [ ] **Step 1: Rewrite the file in this order.** Move rules without editing any declarations.
  1. `@import "tailwindcss"` and `@custom-variant`.
  2. **Tokens, unlayered:** `:root`, `.dark` and `@theme inline`. Move `--ease-out` from the Motion section into the first `:root`.
  3. **`@layer base`:** `html`, `body`, `::selection`, `a, button` transitions, `:focus-visible`, `button:disabled`, and the `::view-transition-*` rules.
  4. **`@layer components`,** grouped under the existing section comments:
     - Type helpers: `.display`, `.wide`, `.num`, `.link`.
     - Layout: `.wrap`, `.narrow`.
     - Buttons: merge the two `.btn` blocks into one (the second block's `transition-property` and `.btn:active` join the first), then `.btn-quiet`.
     - Prose: `.prose-sheet`.
     - Drawings and model space.
     - Demo player and terminal.
     - Motion: the reveal rules and the cover zoom.
     - Toys: `.toy-cell`, `.toy-canvas`, `.toy-range`.
     - Chess: move the lone `@media (max-width: 639px) { .chess-board … }` here.
     - Theme switch.
     - Projects: `.project-media`, `.project-actions`, `.project-action*`, `.project-list`, `.project-entry*`, `.project-summary`, `.project-title`.
     - Background: `.contour-field` and its mobile rule.
     - Home: the `.home-*`, `.chess-invite` and `nav[aria-label="Main"]` rules unchanged, under a `/* Home (moves to Tailwind in the next commit) */` comment.
  5. All `@keyframes`, unlayered.
  6. The `prefers-reduced-motion: reduce` kill switch, unlayered and last, unchanged.
- [ ] **Step 2: Keep pixels identical where the change activates utilities.**
  - On the five `.btn` buttons (three in `ChessPuzzles.tsx`, two in `PatternToy.tsx`), remove `h-9 px-3`, `h-9 px-4` and `text-[13px]`. Those sizes have never rendered.
  - In `parts.tsx` `Metrics`, change `display num text-xl` to `display num text-[28px]`. `text-xl` also sets a line height that `.display` currently overrides.
  - Note for Bader: if smaller chess and pattern buttons were intended, it's now a one-line change.
- [ ] **Step 3: Verify.** Run `bun run build` and the parity gate. Expected: PASS with no diff. Any diff means another utility came to life: find the element, keep today's look, re-run. Then `bun run e2e`, and run the `visual-review` skill (both themes and reduced motion), including a keyboard tab-through of nav, project actions and chess controls to check the focus rings.
- [ ] **Step 4:** Commit `layer the custom css under tailwind and group it by section`.

### Task 7: Convert the home page and nav overrides to Tailwind

**Files:** Modify `src/app/page.tsx`, `src/components/summary.tsx` (`Logo`), `src/components/Nav.tsx`, `src/app/globals.css` (delete the Home block), `e2e/smoke.spec.ts`.

**Mapping rule:**
- Translate every declaration literally.
- Pixel font sizes become `text-[Npx]`. Never use the scale tokens (`text-xs` and so on): in Tailwind 4 they also set a line height, which would change rows that inherit `1.6` today.
- Breakpoints: `@media (max-width: 767px)` becomes mobile-first base plus `md:`, and `max-width: 359px` becomes `max-[359px]:`.

- [ ] **Step 1: Update `Logo`.** Add `small?: boolean`, which switches the box between `size-9` (36px, home rows) and `size-11`, and `className?: string`, which is appended to the box classes.
- [ ] **Step 2: Rewrite `page.tsx`.** Same markup and order, with local `HomeSection` and `HomeRow` components replacing the three copied lists:
```tsx
const column = "mx-auto w-[min(100%,760px)] px-6 md:px-7";
const arrow = "ml-2 inline-block transition-transform duration-[450ms] ease-[var(--ease-out)]";

function HomeSection({ id, title, aside, children }: { id: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-rule pt-3.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px] text-pencil">
        <h2 id={id} className="text-[14px] font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      <ul className="mt-3 grid gap-3.5 md:gap-2.5">{children}</ul>
    </section>
  );
}

function HomeRow({ logo, title, note, date }: { logo: React.ReactNode; title: string; note: string; date?: string }) {
  return (
    <li className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 md:grid-cols-[36px_minmax(0,1fr)_auto] md:gap-3">
      {logo}
      <div>
        <p className="text-[14px] leading-[1.4] font-semibold">{title}</p>
        <p className="text-[13px] leading-[1.4] text-pencil">{note}</p>
      </div>
      {date && <span className="whitespace-nowrap text-[12px] text-pencil max-md:col-start-2">{date}</span>}
    </li>
  );
}
```
Element by element (the `.home-*` class → utilities):
  - **Page shell and main**
    - shell → `flex min-h-svh flex-col`
    - main → `` `${column} flex-none pt-[clamp(28px,4vh,44px)]` ``
    - intro section → no class
  - **Intro**
    - location → `mb-2.5 text-[13px] text-pencil`
    - name → `display whitespace-nowrap text-[clamp(30px,8.8vw,54px)] md:text-[clamp(32px,6vw,60px)]`
    - socials → `mt-3.5 flex gap-[18px]`; each link → `inline-flex min-h-8 items-center gap-[7px] text-[13px] text-pencil hover:text-accent`
    - bio → `mt-4 text-[17px] leading-[1.55] text-pencil`
    - contact → `mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-pencil`; its link → `link text-[14px] font-semibold text-accent`
  - **Projects button**
    - link → `group mt-[18px] inline-flex min-h-11 items-center rounded-[5px] bg-accent px-[18px] py-2.5 text-paper hover:bg-[color-mix(in_oklab,var(--accent)_85%,var(--ink))]`
    - title → `text-[16px] font-semibold`
    - arrow → `` `${arrow} group-hover:translate-x-[3px] group-hover:-translate-y-[3px]` ``
  - **Summary sections**
    - summary wrapper → `mt-[22px] grid grid-cols-[minmax(0,1fr)] gap-6 md:gap-[18px]`
    - each logo → `<Logo small className="max-md:row-span-2" … />`
  - **Chess disclosure**
    - details → `group mt-[18px] border-t border-rule`
    - summary → `flex cursor-pointer list-none items-center justify-between gap-3 py-[13px] text-[12px] max-[359px]:gap-2 [&::-webkit-details-marker]:hidden`
    - "I play chess." → `ml-2 text-pencil max-[359px]:ml-1`
    - invite → `whitespace-nowrap text-accent`; plus sign → `` `${arrow} group-open:rotate-45` ``
    - content → `pb-6 pt-3`
  - **Footer**
    - footer → `` `${column} mt-3 flex flex-wrap justify-between gap-3 py-5 text-[12px] text-pencil md:flex-nowrap` ``
    - list → `flex flex-wrap gap-4`
    - links → `hover:text-accent`, mapped over `FOOTER_LINKS`

The explicit reduced-motion rule for the arrows goes. The global kill switch already covers it.
- [ ] **Step 3: Update `Nav.tsx`.**
  - `nav`: add `max-[359px]:px-3 max-[359px]:text-[12px]`. This works only because Task 6 moved `.wrap` into the components layer.
  - `ul`: add `max-[359px]:gap-2.5`.
  - Each nav `Link` and the résumé `a`: add `inline-flex min-h-11 items-center`.
- [ ] **Step 4: Delete the Home block from `globals.css`:** every `.home-*` rule, `.chess-invite…`, the three `nav[aria-label="Main"]` rules, and the `.home-arrow, .chess-invite > span` reduced-motion rule. `grep -n "home-\|chess-invite\|aria-label=" src/app/globals.css` should print nothing.
- [ ] **Step 5: Update e2e selectors.** Replace `.home-chess summary` with `main details > summary` and `.home-chess` with `main details`. Run `grep -n "home-" e2e/smoke.spec.ts` to find every use.
- [ ] **Step 6: Verify.** Run `bun run typecheck && bun run lint && bun run build && bun run e2e`, then the parity gate. Expected: PASS with no diff, including at 320px, the no-JS shot, and dark hover. Run the `visual-review` skill, tab through the home page to check focus rings, and run `bun run visual-check`.
- [ ] **Step 7:** Commit `move the home page and nav overrides to tailwind`.

### Task 8: Docs, comments, showreel

**Files:** Modify `CLAUDE.md`, `docs/superpowers/specs/2026-10-01-v1-design.md`, `docs/site-revision.md`, `README.md`, `showreel/reel.html`, `showreel/src/{work,core}.js`. Delete `docs/compact-portfolio.md`.

- [ ] **Step 1: CLAUDE.md.** Change line 41 to "The background contour field must stay subtle: low alpha, and it sleeps once pointer and scroll settle."
- [ ] **Step 2: v1 design doc.** Change the "Reveals, counters" row (line 49) to describe what exists now: sections fade up once, covers zoom slightly on hover, and "metric counters and page fade-in were removed in the October compact pass". Keep the table's columns.
- [ ] **Step 3: Merge `docs/compact-portfolio.md` into `docs/site-revision.md`.** Add it as a "Compact pass, October 2–3" section, keeping only statements that are still true:
  - Design teams now also appear on the home page.
  - There are no counters.
  - The résumé is `Bader-Aljabri-Resume.pdf`.
  - Remove its old test counts.

  Then `git rm docs/compact-portfolio.md`. README already points at site-revision.md.
- [ ] **Step 4: Showreel.** Its rendering won't change, so no parity run is needed.
  - `reel.html`: change the tokens comment to `/* Tokens from the retired Throughline design (2026-07). Deliberately independent of src/app/globals.css. */`.
  - `work.js`: change the WatArrow row's year from `"2025"` to `"2026"`, to match `experience.ts`.
  - `core.js`: delete the unused `hexToRgb` and `mixHex`, and remove `mixHex` from `R.core`.
  - Open `showreel/reel.html` and scrub through once to confirm it still plays.
- [ ] **Step 5:** Commit `bring docs and the showreel in line with the site`.

### Task 9: Final verification and review

- [ ] **Step 1:** Run `bun run format:check && bun run typecheck && bun run lint && bun test && bun run build && bun run e2e` and the parity gate. Every page must report under 180 KB gz.
- [ ] **Step 2:** Run `bun run visual-check` and the `visual-review` skill for the final sign-off. Motion is on here, which the parity harness does not cover.
- [ ] **Step 3:** Add a short "Cleanup, October 8" section to `docs/site-revision.md`: what was removed or moved, and the final test counts and JS sizes taken from Step 1's output. Commit `record the cleanup pass`.
- [ ] **Step 4:** Run `/code-review` on the branch (CLAUDE.md asks for this at the end of each phase) and fix any confirmed findings in separate commits.
- [ ] **Step 5:** Stop. Report the commit list, the one intended visual change (the home footer's Résumé link), and the note about the button sizes to Bader. Do not push or merge.

## Not changing

- Experience date strings: the three formats are copy, so that's a content decision.
- Corner radii (2/3/5/6/10px): a design call.
- Hard-coded colours inside the replay, which are AutoCAD's own (per CLAUDE.md).
- The "all ten" puzzle text: `tests/puzzles.test.ts` pins exactly ten puzzles.
- Caching `getAllProjects()`: it would hide MDX edits in `bun dev`.

## Execution

I recommend **Native**: I implement every task in this session, then a single fresh review of the whole branch. The tasks are strictly sequential:
- Task 7 depends on Task 6's layering and Task 4's `FOOTER_LINKS`.
- Task 5 changes the schema that `parts.tsx` reads.
- The parity harness gives every visual task an objective pass/fail gate.
