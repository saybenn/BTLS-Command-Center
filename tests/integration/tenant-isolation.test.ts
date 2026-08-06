import { randomUUID } from "node:crypto";

import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.DIRECT_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DIRECT_DATABASE_URL is required for database integration tests.");
}

const client = new Client({ connectionString: databaseUrl });
const fixture = {
  accountId: randomUUID(),
  managerMembershipId: randomUUID(),
  fallbackMembershipId: randomUUID(),
  managerAccessId: randomUUID(),
  viewerAccessId: randomUUID(),
  fallbackAccessId: randomUUID(),
  managerPropertyId: randomUUID(),
  viewerPropertyId: randomUUID(),
  ungrantedPropertyId: randomUUID(),
  managerUserId: randomUUID(),
  fallbackUserId: randomUUID(),
};

async function asApplicationUser<T>(userId: string, callback: () => Promise<T>): Promise<T> {
  await client.query("begin");

  try {
    await client.query("set local role btls_app");
    await client.query("select set_config('app.user_id', $1, true)", [userId]);
    const result = await callback();

    await client.query("rollback");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

describe("tenant isolation", () => {
  beforeAll(async () => {
    await client.connect();
    await client.query(
      `
        insert into public.app_users (id, email, display_name, updated_at)
        values
          ($1, 'tenant-manager@btls.local', 'Tenant Manager', now()),
          ($2, 'tenant-fallback@btls.local', 'Tenant Fallback', now())
      `,
      [fixture.managerUserId, fixture.fallbackUserId],
    );
    await client.query(
      `
        insert into public.client_accounts (id, name, updated_at)
        values ($1, 'Tenant Isolation Test Account', now())
      `,
      [fixture.accountId],
    );
    await client.query(
      `
        insert into public.client_properties (id, account_id, name, updated_at)
        values
          ($1, $4, 'Manager Property', now()),
          ($2, $4, 'Viewer Property', now()),
          ($3, $4, 'Ungranted Property', now())
      `,
      [
        fixture.managerPropertyId,
        fixture.viewerPropertyId,
        fixture.ungrantedPropertyId,
        fixture.accountId,
      ],
    );
    await client.query(
      `
        insert into public.account_memberships (id, account_id, user_id, role, updated_at)
        values
          ($1, $3, $2, 'CLIENT_VIEWER', now()),
          ($4, $3, $5, 'CLIENT_STAFF', now())
      `,
      [
        fixture.managerMembershipId,
        fixture.managerUserId,
        fixture.accountId,
        fixture.fallbackMembershipId,
        fixture.fallbackUserId,
      ],
    );
    await client.query(
      `
        insert into public.property_accesses (
          id,
          account_id,
          membership_id,
          property_id,
          role_override,
          updated_at
        )
        values
          ($1, $4, $5, $6, 'CLIENT_MANAGER', now()),
          ($2, $4, $5, $7, 'CLIENT_VIEWER', now()),
          ($3, $4, $8, $9, null, now())
      `,
      [
        fixture.managerAccessId,
        fixture.viewerAccessId,
        fixture.fallbackAccessId,
        fixture.accountId,
        fixture.managerMembershipId,
        fixture.managerPropertyId,
        fixture.viewerPropertyId,
        fixture.fallbackMembershipId,
        fixture.ungrantedPropertyId,
      ],
    );
  });

  afterAll(async () => {
    try {
      await client.query("delete from public.audit_events where account_id = $1", [
        fixture.accountId,
      ]);
      await client.query("delete from public.property_accesses where account_id = $1", [
        fixture.accountId,
      ]);
      await client.query("delete from public.account_memberships where account_id = $1", [
        fixture.accountId,
      ]);
      await client.query("delete from public.client_properties where account_id = $1", [
        fixture.accountId,
      ]);
      await client.query("delete from public.app_users where id in ($1, $2)", [
        fixture.managerUserId,
        fixture.fallbackUserId,
      ]);
      await client.query("delete from public.client_accounts where id = $1", [fixture.accountId]);
    } finally {
      await client.end();
    }
  });

  it("denies cross-property reads and writes without an explicit property grant", async () => {
    const visibleProperties = await asApplicationUser(fixture.managerUserId, async () =>
      client.query<{ id: string }>(
        "select id from public.client_properties where account_id = $1 order by id",
        [fixture.accountId],
      ),
    );

    expect(visibleProperties.rows.map((row) => row.id)).toEqual(
      [fixture.managerPropertyId, fixture.viewerPropertyId].sort(),
    );
    await expect(
      asApplicationUser(fixture.managerUserId, async () =>
        client.query(
          `
            insert into public.audit_events (id, actor_id, account_id, property_id, action, subject_type)
            values ($1, $2, $3, $4, 'tenant_isolation.write_attempt', 'ClientProperty')
          `,
          [randomUUID(), fixture.managerUserId, fixture.accountId, fixture.ungrantedPropertyId],
        ),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("denies a membership without a property grant", async () => {
    const result = await asApplicationUser(fixture.managerUserId, async () =>
      client.query<{ can_access: boolean; role: string | null }>(
        `
          select
            app.can_access_property($1) as can_access,
            app.effective_property_role($1)::text as role
        `,
        [fixture.ungrantedPropertyId],
      ),
    );

    expect(result.rows).toEqual([{ can_access: false, role: null }]);
  });

  it("falls back to the account role when a property grant has no override", async () => {
    const result = await asApplicationUser(fixture.fallbackUserId, async () =>
      client.query<{ role: string | null }>(
        "select app.effective_property_role($1)::text as role",
        [fixture.ungrantedPropertyId],
      ),
    );

    expect(result.rows).toEqual([{ role: "CLIENT_STAFF" }]);
  });

  it("prefers an explicit property role over the account default", async () => {
    const result = await asApplicationUser(fixture.managerUserId, async () =>
      client.query<{ role: string | null }>(
        `
          select id, app.effective_property_role(id)::text as role
          from public.client_properties
          where id in ($1, $2)
          order by id
        `,
        [fixture.managerPropertyId, fixture.viewerPropertyId],
      ),
    );

    expect(result.rows).toEqual(
      [
        { id: fixture.managerPropertyId, role: "CLIENT_MANAGER" },
        { id: fixture.viewerPropertyId, role: "CLIENT_VIEWER" },
      ].sort((left, right) => left.id.localeCompare(right.id)),
    );
  });
});
