import { expect, test } from "bun:test";
import script from "../content/demo/wing-rib.json";
import { scriptDuration } from "../src/lib/demo-state";
import { sessionScriptSchema } from "../src/lib/session-script";

// The build-time gate for the demo: a bad script fails `bun test` in CI.
test("wing-rib script validates and stays short", () => {
  const events = sessionScriptSchema.parse(script);
  expect(scriptDuration(events, { charMs: 18 })).toBeLessThanOrEqual(15000);
});

test("wing-rib script draws every layer", () => {
  const events = sessionScriptSchema.parse(script);
  const layers = new Set(events.flatMap((e) => (e.kind === "geometry" ? [e.layer] : [])));
  expect([...layers].sort()).toEqual(["CENTER", "DIMS", "RIB-CUTOUTS", "RIB-OUTLINE"]);
});

test("no em or en dashes in anything the demo shows", () => {
  expect(JSON.stringify(script)).not.toMatch(/[–—]/);
});
