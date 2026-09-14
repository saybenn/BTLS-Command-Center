import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Client } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const client = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
const ids = {
  admin: randomUUID(),
  operator: randomUUID(),
  account: randomUUID(),
  property: randomUUID(),
  otherProperty: randomUUID(),
  membership: randomUUID(),
  job: randomUUID(),
  otherJob: randomUUID(),
  identity: randomUUID(),
};

describe("Feature 07 operational RLS (transactional policy validation)", () => {
  beforeAll(async () => {
    if (!process.env.DIRECT_DATABASE_URL)
      throw new Error("Local database environment is required.");
    await client.connect();
    await client.query("begin");
    // Validate pending policy SQL inside this rollback-only transaction. This is NOT deployment
    // and never modifies the migration ledger or bypasses a historical checksum guard.
    for (const name of [
      "20260907120100_events_jobs_notifications_security.sql",
      "20260909120100_notification_context_security.sql",
      "20260910120100_operations_retry_security.sql",
    ]) {
      const applied = await client.query("select 1 from app.security_migrations where name=$1", [
        name,
      ]);
      if (!applied.rowCount)
        await client.query(await readFile(`supabase/security-migrations/${name}`, "utf8"));
    }
    await client.query(
      `insert into app_users(id,email,platform_role,updated_at) values
      ($1,$3,'BTLS_ADMIN',now()),($2,$4,'BTLS_OPERATOR',now())`,
      [ids.admin, ids.operator, `${ids.admin}@example.test`, `${ids.operator}@example.test`],
    );
    await client.query(
      "insert into client_accounts(id,name,updated_at) values ($1,'Operations RLS test',now())",
      [ids.account],
    );
    await client.query(
      `insert into client_properties(id,account_id,name,updated_at) values
      ($1,$3,'Granted',now()),($2,$3,'Ungranted',now())`,
      [ids.property, ids.otherProperty, ids.account],
    );
    await client.query(
      "insert into account_memberships(id,account_id,user_id,role,updated_at) values ($1,$2,$3,'CLIENT_VIEWER',now())",
      [ids.membership, ids.account, ids.operator],
    );
    await client.query(
      "insert into property_accesses(id,account_id,property_id,membership_id,updated_at) values ($1,$2,$3,$4,now())",
      [randomUUID(), ids.account, ids.property, ids.membership],
    );
    for (const [jobId, propertyId] of [
      [ids.job, ids.property],
      [ids.otherJob, ids.otherProperty],
    ]) {
      await client.query(
        `insert into job_executions(id,property_id,job_type,job_version,origin,status,correlation_id,idempotency_key,safe_payload,updated_at)
        values ($1,$2,'infrastructure.contextual_proof',1,'SYSTEM','FAILED',$3,$1::uuid::text,'{}',now())`,
        [jobId, propertyId, randomUUID()],
      );
      await client.query(
        "insert into job_execution_attempts(id,job_execution_id,attempt_number,status) values ($1,$2,1,'FAILED')",
        [randomUUID(), jobId],
      );
    }
    await client.query(
      `insert into sending_identities(
        id,property_id,mode,status,display_name,from_address,updated_at
      ) values ($1,$2,'BTLS_MANAGED','ACTIVE','BTLS','no-reply@btls.example',now())`,
      [ids.identity, ids.property],
    );
  });
  beforeEach(async () => {
    await client.query("savepoint operations_test");
  });
  afterEach(async () => {
    await client.query("rollback to savepoint operations_test");
  });
  afterAll(async () => {
    await client.query("rollback");
    await client.end();
  });
  async function asUser(id: string) {
    await client.query("set local role btls_app");
    await client.query("select set_config('app.user_id',$1,true)", [id]);
  }
  it("allows Admin cross-property reads while limiting Operators and their attempt reads", async () => {
    await asUser(ids.operator);
    expect(
      (
        await client.query("select id from job_executions where id in ($1,$2)", [
          ids.job,
          ids.otherJob,
        ])
      ).rows,
    ).toEqual([{ id: ids.job }]);
    expect(
      (
        await client.query(
          "select job_execution_id from job_execution_attempts where job_execution_id in ($1,$2)",
          [ids.job, ids.otherJob],
        )
      ).rows,
    ).toEqual([{ job_execution_id: ids.job }]);
    await client.query("select set_config('app.user_id',$1,true)", [ids.admin]);
    expect(
      (
        await client.query("select id from job_executions where id in ($1,$2)", [
          ids.job,
          ids.otherJob,
        ])
      ).rowCount,
    ).toBe(2);
  });
  it("denies a direct unaudited retry even for an Admin application-role session", async () => {
    await asUser(ids.admin);
    await expect(
      client.query("update job_executions set status='RETRY_SCHEDULED' where id=$1", [ids.job]),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("denies direct Operator attempt mutation", async () => {
    await asUser(ids.operator);
    await expect(
      client.query(
        "update job_execution_attempts set status='SUCCEEDED' where job_execution_id=$1",
        [ids.job],
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("denies direct browser ProviderDispatch writes", async () => {
    await asUser(ids.operator);
    await expect(
      client.query(
        `insert into provider_dispatches(
          id,property_id,sending_identity_id,channel,provider_name,operation_type,
          idempotency_key,correlation_id,status,request_fingerprint,updated_at
        ) values ($1,$2,$3,'TRANSACTIONAL_EMAIL','POSTMARK','forged','forged',$4,'PENDING','forged',now())`,
        [randomUUID(), ids.property, ids.identity, randomUUID()],
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("denies direct browser WebhookReceipt writes", async () => {
    await asUser(ids.operator);
    await expect(
      client.query(
        `insert into webhook_receipts(
          id,property_id,provider,provider_account_key,external_event_id,event_type,status,updated_at
        ) values ($1,$2,'POSTMARK','forged','forged','Delivery','RECEIVED',now())`,
        [randomUUID(), ids.property],
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("denies direct browser SendingIdentity writes", async () => {
    await asUser(ids.operator);
    await expect(
      client.query(
        `insert into sending_identities(
          id,property_id,mode,status,display_name,from_address,updated_at
        ) values ($1,$2,'BTLS_MANAGED','ACTIVE','Forged','forged@example.test',now())`,
        [randomUUID(), ids.property],
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("denies reads when explicit membership is suspended", async () => {
    await client.query("update account_memberships set status='SUSPENDED' where id=$1", [
      ids.membership,
    ]);
    await asUser(ids.operator);
    expect(
      (await client.query("select id from job_executions where id=$1", [ids.job])).rowCount,
    ).toBe(0);
  });
});
