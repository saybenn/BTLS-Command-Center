import { waitForUiFoundationClientReady } from "./helpers/readiness";
import { expect, test } from "./fixtures";

test("shows a persistent, labelled sidebar on desktop", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto("/development-status/ui-foundation", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Application sidebar")).toBeVisible();
  await expect(
    page.getByLabel("Application sidebar").getByRole("button", { name: "Overview" }),
  ).toBeVisible();
  await expect(page.getByText("Administration", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
});

test("collapses desktop navigation into an accessible tablet drawer trigger", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 900 });
  await page.goto("/development-status/ui-foundation", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Application sidebar")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
});

test("operates the mobile navigation drawer with keyboard and overlay dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/development-status/ui-foundation", { waitUntil: "domcontentloaded" });

  const trigger = page.getByRole("button", { name: "Open navigation" });
  const drawer = page.getByLabel("Mobile navigation");

  await waitForUiFoundationClientReady(page);
  await trigger.click();
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Revenue Operations" })).toBeVisible();
  await expect(drawer.getByText("Theme", { exact: true })).toBeVisible();
  await expect(drawer.getByText("Jordan Rivera", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Overview" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(drawer).toBeVisible();
  await page.getByTestId("dialog-overlay").click({ position: { x: 380, y: 400 } });
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});
