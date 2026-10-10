import { expect, test } from "bun:test";
import fs from "node:fs";
import { SITE } from "../src/lib/site";

// Résumé links already sent out (applications, LinkedIn) must keep working after a rename.
// Cloudflare Pages reads public/_redirects: "<from> <to> <status>" per line.
const LEGACY_RESUMES = ["/Bader-Aljabri-2025.pdf", "/FD-Resume.pdf"];

test("old résumé URLs redirect permanently to the current file", () => {
  const rules = fs
    .readFileSync("public/_redirects", "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/\s+/));
  for (const from of LEGACY_RESUMES) {
    expect(rules).toContainEqual([from, SITE.resumePath, "301"]);
  }
  expect(fs.existsSync(`public${SITE.resumePath}`)).toBe(true);
});
