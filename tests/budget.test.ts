import { expect, test } from "bun:test";
import { firstLoadJsPaths } from "../src/lib/budget";

test("finds script srcs, dedupes, ignores nomodule", () => {
  const html = `<script src="/_next/static/chunks/a.js" async=""></script>
    <script src="/_next/static/chunks/a.js"></script>
    <script src="/_next/static/chunks/legacy.js" noModule=""></script>`;
  expect(firstLoadJsPaths(html)).toEqual(["/_next/static/chunks/a.js"]);
});
