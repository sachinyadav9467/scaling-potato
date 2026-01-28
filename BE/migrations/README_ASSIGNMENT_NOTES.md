# Assignment Notes Migration

## Issue
The `assignment_notes` table may not exist in your database, which prevents file uploads from working.

## Solution

### Option 1: Using Prisma (Recommended)
```bash
cd BE
npx prisma migrate dev --name add_assignment_notes
```

### Option 2: Manual SQL Migration

**For MySQL:**
```bash
mysql -u your_user -p your_database < migrations/create-assignment-notes-table.sql
```

**For PostgreSQL:**
```bash
psql -U your_user -d your_database -f migrations/create-assignment-notes-table.sql
```

### Option 3: Using Prisma Studio
1. Run `npx prisma studio`
2. Check if `assignment_notes` table exists
3. If not, run the migration SQL manually

## Verify Table Exists
After running the migration, verify the table exists:
```sql
SHOW TABLES LIKE 'assignment_notes';
-- or for PostgreSQL:
\dt assignment_notes
```

## Test the Upload
1. Restart your backend server
2. Try uploading a PDF or Word document
3. Check browser console for any errors
4. Check backend logs for database errors
