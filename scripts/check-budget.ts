import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { firstLoadJsPaths } from "../src/lib/budget";

const BUDGET_KB = 180; // amended from 80KB — Bader, 2026-07-03 (D1)
const BUDGET = BUDGET_KB * 1024;
const pages = readdirSync("out", { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".html"));
const sizes = new Map<string, number>();
let failed = false;
for (const page of pages) {
  const html = readFileSync(join("out", page), "utf8");
  let total = 0;
  for (const script of firstLoadJsPaths(html)) {
    if (!sizes.has(script)) sizes.set(script, gzipSync(readFileSync(join("out", script))).length);
    total += sizes.get(script)!;
  }
  console.log(`${(total / 1024).toFixed(1)} KB gz  ${page} (budget ${BUDGET_KB})`);
  if (total > BUDGET) failed = true;
}
if (failed) process.exit(1);
