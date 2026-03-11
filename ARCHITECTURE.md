# UserForge - Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (Frontend)                        │
├──────────────────────────────────────┬──────────────────────────┤
│  Next.js App Router (Client + Server)│  Environment Variables   │
│                                      │  - DATABASE_URL          │
│  Pages:                              │  - NODE_ENV              │
│  ├─ page.tsx (Home)                  │                          │
│  ├─ users/page.tsx (List)            │  Auto-deployed on        │
│  ├─ users/add/page.tsx (Create)      │  git push origin main    │
│  └─ users/[id]/edit/page.tsx (Edit)  │                          │
└──────────────────────────────────────┴──────────────────────────┘
                           ↕
              ┌────────────────────────┐
              │   Next.js API Routes   │
              │   (Serverless)         │
              ├────────────────────────┤
              │ /api/users             │
              │ /api/users/[id]        │
              │ /api/users/search      │
              └────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                   Application Layer (Node.js)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Database Connection Pool (pg)                                 │
│  ├─ Max 20 connections                                         │
│  ├─ Idle timeout: 30s                                          │
│  └─ Connection timeout: 2s                                     │
│                                                                  │
│  Query Functions (src/lib/queries.ts)                          │
│  ├─ getUsers()      → SELECT ... LIMIT OFFSET                 │
│  ├─ getUserById()   → SELECT ... WHERE id = $1                │
│  ├─ searchUsers()   → SELECT ... WHERE ILIKE                  │
│  ├─ createUser()    → INSERT ... RETURNING                    │
│  ├─ updateUser()    → UPDATE ... SET ... RETURNING            │
│  └─ deleteUser()    → DELETE ... WHERE                        │
│                                                                  │
│  Error Handling:                                               │
│  ├─ Unique constraint violations (23505)                      │
│  ├─ Connection errors                                         │
│  └─ Query timeouts                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           ↕
            ┌──────────────────────────────┐
            │  Prepared Statements ($1, $2)|
            │  SQL Injection Prevention    │
            └──────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                 RAILWAY (PostgreSQL Database)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Table: users                                                   │
│  ├─ id (UUID) PRIMARY KEY                                      │
│  ├─ name VARCHAR(255) NOT NULL                                │
│  ├─ email VARCHAR(255) NOT NULL UNIQUE                        │
│  ├─ phone VARCHAR(20)                                          │
│  ├─ country VARCHAR(100)                                       │
│  ├─ created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP            │
│  └─ updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP            │
│                                                                  │
│  Indexes:                                                       │
│  ├─ idx_users_email        → Fast email lookups               │
│  ├─ idx_users_created_at   → Fast date sorting                │
│  └─ idx_users_name         → Fast LIKE search                 │
│                                                                  │
│  Constraints:                                                   │
│  ├─ PRIMARY KEY (id)       → Unique row identifier             │
│  ├─ UNIQUE (email)         → No duplicate emails               │
│  └─ NOT NULL               → Required fields                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow

### Example: Create User

```
1. USER SUBMITS FORM
   ┌──────────────────────────────────┐
   │ Name: John Doe                   │
   │ Email: john@example.com          │
   │ Phone: +1-555-1234               │
   │ Country: USA                     │
   │ [Create User Button]             │
   └──────────────────────────────────┘
                    ↓
2. FORM VALIDATION (Frontend)
   ├─ Check name not empty ✓
   ├─ Check email format ✓
   └─ Create FormData
                    ↓
3. POST REQUEST
   POST /api/users
   Content-Type: application/json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "phone": "+1-555-1234",
     "country": "USA"
   }
                    ↓
4. API ROUTE RECEIVES (route.ts)
   ├─ Extract body
   ├─ Validate required fields
   └─ Call createUser()
                    ↓
5. DATABASE LAYER (queries.ts)
   ├─ Build prepared SQL:
   │  INSERT INTO users (name, email, phone, country)
   │  VALUES ($1, $2, $3, $4)
   │  RETURNING id, name, email, phone, country, created_at, updated_at
   ├─ Escape parameters: [name, email, phone, country]
   └─ Execute query
                    ↓
6. CONNECTION POOL
   ├─ Get connection from pool
   ├─ Send query to PostgreSQL
   └─ Return connection to pool
                    ↓
7. POSTGRESQL EXECUTES
   ├─ Parse prepared statement
   ├─ Validate constraints:
   │  ├─ email UNIQUE? (check index)
   │  ├─ name NOT NULL? ✓
   │  └─ email NOT NULL? ✓
   ├─ Generate UUID for id
   ├─ Set created_at = CURRENT_TIMESTAMP
   ├─ Insert row
   └─ Return all columns
                    ↓
8. RESPONSE TO APP
   {
     "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
     "name": "John Doe",
     "email": "john@example.com",
     "phone": "+1-555-1234",
     "country": "USA",
     "created_at": "2024-01-15T10:30:00.000Z",
     "updated_at": "2024-01-15T10:30:00.000Z"
   }
                    ↓
9. API RETURNS JSON
   ├─ Status: 201 Created
   ├─ Body: User object (from step 8)
   └─ Headers: Content-Type: application/json
                    ↓
10. FRONTEND PROCESSES RESPONSE
    ├─ Parse JSON
    ├─ Update state
    └─ Redirect to /users
                    ↓
11. USER SEES
    ✓ User successfully created!
    ✓ Redirected to users list
    ✓ John Doe appears in table
```

---

## 📊 Database Query Examples

### List Users (with pagination)

```
Frontend Request:
GET /api/users?page=2&limit=10

App Logic:
─────────
const offset = (2 - 1) * 10 = 10
const limit = 10

SQL Query:
──────────
SELECT COUNT(*) as count FROM users;
→ Returns: 42 total users

SELECT id, name, email, phone, country, created_at, updated_at
FROM users
ORDER BY created_at DESC
LIMIT 10 OFFSET 10;
→ Returns: rows 11-20

Response:
─────────
{
  "success": true,
  "data": {
    "users": [
      { id: "...", name: "John", email: "john@example.com", ... },
      { id: "...", name: "Jane", email: "jane@example.com", ... },
      ...
    ],
    "total": 42,
    "pages": 5
  }
}
```

### Search Users

```
Frontend Request:
GET /api/users/search?q=john

SQL Query:
──────────
ILIKE '%john%' matches: john, John, JOHN, johnny, johnson, etc.

SELECT id, name, email, ...
FROM users
WHERE name ILIKE '%john%' OR email ILIKE '%john%'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

Response:
─────────
{
  "success": true,
  "data": {
    "users": [
      { name: "John Doe", email: "john@example.com", ... },
      { name: "Johnny Smith", email: "johnny@example.com", ... },
      ...
    ],
    "total": 3,
    "pages": 1
  }
}
```

### Update User

```
Frontend Request:
PUT /api/users/a1b2c3d4-...
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

SQL Query:
──────────
UPDATE users
SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
WHERE id = $3
RETURNING *;

Parameters: ["Jane Doe", "jane@example.com", "a1b2c3d4-..."]

Response:
─────────
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    ...
    "updated_at": "2024-01-15T11:45:00.000Z"  ← Updated!
  }
}
```

---

## 🔐 Security Layers

```
ATTACK: SQL Injection
───────────────────
Attacker tries: email = "test@test.com'; DROP TABLE users; --"

Vulnerable Code (❌):
query(`SELECT * FROM users WHERE email = '${email}'`)
→ Would execute: SELECT * FROM users WHERE email = 'test@test.com'; DROP TABLE users; --'

Safe Code (✅):
query('SELECT * FROM users WHERE email = $1', [email])
→ PostgreSQL treats email as DATA, not CODE
→ Executes safely: SELECT * FROM users WHERE email = 'test@test.com'; DROP TABLE users; --'
→ No table dropped!

ATTACK: Duplicate Email
───────────────────────
Attacker tries: Create user with email that already exists

Database Constraint:
UNIQUE(email) at database level
↓
PostgreSQL rejects with error: "duplicate key value violates unique constraint"
↓
API returns: { success: false, error: "Email already exists" }
↓
User sees friendly error message
→ Cannot bypass constraint from application code!

ATTACK: Environment Variable Leak
──────────────────────────────────
Never commit .env.local to git (.gitignore protects this)
DATABASE_URL stored safely in Vercel environment variables
→ Not visible in source code
→ Not visible in git history
→ Only accessible within Vercel functions
```

---

## 📈 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ pages:                                                    │ │
│  │ - /                    (Home with info)                  │ │
│  │ - /users               (List, search, pagination)        │ │
│  │ - /users/add           (Create form)                     │ │
│  │ - /users/[id]/edit     (Edit form)                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                      ↕ Fetch API
            User clicks / Submits form
            Browser sends HTTP request
                      ↕
┌────────────────────────────────────────────────────────────────┐
│                VERCEL (Deployment Platform)                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Next.js API Routes (Route Handlers)                       │ │
│  │                                                           │ │
│  │ POST /api/users              (Create)                   │ │
│  │ GET  /api/users              (List)                     │ │
│  │ GET  /api/users/[id]         (Get one)                  │ │
│  │ PUT  /api/users/[id]         (Update)                   │ │
│  │ DELETE /api/users/[id]       (Delete)                   │ │
│  │ GET  /api/users/search       (Search)                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                      ↕ Calls                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ src/lib/queries.ts (SQL Functions)                        │ │
│  │                                                           │ │
│  │ getUsers()      ← SELECT with LIMIT/OFFSET              │ │
│  │ getUserById()   ← SELECT with WHERE                      │ │
│  │ searchUsers()   ← SELECT with ILIKE                      │ │
│  │ createUser()    ← INSERT with RETURNING                  │ │
│  │ updateUser()    ← UPDATE with RETURNING                  │ │
│  │ deleteUser()    ← DELETE with WHERE                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                      ↕ Executes SQL                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ src/lib/db.ts (Connection Pool)                           │ │
│  │                                                           │ │
│  │ PostgreSQL Pool:                                         │ │
│  │ - Maintains 20 connections                              │ │
│  │ - Reuses connections (don't create new each time)       │ │
│  │ - Escapes parameters ($1, $2, ...)                      │ │
│  │ - Logs queries to console                               │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                      ↕ TCP Connection
              (Environment: DATABASE_URL)
                      ↕
┌────────────────────────────────────────────────────────────────┐
│               RAILWAY (PostgreSQL Database)                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ users table:                                              │ │
│  │                                                           │ │
│  │ id | name | email | phone | country | created_at | ...  │ │
│  │ ──────────────────────────────────────────────────────── │ │
│  │ UUID | TEXT | TEXT | TEXT | TEXT | TIMESTAMP | ...       │ │
│  │                                                           │ │
│  │ Indexes:                                                 │ │
│  │ - idx_users_email      (speed up WHERE email =...)      │ │
│  │ - idx_users_created_at (speed up ORDER BY created_at)   │ │
│  │ - idx_users_name       (speed up ILIKE search)          │ │
│  │                                                           │ │
│  │ Constraints:                                             │ │
│  │ - PRIMARY KEY (id)                                       │ │
│  │ - UNIQUE (email)                                         │ │
│  │ - NOT NULL (id, name, email, created_at, updated_at)    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                      ↕ Result
             PostgreSQL returns rows
                      ↕
                  [Reverse path]
            Browser receives JSON response
          Displays data or shows error message
```

---

## 📋 Component Interaction Matrix

| Component | Communicates With | How | Purpose |
|-----------|-------------------|-----|---------|
| Browser | Next.js API Routes | HTTP(S) | Send requests, get responses |
| Pages | API Routes | fetch() | Load/update data |
| API Routes | queries.ts | Function calls | Execute SQL |
| queries.ts | db.ts Pool | pool.query() | Execute SQL safely |
| db.ts Pool | PostgreSQL | TCP + Protocol | Send queries, get results |
| PostgreSQL | Disk | Read/Write | Persist data |

---

## 🔄 State Management Flow

```
User Action:
├─ Click "Add User"
│  └─ Navigate to /users/add
│
├─ Fill form
│  └─ Update local component state
│
├─ Click "Create User"
│  ├─ Validate form (frontend)
│  ├─ POST /api/users
│  ├─ Wait for response
│  │  ├─ Server validates
│  │  ├─ Insert into database
│  │  ├─ Return user object
│  │  └─ Client receives response
│  ├─ If success:
│  │  ├─ Redirect to /users
│  │  └─ Fetch users list (page 1)
│  └─ If error:
│     ├─ Show error message
│     └─ Keep form state
│
├─ View users list
│  ├─ GET /api/users?page=1&limit=10
│  ├─ Display in table
│  └─ Show pagination buttons
│
├─ Search users
│  ├─ Type "john" in search
│  ├─ Click Search
│  ├─ GET /api/users/search?q=john
│  ├─ Display results
│  └─ Reset pagination to page 1
│
└─ Edit user
   ├─ Click "Edit" on user row
   ├─ GET /api/users/{id}
   ├─ Load form with data
   ├─ Modify fields
   ├─ Click "Save"
   ├─ PUT /api/users/{id}
   ├─ Redirect to list
   └─ Show updated user
```

---

**This architecture ensures:**
✅ Type-safe queries (prepared statements)
✅ Scalable connections (connection pooling)
✅ Fast data access (indexes)
✅ Data integrity (constraints)
✅ Easy deployment (Vercel + Railway)
✅ Clear separation of concerns


