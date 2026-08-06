-- Supabase-owned security and Storage foundation.
--
-- Apply this migration only after Prisma's initial tenancy migration. Prisma owns
-- the public tables and constraints; this migration owns roles, RLS, helpers, and
-- Storage configuration. Do not move public-table DDL into this directory.

create schema if not exists app;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'btls_app') then
    create role btls_app
      login
      noinherit
      nosuperuser
      nocreatedb
      nocreaterole
      noreplication
      nobypassrls;
  end if;
end
$$;

revoke all on schema public from public;
revoke all on schema app from public;

grant usage on schema public to authenticated, btls_app;
grant usage on schema app to authenticated, btls_app;

grant select, insert, update on table
  public.app_users,
  public.client_accounts,
  public.client_properties,
  public.account_memberships,
  public.property_accesses,
  public.feature_flags
to authenticated, btls_app;

grant select, insert on table public.audit_events to authenticated, btls_app;

create or replace function app.current_user_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    auth.uid(),
    nullif(current_setting('app.user_id', true), '')::uuid
  );
$$;

create or replace function app.is_btls_operator()
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
      and platform_role is not null
  );
$$;

create or replace function app.can_access_account(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.is_btls_operator()
    or exists (
      select 1
      from public.account_memberships
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
  select app.is_btls_operator()
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

create or replace function app.storage_object_property_id(object_name text)
returns uuid
language sql
immutable
as $$
  select case
    when split_part(object_name, '/', 1)
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(object_name, '/', 1)::uuid
    else null
  end;
$$;

create or replace function app.can_access_storage_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.can_access_property(app.storage_object_property_id(object_name));
$$;

grant execute on function
  app.current_user_id(),
  app.is_btls_operator(),
  app.can_access_account(uuid),
  app.can_access_property(uuid),
  app.storage_object_property_id(text),
  app.can_access_storage_object(text)
to authenticated, btls_app;

alter table public.app_users enable row level security;
alter table public.client_accounts enable row level security;
alter table public.client_properties enable row level security;
alter table public.account_memberships enable row level security;
alter table public.property_accesses enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_events enable row level security;

create policy "app_users_select_own_or_operator"
on public.app_users
for select
to authenticated, btls_app
using (id = app.current_user_id() or app.is_btls_operator());

create policy "app_users_insert_own"
on public.app_users
for insert
to authenticated, btls_app
with check (id = app.current_user_id());

create policy "app_users_update_own_or_operator"
on public.app_users
for update
to authenticated, btls_app
using (id = app.current_user_id() or app.is_btls_operator())
with check (id = app.current_user_id() or app.is_btls_operator());

create policy "client_accounts_select_authorized"
on public.client_accounts
for select
to authenticated, btls_app
using (app.can_access_account(id));

create policy "client_accounts_write_operator"
on public.client_accounts
for all
to authenticated, btls_app
using (app.is_btls_operator())
with check (app.is_btls_operator());

create policy "client_properties_select_authorized"
on public.client_properties
for select
to authenticated, btls_app
using (app.can_access_property(id));

create policy "client_properties_write_operator"
on public.client_properties
for all
to authenticated, btls_app
using (app.is_btls_operator())
with check (app.is_btls_operator());

create policy "account_memberships_select_own_or_operator"
on public.account_memberships
for select
to authenticated, btls_app
using (user_id = app.current_user_id() or app.is_btls_operator());

create policy "account_memberships_write_operator"
on public.account_memberships
for all
to authenticated, btls_app
using (app.is_btls_operator())
with check (app.is_btls_operator());

create policy "property_accesses_select_own_or_operator"
on public.property_accesses
for select
to authenticated, btls_app
using (
  membership_id in (
    select id
    from public.account_memberships
    where user_id = app.current_user_id()
  )
  or app.is_btls_operator()
);

create policy "property_accesses_write_operator"
on public.property_accesses
for all
to authenticated, btls_app
using (app.is_btls_operator())
with check (app.is_btls_operator());

create policy "feature_flags_select_authorized"
on public.feature_flags
for select
to authenticated, btls_app
using (
  scope = 'GLOBAL'
  or (account_id is not null and app.can_access_account(account_id))
  or (property_id is not null and app.can_access_property(property_id))
);

create policy "feature_flags_write_operator"
on public.feature_flags
for all
to authenticated, btls_app
using (app.is_btls_operator())
with check (app.is_btls_operator());

create policy "audit_events_select_authorized"
on public.audit_events
for select
to authenticated, btls_app
using (
  app.is_btls_operator()
  or (property_id is not null and app.can_access_property(property_id))
  or (account_id is not null and app.can_access_account(account_id))
);

create policy "audit_events_insert_authorized"
on public.audit_events
for insert
to authenticated, btls_app
with check (
  (actor_id is null or actor_id = app.current_user_id())
  and (account_id is null or app.can_access_account(account_id))
  and (property_id is null or app.can_access_property(property_id))
);

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('public-media', 'public-media', true, 10485760),
  ('public-content', 'public-content', true, 10485760),
  ('private-media', 'private-media', false, 52428800),
  ('temporary-uploads', 'temporary-uploads', false, 52428800)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

create policy "storage_public_buckets_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('public-media', 'public-content'));

create policy "storage_private_buckets_read_authorized"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('private-media', 'temporary-uploads')
  and app.can_access_storage_object(name)
);

create policy "storage_property_uploads_insert_authorized"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('public-media', 'public-content', 'private-media', 'temporary-uploads')
  and app.can_access_storage_object(name)
);

create policy "storage_property_uploads_update_authorized"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('public-media', 'public-content', 'private-media', 'temporary-uploads')
  and app.can_access_storage_object(name)
)
with check (
  bucket_id in ('public-media', 'public-content', 'private-media', 'temporary-uploads')
  and app.can_access_storage_object(name)
);

create policy "storage_property_uploads_delete_authorized"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('public-media', 'public-content', 'private-media', 'temporary-uploads')
  and app.can_access_storage_object(name)
);
