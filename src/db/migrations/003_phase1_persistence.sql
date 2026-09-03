-- Migration 003: Phase 1 Real PostgreSQL Persistence
-- Additive migration for Category, Review, and Feed persistence

-- 1. Service Categories Enhancements
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS slug VARCHAR(150);
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS subcategories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS default_advance_percent NUMERIC(5,2) DEFAULT 20;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS min_price NUMERIC(10,2) DEFAULT 500;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS category_type VARCHAR(50) DEFAULT 'SERVICE';

CREATE INDEX IF NOT EXISTS idx_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_type ON service_categories(category_type);

-- 2. User ID Column Harmonization (Allows both UUIDs and string IDs safely)
ALTER TABLE service_requests DROP CONSTRAINT IF EXISTS service_requests_customer_id_fkey;
ALTER TABLE provider_profiles DROP CONSTRAINT IF EXISTS provider_profiles_user_id_fkey;
ALTER TABLE seller_stores DROP CONSTRAINT IF EXISTS seller_stores_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(100);
ALTER TABLE service_requests ALTER COLUMN customer_id TYPE VARCHAR(100);
ALTER TABLE provider_profiles ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE seller_stores ALTER COLUMN user_id TYPE VARCHAR(100);
ALTER TABLE orders ALTER COLUMN customer_id TYPE VARCHAR(100);
ALTER TABLE reviews ALTER COLUMN user_id TYPE VARCHAR(100);

ALTER TABLE service_requests ADD CONSTRAINT service_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE provider_profiles ADD CONSTRAINT provider_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE seller_stores ADD CONSTRAINT seller_stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Feed Persistence Tables
CREATE TABLE IF NOT EXISTS feed_posts (
    id VARCHAR(80) PRIMARY KEY,
    author_id VARCHAR(100) NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    author_avatar TEXT,
    author_role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    author_badge VARCHAR(100),
    author_rating NUMERIC(3,2) DEFAULT 5.0,
    author_district VARCHAR(100) DEFAULT 'ঢাকা',
    author_thana VARCHAR(100),
    post_type VARCHAR(50) NOT NULL DEFAULT 'UPDATE',
    title VARCHAR(255),
    content TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    category_key VARCHAR(100) NOT NULL DEFAULT 'general',
    likes_count INT NOT NULL DEFAULT 0,
    shares_count INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    action_cta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_posts_author ON feed_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_category ON feed_posts(category_key);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_pinned ON feed_posts(is_pinned DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS feed_comments (
    id VARCHAR(80) PRIMARY KEY,
    post_id VARCHAR(80) NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_avatar TEXT,
    user_role VARCHAR(50) DEFAULT 'CUSTOMER',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_feed_comments_user ON feed_comments(user_id);

CREATE TABLE IF NOT EXISTS feed_likes (
    id VARCHAR(80) PRIMARY KEY,
    post_id VARCHAR(80) NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_feed_likes_post_user UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_likes_post ON feed_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_user ON feed_likes(user_id);

CREATE TABLE IF NOT EXISTS feed_bookmarks (
    id VARCHAR(80) PRIMARY KEY,
    post_id VARCHAR(80) NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_feed_bookmarks_post_user UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_bookmarks_user ON feed_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_bookmarks_post ON feed_bookmarks(post_id);

CREATE TABLE IF NOT EXISTS user_follows (
    id VARCHAR(80) PRIMARY KEY,
    follower_id VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    target_name VARCHAR(150),
    target_avatar TEXT,
    target_role VARCHAR(50),
    target_badge VARCHAR(100),
    target_category VARCHAR(100),
    target_rating NUMERIC(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_follows UNIQUE (follower_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_target ON user_follows(target_id);
