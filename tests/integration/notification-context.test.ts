import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const client = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
const ids = {
  user: randomUUID(),
  otherUser: randomUUID(),
  account: randomUUID(),
  membership: randomUUID(),
  access: randomUUID(),
  property: randomUUID(),
  otherProperty: randomUUID(),
  notification: randomUUID(),
  correlation: randomUUID(),
};

describe("Feature 07 notification context persistence and RLS", () => {
  beforeAll(async () => {
    if (!process.env.DIRECT_DATABASE_URL)
      throw new Error("Local database environment is required.");
    await client.connect();
    await client.query("begin");
    await client.query(
      `insert into app_users(id,email,platform_role,updated_at) values
      ($1,$3,'BTLS_OPERATOR',now()),($2,$4,null,now())`,
      [ids.user, ids.otherUser, `${ids.user}@example.test`, `${ids.otherUser}@example.test`],
    );
    await client.query(
      "insert into client_accounts(id,name,updated_at) values ($1,'Notification proof',now())",
      [ids.account],
    );
    await client.query(
      `insert into client_properties(id,account_id,name,updated_at) values
      ($1,$3,'Authorized property',now()),($2,$3,'Ungranted property',now())`,
      [ids.property, ids.otherProperty, ids.account],
    );
    await client.query(
      `insert into account_memberships(id,account_id,user_id,role,updated_at)
      values ($1,$2,$3,'CLIENT_VIEWER',now())`,
      [ids.membership, ids.account, ids.user],
    );
    await client.query(
      `insert into property_accesses(id,account_id,property_id,membership_id,updated_at)
      values ($1,$2,$3,$4,now())`,
      [ids.access, ids.account, ids.property, ids.membership],
    );
    for (const [id, propertyId, userId] of [
      [ids.notification, ids.property, ids.user],
      [randomUUID(), ids.otherProperty, ids.user],
      [randomUUID(), ids.property, ids.otherUser],
    ]) {
      await client.query(
        `insert into notifications(id,property_id,recipient_user_id,type,title,body,
        subject_type,subject_id,deduplication_key,source,correlation_id)
        values ($1,$2,$3,'infrastructure.proof.completed','Completed','Test operation completed.',
        'property.overview',$2,'proof','infrastructure.proof',$4)`,
        [id, propertyId, userId, ids.correlation],
      );
    }
  });
  beforeEach(async () => {
    await client.query("savepoint notification_test");
  });
  afterEach(async () => {
    await client.query("rollback to savepoint notification_test");
  });
  afterAll(async () => {
    await client.query("rollback");
    await client.end();
  });

  it("persists context and enforces intended-notification uniqueness", async () => {
    const { rows } = await client.query(
      "select source,correlation_id,subject_id from notifications where id=$1",
      [ids.notification],
    );
    expect(rows[0]).toEqual({
      source: "infrastructure.proof",
      correlation_id: ids.correlation,
      subject_id: ids.property,
    });
    await expect(
      client.query(
        `insert into notifications(id,property_id,recipient_user_id,type,title,body,deduplication_key)
      values ($1,$2,$3,'test','Duplicate','Duplicate','proof')`,
        [randomUUID(), ids.property, ids.user],
      ),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("restricts operators to their recipient notices in explicitly granted properties and persists read state", async () => {
    await client.query("set local role btls_app");
    await client.query("select set_config('app.user_id',$1,true)", [ids.user]);
    const { rows } = await client.query(
      "select id from notifications where property_id in ($1,$2)",
      [ids.property, ids.otherProperty],
    );
    expect(rows).toEqual([{ id: ids.notification }]);
    await client.query("update notifications set read_at=now() where id=$1", [ids.notification]);
    const read = await client.query("select read_at from notifications where id=$1", [
      ids.notification,
    ]);
    expect(read.rows[0].read_at).toBeInstanceOf(Date);
    const hidden = await client.query(
      "update notifications set read_at=now() where property_id=$1 returning id",
      [ids.otherProperty],
    );
    expect(hidden.rowCount).toBe(0);
  });

  it("does not let browser roles forge notifications or rewrite source", async () => {
    await client.query("set local role authenticated");
    await expect(
      client.query(
        `insert into notifications(id,property_id,recipient_user_id,type,title,body,deduplication_key)
      values ($1,$2,$3,'test','Forged','Forged','forged')`,
        [randomUUID(), ids.property, ids.user],
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("does not let application recipients rewrite notification provenance", async () => {
    await client.query("set local role btls_app");
    await client.query("select set_config('app.user_id',$1,true)", [ids.user]);
    await expect(
      client.query("update notifications set source='system' where id=$1", [ids.notification]),
    ).rejects.toMatchObject({ code: "42501" });
  });
});
