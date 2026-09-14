import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

import { signInThroughUi } from "./auth-helpers";
import { expect, test } from "./fixtures";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !process.env.DIRECT_DATABASE_URL) {
  throw new Error("Local Supabase test environment required.");
}
const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const sql = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
const users: string[] = [];
const accounts: string[] = [];

test.beforeAll(async () => {
  await sql.connect();
});

test.afterAll(async () => {
  for (const account of accounts) {
    await sql.query(
      "delete from notifications where property_id in (select id from client_properties where account_id=$1)",
      [account],
    );
    await sql.query("delete from property_accesses where account_id=$1", [account]);
    await sql.query("delete from account_memberships where account_id=$1", [account]);
    await sql.query("delete from client_properties where account_id=$1", [account]);
    await sql.query("delete from client_accounts where id=$1", [account]);
  }
  for (const id of users) {
    await sql.query("delete from app_users where id=$1", [id]);
    await auth.auth.admin.deleteUser(id);
  }
  await sql.end();
});

async function fixture() {
  const email = `notifications-${randomUUID()}@example.test`;
  const password = `Local-test-${randomUUID()}`;
  const result = await auth.auth.admin.createUser({ email, password, email_confirm: true });
  if (result.error || !result.data.user) throw new Error("Could not create local test identity.");
  const user = result.data.user.id;
  const otherRecipient = randomUUID();
  users.push(user, otherRecipient);
  await sql.query(
    `insert into app_users(id,email,updated_at) values
    ($1,$3,now()),($2,$4,now())`,
    [user, otherRecipient, email, `${otherRecipient}@example.test`],
  );
  const account = randomUUID();
  accounts.push(account);
  const property = randomUUID();
  await sql.query(
    "insert into client_accounts(id,name,updated_at) values ($1,'Notification browser fixture',now())",
    [account],
  );
  await sql.query(
    "insert into client_properties(id,account_id,name,updated_at) values ($1,$2,'Notification proof property',now())",
    [property, account],
  );
  const membership = randomUUID();
  await sql.query(
    "insert into account_memberships(id,account_id,user_id,role,updated_at) values ($1,$2,$3,'CLIENT_VIEWER',now())",
    [membership, account, user],
  );
  await sql.query(
    "insert into property_accesses(id,account_id,property_id,membership_id,updated_at) values ($1,$2,$3,$4,now())",
    [randomUUID(), account, property, membership],
  );
  const notification = randomUUID();
  const unavailable = randomUUID();
  const otherRecipientNotification = randomUUID();
  for (const [id, recipient, title, subjectType] of [
    [notification, user, "Background proof completed", "property.overview"],
    [unavailable, user, "Old destination", "unsupported.subject"],
    [otherRecipientNotification, otherRecipient, "Private notice", "property.overview"],
  ]) {
    await sql.query(
      `insert into notifications(
        id,property_id,recipient_user_id,source,correlation_id,type,title,body,
        subject_type,subject_id,deduplication_key,created_at
      ) values ($1,$2,$3,'infrastructure.proof',$4,'infrastructure.proof.completed',
        $5,'Durable work finished.',$6,$2,$1::uuid::text,now())`,
      [id, property, recipient, randomUUID(), title, subjectType],
    );
  }
  return {
    email,
    password,
    notification,
    otherRecipientNotification,
    property,
  };
}

test("recipient reads a persistent contextual notice and opens its authorized destination", async ({
  page,
}, info) => {
  const data = await fixture();
  await signInThroughUi(page, data);
  await page.goto(`/${data.property}/overview`);
  await page.getByRole("link", { name: "Notifications, 2 unread" }).click();
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByText("2 unread", { exact: true })).toBeVisible();
  await expect(page.getByText("Background proof completed")).toBeVisible();
  await expect(page.getByText("Destination unavailable", { exact: true })).toBeVisible();

  const markRead = page.getByRole("button", { name: "Mark Background proof completed as read" });
  await markRead.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Notification marked as read.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 unread", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("notification-center.png"), fullPage: true });

  await page.getByRole("link", { name: "Property overview" }).click();
  await expect(page).toHaveURL(new RegExp(`/${data.property}/overview$`));
  await page.goto(`/${data.property}/notifications/${data.otherRecipientNotification}/open`);
  await expect(page.getByRole("heading", { name: "Destination unavailable" })).toBeVisible();

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`/${data.property}/notifications`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
