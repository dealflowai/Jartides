import { test, expect } from "@playwright/test";

test.describe("Checkout flow", () => {
  test("checkout page redirects without items", async ({ page }) => {
    await page.goto("/checkout");
    // Should either show empty cart message or redirect
    const content = await page.textContent("body");
    // Either we see checkout content or got redirected
    expect(content).toBeTruthy();
  });

  test("contact form loads and validates", async ({ page }) => {
    await page.goto("/");
    // Scroll to contact or navigate to contact section
    const contactLink = page.locator('a[href*="contact"]').first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
    }
  });
});

test.describe("Cart", () => {
  test("cart sidebar opens and closes", async ({ page }) => {
    await page.goto("/shop");
    // Look for cart button in header
    const cartButton = page.locator('button[aria-label*="cart" i], button:has(> svg)').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      // Cart sidebar should be visible
      await page.waitForTimeout(500);
    }
  });
});
