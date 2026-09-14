-- Preserve Feature 07 operations capabilities after the forward Feature 06 reconciliation.

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
        (capability in (
          'platform.property.read',
          'platform.media.view',
          'platform.media.manage'
        ) and platform_role in ('BTLS_ADMIN', 'BTLS_OPERATOR'))
        or (capability in (
          'platform.property.manage',
          'platform.user.manage',
          'platform.media.sensitive.view',
          'platform.operations.view',
          'platform.operations.retry'
        ) and platform_role = 'BTLS_ADMIN')
      )
  );
$$;
