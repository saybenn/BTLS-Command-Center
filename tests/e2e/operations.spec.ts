import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import { signInThroughUi } from "./auth-helpers";
import { expect, test } from "./fixtures";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !process.env.DIRECT_DATABASE_URL)
  throw new Error("Local Supabase test environment required.");
const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const sql = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
const users: string[] = [];
const accounts: string[] = [];
test.beforeAll(async () => {
  await sql.connect();
});
test.afterAll(async () => {
  for (const account of accounts) {
    for (const table of ["notifications", "event_outbox", "audit_events", "job_executions"]) {
      await sql.query(
        `delete from ${table} where property_id in (select id from client_properties where account_id=$1)`,
        [account],
      );
    }
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
async function fixture(role: "BTLS_ADMIN" | "BTLS_OPERATOR") {
  const email = `operations-${randomUUID()}@example.test`;
  const password = `Local-test-${randomUUID()}`;
  const result = await auth.auth.admin.createUser({ email, password, email_confirm: true });
  if (result.error || !result.data.user) throw new Error("Could not create local test identity.");
  const user = result.data.user.id;
  users.push(user);
  await sql.query(
    "insert into app_users(id,email,platform_role,updated_at) values ($1,$2,$3,now())",
    [user, email, role],
  );
  const account = randomUUID();
  accounts.push(account);
  const property = randomUUID();
  const hidden = randomUUID();
  await sql.query(
    "insert into client_accounts(id,name,updated_at) values ($1,'Operations browser fixture',now())",
    [account],
  );
  await sql.query(
    "insert into client_properties(id,account_id,name,updated_at) values ($1,$3,'Operations proof property',now()),($2,$3,'Hidden proof property',now())",
    [property, hidden, account],
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
  const job = randomUUID();
  const hiddenJob = randomUUID();
  for (const [id, propertyId] of [
    [job, property],
    [hiddenJob, hidden],
  ]) {
    const eventId = randomUUID();
    const correlationId = randomUUID();
    const payload = {
      eventId,
      correlationId,
      propertyId,
      idempotencyKey: `event:${eventId}`,
      source: "infrastructure.proof",
      recipientUserId: user,
      subject: { type: "property.overview", id: propertyId },
    };
    await sql.query(
      `insert into job_executions(id,property_id,job_type,job_version,origin,status,correlation_id,idempotency_key,safe_payload,failure_category,failed_at,updated_at)
      values ($1,$2,'infrastructure.contextual_proof',1,'SYSTEM','FAILED',$3,$4,$5,'RETRYABLE_FAILURE',now(),now())`,
      [id, propertyId, correlationId, payload.idempotencyKey, payload],
    );
    await sql.query(
      "insert into job_execution_attempts(id,job_execution_id,attempt_number,status,failure_category,finished_at) values ($1,$2,3,'FAILED','RETRYABLE_FAILURE',now())",
      [randomUUID(), id],
    );
  }
  return { email, password, job, hiddenJob, property, hidden };
}

test("Admin inspects a failure and queues one audited retry with keyboard access", async ({
  page,
}, info) => {
  const data = await fixture("BTLS_ADMIN");
  await signInThroughUi(page, data);
  await page.goto(`/admin/operations?propertyId=${data.property}`);
  await expect(page.getByRole("heading", { name: "Operations", exact: true })).toBeVisible();
  await page
    .getByRole("link", { name: "Background operation proof — Operations proof property" })
    .click();
  await expect(page.getByText("Attempt 3 · Failed", { exact: true })).toBeVisible();
  await page.getByLabel("Reason for retry").fill("Dependency recovered after review");
  const retry = page.getByRole("button", { name: "Request safe retry" });
  await retry.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Retry queued", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Retry unavailable" })).toBeDisabled();
  expect(
    (
      await sql.query(
        "select id from audit_events where subject_id=$1 and action='job_execution.retry_requested'",
        [data.job],
      )
    ).rowCount,
  ).toBe(1);
  expect(
    (await sql.query("select id from event_outbox where payload->>'jobExecutionId'=$1", [data.job]))
      .rowCount,
  ).toBe(1);
  await expect(page.getByRole("main")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("operations-retry.png"), fullPage: true });
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("Operator sees only granted properties and cannot retry", async ({ page }) => {
  const data = await fixture("BTLS_OPERATOR");
  await signInThroughUi(page, data);
  await page.goto(`/admin/operations/${data.job}`);
  await expect(page.getByText("Only BTLS Admin can request a retry.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry unavailable" })).toBeDisabled();
  await page.goto(`/admin/operations?propertyId=${data.hidden}`);
  await expect(page.getByText("No matching operations")).toBeVisible();
  await page.goto(`/admin/operations/${data.hiddenJob}`);
  await expect(page).toHaveURL(/no-access/);
});
