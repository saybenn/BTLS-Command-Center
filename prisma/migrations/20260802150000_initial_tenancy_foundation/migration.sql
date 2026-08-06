-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppUserStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "PlatformRole" AS ENUM ('BTLS_ADMIN', 'BTLS_OPERATOR');
CREATE TYPE "AccountRole" AS ENUM ('CLIENT_OWNER', 'CLIENT_MANAGER', 'CLIENT_STAFF', 'CLIENT_VIEWER');
CREATE TYPE "AccountMembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "ClientAccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "ClientPropertyStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "FeatureFlagScope" AS ENUM ('GLOBAL', 'ACCOUNT', 'PROPERTY');

-- CreateTable
CREATE TABLE "app_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "status" "AppUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "platform_role" "PlatformRole",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "client_accounts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ClientAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "client_properties" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "status" "ClientPropertyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_properties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account_memberships" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "AccountRole" NOT NULL,
    "status" "AccountMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "account_memberships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "property_accesses" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "role_override" "AccountRole",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "property_accesses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "scope" "FeatureFlagScope" NOT NULL,
    "account_id" UUID,
    "property_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "account_id" UUID,
    "property_id" UUID,
    "action" TEXT NOT NULL,
    "subject_type" TEXT NOT NULL,
    "subject_id" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");
CREATE INDEX "client_accounts_status_idx" ON "client_accounts"("status");
CREATE UNIQUE INDEX "client_properties_domain_key" ON "client_properties"("domain");
CREATE INDEX "client_properties_account_id_status_idx" ON "client_properties"("account_id", "status");
CREATE UNIQUE INDEX "client_properties_id_account_id_key" ON "client_properties"("id", "account_id");
CREATE INDEX "account_memberships_account_id_status_idx" ON "account_memberships"("account_id", "status");
CREATE INDEX "account_memberships_user_id_status_idx" ON "account_memberships"("user_id", "status");
CREATE UNIQUE INDEX "account_memberships_user_id_account_id_key" ON "account_memberships"("user_id", "account_id");
CREATE UNIQUE INDEX "account_memberships_id_account_id_key" ON "account_memberships"("id", "account_id");
CREATE INDEX "property_accesses_property_id_idx" ON "property_accesses"("property_id");
CREATE INDEX "property_accesses_membership_id_idx" ON "property_accesses"("membership_id");
CREATE UNIQUE INDEX "property_accesses_membership_id_property_id_key" ON "property_accesses"("membership_id", "property_id");
CREATE INDEX "feature_flags_account_id_idx" ON "feature_flags"("account_id");
CREATE INDEX "feature_flags_property_id_idx" ON "feature_flags"("property_id");
CREATE INDEX "audit_events_actor_id_occurred_at_idx" ON "audit_events"("actor_id", "occurred_at");
CREATE INDEX "audit_events_account_id_occurred_at_idx" ON "audit_events"("account_id", "occurred_at");
CREATE INDEX "audit_events_property_id_occurred_at_idx" ON "audit_events"("property_id", "occurred_at");

-- Feature flag target integrity and one flag value per scope target.
ALTER TABLE "feature_flags"
ADD CONSTRAINT "feature_flags_scope_target_check"
CHECK (
  ("scope" = 'GLOBAL' AND "account_id" IS NULL AND "property_id" IS NULL)
  OR ("scope" = 'ACCOUNT' AND "account_id" IS NOT NULL AND "property_id" IS NULL)
  OR ("scope" = 'PROPERTY' AND "account_id" IS NULL AND "property_id" IS NOT NULL)
);

CREATE UNIQUE INDEX "feature_flags_global_key_key"
ON "feature_flags"("key")
WHERE "scope" = 'GLOBAL';

CREATE UNIQUE INDEX "feature_flags_account_key_key"
ON "feature_flags"("key", "account_id")
WHERE "scope" = 'ACCOUNT';

CREATE UNIQUE INDEX "feature_flags_property_key_key"
ON "feature_flags"("key", "property_id")
WHERE "scope" = 'PROPERTY';

-- AddForeignKey
ALTER TABLE "client_properties" ADD CONSTRAINT "client_properties_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "client_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_memberships" ADD CONSTRAINT "account_memberships_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "client_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_memberships" ADD CONSTRAINT "account_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "property_accesses" ADD CONSTRAINT "property_accesses_membership_id_account_id_fkey" FOREIGN KEY ("membership_id", "account_id") REFERENCES "account_memberships"("id", "account_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "property_accesses" ADD CONSTRAINT "property_accesses_property_id_account_id_fkey" FOREIGN KEY ("property_id", "account_id") REFERENCES "client_properties"("id", "account_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "client_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
