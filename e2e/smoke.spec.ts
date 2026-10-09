import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import puzzles from "../content/chess/puzzles.json";

// Every page the site publishes, so a new project is covered without editing these tests.
async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}
const projectPaths = (paths: string[]) => paths.filter((p) => /^\/projects\/[^/]+\/$/.test(p));

test("home is a short summary: name, experience, education, projects, a chess puzzle", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveAttribute("aria-label", "Bader Aljabri");
  await expect(page.locator("#exp-label")).toHaveText("Recent experience");
  await expect(page.getByText("Patterned AI").first()).toBeVisible();
  await expect(page.getByText("University of Waterloo")).toBeVisible();
  await expect(page.getByRole("link", { name: /View my projects/ })).toHaveAttribute("href", "/projects/");
  await page.locator(".home-chess summary").click();
  await expect(page.locator(".chess-board")).toBeVisible();
});

test("every page in the nav builds and marks itself current", async ({ page }) => {
  for (const [label, path, heading] of [
    ["Projects", "/projects/", "Projects"],
    ["Experience", "/experience/", "Experience"],
  ]) {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("h1")).toHaveText(heading);
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
  }
});

test("every project on /projects links to a built page", async ({ page, request }) => {
  const projects = projectPaths(await sitemapPaths(request));
  await page.goto("/projects/");
  const hrefs = await page.$$eval("main a[href^='/projects/']", (as) => [
    ...new Set(as.map((a) => (a as HTMLAnchorElement).pathname)),
  ]);
  expect(hrefs.length).toBe(projects.length);
  // each project offers an explicit button into its page
  await expect(page.getByRole("link", { name: /^View project:/ })).toHaveCount(projects.length);
  for (const h of hrefs) {
    const res = await page.goto(h);
    expect(res!.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("the Claude × AutoCAD replay plays in view and finishes with Replay", async ({ page }) => {
  await page.goto("/projects/claude-autocad/");
  const demo = page.locator("[data-demo]");
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute("data-state", "playing");
  await page.waitForTimeout(1500);
  expect(((await page.locator("[data-prompt]").textContent()) ?? "").length).toBeGreaterThan(10);
  await expect(demo).toHaveAttribute("data-state", "done", { timeout: 20000 });
  await expect(demo.getByRole("button", { name: "Replay" })).toBeVisible();
});

test("the replay pauses while off screen", async ({ page }) => {
  await page.goto("/projects/claude-autocad/");
  await page.locator("[data-demo]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  const before = await page.locator("[data-prompt]").textContent();
  await page.waitForTimeout(800);
  expect(await page.locator("[data-prompt]").textContent()).toBe(before);
});

test("reduced motion shows the finished drawing straight away", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/projects/claude-autocad/");
  const demo = page.locator("[data-demo]");
  await expect(demo).toHaveAttribute("data-state", "done");
  await expect(demo.locator("[data-done]")).toBeVisible();
  await ctx.close();
});

test("the pattern toy turns a tile square and switches layout", async ({ page }) => {
  await page.goto("/projects/tile-to-pattern/");
  const pattern = page.locator("main pattern");
  const before = await pattern.innerHTML();
  await page.locator(".toy-cell").first().click();
  expect(await pattern.innerHTML()).not.toBe(before);
  await page.getByRole("button", { name: "Grid" }).click();
  await expect(pattern).toHaveAttribute("height", "120");
});

async function play(page: Page, uci: string) {
  const square = (s: string) => page.locator(`.chess-board [role=gridcell][aria-label^="${s}"]`);
  await square(uci.slice(0, 2)).click();
  await square(uci.slice(2, 4)).click();
}

test("chess: a wrong move is shown as wrong, the right one solves it", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // the interactive board loads as its section nears the viewport
  await page.locator(".home-chess summary").click();
  await page.locator(".chess-frame").scrollIntoViewIfNeeded();
  await page.locator(".chess-board [role=gridcell]").first().waitFor();
  const message = page.locator(".chess-message");
  const first = puzzles[0].solution[0];
  await page.locator(`.chess-board [role=gridcell][aria-label^="${first.slice(0, 2)}"]`).click();
  const targets = await page.$$eval(".chess-board [role=gridcell]", (els) =>
    els
      .filter((e) => e.querySelector(".chess-dot, .chess-capture"))
      .map((e) => e.getAttribute("aria-label")!.slice(0, 2)),
  );
  const wrong = targets.find((t) => t !== first.slice(2, 4))!;
  await page.locator(`.chess-board [role=gridcell][aria-label^="${wrong}"]`).click();
  await expect(page.locator(".chess-flash-wrong")).toHaveCount(1);
  await expect(message).toHaveAttribute("data-tone", "bad");
  await page.waitForTimeout(1000);
  await play(page, first);
  await expect(message).toContainText("Checkmate");
  await expect(page.getByRole("button", { name: "Next puzzle" })).toBeVisible();
});

test("chess: a multi-move puzzle plays the opponent's replies and remembers progress", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // the interactive board loads as its section nears the viewport
  await page.locator(".home-chess summary").click();
  await page.locator(".chess-frame").scrollIntoViewIfNeeded();
  await page.locator(".chess-board [role=gridcell]").first().waitFor();
  const index = puzzles.findIndex((p) => p.solution.length >= 3);
  await page.getByRole("button", { name: new RegExp(`^Puzzle ${index + 1}$`) }).click();
  const line = puzzles[index].solution;
  for (let i = 0; i < line.length; i += 2) {
    await play(page, line[i]);
    if (i + 1 < line.length) await expect(page.locator(".chess-message")).toHaveText("Your move.", { timeout: 3000 });
  }
  await expect(page.locator(".chess-message")).toHaveAttribute("data-tone", "done");
  await page.reload();
  await page.locator(".home-chess summary").click();
  await page.locator(".chess-frame").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: new RegExp(`^Puzzle ${index + 1}, solved$`) })).toBeVisible();
});

test("theme switch flips the theme and it persists across a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/experience/");
  const toggle = page.getByRole("switch", { name: "Dark theme" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("unknown paths get the 404 page", async ({ page }) => {
  const res = await page.goto("/nowhere/");
  expect(res!.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Nothing at this address");
});

test("summary keeps primary actions visible and navigation in bounds", async ({ page }) => {
  for (const [width, height] of [
    [1366, 668],
    [1280, 720],
    [390, 844],
    [320, 740],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.getByRole("link", { name: /View my projects/ })).toBeInViewport();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Résumé" })).toBeInViewport();
    const size = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    expect(size.width).toBeLessThanOrEqual(width);
    await expect(page.getByRole("heading", { name: "Design teams", exact: true })).toBeVisible();
    await expect(page.locator(".home-chess")).not.toHaveAttribute("open");
  }
  await page.locator(".home-chess summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".home-chess")).toHaveAttribute("open");
  await page.keyboard.press("Enter");
  await expect(page.locator(".home-chess")).not.toHaveAttribute("open");
});

test("contours respond to scrolling and remain still with reduced motion", async ({ page }) => {
  await page.goto("/experience/");
  const canvas = page.locator(".contour-field");
  const pixels = () => canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  const initial = await pixels();
  await page.evaluate(() => scrollTo(0, 900));
  await expect.poll(pixels).not.toBe(initial);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const still = await pixels();
  await page.evaluate(() => scrollTo(0, 1500));
  await page.mouse.move(600, 300);
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(still);
});

test("resume navigation serves the supplied PDF", async ({ page, request }) => {
  await page.goto("/");
  const resume = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Résumé" });
  await expect(resume).toHaveAttribute("href", "/Bader-Aljabri-Resume.pdf");
  const response = await request.get("/Bader-Aljabri-Resume.pdf");
  expect(response.ok()).toBeTruthy();
  expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("all pages fit narrow screens and load without browser errors", async ({ page, request }) => {
  const routes = await sitemapPaths(request);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(width);
    }
  }
  expect(errors).toEqual([]);
});

test("project copy and navigation remain available without JavaScript", async ({ browser, request }) => {
  const projects = projectPaths(await sitemapPaths(request));
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/projects/");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(projects.length);
  await page.getByRole("link", { name: "View project: Whisper4Windows" }).click();
  await expect(page.locator("h1")).toHaveText("Whisper4Windows");
  await expect(page.getByRole("heading", { name: "The last step is a paste" })).toBeVisible();
  await context.close();
});

test("static preview compresses text and survives malformed URLs", async ({ request }) => {
  const invalid = await request.get("/%ZZ");
  expect(invalid.status()).toBe(400);
  const home = await request.get("/", { headers: { "Accept-Encoding": "gzip" } });
  expect(home.ok()).toBeTruthy();
  expect(home.headers()["content-encoding"]).toBe("gzip");
  expect(await home.text()).toContain("Bader Aljabri");
});

test("project bodies share a centered reading column with metrics above", async ({ page, request }) => {
  const projects = projectPaths(await sitemapPaths(request));
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of projects) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const body = await page.locator("article.prose-sheet").boundingBox();
      expect(body).not.toBeNull();
      expect(Math.abs(body!.x + body!.width / 2 - width / 2), `${path} at ${width}px`).toBeLessThan(2);
      const metrics = page.locator(".project-story > dl");
      if (await metrics.count()) {
        const bounds = await metrics.boundingBox();
        expect(bounds!.y + bounds!.height).toBeLessThan(body!.y);
      }
    }
  }
});

test("AutoCAD project downloads the supplied drawing", async ({ page }) => {
  await page.goto("/projects/claude-autocad/");
  await expect(page.locator("main")).not.toContainText("in progress");
  const pending = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download DWG: Claude × AutoCAD" }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("SAE_Aero_Wing_Rib_STA3.dwg");
  expect(readFileSync((await download.path())!)).toEqual(readFileSync("public/downloads/SAE_Aero_Wing_Rib_STA3.dwg"));
});
