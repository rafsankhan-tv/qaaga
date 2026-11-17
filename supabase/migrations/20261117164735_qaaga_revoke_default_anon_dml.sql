-- Revoke inherited Supabase default DML grants from public safe views.
REVOKE ALL ON public.listings, public.public_properties FROM anon, authenticated;
GRANT SELECT ON public.listings, public.public_properties TO anon, authenticated;

-- Ensure only safe review reads and authenticated review submission are allowed.
REVOKE ALL ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, property_id, listing_id, author, rating, comment, created_at)
  ON public.reviews TO anon, authenticated;
GRANT INSERT (property_id, listing_id, author, author_email, rating, comment)
  ON public.reviews TO authenticated;
