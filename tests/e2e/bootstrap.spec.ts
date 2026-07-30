import { expect, test } from "@playwright/test";

test("renders the BTLS landing page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "One workspace for business operations and web growth.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("status", { name: "Application status" })).toContainText("Available");
});

test("returns a minimal public health response", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  await expect(response.json()).resolves.toEqual({ status: "ok" });
});
