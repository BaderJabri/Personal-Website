export {};

process.env.PLAYWRIGHT_BROWSERS_PATH ??= "0";
const { chromium } = await import("playwright");

const url = process.argv[2] ?? "http://localhost:4173";
const routes =
  process.argv.length > 3
    ? process.argv.slice(3)
    : [
        "/",
        "/projects/",
        "/experience/",
        "/projects/claude-autocad/",
        "/projects/tile-to-pattern/",
        "/projects/whisper4windows/",
        "/projects/plotit/",
      ];
const browser = await chromium.launch();
try {
  for (const route of routes) {
    const name = route === "/" ? "home" : route.split("/").filter(Boolean).join("-");
    for (const vp of [
      { w: 1280, h: 800 },
      { w: 390, h: 844 },
    ]) {
      for (const theme of ["light", "dark"] as const) {
        const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, colorScheme: theme });
        const page = await ctx.newPage();
        await page.goto(new URL(route, url).href, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        for (const pct of [0, 25, 50, 75, 100]) {
          await page.evaluate((p) => scrollTo(0, (document.body.scrollHeight - innerHeight) * (p / 100)), pct);
          await page.waitForTimeout(550);
          const path = `screenshots/${name}/${vp.w}-${pct}-${theme}.png`;
          await page.screenshot({ path });
          console.log(path);
        }
        await ctx.close();
      }
    }
    const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
    const p = await rm.newPage();
    await p.goto(new URL(route, url).href, { waitUntil: "networkidle" });
    const rmPath = `screenshots/${name}/1280-0-light-rm.png`;
    await p.screenshot({ path: rmPath, fullPage: true });
    console.log(rmPath);
    await rm.close();
  }
  console.log("matrix written to screenshots/");
} finally {
  await browser.close();
}
