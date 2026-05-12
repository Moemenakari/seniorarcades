# NLG Arcade Hub — Full-Stack Application

**Next Level Game** — Lebanon's premier arcade entertainment company. This repository contains the complete full-stack web application including the public-facing website, admin dashboard, and backend API.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS, Framer Motion |
| Admin Panel | React 18, JavaScript, TailwindCSS |
| Backend | Node.js, Express.js, SQLite (better-sqlite3) |
| Database | SQLite (file-based, zero config) |

---

## Quick Start (Local Development)

### 1. Install all dependencies

```bash
npm run install:all
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults work out of the box)
```

### 3. Start all services

```bash
# From the root directory:
npm run dev
```

This starts all three services concurrently:

| Service | URL |
|---|---|
| Backend API | http://localhost:5000 |
| Admin Panel | http://localhost:3001 |
| Frontend | http://localhost:3000 |

---

## Individual Services

### Backend (API + Database)

```bash
cd backend
npm install
npm start
```

- Port: `5000`
- Database: SQLite, auto-initialized at `data/nlg_arcade.db`
- Health check: `GET /api/health`

### Admin Dashboard

```bash
cd admin
npm install
npm start
```

- Port: `3001`
- Login: `moemen` or `abd` / password: `admin123`

### Frontend Website

```bash
cd frontend
npm install
npm start
```

- Port: `3000`

---

## Deployment

### Backend → Render.com

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Blueprint**.
3. Connect your GitHub repo — Render will detect `render.yaml` automatically.
4. Set environment variables in the Render dashboard:
   - `JWT_SECRET` — a long random string
   - `DB_PATH` — `/opt/render/project/src/data` (matches the persistent disk)
   - `ALLOWED_ORIGINS` — your Vercel frontend URLs (comma-separated)
5. The persistent disk keeps the SQLite database alive across deploys.

### Frontend & Admin → Vercel

1. Import each folder (`/frontend` and `/admin`) as separate Vercel projects.
2. Set the environment variable `REACT_APP_API_URL` to your Render backend URL.
   - Example: `https://nlg-arcade-backend.onrender.com/api`
3. Vercel will use the `vercel.json` in each folder for routing configuration.

---

## Project Structure

```
senior/
├── backend/                  # Node.js + Express API
│   ├── config/db.js          # SQLite schema + migrations
│   ├── controllers/          # Business logic per resource
│   ├── routes/               # Express route definitions
│   ├── server.js             # App entry point
│   └── .env.example          # Environment variable template
│
├── frontend/                 # Public website (React + TS)
│   ├── src/pages/            # Route-level page components
│   ├── src/components/       # Shared UI components
│   ├── src/config.ts         # API base URL config
│   └── vercel.json           # Vercel deployment config
│
├── admin/                    # Admin dashboard (React)
│   ├── src/pages/            # Admin page components
│   ├── src/config.js         # API base URL config
│   └── vercel.json           # Vercel deployment config
│
├── render.yaml               # Render.com deployment blueprint
└── .gitignore
```

---

## Key Features

### Public Website
- **Home Page** — Hero, stats, floating trust bar, cookie consent
- **Catalog** — Browse all arcade machines with filters
- **Product Details** — Individual machine pages with ratings
- **Services** — Service packages and offerings
- **Sponsorship** — Brand partnership page with Human Claw Machine gallery
- **About Us** — Company story and team
- **Build Your Event** — Custom event booking form

### Admin Panel
- **Dashboard** — KPIs, recent activity
- **Events** — Full event lifecycle management
- **Machines** — Product catalog management (add/edit/delete + images)
- **Partners** — CRM for clients and event managers
- **Finance** — Expenses, income, debt tracking, smart calculator
- **Footprint** — Locations/partners displayed in the trust bar
- **Ratings** — Moderate game and platform reviews
- **Sponsorship** — Manage Human Claw Machine gallery (add/edit/delete/set main)
- **Reports** — Audit logs and financial history

---

## API Endpoints (Selected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List all machines |
| GET | `/api/sponsorship/gallery` | Get gallery images |
| POST | `/api/sponsorship/gallery` | Add gallery image |
| PUT | `/api/sponsorship/gallery/:id` | Update gallery image |
| PUT | `/api/sponsorship/gallery/:id/main` | Set as main hero image |
| DELETE | `/api/sponsorship/gallery/:id` | Delete gallery image |
| GET | `/api/locations` | Get trust bar locations |
| GET | `/api/settings` | Get site settings |
