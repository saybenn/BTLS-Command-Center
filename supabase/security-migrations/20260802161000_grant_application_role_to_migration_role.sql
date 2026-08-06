-- The migration role may assume the restricted application role for local RLS tests.
-- PostgreSQL administrators already control database roles; this does not grant
-- application privileges to browser or anonymous roles.

grant btls_app to postgres;
