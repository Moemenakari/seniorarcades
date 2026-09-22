/**
 * ============================================================
 * ADMIN PROTECTION MIDDLEWARE
 * ============================================================
 * Admin access is a real account in the users table, proven by
 * the same signed JWT the rest of the API uses. The role is read
 * from the token, not from anything the client can set, so the
 * browser cannot promote itself.
 *
 *   adminProtect  — role 'admin' or 'super'
 *   superProtect  — role 'super' only (destructive / owner actions)
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const ADMIN_ROLES = new Set(['admin', 'super']);

const readToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
};

const authorize = (allowed) => (req, res, next) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Not authorized, no token' });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }

  if (!allowed.has(decoded.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.user = decoded;
  // Used by the audit log. Taken from the token so it cannot be spoofed.
  req.adminName = decoded.name || 'Admin';
  next();
};

exports.adminProtect = authorize(ADMIN_ROLES);
exports.superProtect = authorize(new Set(['super']));
