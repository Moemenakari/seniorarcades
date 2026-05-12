/**
 * ============================================================
 * DASHBOARD ROUTES
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Defines API endpoints for aggregated dashboard 
 * statistics and AI assistant interaction.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

/**
 * ==========================================
 * ROUTE DEFINITIONS
 * ==========================================
 */

// Fetch comprehensive dashboard KPIs
router.get('/', dashboardController.getDashboard);

// AI Chatbot interaction endpoint
router.post('/chat', dashboardController.chatAI);

module.exports = router;

