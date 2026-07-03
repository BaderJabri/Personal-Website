import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { firstLoadJsPaths } from "../src/lib/budget";

const BUDGET = 180 * 1024; // amended from 80KB — Bader, 2026-07-03 (D1)
const html = readFileSync("out/index.html", "utf8");
let total = 0;
for (const p of firstLoadJsPaths(html)) {
  const gz = gzipSync(readFileSync(join("out", p))).length;
  total += gz;
  console.log(`${(gz / 1024).toFixed(1).padStart(7)} KB gz  ${p}`);
}
console.log(`first-load JS: ${(total / 1024).toFixed(1)} KB gz (budget 180)`);
if (total > BUDGET) process.exit(1);
