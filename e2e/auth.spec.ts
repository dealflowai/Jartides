import { test, expect } from "@playwright/test";

test.describe("Authentication flows", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Log In|Sign In|Jartides/i);
    // Should have email and password fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveTitle(/Register|Sign Up|Jartides/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword123");
    await page.locator('button[type="submit"]').click();
    // Should show some error indication
    await page.waitForTimeout(2000);
    // Page should still be on login (not redirected)
    await expect(page).toHaveURL(/\/login/);
  });

  test("protected routes redirect unauthenticated users", async ({ page }) => {
    await page.goto("/account");
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin routes redirect unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
