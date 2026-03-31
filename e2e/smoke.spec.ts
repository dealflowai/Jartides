import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage loads and has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Jartides/i);
  });

  test("homepage has hero section and shop link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    const shopLink = page.locator('a[href="/shop"]').first();
    await expect(shopLink).toBeVisible();
  });

  test("shop page loads with products", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).toHaveTitle(/Shop|Jartides/i);
    // Wait for product cards to load
    await expect(page.locator("main")).toBeVisible();
  });

  test("404 page renders correctly", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("header navigation links work", async ({ page }) => {
    await page.goto("/");
    // Navigate to shop
    await page.locator('header a[href="/shop"]').first().click();
    await expect(page).toHaveURL(/\/shop/);
  });

  test("skip-to-content link is accessible", async ({ page }) => {
    await page.goto("/");
    // Tab to the skip link
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
  });
});

test.describe("SEO", () => {
  test("has meta description", async ({ page }) => {
    await page.goto("/");
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /.+/);
  });

  test("has open graph tags", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });
});
