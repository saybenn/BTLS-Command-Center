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
const createdAccountIds: string[] = [];

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
  await expect(page).toHaveURL(/\/no-access$/);
}

async function createClientPropertyFixture(userId: string) {
  const suffix = randomUUID().slice(0, 8);
  const accountId = randomUUID();
  const membershipId = randomUUID();
  const now = new Date().toISOString();
  const accountName = `Browser client ${suffix}`;
  const { data: account, error: accountError } = await admin
    .from("client_accounts")
    .insert({ id: accountId, name: accountName, updated_at: now })
    .select("id")
    .single();
  if (accountError || !account)
    throw accountError ?? new Error("Could not create a client account.");
  createdAccountIds.push(account.id);

  const { data: properties, error: propertiesError } = await admin
    .from("client_properties")
    .insert([
      {
        account_id: account.id,
        id: randomUUID(),
        name: `Browser property one ${suffix}`,
        updated_at: now,
      },
      {
        account_id: account.id,
        id: randomUUID(),
        name: `Browser property two ${suffix}`,
        updated_at: now,
      },
      {
        account_id: account.id,
        id: randomUUID(),
        name: `Browser property denied ${suffix}`,
        updated_at: now,
      },
    ])
    .select("id, name");
  if (propertiesError || !properties || properties.length !== 3) {
    throw propertiesError ?? new Error("Could not create client properties.");
  }

  const { data: membership, error: membershipError } = await admin
    .from("account_memberships")
    .insert({
      account_id: account.id,
      id: membershipId,
      role: "CLIENT_VIEWER",
      updated_at: now,
      user_id: userId,
    })
    .select("id")
    .single();
  if (membershipError || !membership) {
    throw membershipError ?? new Error("Could not create client membership.");
  }

  const grants = properties.slice(0, 2).map((property) => ({
    account_id: account.id,
    id: randomUUID(),
    membership_id: membership.id,
    property_id: property.id,
    updated_at: now,
  }));
  const { error: grantsError } = await admin.from("property_accesses").insert(grants);
  if (grantsError) throw grantsError;

  return { accountName, grantedProperties: properties.slice(0, 2), deniedProperty: properties[2] };
}

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  if (createdAccountIds.length > 0) {
    await admin.from("audit_events").delete().in("account_id", createdAccountIds);
    await admin.from("property_accesses").delete().in("account_id", createdAccountIds);
    await admin.from("account_memberships").delete().in("account_id", createdAccountIds);
    await admin.from("client_properties").delete().in("account_id", createdAccountIds);
    await admin.from("client_accounts").delete().in("id", createdAccountIds);
  }
  await admin.from("app_users").delete().in("id", createdUserIds);
  await Promise.all(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
});

test("anonymous users cannot open the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("an invited user establishes a password and reaches no access until authorization is applied", async ({
  page,
}) => {
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
  await expect(page).toHaveURL(/\/no-access$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "No property access" })).toBeVisible({
    timeout: 20_000,
  });
});

test("a signed-in session survives navigation and refresh", async ({ page }) => {
  const user = await createConfirmedUser();
  await signIn(page, user.email);
  await page.goto("/unauthorized");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/no-access$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "No property access" })).toBeVisible();
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
  await expect(page).toHaveURL(/\/unauthorized\?reason=disabled$/);
});
test("a client sees and switches only explicit property grants, while a changed URL is denied", async ({
  page,
}) => {
  const user = await createConfirmedUser();
  await signIn(page, user.email);
  const fixture = await createClientPropertyFixture(user.id);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/select-property$/);
  await expect(page.getByRole("heading", { name: "Select a property" })).toBeVisible();
  await expect(page.getByRole("link", { name: fixture.grantedProperties[0].name })).toBeVisible();
  await expect(page.getByRole("link", { name: fixture.grantedProperties[1].name })).toBeVisible();
  await expect(page.getByText(fixture.deniedProperty.name)).not.toBeVisible();

  await page.getByRole("link", { name: fixture.grantedProperties[0].name }).click();
  await expect(page).toHaveURL(new RegExp(`/${fixture.grantedProperties[0].id}/overview$`));
  await expect(
    page.getByRole("heading", { name: fixture.grantedProperties[0].name }),
  ).toBeVisible();

  await page.getByLabel("Switch property").click();
  await page
    .getByRole("option", { name: `${fixture.grantedProperties[1].name} · ${fixture.accountName}` })
    .click();
  await expect(page).toHaveURL(new RegExp(`/${fixture.grantedProperties[1].id}/overview$`));

  await page.goto(`/${fixture.deniedProperty.id}/overview`);
  await expect(page).toHaveURL(/\/no-access$/);
});
