-- Feature 06: Media capability gates and server-owned Storage access.
-- Prisma owns public.media_assets. This migration owns RLS and Storage configuration.

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
        (capability in ('platform.property.read', 'platform.media.view', 'platform.media.manage')
          and platform_role in ('BTLS_ADMIN', 'BTLS_OPERATOR'))
        or (capability in ('platform.property.manage', 'platform.user.manage', 'platform.media.sensitive.view')
          and platform_role = 'BTLS_ADMIN')
      )
  );
$$;

create or replace function app.has_property_media_capability(
  target_property_id uuid,
  capability text
)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.can_access_property(target_property_id)
    and case capability
      when 'media.view' then app.effective_property_role(target_property_id) in (
        'CLIENT_OWNER'::public."AccountRole",
        'CLIENT_MANAGER'::public."AccountRole",
        'CLIENT_STAFF'::public."AccountRole",
        'CLIENT_VIEWER'::public."AccountRole"
      )
      when 'media.manage' then app.effective_property_role(target_property_id) in (
        'CLIENT_OWNER'::public."AccountRole",
        'CLIENT_MANAGER'::public."AccountRole",
        'CLIENT_STAFF'::public."AccountRole"
      )
      when 'media.sensitive.view' then app.effective_property_role(target_property_id) in (
        'CLIENT_OWNER'::public."AccountRole",
        'CLIENT_MANAGER'::public."AccountRole"
      )
      else false
    end;
$$;

create or replace function app.can_view_media_asset(
  target_property_id uuid,
  target_sensitivity public."MediaSensitivity"
)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.can_access_property(target_property_id)
    and case target_sensitivity
      when 'SENSITIVE'::public."MediaSensitivity" then (
        app.has_platform_capability('platform.media.sensitive.view')
        or app.has_property_media_capability(target_property_id, 'media.sensitive.view')
      )
      else (
        app.has_platform_capability('platform.media.view')
        or app.has_property_media_capability(target_property_id, 'media.view')
      )
    end;
$$;

create or replace function app.can_manage_media_asset(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.can_access_property(target_property_id)
    and (
      app.has_platform_capability('platform.media.manage')
      or app.has_property_media_capability(target_property_id, 'media.manage')
    );
$$;

grant execute on function
  app.has_platform_capability(text),
  app.has_property_media_capability(uuid, text),
  app.can_view_media_asset(uuid, public."MediaSensitivity"),
  app.can_manage_media_asset(uuid)
to authenticated, btls_app;

grant select, insert, update on table public.media_assets to authenticated, btls_app;

alter table public.media_assets enable row level security;

create policy "media_assets_select_authorized"
on public.media_assets
for select
to authenticated, btls_app
using (app.can_view_media_asset(property_id, sensitivity));

create policy "media_assets_insert_authorized"
on public.media_assets
for insert
to authenticated, btls_app
with check (app.can_manage_media_asset(property_id));

create policy "media_assets_update_authorized"
on public.media_assets
for update
to authenticated, btls_app
using (app.can_manage_media_asset(property_id))
with check (app.can_manage_media_asset(property_id));

-- Browser uploads and downloads are authorized through server-created signed URLs.
-- Remove the broad path-derived direct Storage policies from the initial foundation.
drop policy if exists "storage_public_buckets_read" on storage.objects;
drop policy if exists "storage_private_buckets_read_authorized" on storage.objects;
drop policy if exists "storage_property_uploads_insert_authorized" on storage.objects;
drop policy if exists "storage_property_uploads_update_authorized" on storage.objects;
drop policy if exists "storage_property_uploads_delete_authorized" on storage.objects;

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('public-media', 'public-content');

update storage.buckets
set
  file_size_limit = 26214400,
  allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'
]
where id = 'private-media';

update storage.buckets
set allowed_mime_types = array[
  'audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'video/mp4'
]
where id = 'temporary-uploads';
