-- =========================================================================
-- QAAGA.COM FULL PRODUCTION DATABASE SCHEMA
-- Single Source of Truth for Furnished Apartment & Room Rentals
-- Compatible with Supabase PostgreSQL, RLS, Realtime & Storage
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. PROFILES TABLE (Users, Roles & Verification)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Member',
    phone TEXT,
    city TEXT DEFAULT 'Dhaka',
    country TEXT DEFAULT 'Bangladesh',
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'guest', 'host', 'admin')) DEFAULT 'guest',
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
    verified BOOLEAN DEFAULT false,
    identity_status TEXT NOT NULL CHECK (identity_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified',
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- -------------------------------------------------------------------------
-- 2. IDENTITY VERIFICATIONS (Government ID & Document Uploads)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL REFERENCES public.profiles(email) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'national_id', 'driving_license')),
    document_front_url TEXT NOT NULL,
    document_back_url TEXT,
    selfie_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_id_verifications_status ON public.identity_verifications(status);
CREATE INDEX IF NOT EXISTS idx_id_verifications_email ON public.identity_verifications(user_email);

-- -------------------------------------------------------------------------
-- 3. PROPERTIES & LISTINGS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    host_email TEXT NOT NULL,
    host_name TEXT NOT NULL DEFAULT 'Verified Host',
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT NOT NULL DEFAULT 'Apartment' CHECK (property_type IN ('Apartment', 'Studio', 'Private Room', 'Sky Condo', 'Villa', 'Suite', 'Penthouse')),
    room_type TEXT DEFAULT 'Entire place' CHECK (room_type IN ('Entire place', 'Private room', 'Shared room')),
    category TEXT NOT NULL DEFAULT 'stay' CHECK (category IN ('stay', 'experiences', 'services')),
    city TEXT NOT NULL DEFAULT 'Dhaka',
    area TEXT NOT NULL DEFAULT 'Dhaka',
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    two_night_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
    price_daily NUMERIC(10, 2) NOT NULL DEFAULT 60.00,
    price_weekly NUMERIC(10, 2) DEFAULT 380.00,
    price_monthly NUMERIC(10, 2) DEFAULT 1400.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    max_guests INTEGER NOT NULL DEFAULT 2,
    bedrooms TEXT NOT NULL DEFAULT '1 bedroom',
    bathrooms INTEGER NOT NULL DEFAULT 1,
    beds INTEGER NOT NULL DEFAULT 1,
    square_feet INTEGER DEFAULT 650,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    guest_favorite BOOLEAN DEFAULT false,
    in_popular_kl BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'pending_approval', 'rejected')) DEFAULT 'pending_approval',
    image TEXT NOT NULL,
    gallery TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    amenities TEXT[] NOT NULL DEFAULT ARRAY['High-speed WiFi', 'Air conditioning', 'Furnished kitchen', 'Washing machine']::TEXT[],
    facilities JSONB DEFAULT '{"wifi": true, "ac": true, "kitchen": true, "pool": true, "gym": true, "parking": false}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_properties_host ON public.properties(host_email);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties(area);

-- Create backwards-compatible listings view / synonym if needed
CREATE OR REPLACE VIEW public.listings WITH (security_invoker = true) AS SELECT * FROM public.properties;

-- -------------------------------------------------------------------------
-- 4. PROPERTY AVAILABILITY & CALENDAR
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    custom_price NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(property_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_lookup ON public.property_availability(property_id, date);

-- -------------------------------------------------------------------------
-- 5. BOOKINGS & RESERVATIONS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    confirmation_code TEXT UNIQUE NOT NULL,
    property_id TEXT NOT NULL,
    listing_id TEXT, -- backwards compatibility
    title TEXT NOT NULL,
    area TEXT NOT NULL,
    image TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    guest_email TEXT, -- backwards compatibility
    customer_name TEXT NOT NULL,
    guest_name TEXT, -- backwards compatibility
    customer_phone TEXT,
    host_email TEXT NOT NULL,
    host_name TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    check_in_label TEXT,
    nights INTEGER NOT NULL DEFAULT 1,
    guests INTEGER NOT NULL DEFAULT 1,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    pets INTEGER DEFAULT 0,
    total_usd NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Accepted', 'Rejected', 'Cancelled', 'Completed')) DEFAULT 'Pending',
    cancellation_reason TEXT,
    cancelled_by TEXT,
    cancelled_at TIMESTAMPTZ,
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON public.bookings(host_email);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- -------------------------------------------------------------------------
-- 6. PAYMENT RECORDS & PROOFS (Direct Guest-to-Provider Payments)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'wise', 'tng_ewallet', 'cash_checkin', 'card', 'other')),
    transaction_reference TEXT,
    proof_image_url TEXT NOT NULL,
    payer_name TEXT NOT NULL,
    payer_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending_review', 'verified', 'rejected')) DEFAULT 'pending_review',
    host_notes TEXT,
    admin_notes TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_payment_records_booking ON public.payment_records(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);

-- -------------------------------------------------------------------------
-- 7. REVIEWS & RATINGS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT,
    listing_id TEXT, -- compatibility
    author TEXT NOT NULL,
    author_email TEXT NOT NULL DEFAULT (auth.jwt() ->> 'email'),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- -------------------------------------------------------------------------
-- 8. MESSAGES & INBOX
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.threads (
    id TEXT PRIMARY KEY,
    host_name TEXT NOT NULL,
    listing_title TEXT NOT NULL,
    listing_image TEXT NOT NULL,
    property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    host_email TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    unread BOOLEAN DEFAULT false,
    last_message TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id TEXT NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('host', 'guest', 'admin')),
    sender_email TEXT NOT NULL DEFAULT (auth.jwt() ->> 'email'),
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- -------------------------------------------------------------------------
-- 9. NOTIFICATIONS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_email);

-- -------------------------------------------------------------------------
-- 10. SITE BRANDING (Cloud Synced Logo & Favicon)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_branding (
    id TEXT PRIMARY KEY DEFAULT 'default_branding',
    logo_url TEXT,
    favicon_url TEXT,
    alt_text TEXT DEFAULT 'qaaga.com',
    fallback_text TEXT DEFAULT 'qaaga',
    fallback_domain TEXT DEFAULT '.com',
    show_text_when_removed BOOLEAN DEFAULT true,
    size TEXT DEFAULT 'md',
    blend_multiply BOOLEAN DEFAULT false,
    revision BIGINT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- -------------------------------------------------------------------------
-- 11. ADMIN ACTIVITY LOGS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- -------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (OWNERSHIP-BASED, NO PUBLIC WRITE POLICIES)
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Trusted role comes only from Supabase Auth app_metadata, never from user_metadata
-- or an editable profile field. Set app_metadata.role = 'admin' from a trusted
-- Supabase Auth Admin/API workflow for designated administrators.
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE SQL
STABLE
SET search_path = ''
AS $$
  SELECT LOWER(COALESCE(auth.jwt() ->> 'email', ''));
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

REVOKE ALL ON FUNCTION public.current_user_email() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- Remove the old SECURITY DEFINER email-based admin helper.
DROP FUNCTION IF EXISTS public.is_super_admin(TEXT);

-- Remove the former allow-everyone policies before installing secure policies.
DROP POLICY IF EXISTS "Public profiles can be read by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Active properties are viewable by all" ON public.properties;
DROP POLICY IF EXISTS "Hosts can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Hosts can update their properties" ON public.properties;
DROP POLICY IF EXISTS "Hosts can delete their properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Participants can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Participants can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Payment records readable by participants" ON public.payment_records;
DROP POLICY IF EXISTS "Customer can submit payment proof" ON public.payment_records;
DROP POLICY IF EXISTS "Host or Admin can update payment status" ON public.payment_records;
DROP POLICY IF EXISTS "Identity verifications readable by owner and admin" ON public.identity_verifications;
DROP POLICY IF EXISTS "Users can submit identity verification" ON public.identity_verifications;
DROP POLICY IF EXISTS "Admin can update identity verifications" ON public.identity_verifications;
DROP POLICY IF EXISTS "Reviews readable by all" ON public.reviews;
DROP POLICY IF EXISTS "Users can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Threads accessible to all" ON public.threads;
DROP POLICY IF EXISTS "Messages accessible to all" ON public.messages;
DROP POLICY IF EXISTS "Notifications viewable" ON public.notifications;
DROP POLICY IF EXISTS "Site branding readable by all" ON public.site_branding;
DROP POLICY IF EXISTS "Site branding updateable" ON public.site_branding;

-- Profiles: users can access only their own profile; trusted admins can manage all.
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (email = public.current_user_email() OR public.is_platform_admin());
CREATE POLICY "profiles_insert_own_non_admin" ON public.profiles
  FOR INSERT WITH CHECK (
    email = public.current_user_email()
    AND role IN ('guest', 'customer', 'host')
  );
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE
  USING (email = public.current_user_email() OR public.is_platform_admin())
  WITH CHECK (
    (email = public.current_user_email() AND role IN ('guest', 'customer', 'host'))
    OR public.is_platform_admin()
  );
CREATE POLICY "profiles_delete_admin_only" ON public.profiles
  FOR DELETE USING (public.is_platform_admin());

-- Properties: public read only for approved/active listings; host owns their records.
CREATE POLICY "properties_read_active_or_owner" ON public.properties
  FOR SELECT USING (
    status = 'active'
    OR host_email = public.current_user_email()
    OR public.is_platform_admin()
  );
CREATE POLICY "properties_insert_own_pending" ON public.properties
  FOR INSERT WITH CHECK (
    (host_email = public.current_user_email() AND status = 'pending_approval')
    OR public.is_platform_admin()
  );
CREATE POLICY "properties_update_own_or_admin" ON public.properties
  FOR UPDATE
  USING (host_email = public.current_user_email() OR public.is_platform_admin())
  WITH CHECK (host_email = public.current_user_email() OR public.is_platform_admin());

CREATE OR REPLACE FUNCTION public.guard_property_owner_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $
BEGIN
  IF public.is_platform_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.host_email <> OLD.host_email THEN
    RAISE EXCEPTION 'A property host cannot be changed by the host account';
  END IF;
  IF NEW.status IN ('active', 'rejected') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Only a trusted administrator can approve or reject a listing';
  END IF;

  NEW.rating := OLD.rating;
  NEW.reviews_count := OLD.reviews_count;
  NEW.guest_favorite := OLD.guest_favorite;
  NEW.is_featured := OLD.is_featured;
  NEW.in_popular_kl := OLD.in_popular_kl;
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trg_guard_property_owner_changes ON public.properties;
CREATE TRIGGER trg_guard_property_owner_changes
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_property_owner_changes();
CREATE POLICY "properties_delete_own_or_admin" ON public.properties
  FOR DELETE USING (host_email = public.current_user_email() OR public.is_platform_admin());

-- Availability: public can see dates for active properties, host/admin can manage.
CREATE POLICY "availability_read_active_or_owner" ON public.property_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_availability.property_id
        AND (p.status = 'active' OR p.host_email = public.current_user_email() OR public.is_platform_admin())
    )
  );
CREATE POLICY "availability_insert_owner_or_admin" ON public.property_availability
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_availability.property_id
        AND (p.host_email = public.current_user_email() OR public.is_platform_admin())
    )
  );
CREATE POLICY "availability_update_owner_or_admin" ON public.property_availability
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_availability.property_id
        AND (p.host_email = public.current_user_email() OR public.is_platform_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = public.property_availability.property_id
        AND (p.host_email = public.current_user_email() OR public.is_platform_admin())
    )
  );
CREATE POLICY "availability_delete_owner_or_admin" ON public.property_availability
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = public.property_availability.property_id
        AND (p.host_email = public.current_user_email() OR public.is_platform_admin())
    )
  );

-- Bookings: only the authenticated customer can create; only involved parties can read.
CREATE POLICY "bookings_insert_as_customer" ON public.bookings
  FOR INSERT WITH CHECK (
    customer_email = public.current_user_email()
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = public.bookings.property_id
        AND p.host_email = public.bookings.host_email
        AND p.status = 'active'
    )
  );
CREATE POLICY "bookings_read_participant_or_admin" ON public.bookings
  FOR SELECT USING (
    customer_email = public.current_user_email()
    OR host_email = public.current_user_email()
    OR public.is_platform_admin()
  );
CREATE POLICY "bookings_update_participant_or_admin" ON public.bookings
  FOR UPDATE
  USING (
    customer_email = public.current_user_email()
    OR host_email = public.current_user_email()
    OR public.is_platform_admin()
  )
  WITH CHECK (
    customer_email = public.current_user_email()
    OR host_email = public.current_user_email()
    OR public.is_platform_admin()
  );

CREATE OR REPLACE FUNCTION public.guard_booking_status_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  actor_email TEXT := public.current_user_email();
BEGIN
  IF public.is_platform_admin() THEN
    RETURN NEW;
  END IF;

  IF actor_email = LOWER(OLD.customer_email) THEN
    IF NEW.status <> 'Cancelled' THEN
      RAISE EXCEPTION 'Customers may only cancel their own bookings';
    END IF;
    NEW.cancelled_by := actor_email;
    NEW.cancelled_at := COALESCE(NEW.cancelled_at, NOW());
  ELSIF actor_email = LOWER(OLD.host_email) THEN
    IF NEW.status NOT IN ('Confirmed', 'Accepted', 'Rejected', 'Cancelled', 'Completed') THEN
      RAISE EXCEPTION 'Host booking status transition is not allowed';
    END IF;
    IF NEW.status = 'Cancelled' THEN
      NEW.cancelled_by := actor_email;
      NEW.cancelled_at := COALESCE(NEW.cancelled_at, NOW());
    END IF;
  ELSE
    RAISE EXCEPTION 'Not authorized to update this booking';
  END IF;

  IF OLD.status IN ('Cancelled', 'Rejected', 'Completed') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'This booking is already closed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_booking_status_update ON public.bookings;
CREATE TRIGGER trg_guard_booking_status_update
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.guard_booking_status_update();

-- Payments: customer submits own proof; only booking host/admin can review it.
CREATE POLICY "payments_read_booking_participants" ON public.payment_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = payment_records.booking_id
        AND (
          b.customer_email = public.current_user_email()
          OR b.host_email = public.current_user_email()
          OR public.is_platform_admin()
        )
    )
  );
CREATE POLICY "payments_insert_customer_own_booking" ON public.payment_records
  FOR INSERT WITH CHECK (
    payer_email = public.current_user_email()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = payment_records.booking_id
        AND b.customer_email = public.current_user_email()
    )
  );
CREATE POLICY "payments_update_host_or_admin" ON public.payment_records
  FOR UPDATE
  USING (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = payment_records.booking_id
        AND b.host_email = public.current_user_email()
    )
  )
  WITH CHECK (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = payment_records.booking_id
        AND b.host_email = public.current_user_email()
    )
  );

-- Identity documents: private to the owner and trusted admins.
CREATE POLICY "identity_read_own_or_admin" ON public.identity_verifications
  FOR SELECT USING (user_email = public.current_user_email() OR public.is_platform_admin());
CREATE POLICY "identity_insert_own_pending" ON public.identity_verifications
  FOR INSERT WITH CHECK (
    user_email = public.current_user_email()
    AND status = 'pending'
  );
CREATE POLICY "identity_update_admin_only" ON public.identity_verifications
  FOR UPDATE USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "identity_delete_admin_only" ON public.identity_verifications
  FOR DELETE USING (public.is_platform_admin());

-- Reviews are public to read, but a signed-in user can post only as themselves.
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "reviews_insert_as_self" ON public.reviews
  FOR INSERT WITH CHECK (author_email = public.current_user_email());

-- Threads and messages are visible only to their two participants.
CREATE POLICY "threads_read_participants" ON public.threads
  FOR SELECT USING (
    host_email = public.current_user_email()
    OR guest_email = public.current_user_email()
    OR public.is_platform_admin()
  );
CREATE POLICY "threads_insert_participant" ON public.threads
  FOR INSERT WITH CHECK (
    property_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = public.threads.property_id
        AND p.status = 'active'
        AND p.host_email = public.threads.host_email
    )
    AND (
      guest_email = public.current_user_email()
      OR host_email = public.current_user_email()
    )
  );
CREATE POLICY "threads_update_participants" ON public.threads
  FOR UPDATE
  USING (
    host_email = public.current_user_email()
    OR guest_email = public.current_user_email()
    OR public.is_platform_admin()
  )
  WITH CHECK (
    host_email = public.current_user_email()
    OR guest_email = public.current_user_email()
    OR public.is_platform_admin()
  );
CREATE POLICY "messages_read_thread_participants" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = messages.thread_id
        AND (
          t.host_email = public.current_user_email()
          OR t.guest_email = public.current_user_email()
          OR public.is_platform_admin()
        )
    )
  );
CREATE POLICY "messages_insert_as_thread_participant" ON public.messages
  FOR INSERT WITH CHECK (
    sender_email = public.current_user_email()
    AND EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = messages.thread_id
        AND (
          (messages.sender = 'host' AND t.host_email = public.current_user_email())
          OR (messages.sender = 'guest' AND t.guest_email = public.current_user_email())
          OR public.is_platform_admin()
        )
    )
  );

-- Notifications: private to the named recipient. Admin can deliver/manage platform notices.
CREATE POLICY "notifications_read_recipient_or_admin" ON public.notifications
  FOR SELECT USING (
    recipient_email = public.current_user_email()
    OR public.is_platform_admin()
  );
CREATE POLICY "notifications_insert_recipient_or_admin" ON public.notifications
  FOR INSERT WITH CHECK (
    recipient_email = public.current_user_email()
    OR public.is_platform_admin()
  );
CREATE POLICY "notifications_update_read_recipient_or_admin" ON public.notifications
  FOR UPDATE
  USING (recipient_email = public.current_user_email() OR public.is_platform_admin())
  WITH CHECK (recipient_email = public.current_user_email() OR public.is_platform_admin());

-- Branding is public to read; only trusted platform admins can change it.
CREATE POLICY "branding_public_read" ON public.site_branding
  FOR SELECT USING (true);
CREATE POLICY "branding_admin_insert" ON public.site_branding
  FOR INSERT WITH CHECK (public.is_platform_admin());
CREATE POLICY "branding_admin_update" ON public.site_branding
  FOR UPDATE USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "branding_admin_delete" ON public.site_branding
  FOR DELETE USING (public.is_platform_admin());

-- Activity logs are private and admin-managed only.
CREATE POLICY "admin_logs_select_admin" ON public.admin_activity_logs
  FOR SELECT USING (public.is_platform_admin());
CREATE POLICY "admin_logs_insert_admin" ON public.admin_activity_logs
  FOR INSERT WITH CHECK (
    public.is_platform_admin()
    AND actor_email = public.current_user_email()
  );

-- Explicit grants: RLS still determines which rows each role may access.
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.properties, public.property_availability, public.reviews, public.site_branding, public.listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties, public.property_availability TO authenticated;
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT UPDATE (status, cancellation_reason, cancelled_by, cancelled_at, updated_at) ON public.bookings TO authenticated;
GRANT SELECT, INSERT ON public.payment_records, public.identity_verifications TO authenticated;
GRANT UPDATE (status, host_notes, verified_at, updated_at) ON public.payment_records TO authenticated;
GRANT UPDATE (status, rejection_reason, reviewed_by, reviewed_at, updated_at) ON public.identity_verifications TO authenticated;
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;
GRANT SELECT, INSERT ON public.threads, public.messages TO authenticated;
GRANT UPDATE (unread, last_message, updated_at) ON public.threads TO authenticated;
GRANT SELECT, INSERT ON public.notifications TO authenticated;
GRANT UPDATE (read) ON public.notifications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_branding TO authenticated;
GRANT SELECT, INSERT ON public.admin_activity_logs TO authenticated;

-- -------------------------------------------------------------------------
-- 13. SAFE INITIAL BRANDING ONLY (NO DEMO USERS OR ELEVATED ACCOUNTS)
-- -------------------------------------------------------------------------
INSERT INTO public.site_branding (id, logo_url, favicon_url, alt_text, fallback_text, fallback_domain)
VALUES ('default_branding', NULL, NULL, 'qaaga.com', 'qaaga', '.com')
ON CONFLICT (id) DO NOTHING;
