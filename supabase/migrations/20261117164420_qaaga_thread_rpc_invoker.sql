-- Ensure guest conversation creation runs under the caller's RLS policies.
ALTER FUNCTION public.create_property_thread(TEXT) SECURITY INVOKER;
