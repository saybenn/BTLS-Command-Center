import { randomUUID } from "node:crypto";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createFoundationFixture } from "../fixtures/feature-08";
import {
  createCustomer,
  listCustomers,
  updateCustomer,
  getCustomerDetail,
} from "@/features/revenue-operations/services/customers";
import {
  saveContact,
  saveLocation,
  saveAsset,
  saveTag,
  assignTag,
} from "@/features/revenue-operations/services/customer-context";
import {
  saveEmployee,
  saveRevenueSettings,
  getRevenueSettings,
  lookupFoundation,
} from "@/features/revenue-operations/services/workforce-settings";
import { savePropertyService } from "@/server/properties/property-services";
import {
  foundationCapabilities,
  canUseFoundation,
} from "@/server/properties/foundation-authorization";
import type { AuthorizedPropertyContext } from "@/server/properties/property-context";
let fixture: Awaited<ReturnType<typeof createFoundationFixture>>;
let owner: AuthorizedPropertyContext;
let customerId: string;
const createInput = () => ({
  displayName: `Customer ${randomUUID()}`,
  personName: "Ada Person",
  email: "",
  phone: "",
  requestId: randomUUID(),
});
describe("Revenue foundation real PostgreSQL workflows", () => {
  beforeAll(async () => {
    fixture = await createFoundationFixture();
    owner = await fixture.context();
  });
  afterAll(async () => {
    await fixture?.cleanup();
  });
  it("creates a Customer and person Contact atomically without location, asset or commercial records", async () => {
    const result = await createCustomer(owner, createInput());
    expect("id" in result).toBe(true);
    if (!("id" in result)) throw new Error("Unexpected match");
    customerId = result.id;
    const detail = await getCustomerDetail(owner, customerId);
    expect(detail.primaryContact?.personName).toBe("Ada Person");
    expect(detail.customer.relationshipState).toBe("PROSPECT");
    expect(
      (
        await fixture.sql.query(
          "select count(*)::int as count from service_locations where customer_id=$1",
          [customerId],
        )
      ).rows[0].count,
    ).toBe(0);
  });
  it("replays concurrent creation with one customer and one audit effect", async () => {
    const input = createInput();
    const results = await Promise.all([createCustomer(owner, input), createCustomer(owner, input)]);
    expect(results[0]).toEqual(results[1]);
    expect(
      (
        await fixture.sql.query(
          "select count(*)::int as count from customers where create_request_id=$1",
          [input.requestId],
        )
      ).rows[0].count,
    ).toBe(1);
    if (!("id" in results[0])) throw new Error("Unexpected review");
    expect(
      (
        await fixture.sql.query(
          "select count(*)::int as count from audit_events where subject_id=$1 and action='customer.created'",
          [results[0].id],
        )
      ).rows[0].count,
    ).toBe(1);
    await expect(createCustomer(owner, { ...input, displayName: "Changed input" })).rejects.toThrow(
      /already saved/,
    );
  });
  it("reviews shared endpoints without silently merging people, and rejects stale review", async () => {
    const first = await createCustomer(owner, {
      ...createInput(),
      email: "household@example.test",
    });
    expect("id" in first).toBe(true);
    const input = { ...createInput(), email: "household@example.test" };
    const review = await createCustomer(owner, input);
    if (!("reviewToken" in review)) throw new Error("Expected duplicate review");
    expect(review.candidates).toHaveLength(1);
    const other = await createCustomer(owner, {
      ...createInput(),
      email: "household@example.test",
      confirmSeparate: true,
      reviewToken: review.reviewToken,
    });
    expect("reviewToken" in other).toBe(true); // Token is bound to the reviewed input.
    const created = await createCustomer(owner, {
      ...input,
      confirmSeparate: true,
      reviewToken: review.reviewToken,
    });
    expect("id" in created).toBe(true);
    expect(created).not.toEqual(first);
    const pending = { ...createInput(), email: "household@example.test" };
    const before = await createCustomer(owner, pending);
    if (!("reviewToken" in before) || !("id" in first)) throw new Error("Missing review");
    await updateCustomer(owner, {
      id: first.id,
      revision: 1,
      displayName: "Renamed household",
      relationshipState: "CURRENT",
    });
    expect(
      "reviewToken" in
        (await createCustomer(owner, {
          ...pending,
          confirmSeparate: true,
          reviewToken: before.reviewToken,
        })),
    ).toBe(true);
  });
  it("enforces stale Customer writes and one primary person contact", async () => {
    await updateCustomer(owner, {
      id: customerId,
      revision: 1,
      displayName: "Updated customer",
      relationshipState: "CURRENT",
    });
    await expect(
      updateCustomer(owner, {
        id: customerId,
        revision: 1,
        displayName: "Stale",
        relationshipState: "INACTIVE",
      }),
    ).rejects.toThrow(/changed/);
    await saveContact(owner, {
      customerId,
      id: "",
      revision: 0,
      personName: "Second Person",
      email: "",
      phone: "",
      isActive: true,
      isPrimary: true,
    });
    const contacts = (await getCustomerDetail(owner, customerId)).contacts;
    expect(contacts.filter((contact) => contact.isPrimary)).toHaveLength(1);
    expect(contacts.find((contact) => contact.isPrimary)?.personName).toBe("Second Person");
  });
  it("keeps optional locations and assets under the same customer and property", async () => {
    const location = await saveLocation(owner, {
      id: "",
      customerId,
      revision: 0,
      name: "Home",
      addressLine1: "12 Main St",
      addressLine2: "",
      locality: "Boston",
      region: "MA",
      postalCode: "02108",
      countryCode: "US",
      isDefault: true,
      isActive: true,
    });
    await saveAsset(owner, {
      id: "",
      customerId,
      revision: 0,
      name: "Boiler",
      serviceLocationId: location.id,
      manufacturer: "",
      modelName: "",
      serialNumber: "",
      isActive: true,
    });
    const other = await createCustomer(owner, createInput());
    if (!("id" in other)) throw new Error("Unexpected match");
    await expect(
      saveAsset(owner, {
        id: "",
        customerId: other.id,
        revision: 0,
        name: "Wrong parent",
        serviceLocationId: location.id,
        manufacturer: "",
        modelName: "",
        serialNumber: "",
        isActive: true,
      }),
    ).rejects.toThrow(/belonging to this customer/);
    await expect(
      fixture.sql.query(
        "insert into service_assets(id,property_id,customer_id,service_location_id,name,updated_at) values($1,$2,$3,$4,'Invalid',now())",
        [randomUUID(), fixture.property, other.id, location.id],
      ),
    ).rejects.toThrow(/foreign key/);
    await expect(
      saveLocation(owner, {
        id: location.id,
        customerId,
        revision: 1,
        name: "Home",
        addressLine1: "12 Main",
        locality: "Boston",
        countryCode: "US",
        isDefault: false,
        isActive: false,
      }),
    ).rejects.toThrow(/equipment/);
  });
  it("assigns property Tags explicitly and removes only the association", async () => {
    const tag = await saveTag(owner, { id: "", revision: 0, name: "Priority", isActive: true });
    await assignTag(owner, { customerId, tagId: tag.id, assigned: true });
    await assignTag(owner, { customerId, tagId: tag.id, assigned: true });
    expect((await getCustomerDetail(owner, customerId, "tags")).tags[0].assignments).toHaveLength(
      1,
    );
    await assignTag(owner, { customerId, tagId: tag.id, assigned: false });
    expect((await getCustomerDetail(owner, customerId, "tags")).tags[0].assignments).toHaveLength(
      0,
    );
  });
  it("keeps employee profiles separate from logins and rejects an ungranted user link", async () => {
    const before = (await fixture.sql.query("select count(*)::int as count from app_users")).rows[0]
      .count;
    const profile = await saveEmployee(owner, {
      id: "",
      revision: 0,
      displayName: "Field worker",
      jobTitle: "Technician",
      appUserId: "",
      isActive: true,
    });
    expect(profile.id).toBeTruthy();
    expect(
      (await fixture.sql.query("select count(*)::int as count from app_users")).rows[0].count,
    ).toBe(before);
    const staff = await fixture.context("CLIENT_STAFF");
    await saveEmployee(owner, {
      id: "",
      revision: 0,
      displayName: "Linked worker",
      jobTitle: "",
      appUserId: staff.user.id,
      isActive: true,
    });
    await fixture.sql.query("delete from property_accesses where membership_id=$1", [
      staff.membership?.id,
    ]);
    await expect(
      saveEmployee(owner, {
        id: profile.id,
        revision: 1,
        displayName: "Invalid link",
        jobTitle: "",
        appUserId: staff.user.id,
        isActive: true,
      }),
    ).rejects.toThrow(/explicit access/);
    const options = await lookupFoundation(owner, { kind: "user", q: "Foundation" });
    expect(options.some((option) => option.value === staff.user.id)).toBe(false);
  });
  it("stores nullable defaults and accepts only same-property eligible shared sender references", async () => {
    const identity = randomUUID();
    const foreign = randomUUID();
    await fixture.sql.query(
      "insert into sending_identities(id,property_id,mode,status,display_name,from_address,updated_at) values($1,$2,'BTLS_MANAGED','ACTIVE','Approved sender','btls@example.test',now()),($3,$4,'BTLS_MANAGED','ACTIVE','Foreign sender','other@example.test',now())",
      [identity, fixture.property, foreign, fixture.otherProperty],
    );
    await saveRevenueSettings(owner, {
      revision: 0,
      defaultSendingIdentityId: "",
      reviewRequestDelayDays: "",
    });
    expect((await getRevenueSettings(owner)).defaultSendingIdentityId).toBeNull();
    await expect(
      saveRevenueSettings(owner, {
        revision: 1,
        defaultSendingIdentityId: foreign,
        reviewRequestDelayDays: 3,
      }),
    ).rejects.toThrow(/this property/);
    await saveRevenueSettings(owner, {
      revision: 1,
      defaultSendingIdentityId: identity,
      reviewRequestDelayDays: 3,
    });
    await fixture.sql.query("update sending_identities set status='DISABLED' where id=$1", [
      identity,
    ]);
    await expect(
      saveRevenueSettings(owner, {
        revision: 2,
        defaultSendingIdentityId: identity,
        reviewRequestDelayDays: 4,
      }),
    ).rejects.toThrow(/active/);
    await saveRevenueSettings(owner, {
      revision: 2,
      defaultSendingIdentityId: "",
      reviewRequestDelayDays: "",
    });
    const manager = await fixture.context("CLIENT_MANAGER");
    await expect(getRevenueSettings(manager)).resolves.toMatchObject({ revision: 3 });
    await expect(
      saveRevenueSettings(manager, {
        revision: 3,
        defaultSendingIdentityId: "",
        reviewRequestDelayDays: "",
      }),
    ).rejects.toThrow(/permission/);
  });
  it("reuses one shared service vocabulary and prevents hierarchy cycles", async () => {
    const first = await savePropertyService(owner, {
      id: "",
      revision: 0,
      name: "Heating",
      slug: "heating",
      parentServiceId: "",
      isActive: "true",
    });
    const second = await savePropertyService(owner, {
      id: "",
      revision: 0,
      name: "Repair",
      slug: "repair",
      parentServiceId: first.id,
      isActive: "true",
    });
    await expect(
      savePropertyService(owner, {
        id: first.id,
        revision: 1,
        name: "Heating",
        slug: "heating",
        parentServiceId: second.id,
        isActive: "true",
      }),
    ).rejects.toThrow(/ancestor/);
  });
  it("denies cross-tenant service access and rechecks revoked access", async () => {
    await expect(
      getCustomerDetail(
        { ...owner, property: { ...owner.property, id: fixture.otherProperty } },
        customerId,
      ),
    ).rejects.toThrow(/permission/);
    const revoked = await fixture.context();
    await fixture.sql.query("delete from property_accesses where membership_id=$1", [
      revoked.membership?.id,
    ]);
    await expect(listCustomers(revoked)).rejects.toThrow(/permission/);
  });
  it("matches SQL RLS with every approved role bundle, and denies unauthorized record reads/writes", async () => {
    const contexts = await Promise.all([
      fixture.context("CLIENT_OWNER"),
      fixture.context("CLIENT_MANAGER"),
      fixture.context("CLIENT_STAFF"),
      fixture.context("CLIENT_VIEWER"),
      fixture.context("CLIENT_VIEWER", "BTLS_ADMIN"),
      fixture.context("CLIENT_VIEWER", "BTLS_OPERATOR"),
    ]);
    for (const context of contexts) {
      await fixture.sql.query("begin");
      try {
        await fixture.sql.query("set local role btls_app");
        await fixture.sql.query("select set_config('app.user_id',$1,true)", [context.user.id]);
        for (const capability of foundationCapabilities) {
          const result = await fixture.sql.query(
            "select app.has_foundation_capability($1,$2) as allowed",
            [fixture.property, capability],
          );
          expect(result.rows[0].allowed).toBe(canUseFoundation(context, capability));
        }
        const records = await fixture.sql.query("select id from customers where property_id=$1", [
          fixture.property,
        ]);
        expect(records.rows.length > 0).toBe(canUseFoundation(context, "customer.view"));
      } finally {
        await fixture.sql.query("rollback");
      }
    }
    const staff = contexts[2];
    await fixture.sql.query("begin");
    try {
      await fixture.sql.query("set local role btls_app");
      await fixture.sql.query("select set_config('app.user_id',$1,true)", [staff.user.id]);
      await expect(
        fixture.sql.query(
          "insert into tags(id,property_id,name,normalized_name,updated_at) values($1,$2,'Denied','denied',now())",
          [randomUUID(), fixture.property],
        ),
      ).rejects.toThrow(/row-level security/);
    } finally {
      await fixture.sql.query("rollback");
    }
  });

  it("replays related-record creation using durable audit evidence", async () => {
    const input = {
      id: "",
      requestId: randomUUID(),
      revision: 0,
      displayName: "Retry worker",
      jobTitle: "",
      appUserId: "",
      isActive: true,
    };
    const [first, second] = await Promise.all([
      saveEmployee(owner, input),
      saveEmployee(owner, input),
    ]);
    expect(first).toEqual(second);
    expect(
      (
        await fixture.sql.query(
          "select count(*)::int as count from employee_profiles where property_id=$1 and display_name='Retry worker'",
          [fixture.property],
        )
      ).rows[0].count,
    ).toBe(1);
    await expect(saveEmployee(owner, { ...input, displayName: "Changed retry" })).rejects.toThrow(
      /already used/,
    );
  });
  it("denies an ungranted employee login association under the restricted database role", async () => {
    const user = await fixture.context("CLIENT_STAFF");
    await fixture.sql.query("delete from property_accesses where membership_id=$1", [
      user.membership?.id,
    ]);
    await fixture.sql.query("begin");
    try {
      await fixture.sql.query("set local role btls_app");
      await fixture.sql.query("select set_config('app.user_id',$1,true)", [owner.user.id]);
      await expect(
        fixture.sql.query(
          "insert into employee_profiles(id,property_id,app_user_id,display_name,updated_at) values($1,$2,$3,'Invalid link',now())",
          [randomUUID(), fixture.property, user.user.id],
        ),
      ).rejects.toThrow(/row-level security/);
    } finally {
      await fixture.sql.query("rollback");
    }
  });

  it("denies directory reads and row updates across every foundation table after access is revoked", async () => {
    const tag = await saveTag(owner, { id: "", revision: 0, name: "RLS coverage", isActive: true });
    await assignTag(owner, { customerId, tagId: tag.id, assigned: true });
    const revoked = await fixture.context();
    await fixture.sql.query("delete from property_accesses where membership_id=$1", [
      revoked.membership?.id,
    ]);
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
    for (const table of tables) {
      const existing = await fixture.sql.query(
        `select count(*)::int as count from ${table} where property_id=$1`,
        [fixture.property],
      );
      expect(existing.rows[0].count, table + " fixture").toBeGreaterThan(0);
    }
    for (const context of [revoked, await fixture.context("CLIENT_STAFF")]) {
      await fixture.sql.query("begin");
      try {
        await fixture.sql.query("set local role btls_app");
        await fixture.sql.query("select set_config('app.user_id',$1,true)", [context.user.id]);
        for (const table of tables) {
          expect(
            (
              await fixture.sql.query(`select * from ${table} where property_id=$1`, [
                fixture.property,
              ])
            ).rowCount,
            table,
          ).toBe(0);
          expect(
            (
              await fixture.sql.query(
                `update ${table} set property_id=property_id where property_id=$1`,
                [fixture.property],
              )
            ).rowCount,
            table,
          ).toBe(0);
        }
      } finally {
        await fixture.sql.query("rollback");
      }
    }
  });
  it("paginates and searches customers without leaking another property's same-name records", async () => {
    const prefix = "Paged " + randomUUID();
    for (let i = 0; i < 26; i++) {
      await createCustomer(owner, {
        ...createInput(),
        displayName: prefix + " " + String(i).padStart(2, "0"),
        phone: i === 0 ? "+44 20 7946 0018" : "",
      });
    }
    await fixture.sql.query(
      "insert into customers(id,property_id,display_name,normalized_name,create_request_id,create_actor_id,create_fingerprint,updated_at) values($1,$2,$3,$4,$1,$1,\'fixture\',now())",
      [randomUUID(), fixture.otherProperty, prefix, prefix.toLowerCase()],
    );
    const first = await listCustomers(owner, { q: prefix, page: 1 });
    const second = await listCustomers(owner, { q: prefix, page: 2 });
    const formattedPhone = await listCustomers(owner, { q: "+44 20 7946 0018" });
    const canonicalPhone = await listCustomers(owner, { q: "+442079460018" });
    expect(formattedPhone.records.map((row) => row.id)).toEqual(
      canonicalPhone.records.map((row) => row.id),
    );
    expect(formattedPhone.records).toHaveLength(1);
    expect(first.total).toBe(26);
    expect(first.records).toHaveLength(25);
    expect(second.records).toHaveLength(1);
    expect(new Set([...first.records, ...second.records].map((row) => row.id)).size).toBe(26);
  });
});
