/**
 * ============================================================
 * ADMIN PROTECTION MIDDLEWARE
 * ============================================================
 * Purpose: Authenticates incoming requests for admin-only resources.
 * Checks the 'x-admin-master-key' header.
 * ============================================================
 */

exports.adminProtect = (req, res, next) => {
  const masterKey = req.headers['x-admin-master-key'];
  const expectedKey = process.env.ADMIN_MASTER_KEY || 'admin123';

  if (masterKey && masterKey === expectedKey) {
    // Attach audit log identity helper to request
    req.adminName = req.headers['x-admin-name'] || req.body?.admin_name || 'Admin';
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Admin credentials required' });
  }
};
