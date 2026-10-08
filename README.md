# BaderJabri.ca

Personal portfolio built with Next.js 16 (App Router, static export), React 19,
TypeScript, Tailwind CSS 4, and Bun. Hosted on Cloudflare Pages without a server runtime.

- Current review: `docs/site-revision.md`
- Design direction: `docs/superpowers/specs/2026-10-01-v1-design.md`
- Project rules: `CLAUDE.md`

## Commands

```
bun install
bun dev
bun run build     # static export → out/
bun run lint
bun run format    # prettier; CI runs format:check
bun run typecheck
bun test
bun run e2e       # tests the built static export
bun run preview   # http://localhost:4173
bun run visual-check # with preview running; captures every page
```

Use Node.js 22.18+ for the TypeScript visual-check script. CI installs Bun and
Chromium; locally run `bunx playwright install chromium` with
`PLAYWRIGHT_BROWSERS_PATH=0` before the first browser test.

Project write-ups live in `content/projects/*/index.mdx`. Their metadata is checked
with Zod during the build. Shared contact details live in `src/lib/site.ts`, and work
history lives in `src/lib/experience.ts`.

Fonts are bundled in `src/app/fonts/` with their SIL Open Font Licenses. Builds do
not request fonts from Google. Images are pre-sized WebP files; declare dimensions
for new images to reserve their space before loading.

The build enforces a 180 KB gzipped first-load JavaScript limit on every HTML page.
Keep interactive code in client components and content rendering on the build side.
