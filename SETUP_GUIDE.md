# UserForge - Step-by-Step Railway + Vercel Setup Guide

This guide will walk you through deploying your UserForge PostgreSQL learning app on Railway (database) and Vercel (frontend).

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ GitHub account
- ✅ Railway account (free at https://railway.app)
- ✅ Vercel account (free at https://vercel.com)

---

## Part 1: Set Up PostgreSQL Database on Railway

### Step 1.1: Create Railway Account

1. Go to https://railway.app
2. Click **Login** → **Continue with GitHub** (or use email)
3. Authorize Railway to access your GitHub account
4. You're in! 🎉

### Step 1.2: Create PostgreSQL Database

1. In Railway dashboard, click **+ New Project**
2. Click **+ Add** → Select **PostgreSQL**
3. Railway will provision a PostgreSQL instance (takes 2-3 minutes)
4. Wait until status shows **Running** (green indicator)

### Step 1.3: Get Your DATABASE_URL

1. Click the **PostgreSQL** card in your project
2. Go to **Connect** tab
3. Copy the **Database URL** (it looks like):
   ```
   postgresql://postgres:RandomPassword@containers-us-west-123.railway.app:5432/railway
   ```
4. ✅ Save this somewhere safe - you'll need it in next steps

### Step 1.4: Create PostgreSQL Schema

1. Still in the **PostgreSQL** service, click **Web Terminal**
2. A terminal window should open
3. Copy the entire contents of `src/db/schema.sql` from your project
4. Paste it into the Railway web terminal
5. Press **Enter** to execute
6. You should see: `CREATE TABLE`, `CREATE INDEX` messages

**Verify tables were created:**

In the same web terminal, run:
```sql
\dt
```

You should see:
```
         List of relations
 Schema | Name  | Type  | Owner
--------+-------+-------+----------
 public | users | table | postgres
```

✅ Success! Your database schema is ready.

---

## Part 2: Set Up Local Environment

### Step 2.1: Add DATABASE_URL to .env.local

1. Open your project in code editor
2. Create file: `.env.local` (in project root)
3. Paste your Railway DATABASE_URL:
   ```
   DATABASE_URL=postgresql://postgres:RandomPassword@containers-us-west-123.railway.app:5432/railway
   ```
4. **⚠️ DO NOT commit this file to git** (it's already in .gitignore)

### Step 2.2: Install Dependencies

```bash
npm install
```

This installs `pg` and `@types/pg` needed for database connection.

### Step 2.3: Test Local Connection

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

**Test the app:**
1. Click **+ Add User**
2. Fill in form with test data (e.g., name: "John", email: "john@example.com")
3. Click **Create User**
4. You should see your user in the list! ✅

If you get an error:
- Check DATABASE_URL in .env.local is correct
- Make sure Railway PostgreSQL is still running
- Check the browser console (F12) for error messages

---

## Part 3: Push Code to GitHub

### Step 3.1: Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: UserForge PostgreSQL app"
```

### Step 3.2: Create GitHub Repository

1. Go to https://github.com/new
2. Name: `userforge`
3. Description: "PostgreSQL learning app"
4. Make it **Public** (so Vercel can see it)
5. Click **Create repository**

### Step 3.3: Push to GitHub

Copy the commands from GitHub and run in your project:

```bash
git remote add origin https://github.com/YOUR_USERNAME/userforge.git
git branch -M main
git push -u origin main
```

Refresh GitHub - you should see your code! ✅

---

## Part 4: Deploy Frontend to Vercel

### Step 4.1: Connect Vercel to GitHub

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **+ New Project**
4. Search for `userforge` repository
5. Click **Import**

### Step 4.2: Add Environment Variables

On the "Configure Project" screen:

**Environment Variables:**
- **Name:** `DATABASE_URL`
- **Value:** (Paste your Railway DATABASE_URL)
- Click **Add**

### Step 4.3: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll see a success message with a URL like:
   ```
   https://userforge-7xk9.vercel.app
   ```
4. Click the URL to visit your live app! 🚀

### Step 4.4: Test Production App

1. On your Vercel URL, click **+ Add User**
2. Create a test user
3. View it in the list
4. Search, edit, delete - everything should work!

If you get errors:
- Check Vercel **Deployments** tab for build logs
- Check browser console (F12) for runtime errors
- Verify DATABASE_URL environment variable is set in Vercel dashboard

---

## Part 5: SQL Testing & Learning

### Connect to Railway Database with psql

If you have `psql` CLI installed locally:

```bash
psql "postgresql://postgres:PASSWORD@host:5432/railway"
```

Or copy the exact DATABASE_URL:
```bash
psql $DATABASE_URL
```

### Useful SQL Queries

```sql
-- See all users
SELECT * FROM users;

-- Count users
SELECT COUNT(*) FROM users;

-- See all indexes
\di

-- View table structure
\d users

-- See execution plan (performance)
EXPLAIN ANALYZE SELECT * FROM users WHERE email='test@example.com';

-- Exit psql
\q
```

---

## Part 6: Making Changes & Redeploying

### Workflow:

1. **Make changes locally**
   ```bash
   # Edit files, test with npm run dev
   npm run dev
   ```

2. **Commit & push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

3. **Vercel auto-deploys**
   - Go to https://vercel.com → your project
   - Watch deployment progress
   - New URL is live in 1-2 minutes

4. **Database changes**
   - If you modify `schema.sql`, run new queries in Railway web terminal
   - App code changes automatically deploy

---

## Troubleshooting

### "Cannot connect to database"
- ✅ Check DATABASE_URL is correct
- ✅ Verify Railway PostgreSQL is running (should be green)
- ✅ Test with psql CLI to confirm connection works

### "relation 'users' does not exist"
- ✅ Run `schema.sql` in Railway web terminal again
- ✅ Run `\dt` to confirm table exists
- ✅ Check database name matches (should be `railway`)

### "duplicate key value violates unique constraint"
- This means email already exists
- Try creating user with different email
- Or delete the existing user first

### Vercel deployment fails
- ✅ Check **Deployments** → **Build logs** for errors
- ✅ Verify `DATABASE_URL` env var is set in Vercel dashboard
- ✅ Make sure `package.json` has all dependencies

### Users list shows "Loading..." forever
- ✅ Open browser console (F12)
- ✅ Check for error messages
- ✅ Verify DATABASE_URL works with psql
- ✅ Check Vercel function logs

### Search not working
- ✅ Check you entered search term
- ✅ Verify user email/name matches search
- ✅ Try searching just part of name (e.g., "john" for "John Doe")

---

## Testing Checklist

After deployment, verify everything works:

- [ ] **Home page** loads with Welcome message
- [ ] **Add User page** - create test user ✅
- [ ] **Users list** - see created user
- [ ] **Search** - search by name/email
- [ ] **Pagination** - if 10+ users, see page navigation
- [ ] **Edit user** - change name/email
- [ ] **Delete user** - remove user
- [ ] **Database** - connect with psql, see data

---

## Important Files

- **`.env.local`** - Your Railway DATABASE_URL (⚠️ never commit)
- **`.env.example`** - Template for DATABASE_URL
- **`src/db/schema.sql`** - PostgreSQL schema (run in Railway)
- **`src/lib/db.ts`** - Connection pool setup
- **`src/lib/queries.ts`** - Raw SQL functions (read these to learn!)
- **`src/app/api/users/`** - API endpoints
- **`src/app/users/`** - Frontend pages

---

## Next Steps

### Continue Learning PostgreSQL:
1. Read comments in `src/lib/queries.ts` - explains each SQL query
2. Try modifying queries - use EXPLAIN ANALYZE for performance
3. Add more columns to users table
4. Create relationships between tables (foreign keys)
5. Learn about transactions, triggers, views

### Extend the App:
1. Add user authentication (login/signup)
2. Add user roles/permissions
3. Create companies table with users.company_id
4. Add soft deletes (deleted_at column)
5. Implement audit logging

### Performance Learning:
1. Run EXPLAIN ANALYZE on slow queries
2. Check index usage
3. Monitor query times in console logs
4. Test with 10,000+ users to see scaling

---

## Support

If you get stuck:

1. **Check Railway logs** - PostgreSQL → Logs tab
2. **Check Vercel logs** - Deployments → Build/Function logs
3. **Check browser console** - F12 → Console tab
4. **Read PostgreSQL docs** - https://www.postgresql.org/docs/
5. **Read Next.js docs** - https://nextjs.org/docs/

Good luck! 🚀


