import { expect, test } from "./fixtures";

test("links the internal index to the illustrative UI Foundation catalog on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto("/development-status", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Internal references" })).toBeVisible();
  await expect(page.getByLabel("Database and environment status")).toBeVisible();
  await expect(page.getByText("Database reachability")).toBeVisible();
  await expect(
    page.getByText("Configuration is shown without URLs, keys, or connection details."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Open UI Foundation showcase" }).click();

  await expect(page).toHaveURL(/\/development-status\/ui-foundation$/);
  await expect(page.getByLabel("Full shell preview")).toBeVisible();
  await expect(page.getByLabel("Application sidebar")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Primitives" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Feedback states" })).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Illustrative recent activity table" }),
  ).toBeVisible();
  await expect(page.getByText("Illustrative examples only.")).toBeVisible();
});

test("keeps the UI Foundation catalog useful at a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/development-status/ui-foundation", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Application sidebar")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Theme" })).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Illustrative recent activity table" }),
  ).toBeVisible();
});
