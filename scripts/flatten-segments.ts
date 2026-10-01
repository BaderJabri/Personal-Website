// Next 16's static export writes client-router segment files into folders
// (`__next.work/$d$slug/__PAGE__.txt`) while the router requests dotted names
// (`__next.work.$d$slug.__PAGE__.txt`), so every prefetch 404s. This writes the dotted copy
// next to each folder. Idempotent, and a no-op when the export already uses dotted names.
// Runs in the build chain after `next build`.
import fs from "node:fs";
import path from "node:path";

export function flattenSegments(root: string): number {
  let written = 0;
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("__next.")) {
        written += copyFlat(full, dir, entry.name);
      } else {
        walk(full);
      }
    }
  };
  const copyFlat = (segDir: string, parent: string, prefix: string): number => {
    let n = 0;
    for (const entry of fs.readdirSync(segDir, { withFileTypes: true })) {
      const full = path.join(segDir, entry.name);
      const name = `${prefix}.${entry.name}`;
      if (entry.isDirectory()) {
        n += copyFlat(full, parent, name);
      } else {
        const target = path.join(parent, name);
        if (!fs.existsSync(target)) {
          fs.copyFileSync(full, target);
          n++;
        }
      }
    }
    return n;
  };
  walk(root);
  return written;
}

if (import.meta.main) {
  console.log(`segment files flattened: ${flattenSegments("out")}`);
}
