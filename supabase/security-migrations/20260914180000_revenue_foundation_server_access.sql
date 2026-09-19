-- Slice 08.8: normal foundation CRUD is server-only. No browser-data exception exists.
-- Preserve the existing restricted btls_app role and all capability/relational checks.
do $$
declare
  foundation_tables text[] := array['property_services','customers','contacts','service_locations',
    'service_assets','tags','customer_tags','employee_profiles','revenue_operations_settings'];
  table_name text;
  policy_record record;
begin
  foreach table_name in array foundation_tables loop
    execute format('revoke all privileges on table public.%I from public, anon, authenticated', table_name);
  end loop;
  for policy_record in
    select tablename, policyname from pg_policies
    where schemaname='public' and tablename=any(foundation_tables)
  loop
    execute format('alter policy %I on public.%I to btls_app',
      policy_record.policyname, policy_record.tablename);
  end loop;
end $$;

-- Workforce linking may read existing active grant identities within the current
-- authorized property. These server-only SELECT policies grant no identity writes.
-- Definer helpers follow the existing authorization pattern to avoid recursive RLS.
create function app.can_read_employee_membership(target_membership_id uuid)
returns boolean language sql stable security definer set search_path=public,app as $$
  select exists (
    select 1 from public.property_accesses p
    join public.account_memberships m on m.id=p.membership_id and m.account_id=p.account_id
    where p.membership_id=target_membership_id
      and p.property_id=nullif(current_setting('app.property_id',true),'')::uuid
      and app.can_link_employee_user(p.property_id,m.user_id)
  );
$$;
revoke all on function app.can_read_employee_membership(uuid) from public, anon, authenticated;
grant execute on function app.can_read_employee_membership(uuid) to btls_app;

create policy app_users_read_employee_link_candidates on public.app_users
for select to btls_app using (
  app.can_link_employee_user(nullif(current_setting('app.property_id',true),'')::uuid,id)
);
create policy memberships_read_employee_link_candidates on public.account_memberships
for select to btls_app using (app.can_read_employee_membership(id));
create policy accesses_read_employee_link_candidates on public.property_accesses
for select to btls_app using (
  property_id=nullif(current_setting('app.property_id',true),'')::uuid
  and app.can_read_employee_membership(membership_id)
);
