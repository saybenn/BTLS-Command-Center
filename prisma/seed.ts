import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import { PrismaClient } from "../src/generated/prisma/client";

const fixtures = {
  accountId: "11000000-0000-4000-8000-000000000001",
  hvacPropertyId: "11000000-0000-4000-8000-000000000002",
  plumbingPropertyId: "11000000-0000-4000-8000-000000000003",
  clientMembershipId: "11000000-0000-4000-8000-000000000004",
  hvacAccessId: "11000000-0000-4000-8000-000000000005",
  plumbingAccessId: "11000000-0000-4000-8000-000000000006",
} as const;

type SeedUser = {
  email: string;
  displayName: string;
};

const adminUser: SeedUser = {
  email: "admin@btls.local",
  displayName: "BTLS Admin",
};

const clientUser: SeedUser = {
  email: "client.user@btls.local",
  displayName: "Test Client User",
};

function requireSeedEnvironment() {
  if (process.env.BTLS_APP_ENV === "production" || process.env.NODE_ENV === "production") {
    throw new Error("The non-production seed process cannot run in production.");
  }

  const databaseUrl = process.env.DIRECT_DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "DIRECT_DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are required to seed.",
    );
  }

  return { databaseUrl, serviceRoleKey, supabaseUrl };
}

async function main() {
  const { databaseUrl, serviceRoleKey, supabaseUrl } = requireSeedEnvironment();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const ensureAuthUser = async (user: SeedUser) => {
    const { data: listedUsers, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      throw listError;
    }

    const existingUser = listedUsers.users.find((candidate) => candidate.email === user.email);

    if (existingUser) {
      return existingUser;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: { display_name: user.displayName },
    });

    if (error || !data.user) {
      throw error ?? new Error(`Supabase Auth did not create ${user.email}.`);
    }

    return data.user;
  };
  const adminAuthUser = await ensureAuthUser(adminUser);
  const clientAuthUser = await ensureAuthUser(clientUser);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.appUser.upsert({
        where: { id: adminAuthUser.id },
        create: {
          id: adminAuthUser.id,
          email: adminUser.email,
          displayName: adminUser.displayName,
          platformRole: "BTLS_ADMIN",
        },
        update: {
          displayName: adminUser.displayName,
          email: adminUser.email,
          platformRole: "BTLS_ADMIN",
          status: "ACTIVE",
        },
      });
      await transaction.appUser.upsert({
        where: { id: clientAuthUser.id },
        create: {
          id: clientAuthUser.id,
          email: clientUser.email,
          displayName: clientUser.displayName,
        },
        update: {
          displayName: clientUser.displayName,
          email: clientUser.email,
          platformRole: null,
          status: "ACTIVE",
        },
      });
      await transaction.clientAccount.upsert({
        where: { id: fixtures.accountId },
        create: { id: fixtures.accountId, name: "BTLS Test Client" },
        update: { name: "BTLS Test Client", status: "ACTIVE" },
      });
      await transaction.clientProperty.upsert({
        where: { id: fixtures.hvacPropertyId },
        create: {
          id: fixtures.hvacPropertyId,
          accountId: fixtures.accountId,
          name: "BTLS Test HVAC",
          domain: "hvac.test.btls.local",
        },
        update: { name: "BTLS Test HVAC", status: "ACTIVE" },
      });
      await transaction.clientProperty.upsert({
        where: { id: fixtures.plumbingPropertyId },
        create: {
          id: fixtures.plumbingPropertyId,
          accountId: fixtures.accountId,
          name: "BTLS Test Plumbing",
          domain: "plumbing.test.btls.local",
        },
        update: { name: "BTLS Test Plumbing", status: "ACTIVE" },
      });
      await transaction.accountMembership.upsert({
        where: {
          userId_accountId: {
            userId: clientAuthUser.id,
            accountId: fixtures.accountId,
          },
        },
        create: {
          id: fixtures.clientMembershipId,
          accountId: fixtures.accountId,
          userId: clientAuthUser.id,
          role: "CLIENT_VIEWER",
        },
        update: { id: fixtures.clientMembershipId, role: "CLIENT_VIEWER", status: "ACTIVE" },
      });
      await transaction.propertyAccess.upsert({
        where: {
          membershipId_propertyId: {
            membershipId: fixtures.clientMembershipId,
            propertyId: fixtures.hvacPropertyId,
          },
        },
        create: {
          id: fixtures.hvacAccessId,
          accountId: fixtures.accountId,
          membershipId: fixtures.clientMembershipId,
          propertyId: fixtures.hvacPropertyId,
          roleOverride: "CLIENT_MANAGER",
        },
        update: { roleOverride: "CLIENT_MANAGER" },
      });
      await transaction.propertyAccess.upsert({
        where: {
          membershipId_propertyId: {
            membershipId: fixtures.clientMembershipId,
            propertyId: fixtures.plumbingPropertyId,
          },
        },
        create: {
          id: fixtures.plumbingAccessId,
          accountId: fixtures.accountId,
          membershipId: fixtures.clientMembershipId,
          propertyId: fixtures.plumbingPropertyId,
          roleOverride: "CLIENT_VIEWER",
        },
        update: { roleOverride: "CLIENT_VIEWER" },
      });
    });
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
