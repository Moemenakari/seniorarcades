/**
 * ============================================================
 * DATABASE CONFIGURATION & SCHEMA
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Initializes the SQLite database, defines the 
 * application schema, and handles migrations.
 * ============================================================
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * ==========================================
 * DATABASE INITIALIZATION
 * ==========================================
 */

// Determine database directory:
// - On Render.com: use the persistent disk mount path (/opt/render/project/src/data)
// - Locally: use the /data directory at the project root
const dataDir = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to the SQLite database file
const dbPath = path.join(dataDir, 'nlg_arcade.db');
console.log(`📁 Database path: ${dbPath}`);
const db = new Database(dbPath);

// Performance optimizations for SQLite
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * ==========================================
 * DATABASE SCHEMA DEFINITION
 * ==========================================
 * Tables:
 * 1. events      - Core event management
 * 2. products    - Inventory of arcade machines
 * 3. clients     - Customer and partner directory
 * 4. expenses    - Financial costs tracking
 * 5. income      - Revenue records
 * 6. debts       - Partner debt management
 * 7. payments    - Settlement records
 * 8. archive_*   - Historical data storage
 * 9. finance_logs - Unified financial history
 * 10. settings            - System-wide configuration
 * 11. audit_logs           - System activity tracking
 * 12. sponsorship_gallery  - Human Claw Machine gallery (Admin-managed)
 */

db.exec(`
  -- EVENTS (Core table - everything links to event_id)
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    client_id INTEGER,
    client_name TEXT,
    phone TEXT,
    location TEXT,
    date TEXT,
    end_date TEXT,
    event_type TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled','archived')),
    total_income REAL DEFAULT 0,
    rating INTEGER DEFAULT 0,
    manager_name TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    event_manager_pay REAL DEFAULT 0,
    profit REAL DEFAULT 0,
    food_cost REAL DEFAULT 0,
    gas_cost REAL DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  -- PRODUCTS (Arcade machines / games)
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    min_price REAL NOT NULL DEFAULT 0,
    max_price REAL NOT NULL DEFAULT 0,
    average_price REAL NOT NULL DEFAULT 0,
    space_required TEXT DEFAULT '2x2 meters',
    needs_electricity INTEGER DEFAULT 0,
    electricity_amount TEXT,
    has_coins INTEGER DEFAULT 0,
    extra_features TEXT,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    status TEXT DEFAULT 'active' CHECK(status IN ('active','hidden','archived')),
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- CLIENTS (CRM)
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    event_type TEXT,
    type TEXT DEFAULT 'client' CHECK(type IN ('client','event_manager')),
    notes TEXT,
    total_spent REAL DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','archived')),
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- EXPENSES (Linked to event_id)
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    paid_by TEXT NOT NULL CHECK(paid_by IN ('moemen','abd','company','others')),
    category TEXT NOT NULL CHECK(category IN ('food','fuel','transport','festival','equipment','other','event_auto')),
    description TEXT NOT NULL,
    day_type TEXT NOT NULL CHECK(day_type IN ('work_day','off_day')),
    event_id INTEGER,
    event_name TEXT,
    date TEXT DEFAULT (date('now','localtime')),
    status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid','paid','archived')),
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  -- INCOME (Linked to event_id)
  CREATE TABLE IF NOT EXISTS income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT DEFAULT (date('now','localtime')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  -- DEBTS (Partner debts tracked per expense)
  CREATE TABLE IF NOT EXISTS debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_name TEXT NOT NULL CHECK(partner_name IN ('moemen','abd','others')),
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('debt_to_partner','payment_to_partner')),
    related_expense_id INTEGER,
    related_event_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','cleared')),
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (related_expense_id) REFERENCES expenses(id),
    FOREIGN KEY (related_event_id) REFERENCES events(id)
  );

  -- PAYMENTS (Settlement records)
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id INTEGER,
    event_id INTEGER,
    amount REAL NOT NULL,
    paid_to TEXT NOT NULL CHECK(paid_to IN ('moemen','abd','others')),
    description TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (debt_id) REFERENCES debts(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  -- ARCHIVE: EVENTS
  CREATE TABLE IF NOT EXISTS archive_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    archived_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- ARCHIVE: FINANCIALS (expenses, debts, payments)
  CREATE TABLE IF NOT EXISTS archive_financials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_id INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    data TEXT NOT NULL,
    archive_type TEXT DEFAULT 'paid' CHECK(archive_type IN ('paid','deleted')),
    archived_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- FINANCE LOGS (Unified Smart Calculator Records)
  CREATE TABLE IF NOT EXISTS finance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    person TEXT NOT NULL,
    total REAL NOT NULL,
    details TEXT NOT NULL,
    date TEXT DEFAULT (datetime('now','localtime')),
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- SETTINGS
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL
  );

  -- AUDIT LOGS (System-wide tracking)
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time TEXT,
    user TEXT,
    section TEXT DEFAULT 'General',
    action_type TEXT,
    description TEXT,
    amount REAL,
    related_to TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- LOCATIONS (Where we have been)
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- USERS (For Authentication & Ratings)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  -- GAME RATINGS
  CREATE TABLE IF NOT EXISTS game_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
  );

  -- PLATFORM RATINGS
  CREATE TABLE IF NOT EXISTS platform_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- SPONSORSHIP GALLERY (Human Claw Machine images managed via Admin Panel)
  -- is_main = 1 means this is the primary hero image shown large at the top
  -- sort_order controls display sequence (lower = shown first)
  CREATE TABLE IF NOT EXISTS sponsorship_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_main INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// Sample data removed as per request to prevent automatic duplication.
// Locations should be managed via Admin Panel only.

/**
 * ==========================================
 * DEFAULT DATA & MIGRATIONS
 * ==========================================
 */

// Insert default settings if they don't exist
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)');
insertSetting.run('ticker_text', '🔥 Now accepting bookings for Summer 2026 Festivals across Lebanon! Book now before machines run out. 🎮');

// Safe column migrations (handles dynamic schema evolution)
const addColSafe = (sql) => { try { db.exec(sql); } catch(e) {} };
addColSafe('ALTER TABLE events ADD COLUMN gen_key TEXT');
addColSafe('ALTER TABLE events ADD COLUMN manual_status TEXT');

// Products enhancements
addColSafe("ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0");
addColSafe("ALTER TABLE products ADD COLUMN popularity_score INTEGER DEFAULT 50");
addColSafe("ALTER TABLE products ADD COLUMN event_suitability TEXT DEFAULT 'all'");
addColSafe("ALTER TABLE products ADD COLUMN badge TEXT DEFAULT 'Popular'");
addColSafe("ALTER TABLE products ADD COLUMN rent_price TEXT DEFAULT 'Average rented per day: $100 - $150'");
addColSafe("ALTER TABLE products ADD COLUMN image_url2 TEXT");
addColSafe("ALTER TABLE products ADD COLUMN image_url3 TEXT");
addColSafe('ALTER TABLE events ADD COLUMN linked_event_id INTEGER');

// Finance System Enhancements
addColSafe("ALTER TABLE income ADD COLUMN source TEXT DEFAULT 'Event'");
addColSafe("ALTER TABLE income ADD COLUMN original_profit REAL DEFAULT 0");
addColSafe("ALTER TABLE income ADD COLUMN debts_cleared TEXT DEFAULT ''");
addColSafe("ALTER TABLE income ADD COLUMN final_profit REAL DEFAULT 0");
addColSafe("ALTER TABLE income ADD COLUMN moemen_share REAL DEFAULT 0");
addColSafe("ALTER TABLE income ADD COLUMN abd_share REAL DEFAULT 0");

// Event Tracking Enhancements
addColSafe("ALTER TABLE events ADD COLUMN deal_type TEXT DEFAULT 'Fixing Rent'");
addColSafe("ALTER TABLE events ADD COLUMN rent_amount REAL DEFAULT 0");
addColSafe("ALTER TABLE events ADD COLUMN company_percent REAL DEFAULT 60");
addColSafe("ALTER TABLE events ADD COLUMN partner_percent REAL DEFAULT 40");
addColSafe("ALTER TABLE events ADD COLUMN admin_name TEXT DEFAULT 'System'");
addColSafe("ALTER TABLE events ADD COLUMN time TEXT");

// Expense & Debt System Fixes
addColSafe("ALTER TABLE expenses ADD COLUMN paid_by_name TEXT");
addColSafe("ALTER TABLE expenses ADD COLUMN admin_name TEXT DEFAULT 'System'");
addColSafe("ALTER TABLE expenses ADD COLUMN time TEXT");
addColSafe("ALTER TABLE debts ADD COLUMN partner_real_name TEXT");

// Expense confirmation tracking (used by markExpensePaid)
addColSafe("ALTER TABLE expenses ADD COLUMN confirmed_by_admin TEXT");
addColSafe("ALTER TABLE expenses ADD COLUMN confirmed_at TEXT");

// Income tracking enhancements (used by addSmartIncome / syncEventFinance)
addColSafe("ALTER TABLE income ADD COLUMN admin_name TEXT DEFAULT 'System'");
addColSafe("ALTER TABLE income ADD COLUMN time TEXT");

// Payments tracking (used by addSmartIncome debt settlement)
addColSafe("ALTER TABLE payments ADD COLUMN paid_to_real_name TEXT");

// Ratings moderation
addColSafe("ALTER TABLE game_ratings ADD COLUMN is_hidden INTEGER DEFAULT 0");
addColSafe("ALTER TABLE platform_ratings ADD COLUMN is_hidden INTEGER DEFAULT 0");

/**
 * ==========================================
 * SPONSORSHIP GALLERY DEFAULT DATA
 * ==========================================
 * Inserts sample images on first run so the gallery is never empty.
 * Admins can replace/delete these via the Admin Panel.
 */
const galleryCount = db.prepare('SELECT COUNT(*) as cnt FROM sponsorship_gallery').get();
if (galleryCount.cnt === 0) {
  const insertGallery = db.prepare(
    'INSERT INTO sponsorship_gallery (image_url, description, sort_order, is_main) VALUES (?, ?, ?, ?)'
  );
  // Main hero image (is_main = 1)
  insertGallery.run(
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    'The Human Claw Machine in action — a crowd-stopping experience at a major festival.',
    0, 1
  );
  // Additional gallery images
  insertGallery.run(
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'Hundreds of attendees lined up to try the Human Claw Machine at Jounieh Festival.',
    1, 0
  );
  insertGallery.run(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'Branded sponsor activation — your logo on the machine seen by thousands.',
    2, 0
  );
  insertGallery.run(
    'https://images.unsplash.com/photo-1511578314322-379afb476865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'Live event setup — the machine becomes the centerpiece of any event zone.',
    3, 0
  );
  insertGallery.run(
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'Crowd engagement at its peak — every round creates a viral social media moment.',
    4, 0
  );
  insertGallery.run(
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'University event activation — students competing for branded prizes.',
    5, 0
  );
  insertGallery.run(
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'Night festival setup — the Human Claw Machine glows under the lights.',
    6, 0
  );
  console.log('✅ Sponsorship gallery seeded with default images');
}

/**
 * ==========================================
 * DATA MAINTENANCE
 * ==========================================
 */

// Generate unique identifiers for events that lack one
const eventsWithoutKey = db.prepare("SELECT id, date FROM events WHERE gen_key IS NULL OR gen_key = ''").all();
const updateGenKey = db.prepare("UPDATE events SET gen_key = ? WHERE id = ?");
eventsWithoutKey.forEach(ev => {
  const d = ev.date ? new Date(ev.date) : new Date();
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  const rand = Math.random().toString(36).substring(2,5).toUpperCase();
  updateGenKey.run(`${dd}${mm}${yyyy}-${rand}`, ev.id);
});

console.log('✅ SQLite database initialized successfully');

module.exports = db;

