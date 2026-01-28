-- SQL script to fix the refresh_tokens.token column length
-- Run this directly in your database if Prisma db:push doesn't work

-- For MySQL:
-- Step 1: Drop the existing unique constraint/index
ALTER TABLE refresh_tokens DROP INDEX token;

-- Step 2: Change column to TEXT
ALTER TABLE refresh_tokens 
MODIFY COLUMN token TEXT NOT NULL;

-- Step 3: Add unique index with prefix (first 255 characters)
-- This avoids the "key too long" error
CREATE UNIQUE INDEX token ON refresh_tokens(token(255));

-- For PostgreSQL (uncomment if using PostgreSQL):
-- ALTER TABLE refresh_tokens 
-- ALTER COLUMN token TYPE TEXT;
-- CREATE UNIQUE INDEX token_unique ON refresh_tokens(token);

-- Verify the change:
-- DESCRIBE refresh_tokens;  -- MySQL
-- \d refresh_tokens;  -- PostgreSQL
