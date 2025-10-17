import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("health check - app loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("API - boards endpoint responds", async ({ request }) => {
    const response = await request.get("/api/board/1");
    expect(response.ok()).toBeTruthy();
  });

  test("API - users endpoint responds", async ({ request }) => {
    const response = await request.get("/api/users/2");
    expect(response.ok()).toBeTruthy();
  });

  test("critical path - can view board", async ({ page }) => {
    await page.goto("/board/1");
    await expect(page.locator("article")).toHaveCount(11);
  });
});
