-- Protect host contact details while preserving public listing reads and realtime updates.
-- Public clients read only the email-free feed. Host/admin writes remain on public.properties.

CREATE TABLE public.public_property_feed (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  room_type TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  two_night_price_usd NUMERIC NOT NULL,
  price_daily NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms TEXT NOT NULL,
  bathrooms INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  rating NUMERIC,
  reviews_count INTEGER,
  guest_favorite BOOLEAN,
  in_popular_kl BOOLEAN,
  is_featured BOOLEAN,
  status TEXT NOT NULL CHECK (status = 'active'),
  image TEXT NOT NULL,
  gallery TEXT[] NOT NULL,
  amenities TEXT[] NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

ALTER TABLE public.public_property_feed ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_property_feed FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_property_feed TO anon, authenticated;
CREATE POLICY public_property_feed_read_active
  ON public.public_property_feed
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE OR REPLACE FUNCTION public.sync_public_property_feed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_property_feed WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  IF NEW.status = 'active' THEN
    INSERT INTO public.public_property_feed (
      id, title, description, property_type, room_type, category,
      city, area, two_night_price_usd, price_daily, currency,
      max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
      guest_favorite, in_popular_kl, is_featured, status, image,
      gallery, amenities, created_at, updated_at
    )
    VALUES (
      NEW.id, NEW.title, NEW.description, NEW.property_type, NEW.room_type, NEW.category,
      NEW.city, NEW.area, NEW.two_night_price_usd, NEW.price_daily, NEW.currency,
      NEW.max_guests, NEW.bedrooms, NEW.bathrooms, NEW.beds, NEW.rating, NEW.reviews_count,
      NEW.guest_favorite, NEW.in_popular_kl, NEW.is_featured, NEW.status, NEW.image,
      NEW.gallery, NEW.amenities, NEW.created_at, NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      property_type = EXCLUDED.property_type,
      room_type = EXCLUDED.room_type,
      category = EXCLUDED.category,
      city = EXCLUDED.city,
      area = EXCLUDED.area,
      two_night_price_usd = EXCLUDED.two_night_price_usd,
      price_daily = EXCLUDED.price_daily,
      currency = EXCLUDED.currency,
      max_guests = EXCLUDED.max_guests,
      bedrooms = EXCLUDED.bedrooms,
      bathrooms = EXCLUDED.bathrooms,
      beds = EXCLUDED.beds,
      rating = EXCLUDED.rating,
      reviews_count = EXCLUDED.reviews_count,
      guest_favorite = EXCLUDED.guest_favorite,
      in_popular_kl = EXCLUDED.in_popular_kl,
      is_featured = EXCLUDED.is_featured,
      status = EXCLUDED.status,
      image = EXCLUDED.image,
      gallery = EXCLUDED.gallery,
      amenities = EXCLUDED.amenities,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at;
  ELSE
    DELETE FROM public.public_property_feed WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.sync_public_property_feed() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_sync_public_property_feed
AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.sync_public_property_feed();

INSERT INTO public.public_property_feed (
  id, title, description, property_type, room_type, category,
  city, area, two_night_price_usd, price_daily, currency,
  max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
  guest_favorite, in_popular_kl, is_featured, status, image,
  gallery, amenities, created_at, updated_at
)
SELECT
  id, title, description, property_type, room_type, category,
  city, area, two_night_price_usd, price_daily, currency,
  max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
  guest_favorite, in_popular_kl, is_featured, status, image,
  gallery, amenities, created_at, updated_at
FROM public.properties
WHERE status = 'active'
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  property_type = EXCLUDED.property_type,
  room_type = EXCLUDED.room_type,
  category = EXCLUDED.category,
  city = EXCLUDED.city,
  area = EXCLUDED.area,
  two_night_price_usd = EXCLUDED.two_night_price_usd,
  price_daily = EXCLUDED.price_daily,
  currency = EXCLUDED.currency,
  max_guests = EXCLUDED.max_guests,
  bedrooms = EXCLUDED.bedrooms,
  bathrooms = EXCLUDED.bathrooms,
  beds = EXCLUDED.beds,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  guest_favorite = EXCLUDED.guest_favorite,
  in_popular_kl = EXCLUDED.in_popular_kl,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  amenities = EXCLUDED.amenities,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

CREATE OR REPLACE VIEW public.public_properties
WITH (security_invoker = true)
AS
SELECT
  id, title, description, property_type, room_type, category,
  city, area, two_night_price_usd, price_daily, currency,
  max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
  guest_favorite, in_popular_kl, is_featured, image, gallery,
  amenities, status, created_at, updated_at
FROM public.public_property_feed
WHERE status = 'active';

CREATE OR REPLACE VIEW public.listings
WITH (security_invoker = true)
AS
SELECT
  id, title, description, property_type, room_type, category,
  city, area, two_night_price_usd, price_daily, currency,
  max_guests, bedrooms, bathrooms, beds, rating, reviews_count,
  guest_favorite, in_popular_kl, is_featured, image, gallery,
  amenities, status, created_at, updated_at
FROM public.public_property_feed
WHERE status = 'active';

GRANT SELECT ON public.public_properties, public.listings TO anon, authenticated;

DROP POLICY IF EXISTS properties_read_active_or_owner ON public.properties;
CREATE POLICY properties_read_owner_or_admin
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (
    LOWER(host_email) = public.current_user_email()
    OR public.is_platform_admin()
  );

-- Public Realtime uses the safe projection, never the source table containing host_email.
ALTER PUBLICATION supabase_realtime DROP TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_property_feed;

-- Thread creation is an authenticated, constrained operation. It must read private host_email
-- internally, while returning only the thread-safe fields declared in the function signature.
ALTER FUNCTION public.create_property_thread(TEXT) SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_booking_request(
  p_listing_id TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_guests INTEGER,
  p_special_requests TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  actor_id UUID := auth.uid();
  actor_email TEXT;
  email_confirmed_at TIMESTAMPTZ;
  customer_name TEXT;
  customer_phone TEXT;
  profile_status TEXT;
  property_row public.properties%ROWTYPE;
  nights_count INTEGER;
  booking_id TEXT;
  confirmation_code TEXT;
  total_amount NUMERIC;
  saved_row public.bookings%ROWTYPE;
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  SELECT LOWER(u.email), u.email_confirmed_at
    INTO actor_email, email_confirmed_at
  FROM auth.users AS u
  WHERE u.id = actor_id;

  IF actor_email IS NULL THEN
    RAISE EXCEPTION 'A valid account email is required';
  END IF;
  IF email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Verify your email before sending a booking request';
  END IF;

  IF p_listing_id IS NULL OR LENGTH(BTRIM(p_listing_id)) = 0 THEN
    RAISE EXCEPTION 'A valid property is required';
  END IF;
  IF p_check_in IS NULL OR p_check_out IS NULL OR p_check_out <= p_check_in THEN
    RAISE EXCEPTION 'Choose a valid check-in and check-out date';
  END IF;
  IF p_check_in < (pg_catalog.now() AT TIME ZONE 'Asia/Dhaka')::DATE THEN
    RAISE EXCEPTION 'Check-in date must be today or later in Bangladesh time';
  END IF;

  nights_count := p_check_out - p_check_in;
  IF nights_count < 1 OR nights_count > 90 THEN
    RAISE EXCEPTION 'Bookings must be between 1 and 90 nights';
  END IF;

  IF p_guests IS NULL OR p_guests < 1 OR p_guests > 30 THEN
    RAISE EXCEPTION 'Guest count must be between 1 and 30';
  END IF;
  IF pg_catalog.char_length(COALESCE(p_special_requests, '')) > 1000 THEN
    RAISE EXCEPTION 'Special requests cannot exceed 1000 characters';
  END IF;

  SELECT * INTO property_row
  FROM public.properties AS p
  WHERE p.id = p_listing_id
    AND p.status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This property is not available for booking';
  END IF;
  IF LOWER(property_row.host_email) = actor_email THEN
    RAISE EXCEPTION 'You cannot book your own property';
  END IF;
  IF p_guests > COALESCE(property_row.max_guests, 1) THEN
    RAISE EXCEPTION 'Guest count exceeds this property capacity';
  END IF;
  IF COALESCE(property_row.two_night_price_usd, property_row.price_daily * 2) <= 0 THEN
    RAISE EXCEPTION 'This property does not have a valid booking price';
  END IF;

  SELECT p.full_name, p.phone, p.status
    INTO customer_name, customer_phone, profile_status
  FROM public.profiles AS p
  WHERE LOWER(p.email) = actor_email
  LIMIT 1;

  IF profile_status = 'suspended' THEN
    RAISE EXCEPTION 'This account cannot create bookings';
  END IF;

  customer_name := COALESCE(
    NULLIF(BTRIM(customer_name), ''),
    NULLIF(BTRIM(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
    NULLIF(BTRIM(auth.jwt() -> 'user_metadata' ->> 'name'), ''),
    pg_catalog.split_part(actor_email, '@', 1)
  );

  booking_id := pg_catalog.gen_random_uuid()::TEXT;
  confirmation_code := 'QG-' || pg_catalog.upper(
    pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::TEXT, '-', ''), 1, 10)
  );
  total_amount := pg_catalog.round(
    (COALESCE(property_row.two_night_price_usd, property_row.price_daily * 2) / 2) * nights_count,
    2
  );

  INSERT INTO public.bookings (
    id, confirmation_code, property_id, listing_id,
    customer_email, guest_email, customer_name, guest_name, customer_phone,
    title, area, image, host_email, host_name,
    check_in, check_out, check_in_label, nights, guests,
    total_usd, currency, status, special_requests
  )
  VALUES (
    booking_id, confirmation_code, property_row.id, property_row.id,
    actor_email, actor_email, customer_name, customer_name, customer_phone,
    property_row.title, pg_catalog.concat_ws(', ', property_row.area, property_row.city),
    property_row.image, LOWER(property_row.host_email), property_row.host_name,
    p_check_in, p_check_out,
    p_check_in::TEXT || ' – ' || p_check_out::TEXT,
    nights_count, p_guests, total_amount, 'USD', 'Pending',
    NULLIF(BTRIM(p_special_requests), '')
  )
  RETURNING * INTO saved_row;

  RETURN pg_catalog.jsonb_build_object(
    'id', saved_row.id,
    'confirmationCode', saved_row.confirmation_code,
    'listingId', saved_row.property_id,
    'checkInDate', saved_row.check_in,
    'checkOutDate', saved_row.check_out,
    'nights', saved_row.nights,
    'guests', saved_row.guests,
    'totalUsd', saved_row.total_usd,
    'status', saved_row.status
  );
EXCEPTION
  WHEN exclusion_violation THEN
    RAISE EXCEPTION 'These dates are no longer available. Choose another date range';
END;
$function$;

REVOKE ALL ON FUNCTION public.create_booking_request(TEXT, DATE, DATE, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_booking_request(TEXT, DATE, DATE, INTEGER, TEXT) TO authenticated;
