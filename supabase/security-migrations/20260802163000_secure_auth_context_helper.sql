-- Keep the restricted application role out of the auth schema.
-- This narrowly scoped helper resolves Auth or server-set context as its owner.

create or replace function app.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = auth, public, app
as $$
  select coalesce(
    auth.uid(),
    nullif(current_setting('app.user_id', true), '')::uuid
  );
$$;
