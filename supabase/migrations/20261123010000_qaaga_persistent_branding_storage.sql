-- Persistent public logo and favicon assets for QAAGA.
-- The object bytes live in Supabase Storage; public.site_branding stores their URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qaaga-branding',
  'qaaga-branding',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Only trusted platform administrators may upload, replace, or delete branding files.
DROP POLICY IF EXISTS qaaga_branding_admin_write ON storage.objects;
CREATE POLICY qaaga_branding_admin_write
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'qaaga-branding' AND public.is_platform_admin())
WITH CHECK (bucket_id = 'qaaga-branding' AND public.is_platform_admin());
