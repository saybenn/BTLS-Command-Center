-- Existing notices retain unknown historical context rather than fabricated provenance.
ALTER TABLE "notifications" ADD COLUMN "source" TEXT, ADD COLUMN "correlation_id" UUID;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_context_pair_check"
  CHECK (("source" IS NULL AND "correlation_id" IS NULL) OR
         ("source" IS NOT NULL AND length("source") BETWEEN 1 AND 80 AND "correlation_id" IS NOT NULL));
