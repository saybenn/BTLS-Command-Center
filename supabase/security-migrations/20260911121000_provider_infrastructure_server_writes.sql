-- Feature 07 provider evidence is written only by trusted server application services.
-- Authorized users retain the existing property-scoped SELECT policies.

revoke insert, update, delete on
  public.webhook_receipts,
  public.sending_identities,
  public.provider_dispatches
from authenticated, btls_app;

drop policy if exists "webhook_receipts_insert_property_authorized" on public.webhook_receipts;
drop policy if exists "webhook_receipts_update_operationally_authorized" on public.webhook_receipts;
drop policy if exists "sending_identities_write_platform_admin" on public.sending_identities;
drop policy if exists "provider_dispatches_insert_property_authorized" on public.provider_dispatches;
drop policy if exists "provider_dispatches_update_operationally_authorized" on public.provider_dispatches;
