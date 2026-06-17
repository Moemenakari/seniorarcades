const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nlg_arcade_secret_super_key';
const JWT_EXPIRES_IN = '30d';

const otpStorage = new Map();

const issueSession = (res, user) => {
  const token = jwt.sign({ id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const cookieOptions = process.env.NODE_ENV === 'production' ? 'SameSite=None; Secure' : 'SameSite=Lax';
  res.setHeader('Set-Cookie', `nlg_token=${token}; Max-Age=${30 * 24 * 60 * 60}; Path=/; HttpOnly; ${cookieOptions}`);
  return token;
};

exports.register = async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
  if (!password || String(password).length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

  try {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const existing = await db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
    if (existing) return res.status(409).json({ error: 'An account with this phone number already exists. Please login instead.' });

    const safeEmail = `${cleanPhone.replace(/\D/g, '') || Date.now()}@phone.local`;
    const hash = await bcrypt.hash(password, 10);
    const result = await db.prepare('INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)').run(cleanName, safeEmail, hash, cleanPhone, 'user');

    const user = { id: result.lastInsertRowid, name: cleanName, phone: cleanPhone, role: 'user' };
    const token = issueSession(res, user);
    res.status(201).json({ success: true, token, user, mode: 'signup' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  if (!password) return res.status(400).json({ error: 'Password is required' });

  try {
    const user = await db.prepare('SELECT * FROM users WHERE phone = ?').get(phone.trim());
    if (!user) return res.status(404).json({ error: 'No account found for this phone number. Please register first.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password. Please try again.' });

    const token = issueSession(res, user);
    res.json({ success: true, token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role || 'user' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { phone, new_password } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  try {
    const user = await db.prepare('SELECT * FROM users WHERE phone = ?').get(phone.trim());
    if (!user) return res.status(404).json({ error: 'No account found for this phone number.' });

    if (new_password) {
      const stored = otpStorage.get(phone.trim());
      if (!stored || !stored.verified) return res.status(400).json({ error: 'Phone number verification is required before resetting password.' });
      if (String(new_password).length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
      const hash = await bcrypt.hash(new_password, 10);
      await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
      otpStorage.delete(phone.trim());
      return res.json({ success: true, message: 'Password has been reset successfully.', user_name: user.name });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    otpStorage.set(phone.trim(), { code, expires: Date.now() + 5 * 60 * 1000, verified: false });
    console.log(`\n============================\n[SMS MOCK] Code for ${phone.trim()}: ${code}\n============================\n`);
    return res.json({ success: true, message: 'Verification code sent (check server logs).', user_name: user.name, user_phone: user.phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone number and verification code are required.' });

  const stored = otpStorage.get(phone.trim());
  if (!stored) return res.status(400).json({ error: 'No verification code was requested for this number.' });
  if (Date.now() > stored.expires) { otpStorage.delete(phone.trim()); return res.status(400).json({ error: 'Verification code has expired.' }); }
  if (stored.code !== otp.trim()) return res.status(400).json({ error: 'Incorrect verification code.' });

  otpStorage.set(phone.trim(), { ...stored, verified: true, expires: Date.now() + 5 * 60 * 1000 });
  res.json({ success: true, message: 'Verification successful.' });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await db.prepare('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setPassword = async (req, res) => {
  const { password } = req.body;
  if (!password || String(password).length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, name, phone, role FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
