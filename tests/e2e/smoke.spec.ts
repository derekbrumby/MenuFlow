import { test, expect } from "@playwright/test";

test.describe("MenuFlow surfaces", () => {
  test("landing page has links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "MenuFlow" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Guest Menu" })).toBeVisible();
  });
});
