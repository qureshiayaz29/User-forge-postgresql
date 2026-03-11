# UserForge - Quick Reference Card

Keep this handy while developing!

---

## 🚀 Getting Started (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your Railway DATABASE_URL
echo "DATABASE_URL=postgresql://..." > .env.local

# 3. Run schema.sql in Railway web terminal
# Copy src/db/schema.sql → Railway → PostgreSQL → Web Terminal → paste → Enter

# 4. Start development server
npm run dev
# Visit http://localhost:3000

# 5. Test the app
# Click + Add User → Create → Search → Edit → Delete
```

---

## 📝 API Endpoints

### Users List
```bash
GET /api/users?page=1&limit=10

# Response:
{
  "success": true,
  "data": {
    "users": [...],
    "total": 42,
    "pages": 5
  }
}
```

### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-1234",
  "country": "USA"
}

# Response:
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-1234",
    "country": "USA",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Single User
```bash
GET /api/users/{id}

# Response: user object
```

### Update User
```bash
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

# Response: updated user object
```

### Delete User
```bash
DELETE /api/users/{id}

# Response:
{
  "success": true
}
```

### Search Users
```bash
GET /api/users/search?q=john&page=1&limit=10

# Response: same as /api/users (with search results)
```

---

## 📚 SQL Query Examples

### In src/lib/queries.ts

**Get All Users (Paginated)**
```sql
SELECT id, name, email, phone, country, created_at, updated_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;
```

**Get Single User**
```sql
SELECT * FROM users WHERE id = $1;
```

**Search Users (ILIKE)**
```sql
SELECT * FROM users 
WHERE name ILIKE '%search%' OR email ILIKE '%search%'
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;
```

**Create User (INSERT)**
```sql
INSERT INTO users (name, email, phone, country) 
VALUES ($1, $2, $3, $4) 
RETURNING id, name, email, phone, country, created_at, updated_at;
```

**Update User**
```sql
UPDATE users 
SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
WHERE id = $3
RETURNING *;
```

**Delete User**
```sql
DELETE FROM users WHERE id = $1;
```

**Count Total Users**
```sql
SELECT COUNT(*) as count FROM users;
```

---

## 🐘 PostgreSQL / psql Commands

### Connect to Railway Database
```bash
# From .env.local
psql $DATABASE_URL

# Or use direct URL
psql "postgresql://user:pass@host:5432/database"
```

### List Tables
```sql
\dt
```

### Show Table Structure
```sql
\d users
```

### List Indexes
```sql
\di
```

### Count Rows
```sql
SELECT COUNT(*) FROM users;
```

### See All Data
```sql
SELECT * FROM users;
```

### View Query Performance
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### Exit psql
```sql
\q
```

---

## 📁 Key File Locations

| File | Purpose |
|------|---------|
| `.env.local` | Your Railway DATABASE_URL |
| `src/db/schema.sql` | PostgreSQL table definition |
| `src/lib/db.ts` | Connection pool setup |
| `src/lib/queries.ts` | SQL functions (READ THIS!) |
| `src/lib/types.ts` | TypeScript types |
| `src/app/page.tsx` | Home page |
| `src/app/users/page.tsx` | Users list page |
| `src/app/api/users/route.ts` | API endpoints |
| `package.json` | Dependencies (pg, @types/pg) |

---

## 🔍 Debugging

### Check Local Connection
```bash
psql $DATABASE_URL
# Should show: psql (X.X) ...
```

### View Query Logs
```bash
# Run: npm run dev
# Check terminal for query logs:
# ✓ Query executed { text: '...', duration: '5ms', rows: 1 }
```

### Check Browser Errors
```
Press F12 → Console tab
Look for error messages
Check Network tab for API responses
```

### Check Railway Logs
1. Go to Railway.app
2. Click PostgreSQL
3. Go to Logs tab
4. See database errors

### Check Vercel Logs
1. Go to Vercel.com
2. Click Deployments
3. Click deployment
4. See build/function logs

---

## 🚀 Deployment Checklist

### Before Vercel:
- [ ] Code pushed to GitHub
- [ ] `.env.local` has correct DATABASE_URL
- [ ] App works locally (`npm run dev`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)

### Vercel Setup:
- [ ] Project imported from GitHub
- [ ] Environment variable added: `DATABASE_URL`
- [ ] Deployment successful (green checkmark)
- [ ] Production URL working

### After Deployment:
- [ ] Test all CRUD operations
- [ ] Check Vercel logs for errors
- [ ] Verify DATABASE_URL is set
- [ ] Test search & pagination

---

## 📊 Pagination Math

```
Total Users: 42
Per Page: 10
Total Pages: 5

Page 1: OFFSET 0,  LIMIT 10  (rows 1-10)
Page 2: OFFSET 10, LIMIT 10  (rows 11-20)
Page 3: OFFSET 20, LIMIT 10  (rows 21-30)
Page 4: OFFSET 30, LIMIT 10  (rows 31-40)
Page 5: OFFSET 40, LIMIT 10  (rows 41-42)

Formula: OFFSET = (page - 1) * limit
```

---

## 🔐 Security Reminders

✅ Use prepared statements: `query('SELECT * FROM users WHERE id = $1', [id])`
❌ Never do: `query('SELECT * FROM users WHERE id = ' + id)`

✅ Keep `.env.local` secret (in .gitignore)
❌ Never commit DATABASE_URL to git

✅ Use HTTPS in production (Vercel does this)
❌ Don't use HTTP for sensitive data

---

## 📦 Dependencies

```json
{
  "pg": "^8.11.3",           // PostgreSQL driver
  "@types/pg": "^8.11.3",    // TypeScript types
  "next": "16.1.6",          // Framework
  "react": "19.2.3",         // UI library
  "typescript": "^5",        // Type safety
  "tailwindcss": "^4"        // Styling
}
```

Install: `npm install`

---

## 🎯 Common Tasks

### Add a New User Field
1. Add column to `src/db/schema.sql`
2. Run ALTER TABLE in Railway
3. Update `User` type in `src/lib/types.ts`
4. Update `createUser()` in `src/lib/queries.ts`
5. Update API endpoint in `src/app/api/users/route.ts`
6. Update form in `src/app/users/add/page.tsx`

### Debug a Query
1. Look at logs in browser console: `✓ Query executed { text: '...' }`
2. Copy the SQL text
3. Run in Railway psql: `psql $DATABASE_URL`
4. Test the query manually
5. Check EXPLAIN ANALYZE for performance

### Find Slow Queries
1. Check console logs (npm run dev)
2. Look for high `duration` values
3. Run EXPLAIN ANALYZE: `EXPLAIN ANALYZE SELECT ...`
4. Look for "Seq Scan" (indicates no index)
5. Add index if needed: `CREATE INDEX ... ON ...`

### Fix "duplicate key" Error
1. Email already exists
2. Try different email, or
3. Delete existing user first: `DELETE FROM users WHERE email='...'`

---

## 🎓 Learning Path

**Week 1:** Setup & Basic Operations
- [ ] Create Railway database
- [ ] Run schema.sql
- [ ] Test app locally
- [ ] Read SQL_LEARNING_GUIDE.md

**Week 2:** Deep Dive
- [ ] Read src/lib/queries.ts line-by-line
- [ ] Try modifying queries
- [ ] Use EXPLAIN ANALYZE
- [ ] Check indexes with \di

**Week 3:** Deployment
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test production
- [ ] Monitor logs

**Week 4:** Extension
- [ ] Add new features
- [ ] Add new tables
- [ ] Learn transactions
- [ ] Explore advanced SQL

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module 'pg'" | Run `npm install` |
| ".env.local not found" | Create with your DATABASE_URL |
| "relation users does not exist" | Run schema.sql in Railway |
| "duplicate key error" | Email already exists, use different |
| "too many connections" | Increase max in src/lib/db.ts |
| "column does not exist" | Check table with `\d users` |
| Vercel build fails | Check build logs, verify DATABASE_URL |
| "Cannot connect to database" | Verify DATABASE_URL is correct |
| Production not connecting | Add DATABASE_URL to Vercel env vars |
| Query takes 10+ seconds | Add index or use LIMIT |

---

## 📞 Key Docs to Read

1. **README.md** - Project overview
2. **SETUP_GUIDE.md** - Deployment steps ⭐
3. **SQL_LEARNING_GUIDE.md** - PostgreSQL concepts ⭐
4. **IMPLEMENTATION_SUMMARY.md** - What was built
5. **src/lib/queries.ts** - See all SQL functions ⭐

---

**Start with SETUP_GUIDE.md next!** 🚀


