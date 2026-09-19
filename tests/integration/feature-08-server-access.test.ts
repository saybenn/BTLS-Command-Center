import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, afterAll, it, expect } from "vitest";
import { createFoundationFixture } from "../fixtures/feature-08";
import {
  createCustomer,
  getCustomerDetail,
} from "@/features/revenue-operations/services/customers";
import {
  saveLocation,
  saveAsset,
  saveTag,
  assignTag,
} from "@/features/revenue-operations/services/customer-context";
import {
  saveEmployee,
  saveRevenueSettings,
  lookupFoundation,
} from "@/features/revenue-operations/services/workforce-settings";
import { savePropertyService } from "@/server/properties/property-services";
import { withFoundation } from "@/server/properties/foundation-database";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";

const tables = [
  "customers",
  "contacts",
  "service_locations",
  "service_assets",
  "tags",
  "customer_tags",
  "employee_profiles",
  "revenue_operations_settings",
  "property_services",
] as const;
let fixture: Awaited<ReturnType<typeof createFoundationFixture>>;
let owner: AuthorizedPropertyContext;
let browser: SupabaseClient;
let admin: SupabaseClient;
let authUserId: string;
let customerId: string;
beforeAll(async () => {
  fixture = await createFoundationFixture();
  owner = await fixture.context();
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    options,
  );
  browser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    options,
  );
  const password = "Local-test-" + randomUUID();
  const created = await admin.auth.admin.createUser({
    id: owner.user.id,
    email: owner.user.email,
    password,
    email_confirm: true,
  });
  if (created.error) throw new Error("Local review identity setup failed");
  authUserId = created.data.user.id;
  expect(
    (await browser.auth.signInWithPassword({ email: owner.user.email, password })).error,
  ).toBeNull();
  const customer = await createCustomer(owner, {
    displayName: "Access regression",
    personName: "Ada Person",
    requestId: randomUUID(),
  });
  if (!("id" in customer)) throw new Error("Unexpected duplicate");
  customerId = customer.id;
  const location = await saveLocation(owner, {
    id: "",
    revision: 0,
    customerId,
    name: "Home",
    addressLine1: "1 Main Street",
    locality: "Boston",
    countryCode: "US",
    isDefault: true,
    isActive: true,
  });
  await saveAsset(owner, {
    id: "",
    revision: 0,
    customerId,
    name: "Boiler",
    serviceLocationId: location.id,
    isActive: true,
  });
  const tag = await saveTag(owner, { id: "", revision: 0, name: "Priority", isActive: true });
  await assignTag(owner, { customerId, tagId: tag.id, assigned: true });
  await saveEmployee(owner, { id: "", revision: 0, displayName: "Employee", isActive: true });
  await saveRevenueSettings(owner, { revision: 0, reviewRequestDelayDays: 3 });
  await savePropertyService(owner, {
    id: "",
    revision: 0,
    name: "Heating",
    slug: "heating",
    isActive: "true",
  });
}, 30_000);
afterAll(async () => {
  await fixture?.cleanup();
  if (authUserId) await admin.auth.admin.deleteUser(authUserId);
});
it("denies authenticated browser-key reads and every CRUD mutation on all nine populated tables", async () => {
  const snapshots = new Map<string, unknown>();
  for (const table of tables) {
    const before = await fixture.sql.query(`select * from ${table} where property_id=$1`, [
      fixture.property,
    ]);
    expect(before.rows.length).toBeGreaterThan(0);
    snapshots.set(table, before.rows);
    const operations = [
      await browser.from(table).select("*").eq("property_id", fixture.property),
      await browser.from(table).insert(before.rows[0]),
      await browser
        .from(table)
        .update({ property_id: fixture.property })
        .eq("property_id", fixture.property),
      await browser.from(table).delete().eq("property_id", fixture.property),
    ];
    for (const result of operations) {
      expect(result.error?.code, table).toBe("42501");
      expect(result.data, table).toBeNull();
    }
    expect(
      (await fixture.sql.query(`select * from ${table} where property_id=$1`, [fixture.property]))
        .rows,
    ).toEqual(snapshots.get(table));
  }
}, 30_000);
it("uses the existing non-bypass role and RLS inside the actual service transaction", async () => {
  const state = await withFoundation(owner, "customer.view", async (tx) => {
    const roles = await tx.$queryRaw<Array<{ name: string; bypass: boolean; superuser: boolean }>>`
      select current_user::text as name,rolbypassrls as bypass,rolsuper as superuser
      from pg_roles where rolname=current_user`;
    const active = await tx.$queryRaw<
      Array<{ active: boolean }>
    >`select row_security_active('public.customers') as active`;
    return { role: roles[0], active: active[0].active };
  });
  expect(state).toEqual({
    role: { name: "btls_app", bypass: false, superuser: false },
    active: true,
  });
  const detail = await getCustomerDetail(owner, customerId);
  expect(detail.primaryContact?.personName).toBe("Ada Person");
  const audit = await fixture.sql.query(
    "select count(*)::int as n from audit_events where subject_id=$1 and action='customer.created'",
    [customerId],
  );
  expect(audit.rows[0].n).toBe(1);
  const stranger = await fixture.context("CLIENT_STAFF");
  await expect(getCustomerDetail(stranger, customerId)).rejects.toThrow(/permission/);
  const otherId = randomUUID();
  await fixture.sql.query(
    "insert into customers(id,property_id,display_name,normalized_name,create_request_id,create_actor_id,create_fingerprint,updated_at) values($1,$2,'Other','other',$1,$1,'fixture',now())",
    [otherId, fixture.otherProperty],
  );
  expect(
    await withFoundation(owner, "customer.view", (tx) =>
      tx.customer.findMany({ where: { id: otherId } }),
    ),
  ).toEqual([]);
  await expect(
    withFoundation(owner, "customer.manage", (tx) =>
      tx.customer.update({ where: { id: otherId }, data: { displayName: "Forbidden" } }),
    ),
  ).rejects.toThrow();
});
it("preserves employee linking under restricted RLS without exposing ungranted identities", async () => {
  const worker = await fixture.context("CLIENT_STAFF");
  const ungranted = await fixture.context("CLIENT_STAFF");
  await fixture.sql.query("delete from property_accesses where membership_id=$1", [
    ungranted.membership!.id,
  ]);
  const options = await lookupFoundation(owner, { kind: "user", q: "" });
  expect(options.some((option) => option.value === worker.user.id)).toBe(true);
  expect(options.some((option) => option.value === ungranted.user.id)).toBe(false);
  await saveEmployee(owner, {
    id: "",
    revision: 0,
    displayName: "Linked employee",
    appUserId: worker.user.id,
    isActive: true,
  });
  await expect(
    saveEmployee(owner, {
      id: "",
      revision: 0,
      displayName: "Invalid link",
      appUserId: ungranted.user.id,
      isActive: true,
    }),
  ).rejects.toThrow(/active user/);
  const manager = await fixture.context("CLIENT_MANAGER");
  expect(
    (await lookupFoundation(manager, { kind: "user", q: "" })).some(
      (option) => option.value === worker.user.id,
    ),
  ).toBe(true);
  await expect(lookupFoundation(worker, { kind: "user", q: "" })).rejects.toThrow(/permission/);
});
