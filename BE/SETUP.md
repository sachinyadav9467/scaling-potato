# Environment Setup Guide

## Quick Setup

Run the interactive setup script:

```bash
npm run setup
```

This will ask you for:
- Database type (mysql/postgresql)
- Database host, port, username, password, and database name
- Server port
- JWT secrets (or auto-generate)
- CORS origin

## Manual Setup

If you prefer to set up manually, copy the example file:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

### For MySQL (port 3306):

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

### For PostgreSQL (port 5432):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

## Important Notes

1. **Database Provider**: Make sure the `provider` in `prisma/schema.prisma` matches your database:
   - For MySQL: `provider = "mysql"`
   - For PostgreSQL: `provider = "postgresql"`

2. **Database Creation**: Make sure your database exists before running migrations:
   ```sql
   CREATE DATABASE daily_learning_tracker;
   ```

3. **JWT Secrets**: Use strong, random secrets (minimum 32 characters). The setup script can auto-generate them.

4. **After Setup**:
   ```bash
   npm run db:generate
   npm run db:push  # or npm run db:migrate
   npm run dev
   ```

## Example .env File

```env
PORT=3000
NODE_ENV=development

# MySQL Example
DATABASE_URL="mysql://root:password@localhost:3306/daily_learning_tracker"

# PostgreSQL Example
# DATABASE_URL="postgresql://postgres:password@localhost:5432/daily_learning_tracker?schema=public"

JWT_SECRET=your-very-long-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-very-long-refresh-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

CORS_ORIGIN=http://localhost:5173
```
