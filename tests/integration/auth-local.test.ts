import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Local Supabase Auth environment is required for auth integration tests.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const password = "local-auth-password";
const createdUserIds: string[] = [];

async function createConfirmedUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: `auth-${randomUUID()}@example.test`,
    email_confirm: true,
    password,
  });

  if (error || !data.user) {
    throw error ?? new Error("Local Auth did not create the test user.");
  }

  createdUserIds.push(data.user.id);
  return data.user;
}

describe("local Supabase Auth", () => {
  beforeAll(async () => {
    const user = await createConfirmedUser();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password,
    });

    if (error || !data.session) {
      throw error ?? new Error("Local Auth did not issue a test session.");
    }

    createdUserIds.push(`refresh:${user.id}:${data.session.refresh_token}`);
  });

  afterAll(async () => {
    await Promise.all(
      createdUserIds
        .filter((value) => !value.startsWith("refresh:"))
        .map((userId) => supabase.auth.admin.deleteUser(userId)),
    );
  });

  it("creates invitations and returns enumeration-safe password recovery responses", async () => {
    const invitationEmail = `invite-${randomUUID()}@example.test`;
    const { data: invitation, error: invitationError } =
      await supabase.auth.admin.inviteUserByEmail(invitationEmail, {
        redirectTo: "http://127.0.0.1:3000/invite",
      });
    expect(invitationError).toBeNull();
    expect(invitation.user?.email).toBe(invitationEmail);
    if (invitation.user) createdUserIds.push(invitation.user.id);

    const existing = await supabase.auth.resetPasswordForEmail(invitationEmail, {
      redirectTo: "http://127.0.0.1:3000/reset-password",
    });
    const unknown = await supabase.auth.resetPasswordForEmail(
      `missing-${randomUUID()}@example.test`,
      {
        redirectTo: "http://127.0.0.1:3000/reset-password",
      },
    );
    expect(existing.error).toBeNull();
    expect(unknown.error).toBeNull();
  });

  it("rejects refresh-token use immediately after the user ban", async () => {
    const refreshRecord = createdUserIds.find((value) => value.startsWith("refresh:"));
    if (!refreshRecord) throw new Error("Local Auth refresh fixture is unavailable.");
    const [, userId, refreshToken] = refreshRecord.split(":");

    const { error: banError } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    expect(banError).toBeNull();

    const { error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    expect(refreshError).not.toBeNull();
  });
});
