# Update Database Schema - Fix Refresh Token Column

## The Problem
The `token` column in the `refresh_tokens` table is too short for JWT tokens. The schema has been updated, but you need to apply the changes to your database.

## Solution: Two Options

### Option 1: Using Prisma (Recommended)

Run these commands in your terminal:

```bash
cd BE

# Push schema changes to database
npm run db:push

# Regenerate Prisma client
npm run db:generate
```

Then restart your server:
```bash
npm run dev
```

### Option 2: Direct SQL (If Prisma fails)

If `npm run db:push` doesn't work, you can update the column directly in your database:

#### For MySQL:
```sql
ALTER TABLE refresh_tokens 
MODIFY COLUMN token VARCHAR(1000) NOT NULL;
```

#### For PostgreSQL:
```sql
ALTER TABLE refresh_tokens 
ALTER COLUMN token TYPE VARCHAR(1000);
```

Then regenerate Prisma client:
```bash
cd BE
npm run db:generate
```

## Verify the Fix

After updating, try registering or logging in again. The error should be gone.

## What Changed

The schema now uses:
```prisma
token     String   @db.VarChar(1000) @unique
```

This allows storing JWT tokens up to 1000 characters (JWT tokens are typically 200-500 characters).

## If You Still Get Errors

1. Make sure the database column was actually updated:
   ```sql
   DESCRIBE refresh_tokens;  -- MySQL
   -- or
   \d refresh_tokens;  -- PostgreSQL
   ```

2. Check that the token column shows VARCHAR(1000) or similar

3. Restart your server after making changes
