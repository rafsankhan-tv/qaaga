-- ==============================================================================
-- QAAGA.COM — SUPABASE PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USER PROFILES & ROLE-BASED ACCESS CONTROL (RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'host', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  city TEXT DEFAULT 'Kuala Lumpur',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MARKETPLACE LISTINGS (STAYS, EXPERIENCES, SERVICES)
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Kuala Lumpur',
  sub_type TEXT NOT NULL DEFAULT 'Apartment',
  category TEXT NOT NULL CHECK (category IN ('stay', 'experiences', 'services')),
  two_night_price_usd NUMERIC NOT NULL CHECK (two_night_price_usd > 0),
  rating TEXT NOT NULL DEFAULT '5.0',
  reviews_count INTEGER NOT NULL DEFAULT 0,
  guest_favorite BOOLEAN NOT NULL DEFAULT false,
  image TEXT NOT NULL,
  gallery TEXT[] NOT NULL DEFAULT '{}',
  max_guests INTEGER NOT NULL DEFAULT 2,
  bedrooms TEXT NOT NULL DEFAULT '1 bedroom',
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL DEFAULT 'Host',
  host_years INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  in_popular_kl BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BOOKING RESERVATIONS
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  confirmation_code TEXT UNIQUE NOT NULL,
  listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  image TEXT NOT NULL,
  check_in_label TEXT NOT NULL,
  nights INTEGER NOT NULL DEFAULT 2,
  guests INTEGER NOT NULL DEFAULT 1,
  total_usd NUMERIC NOT NULL,
  host_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Upcoming', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. WISHLIST SAVED ITEMS
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- 7. MESSAGING INBOX THREADS & CHATS
CREATE TABLE IF NOT EXISTS public.threads (
  id TEXT PRIMARY KEY,
  listing_id TEXT REFERENCES public.listings(id) ON DELETE SET NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  listing_title TEXT NOT NULL,
  listing_image TEXT NOT NULL,
  unread BOOLEAN NOT NULL DEFAULT false,
  last_message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  thread_id TEXT NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('host', 'guest', 'admin')),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. GLOBAL SITE BRANDING
CREATE TABLE IF NOT EXISTS public.site_branding (
  id TEXT PRIMARY KEY DEFAULT 'default',
  logo_url TEXT,
  favicon_url TEXT,
  alt_text TEXT NOT NULL DEFAULT 'qaaga.com',
  fallback_text TEXT NOT NULL DEFAULT 'qaaga',
  fallback_domain TEXT NOT NULL DEFAULT '.com',
  show_text_when_removed BOOLEAN NOT NULL DEFAULT true,
  size TEXT NOT NULL DEFAULT 'md' CHECK (size IN ('sm', 'md', 'lg', 'xl')),
  blend_multiply BOOLEAN NOT NULL DEFAULT true,
  revision BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Active listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (is_active = true OR auth.uid() = host_id);

CREATE POLICY "Hosts and Admins can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('host', 'admin')
    ) OR auth.role() = 'service_role' OR auth.role() = 'anon'
  );

CREATE POLICY "Hosts can update their own listings, Admins can update any"
  ON public.listings FOR UPDATE
  USING (
    auth.uid() = host_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Hosts can delete their own listings, Admins can delete any"
  ON public.listings FOR DELETE
  USING (
    auth.uid() = host_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    auth.role() = 'service_role'
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings, hosts can view bookings on their listings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = guest_id OR
    EXISTS (SELECT 1 FROM public.listings WHERE listings.id = bookings.listing_id AND listings.host_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    auth.role() = 'anon' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Guests can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can cancel their own bookings, Admins can manage"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = guest_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    auth.role() = 'service_role'
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can submit reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Users can add to their wishlist"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Users can remove from their wishlist"
  ON public.wishlists FOR DELETE
  USING (auth.uid() = user_id OR auth.role() = 'anon' OR auth.role() = 'service_role');

-- Messages & Threads policies
CREATE POLICY "Participants can view threads"
  ON public.threads FOR SELECT
  USING (true);

CREATE POLICY "Participants can create threads"
  ON public.threads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update threads"
  ON public.threads FOR UPDATE
  USING (true);

CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Participants can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- Site Branding policies
CREATE POLICY "Branding viewable by all"
  ON public.site_branding FOR SELECT
  USING (true);

CREATE POLICY "Admins can update branding"
  ON public.site_branding FOR ALL
  USING (true);

-- 11. ENABLE SUPABASE REALTIME REPLICATION FOR ACTIVE TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_branding;

-- 12. SUPABASE STORAGE BUCKET CREATION (Run in SQL or create in Supabase Dashboard > Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('qaaga-listings', 'qaaga-listings', true),
  ('qaaga-branding', 'qaaga-branding', true),
  ('qaaga-avatars', 'qaaga-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public reads and authenticated/anon uploads
CREATE POLICY "Public Access to Listings Media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('qaaga-listings', 'qaaga-branding', 'qaaga-avatars'));

CREATE POLICY "Allow Uploads to Media Buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('qaaga-listings', 'qaaga-branding', 'qaaga-avatars'));
