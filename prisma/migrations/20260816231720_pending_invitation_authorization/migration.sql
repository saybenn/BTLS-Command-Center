-- CreateEnum
CREATE TYPE "PendingInvitationStatus" AS ENUM ('PENDING', 'CANCELLED', 'EXPIRED', 'APPLIED');

-- CreateTable
CREATE TABLE "pending_account_invitations" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "invited_user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "AccountRole" NOT NULL,
    "status" "PendingInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "invited_by_id" UUID NOT NULL,
    "applied_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pending_account_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_property_accesses" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "pending_invitation_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "role_override" "AccountRole",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pending_property_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_account_invitations_account_id_status_idx" ON "pending_account_invitations"("account_id", "status");

-- CreateIndex
CREATE INDEX "pending_account_invitations_invited_user_id_status_idx" ON "pending_account_invitations"("invited_user_id", "status");

-- CreateIndex
CREATE INDEX "pending_account_invitations_expires_at_idx" ON "pending_account_invitations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "pending_account_invitations_id_account_id_key" ON "pending_account_invitations"("id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "pending_account_invitations_invited_user_id_account_id_key" ON "pending_account_invitations"("invited_user_id", "account_id");

-- CreateIndex
CREATE INDEX "pending_property_accesses_property_id_idx" ON "pending_property_accesses"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "pending_property_accesses_pending_invitation_id_property_id_key" ON "pending_property_accesses"("pending_invitation_id", "property_id");

-- AddForeignKey
ALTER TABLE "pending_account_invitations" ADD CONSTRAINT "pending_account_invitations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "client_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_account_invitations" ADD CONSTRAINT "pending_account_invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_property_accesses" ADD CONSTRAINT "pending_property_accesses_pending_invitation_id_account_id_fkey" FOREIGN KEY ("pending_invitation_id", "account_id") REFERENCES "pending_account_invitations"("id", "account_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_property_accesses" ADD CONSTRAINT "pending_property_accesses_property_id_account_id_fkey" FOREIGN KEY ("property_id", "account_id") REFERENCES "client_properties"("id", "account_id") ON DELETE CASCADE ON UPDATE CASCADE;
