-- ============================================================
-- NLG ARCADE HUB - PostgreSQL Schema for Supabase
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- CLIENTS (created first, events reference it)
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  event_type TEXT,
  type TEXT DEFAULT 'client' CHECK(type IN ('client','event_manager')),
  notes TEXT,
  total_spent NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  client_id BIGINT REFERENCES clients(id),
  client_name TEXT,
  phone TEXT,
  location TEXT,
  date TEXT,
  end_date TEXT,
  event_type TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled','archived')),
  total_income NUMERIC DEFAULT 0,
  rating INTEGER DEFAULT 0,
  manager_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_manager_pay NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  food_cost NUMERIC DEFAULT 0,
  gas_cost NUMERIC DEFAULT 0,
  gen_key TEXT,
  manual_status TEXT,
  linked_event_id BIGINT,
  deal_type TEXT DEFAULT 'Fixing Rent',
  rent_amount NUMERIC DEFAULT 0,
  company_percent NUMERIC DEFAULT 60,
  partner_percent NUMERIC DEFAULT 40,
  admin_name TEXT DEFAULT 'System',
  time TEXT
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_price NUMERIC NOT NULL DEFAULT 0,
  max_price NUMERIC NOT NULL DEFAULT 0,
  average_price NUMERIC NOT NULL DEFAULT 0,
  space_required TEXT DEFAULT '2x2 meters',
  needs_electricity INTEGER DEFAULT 0,
  electricity_amount TEXT,
  has_coins INTEGER DEFAULT 0,
  extra_features TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'active' CHECK(status IN ('active','hidden','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 50,
  event_suitability TEXT DEFAULT 'all',
  badge TEXT DEFAULT 'Popular',
  rent_price TEXT DEFAULT 'Average rented per day: $100 - $150',
  image_url2 TEXT,
  image_url3 TEXT
);

-- EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  amount NUMERIC NOT NULL,
  paid_by TEXT NOT NULL CHECK(paid_by IN ('moemen','abd','company','others')),
  paid_by_name TEXT,
  category TEXT NOT NULL CHECK(category IN ('food','fuel','transport','festival','equipment','other','event_auto')),
  description TEXT NOT NULL,
  day_type TEXT NOT NULL CHECK(day_type IN ('work_day','off_day')),
  event_id BIGINT REFERENCES events(id),
  event_name TEXT,
  date TEXT DEFAULT (CURRENT_DATE::TEXT),
  status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid','paid','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  admin_name TEXT DEFAULT 'System',
  time TEXT,
  confirmed_by_admin TEXT,
  confirmed_at TEXT
);

-- INCOME
CREATE TABLE IF NOT EXISTS income (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  amount NUMERIC NOT NULL,
  date TEXT DEFAULT (CURRENT_DATE::TEXT),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'Event',
  original_profit NUMERIC DEFAULT 0,
  debts_cleared TEXT DEFAULT '',
  final_profit NUMERIC DEFAULT 0,
  moemen_share NUMERIC DEFAULT 0,
  abd_share NUMERIC DEFAULT 0,
  admin_name TEXT DEFAULT 'System',
  time TEXT
);

-- DEBTS
CREATE TABLE IF NOT EXISTS debts (
  id BIGSERIAL PRIMARY KEY,
  partner_name TEXT NOT NULL CHECK(partner_name IN ('moemen','abd','others')),
  partner_real_name TEXT,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('debt_to_partner','payment_to_partner')),
  related_expense_id BIGINT REFERENCES expenses(id),
  related_event_id BIGINT REFERENCES events(id),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','cleared')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  debt_id BIGINT REFERENCES debts(id),
  event_id BIGINT REFERENCES events(id),
  amount NUMERIC NOT NULL,
  paid_to TEXT NOT NULL CHECK(paid_to IN ('moemen','abd','others')),
  paid_to_real_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ARCHIVE EVENTS
CREATE TABLE IF NOT EXISTS archive_events (
  id BIGSERIAL PRIMARY KEY,
  original_id BIGINT NOT NULL,
  data TEXT NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- ARCHIVE FINANCIALS
CREATE TABLE IF NOT EXISTS archive_financials (
  id BIGSERIAL PRIMARY KEY,
  original_id BIGINT NOT NULL,
  table_name TEXT NOT NULL,
  data TEXT NOT NULL,
  archive_type TEXT DEFAULT 'paid' CHECK(archive_type IN ('paid','deleted')),
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- FINANCE LOGS
CREATE TABLE IF NOT EXISTS finance_logs (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('income','expense')),
  person TEXT NOT NULL,
  total NUMERIC NOT NULL,
  details TEXT NOT NULL,
  date TEXT DEFAULT (CURRENT_DATE::TEXT),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  date TEXT,
  time TEXT,
  "user" TEXT,
  section TEXT DEFAULT 'General',
  action_type TEXT,
  description TEXT,
  amount NUMERIC,
  related_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOCATIONS
CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAME RATINGS
CREATE TABLE IF NOT EXISTS game_ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  product_id BIGINT NOT NULL REFERENCES products(id),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review TEXT,
  is_hidden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- PLATFORM RATINGS
CREATE TABLE IF NOT EXISTS platform_ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review TEXT,
  is_hidden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSORSHIP GALLERY
CREATE TABLE IF NOT EXISTS sponsorship_gallery (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_main INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEFAULT DATA
INSERT INTO settings (setting_key, setting_value)
VALUES ('ticker_text', '🔥 Now accepting bookings for Summer 2026 Festivals across Lebanon! Book now before machines run out. 🎮')
ON CONFLICT (setting_key) DO NOTHING;

-- SPONSORSHIP GALLERY DEFAULT IMAGES
INSERT INTO sponsorship_gallery (image_url, description, sort_order, is_main) VALUES
('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', 'The Human Claw Machine in action — a crowd-stopping experience at a major festival.', 0, 1),
('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'Hundreds of attendees lined up to try the Human Claw Machine at Jounieh Festival.', 1, 0),
('https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'Branded sponsor activation — your logo on the machine seen by thousands.', 2, 0),
('https://images.unsplash.com/photo-1511578314322-379afb476865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'Live event setup — the machine becomes the centerpiece of any event zone.', 3, 0),
('https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'Crowd engagement at its peak — every round creates a viral social media moment.', 4, 0),
('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'University event activation — students competing for branded prizes.', 5, 0),
('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'Night festival setup — the Human Claw Machine glows under the lights.', 6, 0)
ON CONFLICT DO NOTHING;
