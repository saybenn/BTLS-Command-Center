-- Execution mutations must pass through trusted, audited services. RLS SELECT remains unchanged.
REVOKE INSERT, UPDATE, DELETE ON public.job_executions, public.job_execution_attempts, public.event_outbox
FROM authenticated, btls_app;

-- Operational reads also respect property/account suspension through the normal tenant helper.
CREATE POLICY operations_active_property ON public.job_executions AS RESTRICTIVE
FOR SELECT TO authenticated, btls_app USING (app.can_access_property(property_id));
CREATE POLICY outbox_active_property ON public.event_outbox AS RESTRICTIVE
FOR SELECT TO authenticated, btls_app USING (app.can_access_property(property_id));
CREATE POLICY attempts_active_property ON public.job_execution_attempts AS RESTRICTIVE
FOR SELECT TO authenticated, btls_app USING (EXISTS (
  SELECT 1 FROM public.job_executions WHERE id = job_execution_attempts.job_execution_id
));
