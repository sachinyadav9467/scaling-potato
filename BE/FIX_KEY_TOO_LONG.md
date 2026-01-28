# Fix: MySQL "Specified key was too long" Error

## Issue
MySQL has a limit on index key length (3072 bytes for InnoDB). When using VARCHAR(1000) with a UNIQUE constraint, the index can exceed this limit, especially with utf8mb4 encoding (3-4 bytes per character).

## Solution
Changed the token column to TEXT type and use a prefix index for the unique constraint. This allows storing full JWT tokens while keeping the unique constraint on the first 255 characters (which is sufficient for uniqueness).

## Steps to Apply the Fix

### Option 1: Using Prisma (Recommended)

```bash
cd BE

# Push schema changes to database
npm run db:push

# Regenerate Prisma client
npm run db:generate

# Restart server
npm run dev
```

### Option 2: Direct SQL (If Prisma fails)

Run this SQL in your MySQL database:

```sql
-- Step 1: Drop the existing unique constraint/index
ALTER TABLE refresh_tokens DROP INDEX token;

-- Step 2: Change column to TEXT
ALTER TABLE refresh_tokens 
MODIFY COLUMN token TEXT NOT NULL;

-- Step 3: Add unique index with prefix (first 255 characters)
CREATE UNIQUE INDEX token ON refresh_tokens(token(255));
```

Then regenerate Prisma client:
```bash
npm run db:generate
```

## What Changed

**Before:**
```prisma
token     String   @db.VarChar(1000) @unique
```

**After:**
```prisma
token     String   @db.Text
@@unique([token(length: 255)]) // Prefix index for uniqueness
```

## Why This Works

1. **TEXT type**: Can store tokens of any length (up to 65KB)
2. **Prefix index**: Creates a unique constraint on the first 255 characters
3. **JWT tokens**: The first 255 characters are more than enough to ensure uniqueness (JWT tokens typically have unique headers and payloads)

## Verification

After applying the fix:
1. Try registering or logging in again
2. The error should be resolved
3. Tokens will be stored correctly

## Note

The prefix index on the first 255 characters is sufficient because:
- JWT tokens have unique headers and payloads
- The first part of the token contains enough information to ensure uniqueness
- This is a common pattern for storing long unique strings in MySQL
