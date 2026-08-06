-- Resolve the role that governs one user's access to one property.
-- An explicit property role wins; otherwise the account-membership role applies.

create or replace function app.effective_property_role(target_property_id uuid)
returns public."AccountRole"
language sql
stable
security definer
set search_path = public, app
as $$
  select coalesce(property_accesses.role_override, account_memberships.role)
  from public.property_accesses
  join public.account_memberships
    on account_memberships.id = property_accesses.membership_id
   and account_memberships.account_id = property_accesses.account_id
  where property_accesses.property_id = target_property_id
    and account_memberships.user_id = app.current_user_id()
    and account_memberships.status = 'ACTIVE'
  limit 1;
$$;

grant execute on function app.effective_property_role(uuid) to authenticated, btls_app;
