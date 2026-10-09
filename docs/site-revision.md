# Portfolio revision, October 2026

## Compact pass, October 2–3

- Home is a summary in one 760 px column: the introduction, a direct link to Projects,
  recent experience, design teams, education, and the chess disclosure. Availability
  sits beside the contact link.
- Chess stays on home behind a native, keyboard-accessible disclosure; opening it may
  extend the page.
- The default home fits 1366 × 668 and 1280 × 720. Smaller screens and enlarged text
  scroll naturally.
- Pointer-responsive contours occupy the upper-right and lower-left corners and drift
  gently with scrolling. Their damping uses elapsed time, so they behave the same at any
  refresh rate; they settle when idle and are static with reduced motion.
- The name animation, theme transition and project demos were kept. Metric counters were
  later replaced by static text.
- Overlapping page and section entrance animations were removed and reveal timing was
  standardised.
- The résumé stays visible in mobile navigation (`Bader-Aljabri-Resume.pdf`). AutoCAD
  remains the first project, and its working integration is distinguished from the
  scripted replay on the site.

## Stack

Retained the static Next.js architecture. The site has seven content routes, local
MDX, and small interactive components; it needs neither a server nor a CMS.
Next.js is now 16.3.8 and React is 19.3.0, with matching React types and Next ESLint
configuration. Compatible dependencies and the transitive lockfile were refreshed.

Mona Sans and B612 Mono are self-hosted, eliminating a network requirement during
builds. Their licenses are beside the font files. Optional font display avoids a
late text swap on slow connections. The JavaScript budget now checks
every exported HTML page, rather than only the home page.

The served sans font is a 61 KB subset of the 98 KB Mona Sans download, preserving
every supplied character and the site's weight/width ranges. Unused OpenType features
and axis ranges were removed. It is internally renamed Portfolio Sans as required by
the reserved-name license. The original is kept in `scripts/fonts/` (with its license) for reproducibility;
`scripts/optimize-font.py` regenerates the derived file with fonttools[woff]. Python
is only needed to regenerate the font, not to build or run the website.

## Design and content

Kept the compact home page, cyan accent, variable sans-serif, and interactive demos.
Project names now lead the index and detail pages. The index follows one reading
order on desktop and mobile, with consistent spacing, image treatment, and actions.
Project metrics render as static text instead of an animated client component.
Project detail bodies share a centered 65-character reading column, with metrics
above the prose. Projects without metrics use the same alignment, rather than
falling back to a left-hand column in the full-width media grid.
Removed competing compact-height CSS overrides and increased small date text.
The name animation now responds only to pointer input, avoiding layout work on load.
Automatic route prefetching is disabled so unseen pages do not compete for initial
loading bandwidth. Navigation still uses Next's client router when JavaScript is enabled.
The local preview serves compressed text and caches fingerprinted assets, and returns
a 400 response for malformed URLs instead of crashing.

Rewrote all four projects around their purpose and specific implementation choices.
Removed repeated instructions, slogans, unrelated internship material, and redundant
captions. Simplified experience bullets and tool lists. Kept instructions where an
interaction is not obvious, such as rotating a tile or dragging the pattern.

The AutoCAD animation is a replay based on a real result completed entirely by AI,
as confirmed by Bader. The plugin is functional, and the original DWG is available
to download from both the project page and listing. The Whisper timing now matches its
[README](https://github.com/BaderJabri/Whisper4Windows): 0.5–2 seconds on GPU, with
hardware/model dependence stated. Removed the time-sensitive GitHub star count and
the unsupported implication that the example wing rib's strength was validated.
Existing résumé-derived usage figures remain; the Plotit timing is labeled as a
demo result rather than a general performance guarantee.

## Dependency audit

After refreshing the lockfile, `bun audit` reports two remaining findings:

- `sprintf-js` through gray-matter's YAML command-line dependency: unbounded
  precision can cause denial of service. Current published version 1.1.3 has no fix.
  Project content is trusted repository input compiled at build time.
- `braces` through the Next ESLint plugin: deeply nested patterns can exhaust the
  stack. Current published version 3.0.3 has no fix. This is development tooling.

Neither package is a visitor-facing server endpoint in this static export. Recheck
the audit when upstream fixes are released. No incompatible dependency overrides
were added to conceal the findings.

## Verification

Final checks passed: production export, lint, TypeScript, 72 unit tests, and 17
browser tests. All HTML routes use 146–149.2 KB gzipped first-load JavaScript,
below the 180 KB budget. The final screenshot matrix contains 147 captures.

Use the commands in README for lint, type checks, unit tests, build, and browser
tests. Browser coverage includes 320/390/1280px overflow checks across all content
routes, JavaScript-disabled project navigation, theme persistence, résumé delivery,
pattern editing, the AutoCAD replay, and chess interactions.

`scripts/visual-check.ts` captures every content route at five scroll depths in
desktop/mobile and light/dark configurations, plus reduced-motion full-page views.
Generated screenshots stay in the ignored `screenshots/` directory.

Measured locally with Lighthouse on October 7, 2026: accessibility, best practices,
and SEO each scored 100, with CLS 0. Performance is not certified against the old
95+/1.5-second target: local mobile-throttled results varied substantially between
runs, and the final DevTools-throttled run measured LCP 2.4 seconds and performance
78 (720 ms blocking time). Earlier runs reached 95; these are not interchangeable
with the final result. The final report is `screenshots/lighthouse-home-throttled.json`.
Validate again on the deployed CDN and a controlled test machine before making a
performance claim. No deployment was performed as part of this revision.
