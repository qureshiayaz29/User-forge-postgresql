# UserForge - PostgreSQL Learning Platform

A production-grade web application designed to **teach PostgreSQL through hands-on usage**. Build a user management system while learning core database concepts like CRUD operations, pagination, indexing, and connection pooling.

**Key Philosophy:** No ORM hiding—see and write **raw SQL** for every operation.

## 🎯 Features

- ✅ **CRUD Operations** - Create, Read, Update, Delete users with raw SQL
- ✅ **Full-Text Search** - Case-insensitive ILIKE search on name and email
- ✅ **Pagination** - LIMIT/OFFSET for efficient data loading
- ✅ **Connection Pooling** - node-postgres pool management for scalability
- ✅ **Raw SQL** - No ORM hiding—see every SQL query in the code
- ✅ **Prepared Statements** - SQL injection prevention with parameterized queries
- ✅ **Indexes** - Performance optimization demonstrations (email, created_at, name)
- ✅ **Timestamps** - Automatic created_at and updated_at audit trails
- ✅ **Error Handling** - PostgreSQL constraint violations, connection errors
- ✅ **Query Logging** - See every SQL query executed with timing

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16+ (App Router) | Modern React framework |
| **Language** | TypeScript | Type-safe development |
| **Styling** | TailwindCSS | Utility-first CSS |
| **Backend** | Next.js API Routes | Serverless backend |
| **Database** | PostgreSQL 14+ | Relational database |
| **DB Client** | node-postgres (pg) | Raw SQL without ORM |
| **Infrastructure** | Railway | PostgreSQL hosting |
| **Deployment** | Vercel | Frontend hosting |

## 📋 Quick Start Guide

### 1. Prerequisites

- Node.js 18+ installed
- Git for version control
- A Railway account (free at [railway.app](https://railway.app))

### 2. Clone & Install

```bash
cd userforge
npm install
```

### 3. Set Up PostgreSQL on Railway

1. Go to [Railway.app](https://railway.app) and sign in
2. Create a **new project**
3. Click **+ Add** → **PostgreSQL**
4. Wait for database to provision (2-3 minutes)
5. Click **PostgreSQL** in your project
6. Go to **Connect** tab
7. Copy the **Database URL** (looks like: `postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway`)

### 4. Configure Environment Variables

Create `.env.local` in your project root:

```bash
DATABASE_URL=postgresql://...your-railway-url-here...
```

**⚠️ Never commit `.env.local` to git!** It's already in `.gitignore`.

### 5. Create Database Schema

**In Railway Web Terminal:**
1. In Railway, go to PostgreSQL → **Connect** → **Web Terminal**
2. Paste the entire contents of `src/db/schema.sql`
3. Press Enter to execute

**Verify schema was created:**
```sql
\dt  -- Shows all tables
\d users  -- Shows users table structure
SELECT COUNT(*) FROM users;  -- Should return 0
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test the App

1. Click **+ Add User** → Create a test user
2. View user in the list
3. Search by name or email
4. Edit user → change name, email
5. Delete user
6. Try pagination if you have 10+ users

## 📁 Project Structure

```
userforge/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with navigation
│   │   ├── page.tsx                # Home page / dashboard
│   │   ├── users/
│   │   │   ├── page.tsx            # List users (with search & pagination)
│   │   │   ├── add/page.tsx        # Add user form
│   │   │   └── [id]/edit/page.tsx  # Edit user form
│   │   └── api/
│   │       └── users/
│   │           ├── route.ts        # GET /api/users (list), POST (create)
│   │           ├── [id]/route.ts   # GET/PUT/DELETE single user
│   │           └── search/route.ts # GET search by query
│   ├���─ lib/
│   │   ├── db.ts                   # PostgreSQL connection pool
│   │   ├─��� queries.ts              # SQL query functions (CRUD)
│   │   └── types.ts                # TypeScript interfaces
│   ├── db/
│   │   └── schema.sql              # PostgreSQL schema with indexes
│   └── styles/
│       └── globals.css             # TailwindCSS styles
├── public/                         # Static assets
├── .env.example                    # Environment template
├── .env.local                      # Your local DATABASE_URL (not committed)
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 📚 SQL Learning Examples

All SQL queries are in `src/lib/queries.ts` with detailed comments. Here are the key concepts:

### SELECT - Fetch Data
```sql
-- Get all users (with pagination)
SELECT id, name, email, phone, country, created_at, updated_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;
```

### SELECT WHERE - Filter Data
```sql
-- Get user by ID (primary key lookup)
SELECT * FROM users 
WHERE id = $1;
```

### SELECT ILIKE - Search (Case-Insensitive)
```sql
-- Search name or email (case-insensitive)
SELECT * FROM users 
WHERE name ILIKE '%search%' OR email ILIKE '%search%'
ORDER BY created_at DESC;
```

### INSERT - Create Data
```sql
-- Insert new user with RETURNING
INSERT INTO users (name, email, phone, country) 
VALUES ($1, $2, $3, $4) 
RETURNING id, name, email, phone, country, created_at, updated_at;
```

### UPDATE - Modify Data
```sql
-- Update specific fields, auto-update timestamp
UPDATE users 
SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
WHERE id = $3
RETURNING *;
```

### DELETE - Remove Data
```sql
-- Permanently delete user
DELETE FROM users 
WHERE id = $1;
```

### Pagination with LIMIT/OFFSET
```sql
-- Page 2 with 10 results per page
SELECT * FROM users 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 10;
```

## 🔍 Debugging & Testing SQL

### Connect to Your Railway Database

```bash
# Using psql CLI
psql $DATABASE_URL
```

### Common psql Commands

```sql
-- List all tables
\dt

-- Describe users table
\d users

-- Count total users
SELECT COUNT(*) FROM users;

-- See all indexes
\di

-- View execution plan
EXPLAIN ANALYZE SELECT * FROM users WHERE email='test@example.com';

-- Exit psql
\q
```

## 🚀 Deployment

### Deploy Frontend to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit: UserForge with PostgreSQL"
git push origin main
```

2. Go to [Vercel.com](https://vercel.com)
3. Click **+ New Project** → Select your GitHub repo
4. Add environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Your Railway `DATABASE_URL`
5. Click **Deploy**

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `.env.local` missing | Configuration missing | Create `.env.local` with `DATABASE_URL=...` |
| Cannot connect to database | Wrong connection string | Copy fresh DATABASE_URL from Railway |
| "relation users does not exist" | Schema not created | Run `schema.sql` in Railway web terminal |
| "duplicate key" error | Email exists | Try different email address |

## 📖 Learning Path

1. **Week 1:** Run schema.sql, verify tables, use psql
2. **Week 2:** Read `src/lib/queries.ts`, test CRUD operations
3. **Week 3:** Run EXPLAIN ANALYZE, check indexes
4. **Week 4:** Deploy to Vercel + Railway

## 📚 Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Guide](https://node-postgres.com/)
- [Next.js 16 App Router](https://nextjs.org/docs/app)
- [Railway Docs](https://docs.railway.app/)

---

**Happy Learning!** 🎉 Raw SQL is powerful and fun.
