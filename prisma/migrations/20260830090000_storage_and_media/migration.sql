-- CreateEnum
CREATE TYPE "MediaAssetProfile" AS ENUM ('BRAND_IMAGE', 'CONTENT_IMAGE', 'ATTACHMENT', 'EVIDENCE', 'GENERATED_DOCUMENT', 'TEMPORARY_INPUT');
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "MediaSensitivity" AS ENUM ('NORMAL', 'SENSITIVE');
CREATE TYPE "MediaDurability" AS ENUM ('DURABLE', 'TEMPORARY');
CREATE TYPE "MediaStorageBucket" AS ENUM ('PUBLIC_MEDIA', 'PUBLIC_CONTENT', 'PRIVATE_MEDIA', 'TEMPORARY_UPLOADS');
CREATE TYPE "MediaAssetStatus" AS ENUM ('PENDING_UPLOAD', 'READY', 'DELETION_PENDING', 'DELETED');

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_by_id" UUID,
    "replaces_asset_id" UUID,
    "profile" "MediaAssetProfile" NOT NULL,
    "visibility" "MediaVisibility" NOT NULL,
    "sensitivity" "MediaSensitivity" NOT NULL,
    "durability" "MediaDurability" NOT NULL,
    "storage_bucket" "MediaStorageBucket" NOT NULL,
    "path_family" TEXT NOT NULL,
    "target_key" TEXT,
    "object_path" TEXT NOT NULL,
    "display_filename" TEXT NOT NULL,
    "declared_mime_type" TEXT NOT NULL,
    "declared_byte_size" INTEGER NOT NULL,
    "expected_extension" TEXT NOT NULL,
    "verified_mime_type" TEXT,
    "verified_byte_size" INTEGER,
    "verified_extension" TEXT,
    "storage_object_id" TEXT,
    "storage_object_version" TEXT,
    "storage_etag" TEXT,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "upload_url_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "finalization_deadline_at" TIMESTAMPTZ(6) NOT NULL,
    "finalized_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "removed_at" TIMESTAMPTZ(6),
    "cleanup_eligible_at" TIMESTAMPTZ(6),
    "deletion_claim_id" UUID,
    "deletion_claimed_at" TIMESTAMPTZ(6),
    "deletion_lease_expires_at" TIMESTAMPTZ(6),
    "deletion_attempt_count" INTEGER NOT NULL DEFAULT 0,
    "finalization_attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_finalization_attempt_at" TIMESTAMPTZ(6),
    "last_failure_category" TEXT,
    "last_failure_at" TIMESTAMPTZ(6),
    "last_cleanup_failure_category" TEXT,
    "last_cleanup_failure_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "media_assets_declared_byte_size_positive" CHECK ("declared_byte_size" > 0),
    CONSTRAINT "media_assets_verified_byte_size_positive" CHECK ("verified_byte_size" IS NULL OR "verified_byte_size" > 0),
    CONSTRAINT "media_assets_finalization_deadline_check" CHECK ("finalization_deadline_at" >= "upload_url_expires_at"),
    CONSTRAINT "media_assets_no_self_replacement" CHECK ("replaces_asset_id" IS NULL OR "replaces_asset_id" <> "id"),
    CONSTRAINT "media_assets_ready_finalization_check" CHECK (
      "status" <> 'READY'
      OR (
        "finalized_at" IS NOT NULL
        AND "verified_mime_type" IS NOT NULL
        AND "verified_byte_size" IS NOT NULL
        AND "verified_extension" IS NOT NULL
        AND "storage_object_id" IS NOT NULL
        AND "storage_object_version" IS NOT NULL
        AND "storage_etag" IS NOT NULL
      )
    ),
    CONSTRAINT "media_assets_deleted_tombstone_check" CHECK (
      "status" <> 'DELETED' OR "deleted_at" IS NOT NULL
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_bucket_object_path_key" ON "media_assets"("storage_bucket", "object_path");
CREATE INDEX "media_assets_property_id_profile_status_removed_at_created_at_idx" ON "media_assets"("property_id", "profile", "status", "removed_at", "created_at");
CREATE INDEX "media_assets_status_cleanup_eligible_at_deletion_lease_expires_at_idx" ON "media_assets"("status", "cleanup_eligible_at", "deletion_lease_expires_at");
CREATE INDEX "media_assets_property_id_status_finalization_deadline_at_idx" ON "media_assets"("property_id", "status", "finalization_deadline_at");
CREATE INDEX "media_assets_replaces_asset_id_idx" ON "media_assets"("replaces_asset_id");

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_replaces_asset_id_fkey" FOREIGN KEY ("replaces_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
