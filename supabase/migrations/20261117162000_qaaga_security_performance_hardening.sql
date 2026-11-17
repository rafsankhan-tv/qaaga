-- QAAGA post-baseline security and query-performance hardening
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION btree_gist SET SCHEMA extensions;
CREATE INDEX IF NOT EXISTS idx_threads_property_id ON public.threads(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
