-- ============================================================================
-- Migration: 001_indexes_and_optimizations.sql
-- Safe, Idempotent Database Performance Optimization
-- ============================================================================

-- Ensure Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 1. Users Composite & State Indexes
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district) WHERE is_active = TRUE;

-- 2. Service Categories Order Index
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON service_categories(is_active, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_categories_popular ON service_categories(is_popular) WHERE is_active = TRUE;

-- 3. Seller Stores Trigram & Geolocation Indexes
CREATE INDEX IF NOT EXISTS idx_sellers_shop_name_trgm ON seller_stores USING gin (shop_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sellers_district_verified ON seller_stores(district, is_verified, is_approved);
CREATE INDEX IF NOT EXISTS idx_sellers_rating ON seller_stores(rating DESC, total_sales DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON seller_stores(user_id);

-- 4. Provider Profiles
CREATE INDEX IF NOT EXISTS idx_providers_cat_district ON provider_profiles(category_id, district) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_providers_rating_jobs ON provider_profiles(rating DESC, completed_jobs DESC);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON provider_profiles(user_id);

-- 5. Service Requests & Bookings
CREATE INDEX IF NOT EXISTS idx_service_requests_status_created ON service_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_created ON service_requests(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_category_dist ON service_requests(category_id, district);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_provider ON service_requests(assigned_provider_id) WHERE assigned_provider_id IS NOT NULL;

-- 6. Products Search & Sort Optimization
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON products USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price ASC);
CREATE INDEX IF NOT EXISTS idx_products_seller_created ON products(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured, rating DESC) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_rating_reviews ON products(rating DESC, review_count DESC);

-- 7. Orders Fast Tracking & Customer History
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(order_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- 8. Healthcare, Hotels & eBooks Optimization
CREATE INDEX IF NOT EXISTS idx_doctors_dept_district ON doctors(department, district) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_doctors_name_trgm ON doctors USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating DESC, review_count DESC);

CREATE INDEX IF NOT EXISTS idx_nurses_dist_service ON nurses(district, service_type) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_nurses_rating ON nurses(rating DESC);

CREATE INDEX IF NOT EXISTS idx_hotels_location_dist ON hotels(district, location);
CREATE INDEX IF NOT EXISTS idx_hotels_price_rating ON hotels(price_per_night ASC, rating DESC);
CREATE INDEX IF NOT EXISTS idx_hotels_name_trgm ON hotels USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_ebooks_cat_downloads ON ebooks(category, download_count DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_title_trgm ON ebooks USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_jobs_dist_deadline ON jobs(district, deadline DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON jobs USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_reviews_target_rating ON reviews(target_type, target_id, rating DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
