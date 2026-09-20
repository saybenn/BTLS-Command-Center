-- Feature 08 capability bundles. Preserve every previously granted capability.
create or replace function app.has_platform_capability(capability text)
returns boolean language sql stable security definer set search_path = public, app as $$
 select exists(select 1 from public.app_users where id=app.current_user_id() and status='ACTIVE'
 and ((capability in ('platform.property.read', 'platform.media.view', 'platform.media.manage', 'platform.customer.view', 'platform.customer.manage', 'platform.employee.view', 'platform.revenue.settings.view', 'platform.property.service.view') and platform_role in ('BTLS_ADMIN','BTLS_OPERATOR'))
 or (capability in ('platform.property.manage', 'platform.user.manage', 'platform.media.sensitive.view', 'platform.operations.view', 'platform.operations.retry', 'platform.employee.manage', 'platform.revenue.settings.manage', 'platform.property.service.manage') and platform_role='BTLS_ADMIN')));
$$;
create or replace function app.has_foundation_capability(target_property_id uuid, capability text)
returns boolean language sql stable security definer set search_path = public, app as $$
 select capability in ('customer.view','customer.manage','employee.view','employee.manage','revenue.settings.view','revenue.settings.manage','property.service.view','property.service.manage')
 and exists(select 1 from public.app_users where id=app.current_user_id() and status='ACTIVE')
 and exists(select 1 from public.client_properties p join public.client_accounts a on a.id=p.account_id
 where p.id=target_property_id and p.status='ACTIVE' and a.status='ACTIVE')
 and (app.has_platform_capability('platform.' || capability)
 or (app.can_access_property(target_property_id) and (
 app.effective_property_role(target_property_id)='CLIENT_OWNER'
 or (app.effective_property_role(target_property_id)='CLIENT_MANAGER' and capability <> 'revenue.settings.manage')
 )));
$$;
grant execute on function app.has_foundation_capability(uuid,text) to authenticated, btls_app;

alter table public.property_services enable row level security;
grant select, insert, update on public.property_services to authenticated, btls_app;
create policy "property_services_read" on public.property_services for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'property.service.view'));
create policy "property_services_insert" on public.property_services for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'property.service.manage'));
create policy "property_services_update" on public.property_services for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'property.service.manage')) with check (app.has_foundation_capability(property_id,'property.service.manage'));


alter table public.customers enable row level security;
grant select, insert, update on public.customers to authenticated, btls_app;
create policy "customers_read" on public.customers for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.view'));
create policy "customers_insert" on public.customers for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'customer.manage'));
create policy "customers_update" on public.customers for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.manage')) with check (app.has_foundation_capability(property_id,'customer.manage'));


alter table public.contacts enable row level security;
grant select, insert, update on public.contacts to authenticated, btls_app;
create policy "contacts_read" on public.contacts for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.view'));
create policy "contacts_insert" on public.contacts for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'customer.manage'));
create policy "contacts_update" on public.contacts for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.manage')) with check (app.has_foundation_capability(property_id,'customer.manage'));


alter table public.service_locations enable row level security;
grant select, insert, update on public.service_locations to authenticated, btls_app;
create policy "service_locations_read" on public.service_locations for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.view'));
create policy "service_locations_insert" on public.service_locations for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'customer.manage'));
create policy "service_locations_update" on public.service_locations for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.manage')) with check (app.has_foundation_capability(property_id,'customer.manage'));


alter table public.service_assets enable row level security;
grant select, insert, update on public.service_assets to authenticated, btls_app;
create policy "service_assets_read" on public.service_assets for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.view'));
create policy "service_assets_insert" on public.service_assets for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'customer.manage'));
create policy "service_assets_update" on public.service_assets for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.manage')) with check (app.has_foundation_capability(property_id,'customer.manage'));


alter table public.tags enable row level security;
grant select, insert, update on public.tags to authenticated, btls_app;
create policy "tags_read" on public.tags for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.view'));
create policy "tags_insert" on public.tags for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'customer.manage'));
create policy "tags_update" on public.tags for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.manage')) with check (app.has_foundation_capability(property_id,'customer.manage'));


alter table public.customer_tags enable row level security;
grant select, insert, update on public.customer_tags to authenticated, btls_app;
create policy "customer_tags_read" on public.customer_tags for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.view'));
create policy "customer_tags_insert" on public.customer_tags for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'customer.manage'));
create policy "customer_tags_update" on public.customer_tags for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.manage')) with check (app.has_foundation_capability(property_id,'customer.manage'));


alter table public.employee_profiles enable row level security;
grant select, insert, update on public.employee_profiles to authenticated, btls_app;
create policy "employee_profiles_read" on public.employee_profiles for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'employee.view'));
create policy "employee_profiles_insert" on public.employee_profiles for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'employee.manage'));
create policy "employee_profiles_update" on public.employee_profiles for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'employee.manage')) with check (app.has_foundation_capability(property_id,'employee.manage'));


alter table public.revenue_operations_settings enable row level security;
grant select, insert, update on public.revenue_operations_settings to authenticated, btls_app;
create policy "revenue_operations_settings_read" on public.revenue_operations_settings for select to authenticated, btls_app using (app.has_foundation_capability(property_id,'revenue.settings.view'));
create policy "revenue_operations_settings_insert" on public.revenue_operations_settings for insert to authenticated, btls_app with check (app.has_foundation_capability(property_id,'revenue.settings.manage'));
create policy "revenue_operations_settings_update" on public.revenue_operations_settings for update to authenticated, btls_app using (app.has_foundation_capability(property_id,'revenue.settings.manage')) with check (app.has_foundation_capability(property_id,'revenue.settings.manage'));

grant delete on public.customer_tags to authenticated, btls_app;
create policy "customer_tags_delete" on public.customer_tags for delete to authenticated, btls_app using (app.has_foundation_capability(property_id,'customer.manage'));
