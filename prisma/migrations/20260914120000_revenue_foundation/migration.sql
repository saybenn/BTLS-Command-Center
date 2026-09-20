-- CreateEnum
CREATE TYPE "CustomerRelationshipState" AS ENUM ('PROSPECT', 'CURRENT', 'INACTIVE');

-- CreateTable
CREATE TABLE "property_services" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parent_service_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "property_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "relationship_state" "CustomerRelationshipState" NOT NULL DEFAULT 'PROSPECT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "create_request_id" UUID NOT NULL,
    "create_actor_id" UUID NOT NULL,
    "create_fingerprint" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "person_name" TEXT NOT NULL,
    "email" TEXT,
    "normalized_email" TEXT,
    "phone_e164" TEXT,
    "phone_display" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_locations" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "locality" TEXT NOT NULL,
    "region" TEXT,
    "postal_code" TEXT,
    "country_code" VARCHAR(2) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "service_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_assets" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "service_location_id" UUID,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model_name" TEXT,
    "serial_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "service_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tags" (
    "property_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_tags_pkey" PRIMARY KEY ("property_id","customer_id","tag_id")
);

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "app_user_id" UUID,
    "display_name" TEXT NOT NULL,
    "job_title" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_operations_settings" (
    "property_id" UUID NOT NULL,
    "default_sending_identity_id" UUID,
    "review_request_delay_days" INTEGER,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "revenue_operations_settings_pkey" PRIMARY KEY ("property_id")
);

-- CreateIndex
CREATE INDEX "property_services_property_id_is_active_name_id_idx" ON "property_services"("property_id", "is_active", "name", "id");

-- CreateIndex
CREATE UNIQUE INDEX "property_services_id_property_id_key" ON "property_services"("id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_services_property_id_normalized_name_key" ON "property_services"("property_id", "normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "property_services_property_id_slug_key" ON "property_services"("property_id", "slug");

-- CreateIndex
CREATE INDEX "customers_property_id_relationship_state_display_name_id_idx" ON "customers"("property_id", "relationship_state", "display_name", "id");

-- CreateIndex
CREATE INDEX "customers_property_id_normalized_name_idx" ON "customers"("property_id", "normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_property_id_key" ON "customers"("id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_property_id_create_actor_id_create_request_id_key" ON "customers"("property_id", "create_actor_id", "create_request_id");

-- CreateIndex
CREATE INDEX "contacts_property_id_customer_id_is_active_idx" ON "contacts"("property_id", "customer_id", "is_active");

-- CreateIndex
CREATE INDEX "contacts_property_id_normalized_email_idx" ON "contacts"("property_id", "normalized_email");

-- CreateIndex
CREATE INDEX "contacts_property_id_phone_e164_idx" ON "contacts"("property_id", "phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_id_property_id_customer_id_key" ON "contacts"("id", "property_id", "customer_id");

-- CreateIndex
CREATE INDEX "service_locations_property_id_customer_id_is_active_idx" ON "service_locations"("property_id", "customer_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "service_locations_id_property_id_customer_id_key" ON "service_locations"("id", "property_id", "customer_id");

-- CreateIndex
CREATE INDEX "service_assets_property_id_customer_id_is_active_idx" ON "service_assets"("property_id", "customer_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "service_assets_id_property_id_key" ON "service_assets"("id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_id_property_id_key" ON "tags"("id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_property_id_normalized_name_key" ON "tags"("property_id", "normalized_name");

-- CreateIndex
CREATE INDEX "customer_tags_property_id_tag_id_idx" ON "customer_tags"("property_id", "tag_id");

-- CreateIndex
CREATE INDEX "employee_profiles_property_id_is_active_display_name_id_idx" ON "employee_profiles"("property_id", "is_active", "display_name", "id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_id_property_id_key" ON "employee_profiles"("id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_property_id_app_user_id_key" ON "employee_profiles"("property_id", "app_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sending_identities_id_property_id_key" ON "sending_identities"("id", "property_id");

-- AddForeignKey
ALTER TABLE "property_services" ADD CONSTRAINT "property_services_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_services" ADD CONSTRAINT "property_services_parent_service_id_property_id_fkey" FOREIGN KEY ("parent_service_id", "property_id") REFERENCES "property_services"("id", "property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_customer_id_property_id_fkey" FOREIGN KEY ("customer_id", "property_id") REFERENCES "customers"("id", "property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_customer_id_property_id_fkey" FOREIGN KEY ("customer_id", "property_id") REFERENCES "customers"("id", "property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_assets" ADD CONSTRAINT "service_assets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_assets" ADD CONSTRAINT "service_assets_customer_id_property_id_fkey" FOREIGN KEY ("customer_id", "property_id") REFERENCES "customers"("id", "property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_assets" ADD CONSTRAINT "service_assets_service_location_id_property_id_customer_id_fkey" FOREIGN KEY ("service_location_id", "property_id", "customer_id") REFERENCES "service_locations"("id", "property_id", "customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_customer_id_property_id_fkey" FOREIGN KEY ("customer_id", "property_id") REFERENCES "customers"("id", "property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_tag_id_property_id_fkey" FOREIGN KEY ("tag_id", "property_id") REFERENCES "tags"("id", "property_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_operations_settings" ADD CONSTRAINT "revenue_operations_settings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "client_properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_operations_settings" ADD CONSTRAINT "revenue_operations_settings_default_sending_identity_id_pr_fkey" FOREIGN KEY ("default_sending_identity_id", "property_id") REFERENCES "sending_identities"("id", "property_id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Defaults must remain active and unique; endpoints are intentionally not unique.
CREATE UNIQUE INDEX contacts_one_primary ON contacts(property_id,customer_id) WHERE is_primary AND is_active;
CREATE UNIQUE INDEX locations_one_default ON service_locations(property_id,customer_id) WHERE is_default AND is_active;
ALTER TABLE contacts ADD CONSTRAINT contacts_primary_active CHECK (NOT is_primary OR is_active);
ALTER TABLE contacts ADD CONSTRAINT contacts_person_name_nonempty CHECK (length(trim(person_name)) > 0);
ALTER TABLE service_locations ADD CONSTRAINT locations_default_active CHECK (NOT is_default OR is_active);
ALTER TABLE property_services ADD CONSTRAINT services_not_own_parent CHECK (parent_service_id IS NULL OR parent_service_id <> id);
ALTER TABLE revenue_operations_settings ADD CONSTRAINT review_delay_valid CHECK (review_request_delay_days BETWEEN 0 AND 365);
