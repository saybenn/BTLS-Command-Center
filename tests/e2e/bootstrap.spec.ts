import { expect, test } from "./fixtures";

test("renders the BTLS landing page", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", {
      name: "One workspace for business operations and web growth.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("status", { name: "Application status" })).toContainText("Available");
});

test("resolves semantic surface tokens in dark and light themes", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const surfaceColors = await page.evaluate(() => {
    const root = document.documentElement;

    root.classList.remove("light");
    const dark = getComputedStyle(document.body).backgroundColor;

    root.classList.add("light");
    const light = getComputedStyle(document.body).backgroundColor;

    root.classList.remove("light");

    return { dark, light };
  });

  expect(surfaceColors.dark).not.toBe(surfaceColors.light);
  expect(surfaceColors.dark).not.toBe("rgba(0, 0, 0, 0)");
  expect(surfaceColors.light).not.toBe("rgba(0, 0, 0, 0)");
});

test("returns a minimal public health response", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  await expect(response.json()).resolves.toEqual({ status: "ok" });
});
