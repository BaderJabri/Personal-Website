import { test, expect } from "@playwright/test";

test("home renders with sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Bader Aljabri");
  for (const id of ["work", "play", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});
