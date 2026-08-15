import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = "http://127.0.0.1:3100";
const password = "local-browser-password";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("The local Supabase Auth environment is required for auth browser tests.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const createdUserIds: string[] = [];

function uniqueEmail(prefix: string) {
  return `${prefix}-${randomUUID()}@example.test`;
}

async function createConfirmedUser() {
  const email = uniqueEmail("browser-auth");
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  if (error || !data.user) throw error ?? new Error("Local Auth did not create a test user.");
  createdUserIds.push(data.user.id);
  return { email, id: data.user.id };
}

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await admin.from("app_users").delete().in("id", createdUserIds);
  await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
});

test("anonymous users cannot open the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("an invited user establishes a password and reaches the dashboard", async ({ page }) => {
  const email = uniqueEmail("browser-invite");
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${appUrl}/invite` },
  });
  if (error || !data.user || !data.properties.action_link) {
    throw error ?? new Error("Local Auth did not generate an invitation link.");
  }
  createdUserIds.push(data.user.id);

  await page.goto(data.properties.action_link, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Activate your account" })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel("Create a password").fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Accept invitation" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
  await expect(page.getByText(email)).toBeVisible();
});

test("a signed-in session survives navigation and refresh", async ({ page }) => {
  const user = await createConfirmedUser();
  await signIn(page, user.email);
  await page.goto("/unauthorized");
  await page.goto("/dashboard");
  await page.reload();
  await expect(page.getByRole("heading", { name: "You are signed in" })).toBeVisible();
});

test("forgot-password response does not enumerate accounts", async ({ page }) => {
  const user = await createConfirmedUser();
  const submit = async (email: string) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill(email);
    await page.getByRole("button", { name: "Send reset instructions" }).click();
    return page
      .getByText(
        "If an account exists for that email, you will receive password-reset instructions shortly.",
      )
      .textContent();
  };

  await expect(await submit(user.email)).toBe(await submit(uniqueEmail("unknown")));
});

test("a disabled user is denied on the next protected request", async ({ page }) => {
  const user = await createConfirmedUser();
  await signIn(page, user.email);
  await admin.from("app_users").update({ status: "DISABLED" }).eq("id", user.id);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in\?reason=disabled$/);
});
