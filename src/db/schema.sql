-- ============================================================================
-- QAAGA Super Marketplace — Optimized Production PostgreSQL Database Schema
-- Multi-Service Platform: Services, Doctors, Nurses, Hotels, Products, Jobs, eBooks
-- High Performance, GIN/B-Tree Indexed, Connection-Pooled, ACID-Compliant
-- ============================================================================

-- Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Updated Timestamp Trigger Function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(30) DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'PROVIDER', 'SELLER', 'ADMIN', 'DOCTOR', 'NURSE', 'HOTEL_MANAGER')),
    avatar_url TEXT,
    district VARCHAR(100) DEFAULT 'ঢাকা',
    area VARCHAR(100),
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized User Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district) WHERE is_active = TRUE;

-- 2. DYNAMIC SERVICE CATEGORIES & MODULES
CREATE TABLE IF NOT EXISTS service_categories (
    id VARCHAR(80) PRIMARY KEY,
    name_bn VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description_bn TEXT,
    description_en TEXT,
    badge_text VARCHAR(50),
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_active_order ON service_categories(is_active, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_categories_popular ON service_categories(is_popular) WHERE is_active = TRUE;

-- 3. MERCHANT / SELLER STORES
CREATE TABLE IF NOT EXISTS seller_stores (
    id VARCHAR(80) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shop_name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    email VARCHAR(150),
    district VARCHAR(100) DEFAULT 'ঢাকা',
    area VARCHAR(100) DEFAULT 'মিরপুর',
    address TEXT,
    shop_bio TEXT,
    shop_logo TEXT,
    shop_banner TEXT,
    trade_license VARCHAR(100),
    nid_number VARCHAR(50),
    delivery_policy TEXT,
    return_policy TEXT,
    bank_account_info TEXT,
    bkash_merchant VARCHAR(20),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    available_balance NUMERIC(12, 2) DEFAULT 0.00,
    pending_balance NUMERIC(12, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    has_official_badge BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Seller Indexes
CREATE INDEX IF NOT EXISTS idx_sellers_shop_name_trgm ON seller_stores USING gin (shop_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sellers_district_verified ON seller_stores(district, is_verified, is_approved);
CREATE INDEX IF NOT EXISTS idx_sellers_rating ON seller_stores(rating DESC, total_sales DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON seller_stores(user_id);

-- 4. SERVICE PROVIDER PROFILES (Electrician, Plumber, AC Tech, etc.)
CREATE TABLE IF NOT EXISTS provider_profiles (
    id VARCHAR(80) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    category_id VARCHAR(80) REFERENCES service_categories(id) ON DELETE SET NULL,
    title VARCHAR(150),
    bio TEXT,
    experience_years INT DEFAULT 1,
    hourly_rate NUMERIC(10, 2) DEFAULT 0,
    district VARCHAR(100) DEFAULT 'ঢাকা',
    area VARCHAR(100) DEFAULT 'মিরপুর',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    completed_jobs INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Provider Indexes
CREATE INDEX IF NOT EXISTS idx_providers_cat_district ON provider_profiles(category_id, district) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_providers_rating_jobs ON provider_profiles(rating DESC, completed_jobs DESC);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON provider_profiles(user_id);

-- 5. SERVICE REQUESTS & BOOKINGS (Escrow 20% Deposit)
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(80) PRIMARY KEY,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    category_id VARCHAR(80) REFERENCES service_categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    district VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT,
    preferred_date DATE,
    preferred_time VARCHAR(50),
    budget NUMERIC(10, 2) NOT NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    advance_amount NUMERIC(10, 2) DEFAULT 0,
    remaining_amount NUMERIC(10, 2) DEFAULT 0,
    platform_commission NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ADMIN_REVIEW' CHECK (status IN ('ADMIN_REVIEW', 'OPEN', 'OFFERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED')),
    payment_status VARCHAR(50) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED')),
    assigned_provider_id VARCHAR(80) REFERENCES provider_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Service Request Indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_status_created ON service_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_created ON service_requests(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_category_dist ON service_requests(category_id, district);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_provider ON service_requests(assigned_provider_id) WHERE assigned_provider_id IS NOT NULL;

-- 6. PROVIDER OFFERS / BIDS
CREATE TABLE IF NOT EXISTS service_offers (
    id VARCHAR(80) PRIMARY KEY,
    request_id VARCHAR(80) REFERENCES service_requests(id) ON DELETE CASCADE,
    provider_id VARCHAR(80) REFERENCES provider_profiles(id) ON DELETE CASCADE,
    proposed_price NUMERIC(10, 2) NOT NULL,
    estimated_duration VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'ADMIN_REVIEW')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offers_request_status ON service_offers(request_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_provider_status ON service_offers(provider_id, status);

-- 7. MARKETPLACE PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(80) PRIMARY KEY,
    seller_id VARCHAR(80) REFERENCES seller_stores(id) ON DELETE SET NULL,
    seller_name VARCHAR(150),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    stock INT DEFAULT 10,
    description TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_official_warranty BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Product Search & Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON products USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price ASC);
CREATE INDEX IF NOT EXISTS idx_products_seller_created ON products(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured, rating DESC) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_rating_reviews ON products(rating DESC, review_count DESC);

-- 8. ORDERS & CHECKOUT
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(80) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD' CHECK (payment_method IN ('COD', 'BKASH', 'NAGAD', 'ROCKET', 'SSLCOMMERZ', 'CARD')),
    payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    order_status VARCHAR(50) DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED')),
    courier_partner VARCHAR(100),
    tracking_number VARCHAR(100),
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Order Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(order_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- 9. SELLER PAYOUT REQUESTS
CREATE TABLE IF NOT EXISTS seller_payouts (
    id VARCHAR(80) PRIMARY KEY,
    seller_id VARCHAR(80) REFERENCES seller_stores(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('BKASH', 'NAGAD', 'BANK_TRANSFER')),
    account_details VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED')),
    transaction_ref VARCHAR(100),
    admin_note TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payouts_seller_status ON seller_payouts(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_payouts_status_date ON seller_payouts(status, requested_at DESC);

-- 10. DOCTORS & HEALTHCARE
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    designation VARCHAR(150),
    hospital VARCHAR(200),
    chamber_address TEXT,
    district VARCHAR(100) DEFAULT 'ঢাকা',
    visiting_fee NUMERIC(10, 2) NOT NULL,
    visiting_hours VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_dept_district ON doctors(department, district) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_doctors_name_trgm ON doctors USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating DESC, review_count DESC);

-- 11. NURSES & CAREGIVERS
CREATE TABLE IF NOT EXISTS nurses (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    gender VARCHAR(20),
    experience_years INT DEFAULT 2,
    qualifications VARCHAR(255),
    service_type VARCHAR(100) NOT NULL,
    shift_fee_12h NUMERIC(10, 2) NOT NULL,
    shift_fee_24h NUMERIC(10, 2) NOT NULL,
    monthly_package NUMERIC(10, 2),
    district VARCHAR(100) DEFAULT 'ঢাকা',
    area VARCHAR(100) DEFAULT 'মিরপুর',
    phone VARCHAR(20),
    avatar_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nurses_dist_service ON nurses(district, service_type) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_nurses_rating ON nurses(rating DESC);

-- 12. HOTELS & RESORTS
CREATE TABLE IF NOT EXISTS hotels (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    images TEXT[] NOT NULL DEFAULT '{}',
    amenities TEXT[] NOT NULL DEFAULT '{}',
    contact_phone VARCHAR(20),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotels_location_dist ON hotels(district, location);
CREATE INDEX IF NOT EXISTS idx_hotels_price_rating ON hotels(price_per_night ASC, rating DESC);
CREATE INDEX IF NOT EXISTS idx_hotels_name_trgm ON hotels USING gin (name gin_trgm_ops);

-- 13. EBOOKS & DIGITAL PRODUCTS
CREATE TABLE IF NOT EXISTS ebooks (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    cover_image TEXT,
    pdf_url TEXT,
    total_pages INT DEFAULT 100,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    download_count INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ebooks_cat_downloads ON ebooks(category, download_count DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_title_trgm ON ebooks USING gin (title gin_trgm_ops);

-- 14. JOBS & CAREERS
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    company_logo TEXT,
    location VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) DEFAULT 'FULL_TIME',
    salary_range VARCHAR(100),
    vacancy INT DEFAULT 1,
    deadline DATE,
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_dist_deadline ON jobs(district, deadline DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON jobs USING gin (title gin_trgm_ops);

-- 15. RATINGS & REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(80) PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('PRODUCT', 'SERVICE', 'SELLER', 'DOCTOR', 'NURSE', 'HOTEL', 'EBOOK')),
    target_id VARCHAR(80) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    user_avatar TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_target_rating ON reviews(target_type, target_id, rating DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
