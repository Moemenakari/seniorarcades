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
const { adminProtect } = require('../middleware/admin.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes (require JWT)
router.post('/password', protect, authController.setPassword);
router.get('/me', protect, authController.getMe);

// Admin-only routes
router.get('/users', adminProtect, authController.getUsers);

module.exports = router;
