# Fix: Refresh Token Column Too Long

## Issue
The `token` column in the `refresh_tokens` table was too short for JWT tokens, causing:
```
Invalid `prisma.refreshToken.create()` invocation: 
The provided value for the column is too long for the column's type. Column: token
```

## Solution
Updated the Prisma schema to use `@db.VarChar(1000)` for the token field, which can accommodate long JWT tokens.

## Steps to Apply the Fix

1. **Update the database schema:**
   ```bash
   cd BE
   npm run db:push
   ```
   
   Or if you prefer migrations:
   ```bash
   npm run db:migrate
   ```

2. **Regenerate Prisma client:**
   ```bash
   npm run db:generate
   ```

3. **Restart your server:**
   ```bash
   npm run dev
   ```

## What Changed

**Before:**
```prisma
token     String   @unique
```

**After:**
```prisma
token     String   @db.VarChar(1000) @unique
```

This allows the token column to store up to 1000 characters, which is sufficient for JWT tokens (typically 200-500 characters).

## Alternative: Using TEXT

If you prefer unlimited length (though VARCHAR(1000) should be sufficient):

```prisma
token     String   @db.Text @unique
```

However, `@db.Text` cannot have a unique constraint in MySQL, so you'd need to remove `@unique` and handle uniqueness in application code or use a different approach.

## Verification

After applying the fix, try registering or logging in again. The error should be resolved.
