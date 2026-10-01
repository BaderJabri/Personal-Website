import { afterEach, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { flattenSegments } from "../scripts/flatten-segments";

let dir: string;
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

test("writes the dotted copy the router requests for each nested segment file", () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "seg-"));
  const nested = path.join(dir, "work", "plotit", "__next.work", "$d$slug");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(path.join(nested, "__PAGE__.txt"), "page");
  fs.writeFileSync(path.join(dir, "work", "plotit", "__next.work", "$d$slug.txt"), "layout");

  const written = flattenSegments(dir);

  expect(fs.readFileSync(path.join(dir, "work", "plotit", "__next.work.$d$slug.__PAGE__.txt"), "utf8")).toBe("page");
  expect(fs.readFileSync(path.join(dir, "work", "plotit", "__next.work.$d$slug.txt"), "utf8")).toBe("layout");
  expect(written).toBe(2);
  expect(flattenSegments(dir)).toBe(0); // idempotent
});
