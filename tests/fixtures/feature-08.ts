import { randomUUID } from "node:crypto";
import { Client } from "pg";
import type { PropertyCapability, PlatformCapability } from "@/server/auth/permissions";
const propertyCapabilities: PropertyCapability[] = [
  "customer.view",
  "customer.manage",
  "employee.view",
  "employee.manage",
  "revenue.settings.view",
  "revenue.settings.manage",
  "property.service.view",
  "property.service.manage",
];
const platformCapabilities: PlatformCapability[] = [
  "platform.property.read",
  ...propertyCapabilities.map((cap) => ("platform." + cap) as PlatformCapability),
];
function hasPropertyCapability(role: string, cap: PropertyCapability) {
  return (
    role === "CLIENT_OWNER" || (role === "CLIENT_MANAGER" && cap !== "revenue.settings.manage")
  );
}
function hasPlatformCapability(role: string | null, cap: PlatformCapability) {
  return (
    role === "BTLS_ADMIN" ||
    (role === "BTLS_OPERATOR" &&
      ![
        "platform.employee.manage",
        "platform.revenue.settings.manage",
        "platform.property.service.manage",
      ].includes(cap))
  );
}
import type { AccountRole, PlatformRole } from "@/generated/prisma/client";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
export async function createFoundationFixture() {
  const sql = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
  await sql.connect();
  const account = randomUUID(),
    property = randomUUID(),
    otherAccount = randomUUID(),
    otherProperty = randomUUID();
  await sql.query(
    "insert into client_accounts(id,name,updated_at) values($1,'Foundation fixture',now()),($2,'Other foundation tenant',now())",
    [account, otherAccount],
  );
  await sql.query(
    "insert into client_properties(id,account_id,name,updated_at) values($1,$2,'Foundation property',now()),($3,$4,'Other tenant',now())",
    [property, account, otherProperty, otherAccount],
  );
  const users: string[] = [];
  async function context(
    role: AccountRole = "CLIENT_OWNER",
    platformRole: PlatformRole | null = null,
  ): Promise<AuthorizedPropertyContext> {
    const id = randomUUID(),
      membership = randomUUID(),
      access = randomUUID();
    users.push(id);
    const email = `foundation-${id}@example.test`;
    await sql.query(
      "insert into app_users(id,email,display_name,platform_role,updated_at) values($1,$2,'Foundation user',$3,now())",
      [id, email, platformRole],
    );
    await sql.query(
      "insert into account_memberships(id,account_id,user_id,role,updated_at) values($1,$2,$3,$4,now())",
      [membership, account, id, role],
    );
    await sql.query(
      "insert into property_accesses(id,account_id,membership_id,property_id,updated_at) values($1,$2,$3,$4,now())",
      [access, account, membership, property],
    );
    return {
      account: { id: account, name: "Foundation fixture" },
      property: { id: property, name: "Foundation property", domain: null },
      user: { id, email, displayName: "Foundation user", platformRole },
      effectiveRole: platformRole ? null : role,
      membership: { id: membership, role },
      propertyAccess: { id: access, roleOverride: null },
      capabilities: {
        property: platformRole
          ? []
          : propertyCapabilities.filter((capability) => hasPropertyCapability(role, capability)),
        platform: platformCapabilities.filter((capability) =>
          hasPlatformCapability(platformRole, capability),
        ),
      },
    };
  }
  async function cleanup() {
    for (const table of [
      "customer_tags",
      "service_assets",
      "service_locations",
      "contacts",
      "customers",
      "employee_profiles",
      "revenue_operations_settings",
      "tags",
    ]) {
      await sql.query(`delete from ${table} where property_id=any($1::uuid[])`, [
        [property, otherProperty],
      ]);
    }
    await sql.query(
      "update property_services set parent_service_id=null where property_id=any($1::uuid[])",
      [[property, otherProperty]],
    );
    for (const table of ["property_services", "sending_identities"])
      await sql.query(`delete from ${table} where property_id=any($1::uuid[])`, [
        [property, otherProperty],
      ]);
    await sql.query("delete from audit_events where account_id=any($1::uuid[])", [
      [account, otherAccount],
    ]);
    await sql.query("delete from property_accesses where account_id=any($1::uuid[])", [
      [account, otherAccount],
    ]);
    await sql.query("delete from account_memberships where account_id=any($1::uuid[])", [
      [account, otherAccount],
    ]);
    await sql.query("delete from client_properties where account_id=any($1::uuid[])", [
      [account, otherAccount],
    ]);
    await sql.query("delete from client_accounts where id=any($1::uuid[])", [
      [account, otherAccount],
    ]);
    await sql.query("delete from app_users where id=any($1::uuid[])", [users]);
    await sql.end();
  }
  return { sql, account, property, otherProperty, otherAccount, context, cleanup };
}
