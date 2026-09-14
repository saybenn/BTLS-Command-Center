-- Notices are emitted by trusted server-side application services, never browser clients.
-- Retain recipient/property SELECT and read_at UPDATE policies and all existing indexes.
REVOKE INSERT ON public.notifications FROM authenticated, btls_app;
DROP POLICY IF EXISTS notifications_insert_property_authorized ON public.notifications;

-- Additional restrictive policy also closes the operator's general property-read bypass.
CREATE POLICY notifications_explicit_recipient_scope
ON public.notifications AS RESTRICTIVE FOR ALL TO authenticated, btls_app
USING (
  recipient_user_id = app.current_user_id()
  AND app.can_access_property(property_id)
  AND (app.has_platform_capability('platform.operations.view') OR app.has_explicit_property_access(property_id))
)
WITH CHECK (
  recipient_user_id = app.current_user_id()
  AND app.can_access_property(property_id)
  AND (app.has_platform_capability('platform.operations.view') OR app.has_explicit_property_access(property_id))
);
