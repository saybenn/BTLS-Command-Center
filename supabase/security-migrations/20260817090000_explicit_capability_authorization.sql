-- Feature 05: explicit platform-capability authorization.
-- This additive migration supersedes the broad internal-role RLS bypass without rewriting prior history.

create or replace function app.has_platform_capability(capability text)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select exists (
    select 1
    from public.app_users
    where id = app.current_user_id()
      and status = 'ACTIVE'
      and (
        (capability = 'platform.property.read' and platform_role in ('BTLS_ADMIN', 'BTLS_OPERATOR'))
        or (capability in ('platform.property.manage', 'platform.user.manage') and platform_role = 'BTLS_ADMIN')
      )
  );
$$;

-- Compatibility only. New policies must use app.has_platform_capability directly.
create or replace function app.is_btls_operator()
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.has_platform_capability('platform.property.read');
$$;

create or replace function app.can_access_account(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.has_platform_capability('platform.property.read')
    or exists (
      select 1 from public.account_memberships
      where account_id = target_account_id
        and user_id = app.current_user_id()
        and status = 'ACTIVE'
    );
$$;

create or replace function app.can_access_property(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.has_platform_capability('platform.property.read')
    or exists (
      select 1
      from public.property_accesses
      join public.account_memberships
        on account_memberships.id = property_accesses.membership_id
       and account_memberships.account_id = property_accesses.account_id
      where property_accesses.property_id = target_property_id
        and account_memberships.user_id = app.current_user_id()
        and account_memberships.status = 'ACTIVE'
    );
$$;

grant execute on function app.has_platform_capability(text) to authenticated, btls_app;

grant select, insert, update on table
  public.pending_account_invitations,
  public.pending_property_accesses
 to authenticated, btls_app;

alter table public.pending_account_invitations enable row level security;
alter table public.pending_property_accesses enable row level security;

drop policy if exists "app_users_select_own_or_operator" on public.app_users;
drop policy if exists "app_users_update_own_or_operator" on public.app_users;
drop policy if exists "client_accounts_write_operator" on public.client_accounts;
drop policy if exists "client_properties_write_operator" on public.client_properties;
drop policy if exists "account_memberships_select_own_or_operator" on public.account_memberships;
drop policy if exists "account_memberships_write_operator" on public.account_memberships;
drop policy if exists "property_accesses_select_own_or_operator" on public.property_accesses;
drop policy if exists "property_accesses_write_operator" on public.property_accesses;
drop policy if exists "feature_flags_write_operator" on public.feature_flags;
drop policy if exists "audit_events_select_authorized" on public.audit_events;

create policy "app_users_select_own_or_platform_user_manager" on public.app_users for select to authenticated, btls_app using (id = app.current_user_id() or app.has_platform_capability('platform.user.manage'));
create policy "app_users_update_own_or_platform_user_manager" on public.app_users for update to authenticated, btls_app using (id = app.current_user_id() or app.has_platform_capability('platform.user.manage')) with check (id = app.current_user_id() or app.has_platform_capability('platform.user.manage'));
create policy "client_accounts_write_platform_property_manager" on public.client_accounts for all to authenticated, btls_app using (app.has_platform_capability('platform.property.manage')) with check (app.has_platform_capability('platform.property.manage'));
create policy "client_properties_write_platform_property_manager" on public.client_properties for all to authenticated, btls_app using (app.has_platform_capability('platform.property.manage')) with check (app.has_platform_capability('platform.property.manage'));
create policy "account_memberships_select_own_or_platform_user_manager" on public.account_memberships for select to authenticated, btls_app using (user_id = app.current_user_id() or app.has_platform_capability('platform.user.manage'));
create policy "account_memberships_write_platform_user_manager" on public.account_memberships for all to authenticated, btls_app using (app.has_platform_capability('platform.user.manage')) with check (app.has_platform_capability('platform.user.manage'));
create policy "property_accesses_select_own_or_platform_user_manager" on public.property_accesses for select to authenticated, btls_app using (membership_id in (select id from public.account_memberships where user_id = app.current_user_id()) or app.has_platform_capability('platform.user.manage'));
create policy "property_accesses_write_platform_user_manager" on public.property_accesses for all to authenticated, btls_app using (app.has_platform_capability('platform.user.manage')) with check (app.has_platform_capability('platform.user.manage'));
create policy "feature_flags_write_platform_property_manager" on public.feature_flags for all to authenticated, btls_app using (app.has_platform_capability('platform.property.manage')) with check (app.has_platform_capability('platform.property.manage'));
create policy "audit_events_select_explicitly_authorized" on public.audit_events for select to authenticated, btls_app using (app.has_platform_capability('platform.property.read') or (property_id is not null and app.can_access_property(property_id)) or (account_id is not null and app.can_access_account(account_id)));
create policy "pending_account_invitations_platform_user_manager" on public.pending_account_invitations for all to authenticated, btls_app using (app.has_platform_capability('platform.user.manage')) with check (app.has_platform_capability('platform.user.manage'));
create policy "pending_property_accesses_platform_user_manager" on public.pending_property_accesses for all to authenticated, btls_app using (app.has_platform_capability('platform.user.manage')) with check (app.has_platform_capability('platform.user.manage'));