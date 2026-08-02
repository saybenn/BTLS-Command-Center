import { expect, type Page } from "@playwright/test";

export async function waitForUiFoundationClientReady(page: Page) {
  await expect(page.getByRole("main").getByRole("combobox", { name: "Theme" })).toHaveText("Dark", {
    timeout: 15_000,
  });
}
