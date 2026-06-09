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

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is not set in production! Fallback key is unsafe.');
}

const otpStorage = new Map(); // phone -> { code, expires, verified }

/**
 * ISSUE JWT SESSION
 * -----------------
 * Creates a JWT token and sets it as an HTTP-only cookie.
 */
const issueSession = (res, user) => {
  const token = jwt.sign({ id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const cookieOptions = process.env.NODE_ENV === 'production' 
    ? 'SameSite=None; Secure' 
    : 'SameSite=Lax';
  res.setHeader('Set-Cookie', `nlg_token=${token}; Max-Age=${30 * 24 * 60 * 60}; Path=/; HttpOnly; ${cookieOptions}`);
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

    // If new_password is provided, reset to it AFTER verifying OTP
    if (new_password) {
      const stored = otpStorage.get(phone.trim());
      if (!stored || !stored.verified) {
        return res.status(400).json({ error: 'Phone number verification is required before resetting password.' });
      }

      if (String(new_password).length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
      }
      const hash = await bcrypt.hash(new_password, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
      
      otpStorage.delete(phone.trim());
      return res.json({ 
        success: true, 
        message: 'Password has been reset successfully. You can now login with your new password.',
        user_name: user.name
      });
    }

    // First step: Generate a 4-digit code and save to in-memory otpStorage
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    otpStorage.set(phone.trim(), {
      code,
      expires: Date.now() + 5 * 60 * 1000,
      verified: false
    });

    console.log(`\n============================\n[SMS MOCK] Verification code for ${phone.trim()} is: ${code}\n============================\n`);

    // Return confirmation
    return res.json({ 
      success: true, 
      message: 'Verification code sent (check server logs). Please verify before resetting.',
      user_name: user.name,
      user_phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * VERIFY OTP
 * ----------
 * Validates the in-memory verification code.
 */
exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and verification code are required.' });
  }

  const stored = otpStorage.get(phone.trim());
  if (!stored) {
    return res.status(400).json({ error: 'No verification code was requested for this number.' });
  }

  if (Date.now() > stored.expires) {
    otpStorage.delete(phone.trim());
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  if (stored.code !== otp.trim()) {
    return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
  }

  // Mark as verified
  otpStorage.set(phone.trim(), { ...stored, verified: true, expires: Date.now() + 5 * 60 * 1000 });
  res.json({ success: true, message: 'Verification successful.' });
};

/**
 * GET ALL USERS (Admin only)
 * --------------------------
 * Fetches all registered users in the database.
 */
exports.getUsers = (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ success: true, users });
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
