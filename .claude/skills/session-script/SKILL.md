---
name: session-script
description: Use when creating or editing the Claude×AutoCAD demo component, its SessionEvent JSON scripts, or any visual inside the demo frame — schema, timing conventions, and the fidelity checklist.
---

# The demo session-script system

The demo is a **replayer**: a component that plays a validated JSON script. The component
never knows about wing ribs. If you are hardcoding geometry or transcript text into the
component, stop — it belongs in a script.

## Schema (source of truth: spec §3)

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

- `t` = ms offset from loop start. v1 script: ~16 000ms total + 2 000ms hold, then loop.
- Validate every script with zod at build time; a bad script fails the build.

## Authoring conventions

- Event order per operation: `tool_call` → `command_echo` → `geometry` → `tool_result`.
- Command-line echoes use real AutoCAD command names and prompt text
  (`PLINE Specify start point:`, `RECTANG`, `ARRAYPATH`, `DIMLINEAR`).
- Geometry draw-on uses `pathLength`-normalized stroke dash animation; dash-dot linetypes
  (centerlines) FADE in instead (dashoffset animation on patterned strokes = marching ants).

## Layer/color table (ACAD convention — never restyle)

| Layer | Color | Content |
|---|---|---|
| RIB-OUTLINE | white `#f0f0f0` | closed profile polylines |
| RIB-CUTOUTS | cyan `#00ffff` | holes, slots |
| CENTER | red `#ff4d4d`, dash-dot | centerlines, hole crosses |
| DIMS | yellow `#ffd21f` | extension/dim lines, arrows, text |

## Claude pane conventions (mimic Claude Code exactly)

- `>` user prompt (typed), `✻ Thinking…` italic gray with pulsing ✻,
  `⏺` tool call with orange bullet `#d97757`, `⎿` indented gray result,
  `✓` completion in green `#4be38a`, bordered input box with blinking cursor.

## AutoCAD chrome checklist (from canonical mockup `docs/superpowers/specs/mockups/autocad-demo-v2.html`)

Title bar + QAT · ribbon tabs (Home active: Draw/Modify/Annotation/Layers panels) ·
file tabs · model space `#212830` with minor/major grid · crosshair + pickbox ·
dynamic-input tooltip · ViewCube · UCS icon · command line (scrolling history + current
prompt row) · Model/Layout tabs · status bar (coords + GRID SNAP ORTHO POLAR OSNAP LWT,
active toggles blue `#4a90d9`).

## Behavior requirements

- Plays on scroll-into-view, loops, pauses off-screen (IntersectionObserver).
- Hover reveals a replay button (bottom-right).
- `prefers-reduced-motion`: render final frame + play button. No-JS: static final-frame SVG.
