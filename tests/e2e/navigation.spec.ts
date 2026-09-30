import { expect, test } from "@playwright/test";

test("non-demo directory and emergency information are available without an account", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Find care, close to you." })).toBeVisible();
  await expect(page.getByText("108 — Emergency Ambulance Helpline")).toBeVisible();
  await expect(page.locator('a[href="tel:108"]')).toHaveCount(0);
  await expect(page.getByLabel("Bhubaneswar healthcare directory map")).toBeVisible();
  await expect(page.getByLabel("Describe your symptoms")).toHaveCount(0);
  await expect(page.getByText("Demo data, not medical advice")).toHaveCount(0);
});
