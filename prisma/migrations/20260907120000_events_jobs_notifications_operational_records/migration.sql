-- CreateEnum
CREATE TYPE "EventOutboxStatus" AS ENUM ('PENDING', 'DISPATCHED', 'FAILED');
CREATE TYPE "JobExecutionOrigin" AS ENUM ('USER', 'SYSTEM', 'WEBHOOK');
CREATE TYPE "JobExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'RETRY_SCHEDULED');
CREATE TYPE "JobExecutionAttemptStatus" AS ENUM ('STARTED', 'SUCCEEDED', 'FAILED');
CREATE TYPE "WebhookProvider" AS ENUM ('POSTMARK', 'TWILIO');
CREATE TYPE "WebhookReceiptStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED');
CREATE TYPE "SendingIdentityMode" AS ENUM ('BTLS_MANAGED', 'CUSTOM_DOMAIN', 'CONNECTED_MAILBOX');
CREATE TYPE "SendingIdentityStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "ProviderDispatchChannel" AS ENUM ('TRANSACTIONAL_EMAIL', 'SMS');
CREATE TYPE "ProviderDispatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'UNCERTAIN', 'FAILED');

-- CreateTable
CREATE TABLE "event_outbox" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_version" INTEGER NOT NULL,
    "correlation_id" UUID NOT NULL,
    "deduplication_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "EventOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "dispatched_at" TIMESTAMPTZ(6),
    "failure_category" TEXT,
    "failure_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "job_executions" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "initiated_by_id" UUID,
    "job_type" TEXT NOT NULL,
    "job_version" INTEGER NOT NULL,
    "origin" "JobExecutionOrigin" NOT NULL,
    "status" "JobExecutionStatus" NOT NULL DEFAULT 'QUEUED',
    "correlation_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "safe_payload" JSONB NOT NULL,
    "retry_requested_at" TIMESTAMPTZ(6),
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "failure_category" TEXT,
    "failure_message" TEXT,
    "failed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "job_executions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "job_execution_attempts" (
    "id" UUID NOT NULL,
    "job_execution_id" UUID NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "status" "JobExecutionAttemptStatus" NOT NULL DEFAULT 'STARTED',
    "provider_run_id" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),
    "failure_category" TEXT,
    "failure_message" TEXT,
    CONSTRAINT "job_execution_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "job_execution_attempts_attempt_number_positive" CHECK ("attempt_number" > 0)
);

CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "subject_type" TEXT,
    "subject_id" UUID,
    "deduplication_key" TEXT NOT NULL,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_subject_pair_check" CHECK (
      ("subject_type" IS NULL AND "subject_id" IS NULL)
      OR ("subject_type" IS NOT NULL AND "subject_id" IS NOT NULL)
    )
);

CREATE TABLE "webhook_receipts" (
    "id" UUID NOT NULL,
    "property_id" UUID,
    "provider" "WebhookProvider" NOT NULL,
    "provider_account_key" TEXT NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "correlation_id" UUID,
    "occurred_at" TIMESTAMPTZ(6),
    "status" "WebhookReceiptStatus" NOT NULL DEFAULT 'RECEIVED',
    "processing_started_at" TIMESTAMPTZ(6),
    "processed_at" TIMESTAMPTZ(6),
    "failure_category" TEXT,
    "failure_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "webhook_receipts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sending_identities" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "mode" "SendingIdentityMode" NOT NULL DEFAULT 'BTLS_MANAGED',
    "status" "SendingIdentityStatus" NOT NULL DEFAULT 'ACTIVE',
    "display_name" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "reply_to_address" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "sending_identities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sending_identities_feature_07_mode_check" CHECK ("mode" = 'BTLS_MANAGED')
);

CREATE TABLE "provider_dispatches" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "job_execution_id" UUID,
    "sending_identity_id" UUID,
    "channel" "ProviderDispatchChannel" NOT NULL,
    "provider_name" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "correlation_id" UUID NOT NULL,
    "provider_correlation_id" TEXT,
    "provider_message_id" TEXT,
    "status" "ProviderDispatchStatus" NOT NULL DEFAULT 'PENDING',
    "request_fingerprint" TEXT NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "failure_category" TEXT,
    "failure_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "provider_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_outbox_event_id_key" ON "event_outbox"("event_id");
CREATE UNIQUE INDEX "event_outbox_property_id_event_name_deduplication_key_key" ON "event_outbox"("property_id", "event_name", "deduplication_key");
CREATE INDEX "event_outbox_status_created_at_idx" ON "event_outbox"("status", "created_at");
CREATE INDEX "event_outbox_property_id_created_at_idx" ON "event_outbox"("property_id", "created_at");

CREATE UNIQUE INDEX "job_executions_property_id_job_type_idempotency_key_key" ON "job_executions"("property_id", "job_type", "idempotency_key");
CREATE INDEX "job_executions_property_id_status_created_at_idx" ON "job_executions"("property_id", "status", "created_at");
CREATE INDEX "job_executions_status_failed_at_idx" ON "job_executions"("status", "failed_at");
CREATE INDEX "job_executions_correlation_id_idx" ON "job_executions"("correlation_id");

CREATE UNIQUE INDEX "job_execution_attempts_job_execution_id_attempt_number_key" ON "job_execution_attempts"("job_execution_id", "attempt_number");
CREATE INDEX "job_execution_attempts_status_started_at_idx" ON "job_execution_attempts"("status", "started_at");

CREATE UNIQUE INDEX "notifications_property_id_recipient_user_id_deduplication_key_key" ON "notifications"("property_id", "recipient_user_id", "deduplication_key");
CREATE INDEX "notifications_property_id_recipient_user_id_read_at_created_at_idx" ON "notifications"("property_id", "recipient_user_id", "read_at", "created_at");

CREATE UNIQUE INDEX "webhook_receipts_provider_provider_account_key_external_event_id_key" ON "webhook_receipts"("provider", "provider_account_key", "external_event_id");
CREATE INDEX "webhook_receipts_property_id_created_at_idx" ON "webhook_receipts"("property_id", "created_at");
CREATE INDEX "webhook_receipts_status_created_at_idx" ON "webhook_receipts"("status", "created_at");

CREATE INDEX "sending_identities_property_id_status_idx" ON "sending_identities"("property_id", "status");

CREATE UNIQUE INDEX "provider_dispatches_property_id_channel_operation_type_idempotency_key_key" ON "provider_dispatches"("property_id", "channel", "operation_type", "idempotency_key");
CREATE INDEX "provider_dispatches_property_id_status_created_at_idx" ON "provider_dispatches"("property_id", "status", "created_at");
CREATE INDEX "provider_dispatches_provider_name_provider_message_id_idx" ON "provider_dispatches"("provider_name", "provider_message_id");
CREATE INDEX "provider_dispatches_correlation_id_idx" ON "provider_dispatches"("correlation_id");

-- AddForeignKey
ALTER TABLE "event_outbox" ADD CONSTRAINT "event_outbox_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "job_executions" ADD CONSTRAINT "job_executions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "job_executions" ADD CONSTRAINT "job_executions_initiated_by_id_fkey" FOREIGN KEY ("initiated_by_id") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "job_execution_attempts" ADD CONSTRAINT "job_execution_attempts_job_execution_id_fkey" FOREIGN KEY ("job_execution_id") REFERENCES "job_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "webhook_receipts" ADD CONSTRAINT "webhook_receipts_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sending_identities" ADD CONSTRAINT "sending_identities_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provider_dispatches" ADD CONSTRAINT "provider_dispatches_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provider_dispatches" ADD CONSTRAINT "provider_dispatches_job_execution_id_fkey" FOREIGN KEY ("job_execution_id") REFERENCES "job_executions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "provider_dispatches" ADD CONSTRAINT "provider_dispatches_sending_identity_id_fkey" FOREIGN KEY ("sending_identity_id") REFERENCES "sending_identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
