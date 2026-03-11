# PostgreSQL Learning Guide - UserForge

This guide teaches PostgreSQL concepts through the UserForge application code. Each concept has examples you can try.

---

## 1. Database Connection & Connection Pooling

### What is Connection Pooling?

Instead of creating a new database connection for every request, connection pooling reuses existing connections. This is crucial for serverless apps (Vercel).

**File:** `src/lib/db.ts`

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Max 20 connections in pool
  idleTimeoutMillis: 30000,   // Close idle after 30s
  connectionTimeoutMillis: 2000, // Timeout for new connections
});
```

### Learn:
- **Max connections:** Limits total connections (prevents "too many connections" error)
- **Idle timeout:** Closes unused connections to save resources
- **Connection timeout:** Fails fast if database is unreachable

---

## 2. Prepared Statements (SQL Injection Prevention)

### What is SQL Injection?

Dangerous code:
```javascript
// ❌ NEVER DO THIS - vulnerable to SQL injection!
query(`SELECT * FROM users WHERE email = '${email}'`)
```

An attacker could enter: `test@test.com'; DROP TABLE users; --`

### Safe Code:

```typescript
// ✅ ALWAYS use prepared statements
query(
  'SELECT * FROM users WHERE email = $1',
  [email]  // Parameter is safely escaped
);
```

**File:** `src/lib/queries.ts`

Every query in this file uses `$1, $2, $3...` placeholders with a params array.

### Learn:
- **Placeholders:** `$1, $2, $3...` mark where parameters go
- **Parameters array:** Values are safely escaped by PostgreSQL
- **Prevention:** Prepared statements prevent SQL injection

---

## 3. CREATE TABLE - Define Schema

### Table Structure

**File:** `src/db/schema.sql`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Concepts:

| Concept | Example | Meaning |
|---------|---------|---------|
| **PRIMARY KEY** | `id UUID PRIMARY KEY` | Unique identifier for each row |
| **UUID** | `uuid_generate_v4()` | Random 36-char unique ID (better than auto-increment) |
| **DEFAULT** | `DEFAULT uuid_generate_v4()` | Auto-generate value if not provided |
| **VARCHAR** | `VARCHAR(255)` | Text field, max 255 characters |
| **NOT NULL** | `NOT NULL` | Field is required, cannot be empty |
| **UNIQUE** | `UNIQUE` | No duplicates allowed (email must be unique) |
| **TIMESTAMP** | `TIMESTAMP` | Date and time (includes timezone) |
| **CURRENT_TIMESTAMP** | `DEFAULT CURRENT_TIMESTAMP` | Auto-set to now() on insert |

### Try This:

In Railway web terminal:
```sql
\d users  -- Shows table structure

-- Output shows:
--  Column  |  Type  | Collation | Nullable | Default
-- ---------+--------+-----------+----------+---------
--  id      | uuid   |           | not null | uuid_generate_v4()
--  name    | varchar|           | not null |
```

---

## 4. CREATE INDEX - Speed Up Queries

### What is an Index?

Index = like a book's table of contents. Without it, PostgreSQL must read every row to find data. With index, it can jump directly to matching data.

**File:** `src/db/schema.sql`

```sql
-- Index on email (used in WHERE clauses)
CREATE INDEX idx_users_email ON users(email);

-- Index on created_at (used for sorting)
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Index on name (used for LIKE searches)
CREATE INDEX idx_users_name ON users(name);
```

### When to Use Indexes:
- ✅ Columns in WHERE clauses
- ✅ Columns used for sorting (ORDER BY)
- ✅ Columns used for LIKE search
- ❌ Don't index everything (slows down INSERT/UPDATE)

### See Indexes:

```sql
\di  -- List all indexes

-- Or check specific table:
SELECT * FROM pg_indexes WHERE tablename = 'users';
```

### Learn:
- Indexes speed up READ queries (SELECT)
- Indexes slow down WRITE queries (INSERT, UPDATE, DELETE)
- Email already has index (UNIQUE constraint auto-indexes)

---

## 5. INSERT - Create Data

### Basic INSERT

**File:** `src/lib/queries.ts` → `createUser()`

```sql
INSERT INTO users (name, email, phone, country) 
VALUES ($1, $2, $3, $4) 
RETURNING id, name, email, phone, country, created_at, updated_at;
```

### Concepts:

| Part | Meaning |
|------|---------|
| `INSERT INTO users` | Insert into users table |
| `(name, email, ...)` | Column names |
| `VALUES ($1, $2, ...)` | Placeholder parameters |
| `RETURNING *` | Return the inserted row back |

### Example:

```typescript
// JavaScript code
const user = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-555-1234',
  country: 'USA'
});

// Generated SQL:
// INSERT INTO users (name, email, phone, country) 
// VALUES ('John Doe', 'john@example.com', '+1-555-1234', 'USA') 
// RETURNING id, name, email, phone, country, created_at, updated_at;

// Returns:
{
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-555-1234',
  country: 'USA',
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z'
}
```

### Why RETURNING?

Without RETURNING, you'd have to:
1. Insert the row
2. Query again to get the id and timestamps

RETURNING saves a database round-trip. ✨

---

## 6. SELECT - Read Data

### Get All Users (with Pagination)

**File:** `src/lib/queries.ts` → `getUsers()`

```sql
SELECT id, name, email, phone, country, created_at, updated_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;
```

### Concepts:

| Part | Meaning |
|------|---------|
| `SELECT columns` | Choose which columns to return |
| `FROM users` | From which table |
| `ORDER BY created_at DESC` | Sort by newest first (DESC = descending) |
| `LIMIT 10` | Return max 10 rows |
| `OFFSET 0` | Skip 0 rows (page 1) |

### Pagination Math:

```
Page 1: OFFSET 0,  LIMIT 10  (rows 0-9)
Page 2: OFFSET 10, LIMIT 10  (rows 10-19)
Page 3: OFFSET 20, LIMIT 10  (rows 20-29)

Formula: OFFSET = (page - 1) * limit
```

### Get Single User

```sql
SELECT id, name, email, phone, country, created_at, updated_at 
FROM users 
WHERE id = $1;
```

### Concepts:

| Part | Meaning |
|------|---------|
| `WHERE id = $1` | Filter to only row matching id |
| `$1` | First parameter (the user id) |

### Count Rows

```sql
SELECT COUNT(*) as count 
FROM users;

-- Returns: { count: '42' } -- 42 users total
```

---

## 7. WHERE - Filter Data

### Basic WHERE

```sql
-- Exact match
WHERE id = 'a1b2c3d4...'

-- Multiple conditions
WHERE name = 'John' AND email = 'john@example.com'

-- OR condition
WHERE country = 'USA' OR country = 'Canada'

-- Comparison
WHERE created_at > '2024-01-01'
WHERE age >= 18
WHERE price < 100
```

### Examples from App:

```typescript
// Get user by ID
const user = await query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Search by email
const user = await query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

---

## 8. ILIKE - Case-Insensitive Search

### What's the Difference?

```sql
-- LIKE (case-sensitive)
WHERE name LIKE 'john'  -- ❌ Won't match 'John' or 'JOHN'

-- ILIKE (case-insensitive)
WHERE name ILIKE 'john'  -- ✅ Matches 'john', 'John', 'JOHN'
```

### Wildcards:

```sql
-- Starts with
WHERE name ILIKE 'john%'  -- Matches: john, johnny, John Doe

-- Ends with
WHERE email ILIKE '%@gmail.com'  -- Matches: test@gmail.com, john@gmail.com

-- Contains anywhere
WHERE name ILIKE '%john%'  -- Matches: john, Johnson, ajohn

-- Exact match (no wildcards)
WHERE name ILIKE 'john'  -- Only john (case-insensitive)
```

### In UserForge:

**File:** `src/lib/queries.ts` → `searchUsers()`

```sql
SELECT * FROM users 
WHERE name ILIKE '%search%' OR email ILIKE '%search%'
ORDER BY created_at DESC;
```

This searches both name AND email for the search term (case-insensitive).

---

## 9. UPDATE - Modify Data

### Update One Column

**File:** `src/lib/queries.ts` → `updateUser()`

```sql
UPDATE users 
SET name = $1 
WHERE id = $2
RETURNING id, name, email, phone, country, created_at, updated_at;
```

### Update Multiple Columns

```sql
UPDATE users 
SET name = $1, email = $2, phone = $3 
WHERE id = $4
RETURNING *;
```

### Auto-Update Timestamps

```sql
UPDATE users 
SET email = $1, updated_at = CURRENT_TIMESTAMP 
WHERE id = $2
RETURNING *;
```

**CURRENT_TIMESTAMP** updates the timestamp to current server time (not client time).

### Concepts:

| Part | Meaning |
|------|---------|
| `UPDATE users` | Update users table |
| `SET column = $1` | Set column to parameter value |
| `WHERE id = $2` | Only update matching id |
| `RETURNING *` | Return updated row |

---

## 10. DELETE - Remove Data

### Delete by ID

**File:** `src/lib/queries.ts` → `deleteUser()`

```sql
DELETE FROM users 
WHERE id = $1;
```

### Concepts:

| Part | Meaning |
|------|---------|
| `DELETE FROM users` | Delete from users table |
| `WHERE id = $1` | Only delete matching id |

### ⚠️ Caution:

```sql
-- ❌ DANGEROUS - deletes all users!
DELETE FROM users;

-- ✅ SAFE - deletes only one user
DELETE FROM users WHERE id = $1;
```

Always use WHERE clause in DELETE!

### Soft Deletes (Better Approach)

Real apps often don't permanently delete - they "soft delete":

```sql
-- Add deleted_at column
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- "Delete" by marking timestamp
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1;

-- Query ignores deleted rows
SELECT * FROM users WHERE deleted_at IS NULL;
```

---

## 11. Transactions - Atomic Operations

### What is a Transaction?

A transaction groups multiple SQL statements. Either ALL succeed or ALL fail (no partial updates).

### Example (Manual Transaction)

```typescript
const client = await getClient();
try {
  await client.query('BEGIN');  // Start transaction
  
  // Multiple operations
  await client.query('INSERT INTO users ...', [...]);
  await client.query('UPDATE users ...', [...]);
  
  // If we get here, commit
  await client.query('COMMIT');
} catch (error) {
  // If anything fails, rollback
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();  // Return client to pool
}
```

### Key Points:
- **BEGIN:** Start transaction
- **COMMIT:** Save all changes (if successful)
- **ROLLBACK:** Undo all changes (if error)

### Real World Example:

Bank transfer (user A sends $100 to user B):

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;  -- A loses $100
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;  -- B gains $100
COMMIT;  -- Both succeed or both fail
```

Without transaction: A loses money but B doesn't receive it (disaster!)

---

## 12. EXPLAIN ANALYZE - Query Performance

### See Query Execution Plan

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### Output Explained:

```
                                        QUERY PLAN
Seq Scan on users  (cost=0.00..35.50 rows=1 width=250)
  Filter: (email = 'test@example.com'::text)

Planning Time: 0.087 ms
Execution Time: 0.125 ms
```

### Interpretation:

- **Seq Scan** = Sequential scan (slow - reads all rows)
- **cost=0.00..35.50** = 35.50 arbitrary cost units
- **rows=1** = Expects to find 1 row
- **Execution Time: 0.125 ms** = Query took 0.125 milliseconds

### With Index:

```
Index Scan using idx_users_email on users  (cost=0.29..8.30 rows=1)
  Index Cond: (email = 'test@example.com'::text)

Execution Time: 0.024 ms  -- Much faster!
```

### Optimization Tips:
1. Look for "Seq Scan" - indicates no index used
2. Compare execution time with/without index
3. Look for "Full table scan" with millions of rows
4. Use LIMIT to test before running huge queries

---

## 13. Common Errors & Solutions

### "relation \"users\" does not exist"

```sql
-- Schema not created
-- Solution: Run src/db/schema.sql in Railway web terminal
```

### "duplicate key value violates unique constraint"

```sql
-- Tried to insert email that already exists
-- Solution: Use different email or update existing user
```

### "too many connections"

```typescript
// Connection pool exhausted
// Solution: Increase max in src/lib/db.ts
const pool = new Pool({
  max: 50,  // Increase from 20
});
```

### "column \"xyz\" does not exist"

```sql
-- Typo in column name or schema mismatch
-- Solution: Check \d users to see actual columns
```

### Query Timeout

```sql
-- Query running too long
-- Solution: Add index, limit results, optimize query
SELECT * FROM users LIMIT 1000 OFFSET 0;  -- Test pagination
```

---

## 14. SQL Cheat Sheet

### Quick Reference

```sql
-- CREATE TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEX
CREATE INDEX idx_users_email ON users(email);

-- INSERT
INSERT INTO users (name, email) 
VALUES ('John', 'john@example.com') 
RETURNING *;

-- SELECT ALL
SELECT * FROM users;

-- SELECT WITH WHERE
SELECT * FROM users WHERE email = 'john@example.com';

-- SELECT WITH ILIKE
SELECT * FROM users WHERE name ILIKE '%john%';

-- SELECT WITH ORDER BY
SELECT * FROM users ORDER BY created_at DESC;

-- SELECT WITH LIMIT/OFFSET
SELECT * FROM users LIMIT 10 OFFSET 20;

-- SELECT COUNT
SELECT COUNT(*) FROM users;

-- UPDATE
UPDATE users SET name = 'Jane' WHERE id = '...';

-- DELETE
DELETE FROM users WHERE id = '...';

-- View indexes
\di

-- View table structure
\d users

-- View execution plan
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Exit psql
\q
```

---

## 15. Next Learning Steps

1. **Read src/lib/queries.ts** - See all SQL functions with comments
2. **Try modifying queries** - Change WHERE, ORDER BY, LIMIT
3. **Run EXPLAIN ANALYZE** - See query performance
4. **Add new columns** - Modify schema, update queries
5. **Create relationships** - Add foreign keys between tables
6. **Learn transactions** - Group multiple operations
7. **Study PostgreSQL docs** - https://www.postgresql.org/docs/

---

Happy learning! 🚀


