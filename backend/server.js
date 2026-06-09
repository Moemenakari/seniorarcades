/**
 * ============================================================
 * NLG ARCADE HUB - BACKEND SERVER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Main entry point for the Node.js/Express API.
 * Handles routing, middleware, and database connectivity.
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

/**
 * ==========================================
 * DATABASE (must be required before routes that use it inline)
 * ==========================================
 */
const db = require('./config/db');

// Initialize Express App
const app = express();

/**
 * ==========================================
 * MIDDLEWARE CONFIGURATION
 * ==========================================
 */
// CORS Configuration:
// - In development: allow all origins (origin: true)
// - In production: allow specific Vercel domains + any custom domain
//   Set ALLOWED_ORIGINS env var as comma-separated list if needed.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // In development or if no restrictions set, allow all
    if (!allowedOrigins || allowedOrigins.length === 0) return callback(null, true);
    // Check against allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain automatically
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

/**
 * ==========================================
 * ROUTE IMPORTS
 * ==========================================
 */
const eventRoutes = require('./routes/event.routes');
const financeRoutes = require('./routes/finance.routes');
const productRoutes = require('./routes/product.routes');
const clientRoutes = require('./routes/client.routes');
const archiveRoutes = require('./routes/archive.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const authRoutes = require('./routes/auth.routes');
const ratingRoutes = require('./routes/rating.routes');
const sponsorshipRoutes = require('./routes/sponsorship.routes');
const { adminProtect } = require('./middleware/admin.middleware');

/**
 * ==========================================
 * API ROUTE MOUNTING
 * ==========================================
 */
app.use('/api/events', adminProtect, eventRoutes);
app.use('/api/finances', adminProtect, financeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/games', productRoutes);       // Alias for backward compatibility
app.use('/api/clients', adminProtect, clientRoutes);
app.use('/api/archive', adminProtect, archiveRoutes);
app.use('/api/dashboard', adminProtect, dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/sponsorship', sponsorshipRoutes);  // Sponsorship gallery management

// Locations API
app.get('/api/locations', (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations ORDER BY created_at DESC').all();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/locations', adminProtect, (req, res) => {
  try {
    const { name, image_url } = req.body;
    const info = db.prepare('INSERT INTO locations (name, image_url) VALUES (?, ?)').run(name, image_url);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/locations/:id', adminProtect, (req, res) => {
  try {
    const { name, image_url } = req.body;
    db.prepare('UPDATE locations SET name = ?, image_url = ? WHERE id = ?').run(name, image_url, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/locations/:id', adminProtect, (req, res) => {
  try {
    db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ==========================================
 * GLOBAL SETTINGS & DATABASE
 * ==========================================
 */
// (db is already required at the top)

// Get application settings (e.g., ticker text)
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application settings
app.put('/api/settings', adminProtect, (req, res) => {
  try {
    db.prepare("UPDATE settings SET setting_value = ? WHERE setting_key = 'ticker_text'").run(req.body.ticker_text);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ==========================================
 * UTILITY ROUTES & ERROR HANDLING
 * ==========================================
 */

// API Health Check
app.get('/api/health', (req, res) => res.json({ 
  status: 'OK', 
  message: 'NLG Backend Running', 
  timestamp: new Date().toISOString() 
}));

// Global Exception Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 Fallback Handler
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

/**
 * ==========================================
 * SERVER INITIALIZATION
 * ==========================================
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 NLG Backend running on http://localhost:${PORT}`);
});

