import type { Page } from "@playwright/test";

export async function signInThroughUi(
  page: Page,
  identity: { email: string; password: string },
): Promise<void> {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(identity.email);
  await page.getByLabel("Password").fill(identity.password);
  await Promise.all([
    page.waitForURL((url) => url.pathname !== "/sign-in", { timeout: 20_000 }),
    page.getByRole("button", { name: "Sign in", exact: true }).click(),
  ]);
}
