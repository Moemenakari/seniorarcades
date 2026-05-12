/**
 * ============================================================
 * AUTH ROUTES
 * ============================================================
 * Purpose: Defines API endpoints for user authentication.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../utils/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes (require JWT)
router.post('/password', protect, authController.setPassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
