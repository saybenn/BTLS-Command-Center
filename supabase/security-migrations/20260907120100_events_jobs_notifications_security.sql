-- Feature 07: property-scoped asynchronous infrastructure and operations visibility.
-- Prisma owns the durable tables. This migration owns RLS and capability helpers.

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

create or replace function app.has_explicit_property_access(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select exists (
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

create or replace function app.can_view_property_operations(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select app.has_platform_capability('platform.operations.view')
    or (
      app.has_explicit_property_access(target_property_id)
      and exists (
        select 1
        from public.app_users
        where id = app.current_user_id()
          and status = 'ACTIVE'
          and platform_role = 'BTLS_OPERATOR'
      )
    );
$$;

grant execute on function
  app.has_platform_capability(text),
  app.has_explicit_property_access(uuid),
  app.can_view_property_operations(uuid)
to authenticated, btls_app;

grant select, insert, update on table
  public.event_outbox,
  public.job_executions,
  public.job_execution_attempts,
  public.webhook_receipts,
  public.sending_identities,
  public.provider_dispatches
to authenticated, btls_app;

grant select, insert on table public.notifications to authenticated, btls_app;
grant update(read_at) on table public.notifications to authenticated, btls_app;

alter table public.event_outbox enable row level security;
alter table public.job_executions enable row level security;
alter table public.job_execution_attempts enable row level security;
alter table public.notifications enable row level security;
alter table public.webhook_receipts enable row level security;
alter table public.sending_identities enable row level security;
alter table public.provider_dispatches enable row level security;

create policy "event_outbox_select_operationally_authorized"
on public.event_outbox
for select
to authenticated, btls_app
using (app.can_view_property_operations(property_id));

create policy "event_outbox_insert_property_authorized"
on public.event_outbox
for insert
to authenticated, btls_app
with check (app.can_access_property(property_id));

create policy "event_outbox_update_operationally_authorized"
on public.event_outbox
for update
to authenticated, btls_app
using (app.can_view_property_operations(property_id))
with check (app.can_view_property_operations(property_id));

create policy "job_executions_select_operationally_authorized"
on public.job_executions
for select
to authenticated, btls_app
using (app.can_view_property_operations(property_id));

create policy "job_executions_insert_property_authorized"
on public.job_executions
for insert
to authenticated, btls_app
with check (app.can_access_property(property_id));

create policy "job_executions_update_operationally_authorized"
on public.job_executions
for update
to authenticated, btls_app
using (app.can_view_property_operations(property_id))
with check (app.can_view_property_operations(property_id));

create policy "job_execution_attempts_select_operationally_authorized"
on public.job_execution_attempts
for select
to authenticated, btls_app
using (
  exists (
    select 1
    from public.job_executions
    where job_executions.id = job_execution_attempts.job_execution_id
      and app.can_view_property_operations(job_executions.property_id)
  )
);

create policy "job_execution_attempts_insert_property_authorized"
on public.job_execution_attempts
for insert
to authenticated, btls_app
with check (
  exists (
    select 1
    from public.job_executions
    where job_executions.id = job_execution_attempts.job_execution_id
      and app.can_access_property(job_executions.property_id)
  )
);

create policy "job_execution_attempts_update_operationally_authorized"
on public.job_execution_attempts
for update
to authenticated, btls_app
using (
  exists (
    select 1
    from public.job_executions
    where job_executions.id = job_execution_attempts.job_execution_id
      and app.can_view_property_operations(job_executions.property_id)
  )
)
with check (
  exists (
    select 1
    from public.job_executions
    where job_executions.id = job_execution_attempts.job_execution_id
      and app.can_view_property_operations(job_executions.property_id)
  )
);

create policy "notifications_select_recipient_property_authorized"
on public.notifications
for select
to authenticated, btls_app
using (
  recipient_user_id = app.current_user_id()
  and app.can_access_property(property_id)
);

create policy "notifications_insert_property_authorized"
on public.notifications
for insert
to authenticated, btls_app
with check (app.can_access_property(property_id));

create policy "notifications_update_read_state_by_recipient"
on public.notifications
for update
to authenticated, btls_app
using (
  recipient_user_id = app.current_user_id()
  and app.can_access_property(property_id)
)
with check (
  recipient_user_id = app.current_user_id()
  and app.can_access_property(property_id)
);

create policy "webhook_receipts_select_operationally_authorized"
on public.webhook_receipts
for select
to authenticated, btls_app
using (
  (property_id is not null and app.can_view_property_operations(property_id))
  or (property_id is null and app.has_platform_capability('platform.operations.view'))
);

create policy "webhook_receipts_insert_property_authorized"
on public.webhook_receipts
for insert
to authenticated, btls_app
with check (
  (property_id is not null and app.can_access_property(property_id))
  or (property_id is null and app.has_platform_capability('platform.operations.view'))
);

create policy "webhook_receipts_update_operationally_authorized"
on public.webhook_receipts
for update
to authenticated, btls_app
using (
  (property_id is not null and app.can_view_property_operations(property_id))
  or (property_id is null and app.has_platform_capability('platform.operations.view'))
)
with check (
  (property_id is not null and app.can_view_property_operations(property_id))
  or (property_id is null and app.has_platform_capability('platform.operations.view'))
);

create policy "sending_identities_select_property_authorized"
on public.sending_identities
for select
to authenticated, btls_app
using (app.can_access_property(property_id));

create policy "sending_identities_write_platform_admin"
on public.sending_identities
for all
to authenticated, btls_app
using (app.has_platform_capability('platform.operations.retry'))
with check (app.has_platform_capability('platform.operations.retry'));

create policy "provider_dispatches_select_operationally_authorized"
on public.provider_dispatches
for select
to authenticated, btls_app
using (app.can_view_property_operations(property_id));

create policy "provider_dispatches_insert_property_authorized"
on public.provider_dispatches
for insert
to authenticated, btls_app
with check (app.can_access_property(property_id));

create policy "provider_dispatches_update_operationally_authorized"
on public.provider_dispatches
for update
to authenticated, btls_app
using (app.can_view_property_operations(property_id))
with check (app.can_view_property_operations(property_id));
