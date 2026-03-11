-- PostgreSQL Schema for UserForge - PostgreSQL Learning App
-- This schema demonstrates key PostgreSQL concepts for learning
-- Learning Topics:
-- 1. PRIMARY KEY - Unique identifier for each row
-- 2. UNIQUE constraint - Ensures no duplicate emails
-- 3. NOT NULL - Required fields
-- 4. DEFAULT - Automatically set values (UUID, timestamps)
-- 5. INDEXES - Speed up queries
-- 6. TIMESTAMPS - Audit trail (created_at, updated_at)

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
-- Learn: PRIMARY KEY, UNIQUE constraint, NOT NULL, DEFAULT, timestamps
CREATE TABLE IF NOT EXISTS users (
  -- UUID primary key - better than auto-increment for distributed systems
  -- uuid_generate_v4() creates a random UUID
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User data fields
  -- VARCHAR(255) - variable length string with max 255 characters
  -- NOT NULL - field is required, cannot be empty
  name VARCHAR(255) NOT NULL,

  -- UNIQUE - ensures no two users have same email
  -- This constraint is checked at database level, not application level
  email VARCHAR(255) NOT NULL UNIQUE,

  -- Optional fields - can be NULL
  phone VARCHAR(20),
  country VARCHAR(100),

  -- Timestamps for auditing
  -- DEFAULT CURRENT_TIMESTAMP - automatically sets value to current time on insert
  -- TIMESTAMP - date and time with timezone awareness
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- CURRENT_TIMESTAMP sets time on insert; updated manually with UPDATE queries
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
-- Learn: Indexes speed up WHERE clauses, especially for UNIQUE/frequently-searched columns
-- Without this index, searching by email requires scanning all rows (slow)
-- With index, PostgreSQL can jump directly to the email you're looking for (fast)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on created_at for faster sorting by date
-- Learn: Useful when filtering/sorting by created_at DESC (newest users first)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Create index on name for ILIKE search
-- Learn: Helps when doing ILIKE searches (case-insensitive pattern matching)
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Verify schema was created
-- You can run these queries manually to verify:
-- SELECT * FROM users; -- Shows all users
-- SELECT COUNT(*) FROM users; -- Count total users
-- \di -- List all indexes
-- \d+ users -- Show table structure with indexes
-- EXPLAIN ANALYZE SELECT * FROM users WHERE email='test@example.com'; -- See query performance

