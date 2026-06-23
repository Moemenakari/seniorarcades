require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins || allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const eventRoutes = require('./routes/event.routes');
const financeRoutes = require('./routes/finance.routes');
const productRoutes = require('./routes/product.routes');
const clientRoutes = require('./routes/client.routes');
const archiveRoutes = require('./routes/archive.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const authRoutes = require('./routes/auth.routes');
const ratingRoutes = require('./routes/rating.routes');
const sponsorshipRoutes = require('./routes/sponsorship.routes');
const uploadRoutes = require('./routes/upload.routes');
const { adminProtect } = require('./middleware/admin.middleware');

app.use('/api/events', adminProtect, eventRoutes);
app.use('/api/finances', adminProtect, financeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/games', productRoutes);
app.use('/api/clients', adminProtect, clientRoutes);
app.use('/api/archive', adminProtect, archiveRoutes);
app.use('/api/dashboard', adminProtect, dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/sponsorship', sponsorshipRoutes);
app.use('/api/upload', adminProtect, uploadRoutes);

app.get('/api/locations', async (req, res) => {
  try {
    const locations = await db.prepare('SELECT * FROM locations ORDER BY created_at DESC').all();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/locations', adminProtect, async (req, res) => {
  try {
    const { name, image_url } = req.body;
    const info = await db.prepare('INSERT INTO locations (name, image_url) VALUES ($1, $2)').run(name, image_url);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/locations/:id', adminProtect, async (req, res) => {
  try {
    const { name, image_url } = req.body;
    await db.prepare('UPDATE locations SET name = $1, image_url = $2 WHERE id = $3').run(name, image_url, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/locations/:id', adminProtect, async (req, res) => {
  try {
    await db.prepare('DELETE FROM locations WHERE id = $1').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.prepare('SELECT * FROM settings').all();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', adminProtect, async (req, res) => {
  try {
    await db.prepare("UPDATE settings SET setting_value = $1 WHERE setting_key = 'ticker_text'").run(req.body.ticker_text);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  message: 'NLG Backend Running',
  timestamp: new Date().toISOString()
}));

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;

const initDB = async () => {
  try {
    await db.exec("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE");
    console.log('✅ DB migration: audit_logs.hidden column ready');
  } catch (e) {
    console.error('❌ DB migration error:', e.message);
  }
};

app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 NLG Backend running on http://localhost:${PORT}`);
});
