/**
 * ============================================================
 * ARCHIVE ROUTES
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Defines API endpoints for retrieving historical 
 * system data and audit logs.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archive.controller');

/**
 * ==========================================
 * ROUTE DEFINITIONS
 * ==========================================
 */

// Fetch the complete system-wide audit trail
router.get('/', archiveController.getSystemArchive);

// Fetch archived event snapshots
router.get('/events', archiveController.getArchivedEvents);

// Fetch archived financial snapshots (expenses, debts)
router.get('/financials', archiveController.getArchivedFinancials);

// Update an audit log entry
router.put('/:id', archiveController.updateAuditLog);

module.exports = router;

