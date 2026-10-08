# Compact portfolio update

Implemented on `codex/compact-portfolio` for the October 2, 2026 visual revision.

- Home remains a summary. Projects has a direct text link below the introduction, without project previews.
- The homepage uses one vertical column for the introduction, Projects link, all three work entries, education, and the chess disclosure. Design teams remain on the Experience page. Availability belongs beside contact.
- Chess stays on home behind a native, keyboard-accessible disclosure. Opening it may extend the page.
- Default home fits 1366 x 668 and 1280 x 720. Smaller screens and enlarged text may scroll naturally.
- Pointer-responsive contours occupy the upper-right and lower-left corners and drift gently with scrolling. They settle when idle; reduced motion is static.
- Name animation, theme transition, project demos, and counters are retained. Counters reserve their final dimensions and expose the final value to screen readers.
- Resume stays visible in mobile navigation. AutoCAD remains first; its working integration is distinguished from the scripted website replay.

Verification: production static build, TypeScript, ESLint, existing 11 browser smoke tests, and a new responsive/keyboard disclosure test passed. First-load JavaScript is 159.5 KB gzipped, below the 180 KB budget. Static-build screenshots cover desktop/mobile, both themes, scroll depths, and reduced motion in `screenshots/`. Lighthouse scores were not remeasured in this pass.

Follow-up: replaced the resume with the supplied FD-Resume.pdf (matching SHA-256); removed overlapping page/section entrance animations and standardized reveal timing, informed by Motion UI. Added a tinted Projects surface and distributed vertical space between sections.

October 3 polish: background damping now uses elapsed time for consistent behavior across refresh rates; scroll travel approaches its limit smoothly. All 14 browser tests passed, including scroll/reduced-motion canvas behavior and the served resume PDF. Production build, lint, and the visual screenshot matrix passed.
