import { expect, test } from "@playwright/test";

test("home renders the hero, the replay and both toys", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveAttribute("aria-label", "Bader Aljabri");
  await expect(page.locator("[data-demo]")).toBeVisible();
  await expect(page.locator("#patterns")).toBeAttached();
  await expect(page.locator("#charts")).toBeAttached();
});

test("the pattern toy turns a tile square and switches layout", async ({ page }) => {
  await page.goto("/");
  const pattern = page.locator("#patterns pattern");
  const before = await pattern.innerHTML();
  await page.locator(".toy-cell").first().click();
  expect(await pattern.innerHTML()).not.toBe(before);
  await page.getByRole("button", { name: "Grid" }).click();
  await expect(page.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true");
  await expect(pattern).toHaveAttribute("height", "120");
});

test("the chart toy follows the spreadsheet", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Jun clicks").first().fill("720");
  await expect(page.locator(".toy-label").last()).toHaveText("720");
  await page.getByRole("button", { name: "Bars" }).click();
  await expect(page.locator(".toy-bar")).toHaveCount(6);
});

test("the chess puzzle accepts the mate and rejects other moves", async ({ page }) => {
  await page.goto("/about/");
  const feedback = page.locator("main p[aria-live=polite]");
  await page.getByRole("gridcell", { name: /^a1/ }).click();
  await page.getByRole("gridcell", { name: /^a7/ }).click();
  await expect(feedback).toContainText("isn't mate");
  await page.getByRole("gridcell", { name: /^a1/ }).click();
  await page.getByRole("gridcell", { name: /^a8/ }).click();
  await expect(feedback).toContainText("Checkmate");
});

test("every page in the nav builds and marks itself current", async ({ page }) => {
  for (const [label, path, heading] of [
    ["Work", "/work/", "Work"],
    ["About", "/about/", "About"],
    ["Contact", "/contact/", "Contact"],
  ]) {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("h1")).toHaveText(heading);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
});

test("every project on /work links to a built page", async ({ page }) => {
  await page.goto("/work/");
  const hrefs = await page.$$eval("main a[href^='/work/']", (as) => [
    ...new Set(as.map((a) => (a as HTMLAnchorElement).pathname)),
  ]);
  expect(hrefs.length).toBe(4);
  for (const h of hrefs) {
    const res = await page.goto(h);
    expect(res!.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("the replay draws in view and finishes with a Replay button", async ({ page }) => {
  await page.goto("/");
  const demo = page.locator("[data-demo]");
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute("data-state", "playing");
  // part-way through, the prompt is still being typed or the outline is still drawing
  await page.waitForTimeout(1500);
  const typed = (await page.locator("[data-prompt]").textContent()) ?? "";
  expect(typed.length).toBeGreaterThan(10);
  await expect(demo).toHaveAttribute("data-state", "done", { timeout: 20000 });
  await expect(demo.getByRole("button", { name: "Replay" })).toBeVisible();
  await expect(demo.locator("[data-done]")).toBeVisible();
});

test("the replay pauses while off screen", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");
  const demo = page.locator("[data-demo]");
  await expect(demo).toHaveAttribute("data-state", "done");
  await expect(demo.locator("[data-done]")).toBeVisible();
  await expect(demo.getByRole("button", { name: "Replay" })).toBeVisible();
  await ctx.close();
});

test("theme toggle switches and persists across a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/about/");
  await page.getByRole("contentinfo").getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("unknown paths get the 404 page", async ({ page }) => {
  const res = await page.goto("/nowhere/");
  expect(res!.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Nothing at this address");
});
