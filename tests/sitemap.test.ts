import { expect, test } from "bun:test";
import { sitemapPaths } from "../scripts/sitemap.mjs";

test("reads every listed page as a site path", () => {
  const xml = `<urlset><url><loc>https://baderjabri.ca/</loc></url><url><loc>https://baderjabri.ca/projects/plotit/</loc></url></urlset>`;
  expect(sitemapPaths(xml)).toEqual(["/", "/projects/plotit/"]);
});

test("a sitemap with no pages throws, so a route-driven check can't pass by checking nothing", () => {
  expect(() => sitemapPaths("<!doctype html><title>404</title>")).toThrow(/no pages/);
});
