-- ==============================================================================
-- Roxiler Systems Full-Stack Assessment
-- Database Architecture: PostgreSQL / MySQL Relational Schema
-- Engine: PostgreSQL 14+ (Compatible with MySQL 8.0+)
-- ==============================================================================

-- Drop tables in reverse order of dependencies if re-running
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
-- Enforces: Name 20-60 characters, Address max 400 characters, Role ENUM
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. STORES TABLE
-- Enforces: Store Name 3-120 chars, Address max 400 chars, Foreign Key to Store Owner (users.id)
CREATE TABLE stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 120),
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    owner_id VARCHAR(64) NOT NULL,
    category VARCHAR(60) DEFAULT 'Retail & Services',
    phone VARCHAR(30) DEFAULT '+91 98765 43210',
    operating_hours VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
    image_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- 3. RATINGS TABLE
-- Enforces: 1-5 Star Integer Rating, Foreign Keys to users and stores
-- Critical: UNIQUE (user_id, store_id) ensures one user can only rate a store once (Upsert on duplicate)
CREATE TABLE ratings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    store_id VARCHAR(64) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_store FOREIGN KEY (store_id) 
        REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & SORTING
-- ==============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_name ON users(name);

CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_address ON stores(address);

CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_composite ON ratings(store_id, rating);

-- ==============================================================================
-- INITIAL SEED DATA
-- Pre-populated test accounts matching the assignment credentials
-- ==============================================================================

-- Seed Users: Admin, Store Owner, Normal User
INSERT INTO users (id, name, email, password, address, role, created_at) VALUES
('usr_admin_01', 'System Administrator Head Executive', 'admin@roxiler.com', 'Admin@123', 'Roxiler Corporate Towers, Financial District, Hyderabad, India', 'ADMIN', NOW()),
('usr_owner_01', 'Store Owner Manager Rajesh Sharma', 'owner.tech@gmail.com', 'Owner@123', 'Shop 14, Commercial Tech Park, Indiranagar, Bangalore, India', 'STORE_OWNER', NOW()),
('usr_owner_02', 'Store Owner Gourmet Supermarket Head', 'owner.gourmet@gmail.com', 'Owner@123', 'Plot 88, Metro Junction Avenue, Pune, Maharashtra, India', 'STORE_OWNER', NOW()),
('usr_user_01', 'Shivam Kharwar FullStack Candidate', 'shivam@gmail.com', 'Shivam@123', 'Flat 402, Green Valley Apartments, Kolar Road, Bhopal, MP, India', 'USER', NOW()),
('usr_user_02', 'Priya Kumari Customer Evaluator', 'priya.k@gmail.com', 'Priya@123', 'Sector 18, Commercial Belt Block C, Noida, UP, India', 'USER', NOW());

-- Seed Stores
INSERT INTO stores (id, name, email, address, owner_id, category, phone, operating_hours, is_verified, created_at) VALUES
('str_tech_01', 'Apex Electronics & Computing Superstore', 'support@apexelectronics.com', 'Shop 14, Commercial Tech Park, Indiranagar, Bangalore, India', 'usr_owner_01', 'Electronics & Hardware', '+91 80 4123 4567', '10:00 AM - 9:30 PM', TRUE, NOW()),
('str_fresh_02', 'Green Leaf Organic Fresh Mart', 'care@greenleafmart.com', 'Plot 88, Metro Junction Avenue, Pune, Maharashtra, India', 'usr_owner_02', 'Grocery & Supermarket', '+91 20 6789 0123', '8:00 AM - 10:00 PM', TRUE, NOW());

-- Seed Ratings (User Ratings)
INSERT INTO ratings (id, user_id, store_id, rating, created_at, updated_at) VALUES
('rat_01', 'usr_user_01', 'str_tech_01', 5, NOW(), NOW()),
('rat_02', 'usr_user_02', 'str_tech_01', 4, NOW(), NOW()),
('rat_03', 'usr_user_01', 'str_fresh_02', 4, NOW(), NOW());

-- ==============================================================================
-- STORE AGGREGATION QUERY (Used by Backend for Overall Rating calculation)
-- ==============================================================================
-- SELECT 
--     s.*,
--     COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS overall_rating,
--     COUNT(r.id) AS total_ratings
-- FROM stores s
-- LEFT JOIN ratings r ON s.id = r.store_id
-- GROUP BY s.id;
