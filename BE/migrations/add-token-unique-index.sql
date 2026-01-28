-- Migration: Add unique index with prefix for refresh_tokens.token
-- Run this after: npm run db:push
-- Or run manually if db:push doesn't create the index

-- For MySQL:
-- Drop existing index if it exists
ALTER TABLE refresh_tokens DROP INDEX IF EXISTS token;

-- Create unique index with prefix (first 255 characters)
-- This avoids the "key too long" error while maintaining uniqueness
CREATE UNIQUE INDEX token ON refresh_tokens(token(255));

-- Verify:
-- SHOW INDEX FROM refresh_tokens;
