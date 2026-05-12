/**
 * ============================================================
 * AUTH MIDDLEWARE RE-EXPORT
 * ============================================================
 * Purpose: Provides a compatible import path for routes that
 * reference '../utils/authMiddleware'. Re-exports from the
 * canonical middleware location.
 * ============================================================
 */

const { protect } = require('../middleware/auth.middleware');
module.exports = { protect };
