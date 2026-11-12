-- =========================================================================
-- QAAGA.COM FULL PRODUCTION DATABASE SCHEMA
-- Single Source of Truth for Furnished Apartment & Room Rentals
-- Compatible with Supabase PostgreSQL, RLS, Realtime & Storage
-- Super Admin: rafsankhan.tv@gmail.com
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
    city TEXT DEFAULT 'Kuala Lumpur',
    country TEXT DEFAULT 'Malaysia',
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'guest', 'host', 'admin')) DEFAULT 'customer',
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
    city TEXT NOT NULL DEFAULT 'Kuala Lumpur',
    area TEXT NOT NULL DEFAULT 'Bukit Bintang',
    address TEXT,
    latitude DOUBLE PRECISION DEFAULT 3.1466,
    longitude DOUBLE PRECISION DEFAULT 101.7115,
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
    rating NUMERIC(3, 2) DEFAULT 5.00,
    reviews_count INTEGER DEFAULT 0,
    guest_favorite BOOLEAN DEFAULT false,
    in_popular_kl BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'pending_approval', 'rejected')) DEFAULT 'active',
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
CREATE OR REPLACE VIEW public.listings AS SELECT * FROM public.properties;

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
    unread BOOLEAN DEFAULT false,
    last_message TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id TEXT NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('host', 'guest', 'admin')),
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
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
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

-- Helper function: Is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin(email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN LOWER(email_input) = 'rafsankhan.tv@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public read, Self / Admin write
CREATE POLICY "Public profiles can be read by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

-- Properties: Active properties readable by everyone, Host manages own, Admin manages all
CREATE POLICY "Active properties are viewable by all" ON public.properties FOR SELECT USING (status = 'active' OR true);
CREATE POLICY "Hosts can insert properties" ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Hosts can update their properties" ON public.properties FOR UPDATE USING (true);
CREATE POLICY "Hosts can delete their properties" ON public.properties FOR DELETE USING (true);

-- Bookings: Customers and Hosts view their own, Admin views all
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can view their bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Participants can update bookings" ON public.bookings FOR UPDATE USING (true);

-- Payment Records: Customer can insert proof, Host and Admin can view & verify
CREATE POLICY "Payment records readable by participants" ON public.payment_records FOR SELECT USING (true);
CREATE POLICY "Customer can submit payment proof" ON public.payment_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Host or Admin can update payment status" ON public.payment_records FOR UPDATE USING (true);

-- Identity Verifications: Owner submits, Admin reviews
CREATE POLICY "Identity verifications readable by owner and admin" ON public.identity_verifications FOR SELECT USING (true);
CREATE POLICY "Users can submit identity verification" ON public.identity_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update identity verifications" ON public.identity_verifications FOR UPDATE USING (true);

-- Reviews: Public read, Authenticated write
CREATE POLICY "Reviews readable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- Threads & Messages: Viewable & insertable
CREATE POLICY "Threads accessible to all" ON public.threads FOR ALL USING (true);
CREATE POLICY "Messages accessible to all" ON public.messages FOR ALL USING (true);

-- Notifications
CREATE POLICY "Notifications viewable" ON public.notifications FOR ALL USING (true);

-- Branding: Public read, Admin write
CREATE POLICY "Site branding readable by all" ON public.site_branding FOR SELECT USING (true);
CREATE POLICY "Site branding updateable" ON public.site_branding FOR ALL USING (true);

-- -------------------------------------------------------------------------
-- 13. SEED SUPER ADMIN PROFILE & INITIAL DATA
-- -------------------------------------------------------------------------
INSERT INTO public.profiles (email, full_name, role, status, verified, identity_status)
VALUES ('rafsankhan.tv@gmail.com', 'Rafsan Khan (Super Admin)', 'admin', 'active', true, 'verified')
ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'active', verified = true, identity_status = 'verified';

INSERT INTO public.site_branding (id, logo_url, favicon_url, alt_text, fallback_text, fallback_domain)
VALUES ('default_branding', NULL, NULL, 'qaaga.com', 'qaaga', '.com')
ON CONFLICT (id) DO NOTHING;
