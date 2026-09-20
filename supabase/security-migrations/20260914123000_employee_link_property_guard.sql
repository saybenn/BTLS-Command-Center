-- A workforce/login association never creates authorization and must use an existing property grant.
create or replace function app.can_link_employee_user(target_property_id uuid,target_user_id uuid)
returns boolean language sql stable security definer set search_path=public,app as $$
 select app.has_foundation_capability(target_property_id,'employee.manage') and
 (target_user_id is null or exists(
 select 1 from public.property_accesses p
 join public.account_memberships m on m.id=p.membership_id and m.account_id=p.account_id
 join public.app_users u on u.id=m.user_id
 where p.property_id=target_property_id and u.id=target_user_id and u.status='ACTIVE' and m.status='ACTIVE'
 ));
$$;
grant execute on function app.can_link_employee_user(uuid,uuid) to authenticated,btls_app;
drop policy employee_profiles_insert on public.employee_profiles;
drop policy employee_profiles_update on public.employee_profiles;
create policy employee_profiles_insert on public.employee_profiles for insert to authenticated,btls_app
 with check(app.has_foundation_capability(property_id,'employee.manage') and app.can_link_employee_user(property_id,app_user_id));
create policy employee_profiles_update on public.employee_profiles for update to authenticated,btls_app
 using(app.has_foundation_capability(property_id,'employee.manage'))
 with check(app.has_foundation_capability(property_id,'employee.manage') and app.can_link_employee_user(property_id,app_user_id));
