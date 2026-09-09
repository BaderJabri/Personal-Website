# Premium Feel — Reference Research

**Date:** 2026-09-08
**Author:** Claude, at Bader's request
**Status:** research findings + proposal. Section 8 holds the one decision still open.

---

## 0. How this was researched

Impressions of a website are worth very little, so nothing below is an impression. For each
reference I pulled the raw HTML, the stylesheet, and the JavaScript, and counted what was
actually there. For the third site the public source repository was also read directly.

| Reference | What was inspected |
|---|---|
| `aakashrajbanshi.com.np` | HTML shell (1,218 B), `index-ChaOHWdA.js` (355,713 B), `index-D7w9zORk.css` (32,423 B) |
| `aakarsh-devhq.vercel.app` | HTML (32,402 B), `style.css` (52,555 B), `script.js` (21,150 B), `3d_background.js` (6,501 B) |
| `aashishjaini.me` | Rendered HTML (121,765 B) + `github.com/Aashish17405/Portfolio` source tree, 37 first-party files |

Library presence was established by counting identifier occurrences in shipped bundles, not by
reading marketing copy or a skills section.

---

## 1. The references, precisely

### 1A. aakashrajbanshi.com.np — the "simple yet premium" one

**Stack:** Vite + React single-page app. 355 KB of JavaScript, 32 KB of CSS. GSAP with
ScrollTrigger (56 and 5 references respectively). No Framer Motion, no Lenis, no Three.js.
Manrope from Google Fonts.

**The finding that matters:** this is not bespoke work. Its CSS variables are `--jet`, `--onyx`,
`--eerie-black-1/2`, `--smoky-black`, `--orange-yellow-crayola`, `--vegas-gold`,
`--bittersweet-shimmer`, `--light-gray-70`, `--fs-1…8`, `--fw-300…600`, `--shadow-1…5`,
`--transition-1`. Its class names include `sidebar-info`, `icon-box`, `article-title`,
`service-item`, `timeline-item`, `avatar-box`, `content-card`. All twelve variable names were
verified present in **codewithsadee/vcard-personal-portfolio**. The site is that template,
ported into React with GSAP layered on.

This is good news rather than bad. It means the quality you responded to is a written-down
system that can be studied, not taste you have to acquire. Here is that system:

- **A compressed type scale.** Eight steps, and they run 24 / 18 / 17 / 16 / 15 / 14 / 13 / 11 px.
  The largest text on the entire site is 24 px. Premium reads as *restraint*, not as big type.
- **A four-step weight scale** (300, 400, 500, 600) and nothing between or beyond.
- **A five-step shadow ladder** carrying all depth, so surfaces separate by elevation rather
  than by outlines.
- **One transition token.** `--transition-1: .25s ease` accounts for 14 of roughly 28 transition
  declarations. Uniform timing is most of what "considered" feels like.
- **Layered near-blacks.** Surfaces sit at 7%, 12%, 13%, 17% and 22% lightness. Five greys doing
  the work that borders usually do badly.
- **A single accent hue**, gold at 45°, appearing on a small fraction of the surface area.
- **Themes by variable flip.** Light mode redefines the same names (`--jet` 22% → 88%, `--onyx`
  17% → 100%). One stylesheet, two palettes.

**What is not worth taking:** a 355 KB bundle to render text; six keyframes including `zoom` and
`scaleUp`; and the fact that a recruiter who has seen the template will recognise it.

### 1B. aakarsh-devhq.vercel.app — the "micro animations" one

**Stack:** no framework at all. Hand-written `style.css` and `script.js`, plus Three.js r128,
GSAP 3.12.2 with ScrollTrigger, Font Awesome 6.4.0 and devicon, all from CDNs. Inter at weights
400/700/800.

**Two things to know before borrowing from it:**

1. **It loads GSAP and ScrollTrigger and never calls them.** Zero occurrences of `gsap.to`,
   `gsap.from`, `gsap.timeline` or `ScrollTrigger` in its JavaScript. Every reveal is
   `IntersectionObserver` plus `classList.add` — 3 observers, 14 class additions. The animation
   quality you liked is CSS, and the two libraries are dead weight on the critical path.
2. **It has no `prefers-reduced-motion` handling anywhere.** Zero matches for both
   `matchMedia` and the media query. On top of a 3,200-sprite WebGL starfield, that is an
   accessibility failure, not a style choice.

**The actual micro-animation inventory** — 15 keyframes: `bounce`, `floatIcon`, `floatProfile`,
`glowLine`, `neonGlow`, `particleFloat`, `preloaderFadeIn`, `rotateBorder`, `shimmer`,
`slideInTL/TR/BL/BR`, `taglineCycle`, `wave`.

Techniques worth naming:

- **Corner-aware entrances.** Four separate slide-ins keyed to which corner an element occupies,
  so reveals feel composed rather than uniform.
- **An animated conic-gradient border** driven by `@property --angle { syntax: '<angle>' }` and a
  `rotateBorder` keyframe. Registering a custom property is what makes an angle interpolable in
  pure CSS — no JavaScript, and it is the single most transferable trick on the site.
- **Two scroll-progress bars** at `width 0.08s linear` and `width 0.05s linear`. Near-zero
  durations so the bar reads as *attached to* the scroll rather than chasing it.
- **A typewriter** (`function type`) and a cycling tagline.
- **Pointer-reactive tilt** via `mousemove` plus `getBoundingClientRect` (7 uses).
- **21 `backdrop-filter` and 16 `mask` declarations** — the frosted-and-faded look is doing a lot
  of the visual work.

**Its easing vocabulary,** which is the part most worth stealing:

| Curve | Uses | Character |
|---|---|---|
| `cubic-bezier(0.4, 0, 0.2, 1)` | 6 | Material standard — neutral, safe |
| `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | 5 | Overshoots past the target and settles |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | 3 | Springier overshoot |
| `cubic-bezier(0.16, 1, 0.3, 1)` | 1 | Strong ease-out, no overshoot |

**What is not worth taking:** `transition: all` appears 13 times, which animates every property
that ever changes and is a reliable source of jank; two icon CDNs; and the starfield.

### 1C. aashishjaini.me — the "subtle creativity" one

**Stack:** Next 15.4.10, React 19.1.0, Tailwind 3.4, shadcn/Radix (14 packages), and — shipped
together — **Framer Motion 12.23, `motion` 12.38, GSAP 3.13 with `@gsap/react`, and Lenis 1.3**.
Behind it, Prisma, Upstash Redis rate-limiting, and Nodemailer for the contact form. The HTML
carries `<meta name="generator" content="v0.dev">`, so the base was generated and then worked on.

The pieces you liked, as they actually exist in source:

- **Custom cursor** (`components/custom-cursor.tsx`) — an inline 27×30 SVG arrow positioned by
  `gsap.to(el, { x, y, ease: "power2.out", duration: 0.05 })`. The comment in the source says
  *"very short duration = no visible lag"*, and that is the whole trick: a follower cursor feels
  cheap when it lags, so the duration is set just high enough to smooth jitter. It scales to 1.3
  over `a, button, .hoverable`, and returns early on `window.innerWidth < 768`.
- **Smooth scroll** (`components/lenis-provider.tsx`) — eleven lines wrapping the tree in
  `<ReactLenis root>`.
- **Scroll progress with section tracking** (`components/code-progress-bar.tsx`) — a Framer
  Motion bar that also fades the header out once past 100 px of scroll, so chrome disappears as
  you read.
- **Background** — plain Canvas 2D particles with a mobile check. Not WebGL.
- **Tailwind config** — stock shadcn: HSL channel variables, a `--radius` ladder computed by
  `calc()`, Inter plus Space Grotesk, `tailwindcss-animate`.

**What is not worth taking:** three motion libraries where one would do; a database, a Redis
instance and an SMTP client attached to a personal site; and a generated base you would then have
to make not look generated.

---

## 2. What actually produces "premium"

Synthesising across all three, ranked by effect per unit of effort.

1. **Restraint in the type scale beats expression.** The site you called premium tops out at
   24 px. Large type is louder, not more expensive-looking. Pick roughly six sizes and never
   deviate.
2. **One easing and duration vocabulary, applied everywhere.** Two or three named curves and two
   or three durations, used consistently. Inconsistent timing is the single most common reason
   hand-built sites feel amateur, and it is invisible until you count.
3. **Depth by surface ladder, not by borders.** Three to five background steps plus a shadow
   ladder. Outlines everywhere is the default look of an unstyled app.
4. **One accent hue, kept under about 5% of surface area.** All three references do this — gold,
   purple, blue. Scarcity is what makes an accent read as deliberate.
5. **A spacing scale, obeyed without exception.** 4 px or 8 px base. Arbitrary margins are
   perceptible even when no one can say why.
6. **Motion that explains rather than decorates.** Progress bars, state transitions and reveals
   that follow reading order survive repeat visits. Floating and pulsing decorations do not.
7. **Never `transition: all`.** Name the properties. It is faster and it prevents accidental
   animation of things you did not intend.
8. **Reduced-motion as a designed state, not a disabled one.** Two of three references simply do
   not handle it. Yours already treats it as first-class, which is genuinely ahead of all three.
9. **Optical detail.** Tabular numerals for anything in a column, tightened tracking on large
   light weights, hairlines at true 1 px. Individually invisible, collectively decisive.

---

## 3. Where your site stands today

Measured against the above, on the current branch:

| Element | Reference sites | `src/app/globals.css` today |
|---|---|---|
| Colour tokens | yes | **yes** — paper/ink/line, both themes |
| Type scale | 8 steps | **absent** — sizes set ad hoc per component |
| Weight scale | 4 steps | **absent** |
| Spacing scale | implicit 8 px | **absent** — `ml-[66px]`, `px-11` hand-picked |
| Radius ladder | yes (shadcn `calc()`) | **absent** |
| Shadow ladder | 5 steps | **absent** |
| Shared transition token | 1 token, 14 uses | partial — one rule, scoped to `a, button` only |
| Easing vocabulary | 3–4 named curves | **absent** — `ease` only |
| Reduced-motion path | 0 of 3 handle it | **yes**, designed in |

The whole file is 42 lines. The gap is not visual talent; it is that six of the nine systems that
produce the feeling you are chasing have not been written down yet. That is a couple of hours of
work, and it is the highest-leverage thing available.

---

## 4. Proposed stack

Your constraints (static export, 180 KB gz first-load, currently 152.5 KB with 27.5 KB of
headroom, no dependency additions without asking) rule out most of what the references use.

### Keep, no change
Next 16 static export · Tailwind v4 with CSS-first tokens · `next-themes` · `motion` for the Line.

### Add — zero dependency cost
- **A token layer in `globals.css`**: `--text-1…6`, `--space-1…8`, `--radius-1…3`, `--elev-1…3`,
  `--ease-out`/`--ease-inout`, `--dur-fast`/`--dur-base`. This is the entire section 2 list and it
  costs nothing but CSS.
- **`@property`-registered custom properties** for anything you want to interpolate in pure CSS —
  the technique behind site B's rotating border, usable for hue and angle transitions without JS.
- **`font-variant-numeric: tabular-nums`** on the work index years and numbering.
- **CSS scroll-driven animations** (`animation-timeline: scroll()` / `view()`). Worth a spike:
  if support is adequate, portions of the Line could scrub with **zero JavaScript**, with the
  `motion` controller as fallback. Verify current browser support before committing — do not take
  my word for it.
- **The View Transitions API** for project-page navigation. Native, degrades silently, and
  respects reduced-motion without extra code.

### Reject, with reasons
| Candidate | Why not |
|---|---|
| **Lenis** | Banned by name in `CLAUDE.md`. It also hijacks native scrolling, fights `prefers-reduced-motion`, and would break the Line's `useScroll` contract. |
| **Three.js** | ~150 KB against 27.5 KB of headroom. Not arguable. |
| **shadcn/Radix** | You have no dialogs, tabs or toasts. 14 packages for components that do not exist. |
| **Icon packs** | Banned by `CLAUDE.md`. The handful of glyphs you need are inline SVG. |
| **A second motion library** | `motion` is already budgeted. Site C shipping three is a warning, not a model. |

---

## 5. The nice aspects, per site

**aakashrajbanshi.com.np** — compressed 8-step type scale topping out at 24 px · five-step
near-black surface ladder · single gold accent used sparingly · one shared `.25s ease` transition
token · five-step shadow ladder replacing borders · light/dark by redefining the same variable
names · a dot-texture token (`--dot-color`) at 12% white, which is close to what your halftone
already does.

**aakarsh-devhq.vercel.app** — corner-aware entrance directions · `@property`-driven conic
gradient border · scroll progress at 0.05s linear so it feels attached · overshoot easing used
deliberately and only on small elements · heavy `backdrop-filter` and `mask` for depth · a
typewriter that stops after one pass rather than looping forever · IntersectionObserver reveals
that cost nothing.

**aashishjaini.me** — a near-zero-duration follower cursor that scales on interactive elements ·
chrome that fades away once you start reading · scroll progress tied to named sections · a
`--radius` ladder derived by `calc()` from one value · desktop-only gating of pointer effects ·
Canvas 2D rather than WebGL for ambient background.

---

## 6. Ideas worth adding — creative, quiet, and yours

The brief is unique without being loud. The strongest move is not to import portfolio tropes but
to push your existing drafting metaphor further, because that is the thing none of the three
references has. Ranked by payoff against risk.

1. **A print stylesheet that renders the site as a drawing sheet.** `@media print`: title block
   bottom-right with name, date, revision; the Line becomes a border rule; sections become
   numbered views. Costs zero JavaScript, cannot regress anything on screen, and almost nobody
   does it. Print your page and it comes out looking like a drawing. This is the single most
   on-brand idea available to you.
2. **Dimension lines on work-row hover.** Hovering a project row draws a faint AutoCAD-style
   extension-and-arrow dimension between the rail and the row, labelled with the year. Uses
   `stroke-dashoffset`, so it draws rather than translates — consistent with your motion contract.
3. **Tabular numerals plus a drawing-schedule index.** Numbers in the work index aligned like a
   parts schedule. One CSS line; changes how the whole section reads.
4. **A keyboard-navigable rail.** The tick follows `:focus-visible` as you tab. Accessibility
   rendered as a visible feature rather than a compliance checkbox.
5. **Grid substrate that reveals near the Line.** A faint engineering grid, masked to a radial
   gradient centred on the rail, so it fades in only around the Line. Pure CSS, no JS.
6. **A colophon that shows the seed.** Your halftone is already date-seeded; print
   `today's field: 20260908` in the colophon. Quiet, technically honest, and different every day.
7. **Hatch fill on in-draft chips.** A 1 px diagonal hatch behind `in-draft` only — drafting
   convention for unfinished material, and it distinguishes status without adding another colour.
8. **A revision-cloud 404.** Replaces the flat-line gag with a drafting convention: a revision
   cloud around "404" and a `REV. A` note.

Explicitly *not* recommended, despite appearing in your references: a follower cursor, smooth
scroll, particle fields, an intro/preloader screen, and looping typewriters. Each is loud, each
translates something, and each fights the contract that makes your site feel calm.

---

## 7. Sources

- `https://aakashrajbanshi.com.np/` — bundles inspected 2026-09-08
- `https://aakarsh-devhq.vercel.app/` — `style.css`, `script.js`, `3d_background.js`
- `https://www.aashishjaini.me/` and `https://github.com/Aashish17405/Portfolio`
- `https://github.com/codewithsadee/vcard-personal-portfolio` — confirmed origin of 1A's token system
- MDN: `@property`, `animation-timeline`, View Transitions API, `prefers-reduced-motion`
- In-repo: `docs/superpowers/specs/2026-07-03-throughline-redesign-design.md` §2, §6, §7

---

## 8. The open decision

You said "start building" without answering the question about how much of the motion layer to
buy, so this document assumes the **conservative reading**: the Throughline motion contract holds
(the Line and its tick remain the only translating elements, everything else stays 150 ms
colour-only), and section 6 proposes additions that live inside it rather than around it.

Every idea in section 6 is compatible with that contract. If you want to relax it — a follower
cursor and smooth scroll are the two that would require it — say so and section 6 changes
substantially.

**Recommended first move regardless of that answer:** build the section 3 token layer. It is
required under either reading, it costs no dependencies and no budget, and it is where most of
the premium feeling in all three references actually comes from.
