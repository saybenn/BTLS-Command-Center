-- The restricted application role resolves the authenticated user through auth.uid().
-- It receives no access to auth tables, only schema usage and this helper function.

grant usage on schema auth to btls_app;
grant execute on function auth.uid() to btls_app;
