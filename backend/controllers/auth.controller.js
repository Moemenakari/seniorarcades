/**
 * ============================================================
 * AUTH CONTROLLER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Handles user authentication with phone + password.
 * Supports Login, Register, Forgot Password, and profile.
 * ============================================================
 */

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nlg_arcade_secret_super_key';
const JWT_EXPIRES_IN = '30d';

/**
 * ISSUE JWT SESSION
 * -----------------
 * Creates a JWT token and sets it as an HTTP-only cookie.
 */
const issueSession = (res, user) => {
  const token = jwt.sign({ id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.setHeader('Set-Cookie', `nlg_token=${token}; Max-Age=${30 * 24 * 60 * 60}; Path=/; HttpOnly; SameSite=Lax`);
  return token;
};

/**
 * REGISTER
 * --------
 * Creates a new user account with phone + password + name.
 * If account already exists, returns error.
 */
exports.register = async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  if (!password || String(password).length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  try {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const existing = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
    if (existing) {
      return res.status(409).json({ error: 'An account with this phone number already exists. Please login instead.' });
    }

    const safeEmail = `${cleanPhone.replace(/\D/g, '') || Date.now()}@phone.local`;
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)'
    ).run(cleanName, safeEmail, hash, cleanPhone, 'user');

    const user = { id: result.lastInsertRowid, name: cleanName, phone: cleanPhone, role: 'user' };
    const token = issueSession(res, user);
    res.status(201).json({
      success: true,
      token,
      user,
      mode: 'signup'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * LOGIN
 * -----
 * Authenticates a user with phone + password.
 */
exports.login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone.trim());
    if (!user) {
      return res.status(404).json({ error: 'No account found for this phone number. Please register first.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = issueSession(res, user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role || 'user' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * FORGOT PASSWORD
 * ---------------
 * User provides phone → system returns a password reset.
 * For this project (graduation), we simply reset to a new password
 * and return it, since there's no SMS gateway.
 */
exports.forgotPassword = async (req, res) => {
  const { phone, new_password } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone.trim());
    if (!user) {
      return res.status(404).json({ error: 'No account found for this phone number.' });
    }

    // If new_password is provided, reset to it
    if (new_password) {
      if (String(new_password).length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
      }
      const hash = await bcrypt.hash(new_password, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
      return res.json({ 
        success: true, 
        message: 'Password has been reset successfully. You can now login with your new password.',
        user_name: user.name
      });
    }

    // If no new password, just confirm the account exists
    return res.json({ 
      success: true, 
      message: 'Account found. Please provide a new password.',
      user_name: user.name,
      user_phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SET PASSWORD
 * ------------
 * Authenticated user can update their password.
 */
exports.setPassword = async (req, res) => {
  const { password } = req.body;
  if (!password || String(password).length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET CURRENT USER
 * ----------------
 * Returns the profile of the authenticated user.
 */
exports.getMe = (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, phone, role FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
