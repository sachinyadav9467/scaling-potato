# Quick Start Guide

## ✅ Current Status

The backend server is **configured and ready**. Here's what you need to do:

## Step 1: Create .env File

You need to create a `.env` file in the `BE` directory. You have two options:

### Option A: Use the setup script (Recommended)
```bash
cd BE
npm run setup
```

This will ask you for:
- Database type (mysql/postgresql)
- Database host, port, username, password, database name
- Server port (default: 3000)
- JWT secrets (auto-generates if you skip)
- CORS origin (default: http://localhost:5173)

### Option B: Create manually
```bash
cd BE
cp .env.example .env
# Then edit .env with your database credentials
```

Example `.env` for MySQL (port 3306):
```env
PORT=3000
NODE_ENV=development

DATABASE_URL="mysql://username:password@localhost:3306/database_name"

JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

CORS_ORIGIN=http://localhost:5173
```

## Step 2: Update Prisma Schema (if using MySQL)

If you're using MySQL, make sure `prisma/schema.prisma` has:
```prisma
datasource db {
  provider = "mysql"  // or "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 3: Generate Prisma Client & Push Schema

```bash
cd BE
npm run db:generate
npm run db:push
```

## Step 4: Start the Server

```bash
cd BE
npm run dev
```

You should see:
```
Server is running on port 3000
Environment: development
Health check: http://localhost:3000/health
```

## Step 5: Test the API

### Health Check
```bash
curl http://localhost:3000/health
```

### API Info
```bash
curl http://localhost:3000/api/v1
```

### Test Login (should return validation error, not 404)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

## Troubleshooting

### If you get 404 errors:
1. ✅ Check server is running: `lsof -ti:3000`
2. ✅ Check `.env` file exists
3. ✅ Check database is running and accessible
4. ✅ Check browser console for CORS errors
5. ✅ Verify frontend is calling `http://localhost:3000/api/v1`

### If Prisma commands fail:
- Use `npx prisma` instead: `npx prisma generate`
- Or install dependencies: `npm install`

### If database connection fails:
- Verify database is running
- Check `DATABASE_URL` in `.env` is correct
- Make sure database exists: `CREATE DATABASE your_database_name;`

## API Endpoints

All endpoints are prefixed with `/api/v1`:

- **Auth**: `/api/v1/auth/login`, `/api/v1/auth/register`, etc.
- **Courses**: `/api/v1/courses`
- **Assignments**: `/api/v1/assignments`
- **Submissions**: `/api/v1/submissions`
- **Metrics**: `/api/v1/metrics/daily/:date`, etc.
- **Users**: `/api/v1/users/me`

## Next Steps

Once the server is running:
1. Test endpoints using curl or Postman
2. Connect your frontend (should be on `http://localhost:5173`)
3. Check server logs for any errors
4. Monitor the console for request logs (in development mode)

---

**Server is ready!** Just need to:
1. Create `.env` file
2. Set up database
3. Run `npm run db:generate` and `npm run db:push`
4. Start server with `npm run dev`
