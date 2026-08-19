import { randomUUID } from "node:crypto";

import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { hasPlatformCapability, platformCapabilities } from "@/server/auth/permissions";

const databaseUrl = process.env.DIRECT_DATABASE_URL;
if (!databaseUrl) throw new Error("DIRECT_DATABASE_URL is required for capability parity tests.");

const client = new Client({ connectionString: databaseUrl });
const users = [
  { id: randomUUID(), role: "BTLS_ADMIN" as const },
  { id: randomUUID(), role: "BTLS_OPERATOR" as const },
];

async function databaseCapability(userId: string, capability: string) {
  await client.query("begin");
  try {
    await client.query("set local role btls_app");
    await client.query("select set_config('app.user_id', $1, true)", [userId]);
    const result = await client.query<{ allowed: boolean }>(
      "select app.has_platform_capability($1) as allowed",
      [capability],
    );
    await client.query("rollback");
    return result.rows[0]?.allowed;
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

describe("platform capability parity", () => {
  beforeAll(async () => {
    await client.connect();
    for (const user of users) {
      await client.query(
        "insert into public.app_users (id, email, platform_role, updated_at) values ($1, $2, $3, now())",
        [user.id, `parity-${user.id}@example.test`, user.role],
      );
    }
  });

  afterAll(async () => {
    try {
      await client.query("delete from public.app_users where id = any($1::uuid[])", [
        users.map((user) => user.id),
      ]);
    } finally {
      await client.end();
    }
  });

  it("keeps SQL RLS capabilities aligned with application capabilities", async () => {
    for (const user of users) {
      for (const capability of platformCapabilities) {
        await expect(databaseCapability(user.id, capability)).resolves.toBe(
          hasPlatformCapability(user.role, capability),
        );
      }
    }
  });
});
