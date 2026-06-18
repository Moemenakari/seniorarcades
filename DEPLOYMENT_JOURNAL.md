# NLG Arcade Hub — Complete Deployment Journal
**Project:** Senior Graduation Project — NLG Arcade Hub (Lebanon)
**Date:** June 2026
**Goal:** Deploy a full-stack arcade rental platform for free online

---

## What We Built

A full-stack web application for NLG (Next Level Game), Lebanon's arcade entertainment company.
Three parts: public website, admin dashboard, and backend API.

---

## Step 1 — Chose the Free Deployment Stack

**Problem:** Need to host database, backend, frontend, and images — all for free.

**Decision:**

| Service | Provider | Why |
|---|---|---|
| Database | Supabase (PostgreSQL) | 500MB free, reliable, fast setup |
| Image Storage | Supabase Storage | No new account needed, 1GB free |
| Backend (Node.js) | Render.com | Free tier, auto-deploy from GitHub |
| Frontend (React) | Vercel | Best for React, CDN, free |
| Admin Panel (React) | Vercel | Same as frontend, separate project |

**Rejected alternatives:**
- TiDB Cloud — more complex setup
- Cloudinary — not available in Lebanon
- SQLite on Render — data lost on every redeploy (no persistence on free tier)

---

## Step 2 — Deleted Old Deployment Files

Old files were broken/outdated, so we removed:
- `render.yaml` (root)
- `admin/vercel.json`
- `frontend/vercel.json`

---

## Step 3 — Created Supabase Project

1. Went to supabase.com → New Project
2. Project name: `nlg`
3. Database password: `17june2025M@`
4. Region: EU West (closest to Lebanon)
5. Project ID assigned: `bvkxvzfyhcklulpvklni`

---

## Step 4 — Migrated Database: SQLite → PostgreSQL

**Problem:** The entire backend was built with `better-sqlite3` (synchronous SQLite).
PostgreSQL uses async calls — completely different API.

**What we changed in every file:**

### 4a — Rewrote `backend/config/db.js`

Created a PostgreSQL adapter that mimics the better-sqlite3 API so we didn't have to rewrite every controller from scratch.

Key techniques used:
- `pg` Pool for connection management
- `AsyncLocalStorage` to propagate transaction clients through nested async calls
- `.prepare(sql).get/all/run()` methods that return Promises
- `transaction(fn)` that uses BEGIN/COMMIT/ROLLBACK

```javascript
const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required by Supabase
});

const txStorage = new AsyncLocalStorage();
```

### 4b — Converted All SQL Syntax

Every SQL query had to be updated:

| SQLite | PostgreSQL |
|---|---|
| `?` placeholder | `$1, $2, $3...` |
| `datetime('now')` | `NOW()` |
| `strftime('%Y-%m', date)` | `TO_CHAR(date, 'YYYY-MM')` |
| `INSERT OR IGNORE` | `INSERT ... ON CONFLICT DO NOTHING` |
| `ROUND(AVG(...), 1)` | `ROUND(AVG(...)::numeric, 1)` |
| `"user"` column | Must quote — reserved word in PostgreSQL |

### 4c — Made All Controllers Async

9 controllers were rewritten to use `await`:
- `event.controller.js`
- `finance.controller.js`
- `auth.controller.js`
- `product.controller.js`
- `client.controller.js`
- `archive.controller.js`
- `dashboard.controller.js`
- `rating.controller.js`
- `sponsorship.controller.js`

Also updated `backend/utils/logger.js` — used fire-and-forget pattern with `.catch()` since logging shouldn't block responses.

### 4d — Updated `backend/package.json`

```
Removed: better-sqlite3
Added:   pg ^8.21.0
```

---

## Step 5 — Created PostgreSQL Schema

Created `backend/schema.sql` with 17 tables:

```
clients, events, products, expenses, income, debts, payments,
archive_events, archive_financials, finance_logs, settings,
audit_logs, locations, users, game_ratings, platform_ratings,
sponsorship_gallery
```

Key PostgreSQL syntax used:
- `BIGSERIAL PRIMARY KEY` (auto-increment)
- `TIMESTAMPTZ` (timestamp with timezone)
- `NUMERIC(10,2)` for money
- `UNIQUE` constraints for ON CONFLICT to work

Also inserted default data:
- `ticker_text` setting
- 7 default sponsorship gallery images

**Ran in Supabase:** Settings → SQL Editor → paste schema.sql → Run
**Result:** "Success. No rows returned" ✅

---

## Step 6 — Connected Backend to Supabase

**Problem 1:** First tried Direct Connection → got `ENOTFOUND` error
```
db.bvkxvzfyhcklulpvklni.supabase.co  ← this host doesn't resolve
```

**Fix:** Switch to Transaction Pooler URL:
```
aws-0-eu-west-1.pooler.supabase.com:6543
```
With user format: `postgres.bvkxvzfyhcklulpvklni`

**Problem 2:** Password `17june2025M@` has `@` symbol — breaks URL parsing
```
postgresql://postgres.xxx:17june2025M@@host  ← double @@ breaks it
```

**Fix:** URL-encode the `@` as `%40`:
```
DATABASE_URL=postgresql://postgres.bvkxvzfyhcklulpvklni:17june2025M%40@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Result:**
```
🚀 NLG Backend running on http://localhost:5000
✅ PostgreSQL connected successfully
```

---

## Step 7 — Set Up Supabase Storage (for Images)

**Why Supabase Storage instead of Cloudinary:**
Cloudinary is not available/accessible in Lebanon. Supabase Storage is already included in the same project — no new account needed.

### Steps:

1. In Supabase → Storage → New bucket
2. Name: `images`
3. Enable: **Public bucket** (anyone can view images)
4. Click Create

### Got API Keys from Supabase → Settings → API:

- `SUPABASE_URL`: `https://bvkxvzfyhcklulpvklni.supabase.co`
- `SUPABASE_SERVICE_KEY`: the `service_role` JWT (long token) — bypasses all RLS restrictions, only used server-side

### Created new files:

**`backend/utils/supabaseStorage.js`**
- `uploadImage(buffer, mimetype, filename)` → returns public URL
- `deleteImage(publicUrl)` → removes from bucket

**`backend/routes/upload.routes.js`**
- `POST /api/upload` — accepts multipart/form-data, field name `image`, max 5MB
- `DELETE /api/upload` — accepts `{ url }` in body

### Installed packages:

```bash
npm install @supabase/supabase-js multer
```

### Verified:
```bash
node -e "require('@supabase/supabase-js')..."
# Result: Buckets: [ 'images' ] ✅
```

---

## Step 8 — Fixed `server.js` Inline Routes

The inline routes in `server.js` (locations, settings) still used SQLite `?` placeholders.
Fixed all to use `$1, $2, $3` PostgreSQL syntax.

Also added the new upload route:
```javascript
app.use('/api/upload', adminProtect, uploadRoutes);
```

---

## Step 9 — Created `render.yaml`

```yaml
services:
  - type: web
    name: nlg-arcade-backend
    runtime: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
```

---

## Step 10 — Pushed Everything to GitHub

Repository: `https://github.com/Moemenakari/seniorarcades`
Branch: `main`

```bash
git add backend/ render.yaml
git commit -m "Migrate backend to PostgreSQL + Supabase Storage"
git push origin main
```

---

## Step 11 — Deployed Backend on Render

1. Went to render.com → Sign up with GitHub
2. New → Web Service
3. Connected repo: `seniorarcades`
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

5. Added Environment Variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.bvkxvzfyhcklulpvklni:17june2025M%40@aws-0-eu-west-1.pooler.supabase.com:6543/postgres` |
| `SUPABASE_URL` | `https://bvkxvzfyhcklulpvklni.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `<service_role JWT>` |
| `JWT_SECRET` | `nlg_arcade_super_secret_jwt_2024` |
| `ADMIN_MASTER_KEY` | `admin123` |

6. Clicked **Create Web Service**

**Deploy Logs (success):**
```
==> Build successful 🎉
🚀 NLG Backend running on http://localhost:10000
✅ PostgreSQL connected successfully
==> Your service is live 🎉
==> Available at https://nlg-arcade-backend.onrender.com
```

**Verified:**
```bash
curl https://nlg-arcade-backend.onrender.com/api/health
# {"status":"OK","message":"NLG Backend Running"}
```

---

## Step 12 — Created `vercel.json` Files

Both frontend and admin use React Router (client-side routing).
Without this file, refreshing any page shows 404 on Vercel.

**`frontend/vercel.json`** and **`admin/vercel.json`:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Step 13 — Deployed Frontend on Vercel

1. vercel.com → Add New → Project
2. Import `seniorarcades` repo
3. Settings:
   - Root Directory: `frontend`
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Environment Variable:
   - `REACT_APP_API_URL` = `https://nlg-arcade-backend.onrender.com/api`
5. Deploy

**Live URL:** `https://nlgarcadesforevents.vercel.app`

---

## Step 14 — Deployed Admin Panel on Vercel

Same as frontend, but:
- Root Directory: `admin`
- Project Name: `nlg-arcade-admin`

**Live URL:** `https://nlg-arcade-admin.vercel.app`

---

## Step 15 — Added CORS Origins on Render

The backend was blocking requests from Vercel due to CORS.

Added in Render → Environment:
```
ALLOWED_ORIGINS=https://nlgarcadesforevents.vercel.app,https://nlg-arcade-admin.vercel.app
```

Clicked **Save, rebuild, and deploy** → ✅

---

## Step 16 — Fixed Hero Title

Changed in `frontend/src/components/Hero.tsx`:
```
Before: "Rent or Buy Arcade Games"
After:  "Rent or Sell Arcade Games"
```

---

## Final Result

| Item | Value |
|---|---|
| Frontend | https://nlgarcadesforevents.vercel.app |
| Admin | https://nlg-arcade-admin.vercel.app |
| Backend API | https://nlg-arcade-backend.onrender.com |
| Health Check | https://nlg-arcade-backend.onrender.com/api/health |
| GitHub Repo | https://github.com/Moemenakari/seniorarcades |

### Admin Login
- Username: `moemen` or `abd`
- Password: `admin123`

### How Passwords Are Stored
- User passwords → hashed with `bcryptjs` (10 salt rounds)
- Admin password → hardcoded check in frontend + master key header in backend
- Database password → URL-encoded in `DATABASE_URL` env var (never committed to git)
- JWT tokens → 30-day expiry, stored in HttpOnly cookies

---

## Problems We Solved

| Problem | Solution |
|---|---|
| SQLite sync API vs PostgreSQL async | Wrapper with AsyncLocalStorage for transactions |
| `?` placeholders don't work in pg | Converted all to `$1, $2, $3` |
| Transaction client not propagating | AsyncLocalStorage stores pg client per transaction |
| `ENOTFOUND` on direct DB connection | Switched to Transaction Pooler (port 6543) |
| `@@` double at-sign in DATABASE_URL | URL-encode `@` as `%40` in password |
| Cloudinary not in Lebanon | Replaced with Supabase Storage (same project) |
| React Router 404 on Vercel refresh | Added `vercel.json` rewrite rule |
| CORS blocking Vercel → Render | Added `ALLOWED_ORIGINS` env var |
| SQLite date functions in PostgreSQL | `datetime('now')` → `NOW()`, `strftime` → `TO_CHAR` |
| `user` reserved word in PostgreSQL | Quoted as `"user"` in SQL |
