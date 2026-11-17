-- QAAGA public PII protection and guest-safe messaging
REVOKE ALL ON public.properties FROM anon;
GRANT SELECT (
  id, title, description, property_type, room_type, category,
  city, area, two_night_price_usd, price_daily, currency,
  max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
  guest_favorite, in_popular_kl, is_featured, image, gallery,
  amenities, status, created_at, updated_at
) ON public.properties TO anon;

CREATE OR REPLACE VIEW public.public_properties
WITH (security_invoker = true)
AS
SELECT
  id, title, description, property_type, room_type, category,
  city, area, two_night_price_usd, price_daily, currency,
  max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
  guest_favorite, in_popular_kl, is_featured, image, gallery,
  amenities, status, created_at, updated_at
FROM public.properties;

DROP VIEW IF EXISTS public.listings;
CREATE VIEW public.listings
WITH (security_invoker = true)
AS
SELECT
  id, title, description, property_type, room_type, category,
  city, area, two_night_price_usd, price_daily, currency,
  max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
  guest_favorite, in_popular_kl, is_featured, image, gallery,
  amenities, status, created_at, updated_at
FROM public.properties;

GRANT SELECT ON public.public_properties, public.listings TO anon, authenticated;

REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, property_id, listing_id, author, rating, comment, created_at)
  ON public.reviews TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_property_thread(p_property_id TEXT)
RETURNS TABLE (
  id TEXT,
  host_name TEXT,
  listing_title TEXT,
  listing_image TEXT,
  unread BOOLEAN
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $
DECLARE
  actor_email TEXT := public.current_user_email();
  property_row public.properties%ROWTYPE;
  thread_row public.threads%ROWTYPE;
BEGIN
  IF actor_email = '' THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  SELECT * INTO property_row
  FROM public.properties
  WHERE public.properties.id = p_property_id
    AND public.properties.status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This property is not available for messaging';
  END IF;

  IF LOWER(property_row.host_email) = actor_email THEN
    RAISE EXCEPTION 'Hosts cannot start a guest conversation with themselves';
  END IF;

  SELECT * INTO thread_row
  FROM public.threads
  WHERE public.threads.property_id = p_property_id
    AND LOWER(public.threads.guest_email) = actor_email
  ORDER BY public.threads.created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      thread_row.id, thread_row.host_name, thread_row.listing_title,
      thread_row.listing_image, thread_row.unread;
    RETURN;
  END IF;

  INSERT INTO public.threads (
    id, property_id, host_email, guest_email,
    host_name, listing_title, listing_image, unread
  )
  VALUES (
    'thread-' || gen_random_uuid()::TEXT,
    property_row.id, property_row.host_email, actor_email,
    property_row.host_name, property_row.title, COALESCE(property_row.image, ''), false
  )
  RETURNING * INTO thread_row;

  RETURN QUERY SELECT
    thread_row.id, thread_row.host_name, thread_row.listing_title,
    thread_row.listing_image, thread_row.unread;
END;
$$;

REVOKE ALL ON FUNCTION public.create_property_thread(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_property_thread(TEXT) TO authenticated;
