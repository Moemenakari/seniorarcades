# NLG Arcade Hub — Full-Stack Application

**Next Level Game (NLG)** — Lebanon's premier arcade entertainment company.  
This repository contains the complete full-stack web application: public website, admin dashboard, and backend API.

---

## Live URLs

| Service | URL |
|---|---|
| 🌐 Frontend (Public Website) | https://nlgarcadesforevents.vercel.app |
| 🛠 Admin Panel | https://nlg-arcade-admin.vercel.app |
| ⚙️ Backend API | https://nlg-arcade-backend.onrender.com |
| 🗄 Database | Supabase PostgreSQL (eu-west-1) |
| 🖼 Image Storage | Supabase Storage — bucket: `images` |

---

## Admin Access

Admins are rows in the `users` table with role `super` or `admin`. There are no
default accounts and no credentials in this repository.

Create or update one:

```bash
cd backend
node scripts/create-admin.js      # prompts for name, phone, role, password
```

| Role | Can do |
|---|---|
| `super` | Everything, including starting a new financial cycle and resetting data |
| `admin` | Everything except the owner-only actions above |

Sign in at the admin panel with the username and password you set. The panel
sends the JWT as `Authorization: Bearer <token>`; every admin route verifies the
signature and the role server-side.

### Forgot the admin password?

You cannot lock yourself out. Run the same script with the **same username** and
it updates that account's password instead of creating a second one:

```bash
cd backend
node scripts/create-admin.js
```

Enter the existing username, pick a new password, done. Passwords are stored as
bcrypt hashes — nobody, including this repository, can read the old one back.

---

## Frontend User Accounts

Users register on the public website with:
- Name
- Phone number
- Password (min 4 characters)

Passwords are hashed with **bcryptjs** (10 salt rounds) before storage.  
Authentication uses **JWT tokens** (30-day expiry) sent as `Authorization: Bearer`.

No default user accounts exist — users must register.

### Session storage: known trade-off

The token lives in `localStorage`, which **any XSS on the page can read**. It is
there because the API (`onrender.com`) and the sites (`vercel.app`) are different
origins, so an `HttpOnly` cookie would be a third-party cookie — blocked by
default in Safari and being phased out in Chrome.

**The stronger setup, for when there is time:** add a Vercel rewrite that proxies
`/api/*` from the front-end's own domain to the Render URL. That makes the API
same-origin, so the token can move into a first-party `HttpOnly` cookie that
JavaScript cannot read. This needs no custom domain — it works on `vercel.app`.

```json
// frontend/vercel.json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR-RENDER-URL.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Switching also means: re-adding `Set-Cookie` in `auth.controller.js`, reading the
cookie in `auth.middleware.js` and `admin.middleware.js`, restoring
`credentials: true` in CORS and `credentials: 'include'` on the front-end fetches.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS, Framer Motion, shadcn/ui |
| Admin Panel | React 18, JavaScript, TailwindCSS, Recharts, Axios |
| Backend | Node.js, Express.js, PostgreSQL (pg) |
| Database | Neon PostgreSQL (migrated from Supabase, previously SQLite) |
| Image Storage | ImageKit (migrated from Supabase Storage; Cloudinary is blocked in Lebanon) |
| Backend Hosting | Render.com (Free tier) |
| Frontend Hosting | Vercel (Free tier) |

---

## Environment Variables

### Backend (`backend/.env`)

See **`backend/.env.example`** for the authoritative list with explanations.

```env
PORT=5000
NODE_ENV=development

# Neon PostgreSQL — keep the ?sslmode=require Neon gives you
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require

# ImageKit (Developer options → API keys)
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Security — no fallbacks; the server refuses to start without these
JWT_SECRET=<long random string>

# CORS (production only)
ALLOWED_ORIGINS=https://nlgarcadesforevents.vercel.app,https://nlg-arcade-admin.vercel.app
```

> `ADMIN_MASTER_KEY` no longer exists. Admin access is a database account —
> see [Admin Access](#admin-access).

### Frontend & Admin (set in Vercel dashboard)

```env
REACT_APP_API_URL=https://nlg-arcade-backend.onrender.com/api
```

---

## Deployment

### Backend → Render.com

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect GitHub repo `seniorarcades`
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add all environment variables from the list above
5. Click **Deploy**

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import `seniorarcades` repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add env var: `REACT_APP_API_URL=https://nlg-arcade-backend.onrender.com/api`
5. Deploy

### Admin → Vercel

Same as Frontend but:
- **Root Directory:** `admin`
- **Project Name:** `nlg-arcade-admin`

---

## Database

- **Provider:** Supabase (PostgreSQL)
- **Project ID:** `bvkxvzfyhcklulpvklni`
- **Region:** AWS eu-west-1 (Europe)
- **Connection:** Transaction Pooler on port `6543`
- **Schema:** Run `backend/schema.sql` in Supabase SQL Editor to initialize

### Tables (17 total)

`clients`, `events`, `products`, `expenses`, `income`, `debts`, `payments`,  
`archive_events`, `archive_financials`, `finance_logs`, `settings`, `audit_logs`,  
`locations`, `users`, `game_ratings`, `platform_ratings`, `sponsorship_gallery`

---

## Image Storage

- **Provider:** Supabase Storage
- **Bucket:** `images` (Public)
- **Upload Endpoint:** `POST /api/upload` (admin only, multipart/form-data, field: `image`)
- **Delete Endpoint:** `DELETE /api/upload` (body: `{ url }`)
- **Max file size:** 5MB
- **Allowed types:** Images only (image/*)

Images return a permanent public URL from Supabase CDN.

---

## Security

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs, 10 salt rounds |
| Auth tokens | JWT, 30-day expiry, HttpOnly cookie |
| Admin protection | Master key header `x-admin-master-key` |
| CORS | Whitelist of Vercel domains only (production) |
| SQL injection | Parameterized queries (`$1, $2...`) via `pg` |
| File upload | Type + size validation via multer |
| DB credentials | Never committed — `.env` is in `.gitignore` |

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/Moemenakari/seniorarcades.git
cd seniorarcades

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install

# Install admin
cd ../admin && npm install
```

### 2. Configure backend

Create `backend/.env` with the variables listed above.

### 3. Start services

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm start

# Admin (port 3001)
cd admin && npm start
```

---

## Project Structure

```
nlgarcades/
├── backend/
│   ├── config/db.js              # PostgreSQL adapter (AsyncLocalStorage transactions)
│   ├── controllers/              # Business logic (9 controllers)
│   ├── middleware/               # Admin auth middleware
│   ├── routes/                   # Express routes (10 route files)
│   ├── utils/
│   │   ├── logger.js             # Audit log helper
│   │   └── supabaseStorage.js    # Supabase Storage upload/delete
│   ├── schema.sql                # PostgreSQL schema (run once in Supabase)
│   ├── server.js                 # Express app entry point
│   └── .env                      # Local secrets (not committed)
│
├── frontend/                     # Public website (React + TypeScript)
│   ├── src/
│   │   ├── pages/                # Route-level pages
│   │   ├── components/           # Shared UI components
│   │   └── config.ts             # API base URL
│   └── vercel.json               # SPA routing config
│
├── admin/                        # Admin dashboard (React)
│   ├── src/
│   │   ├── pages/                # Admin pages
│   │   └── config.js             # API base URL
│   └── vercel.json               # SPA routing config
│
├── render.yaml                   # Render deployment config
└── .gitignore
```

---

## API — Key Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List all machines |
| GET | `/api/sponsorship/gallery` | Get sponsorship gallery |
| GET | `/api/locations` | Get trust bar locations |
| GET | `/api/settings` | Get site settings |
| GET | `/api/ratings/:productId` | Get game ratings |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Admin (requires `x-admin-master-key` header)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload image to Supabase Storage |
| DELETE | `/api/upload` | Delete image from Supabase Storage |
| GET | `/api/dashboard` | Dashboard KPIs |
| GET/POST/PUT/DELETE | `/api/events` | Event management |
| GET/POST/PUT/DELETE | `/api/products` | Machine catalog |
| GET/POST/PUT/DELETE | `/api/clients` | Client CRM |
| GET/POST | `/api/finances` | Finance tracking |
| GET | `/api/archive` | Archived records |

---

## Key Features

### Public Website
- Hero section with animated stats
- Arcade machine catalog with filters and search
- Individual product pages with ratings and reviews
- Services and packages page
- Sponsorship / Human Claw Machine gallery
- About Us page
- Build Your Event booking form
- Cookie consent banner
- Floating trust bar with partner locations

### Admin Panel
- Dashboard with KPIs and charts
- Full event lifecycle management
- Machine catalog (add/edit/delete + image upload)
- Client and event manager CRM
- Finance: expenses, income, debts, payments, smart calculator
- Locations management (trust bar)
- Game and platform ratings moderation
- Sponsorship gallery management (set main hero image)
- Audit logs and financial archive reports
