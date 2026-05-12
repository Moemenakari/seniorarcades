/**
 * ============================================================
 * CLIENT & PARTNER ROUTES
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Defines API endpoints for CRM and Partner management.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

/**
 * ==========================================
 * ROUTE DEFINITIONS
 * ==========================================
 */

// Fetch all clients/partners
router.get('/', clientController.getClients);

// Fetch profile details
router.get('/:id', clientController.getClient);

// Register new client
router.post('/', clientController.addClient);

// Update profile information
router.put('/:id', clientController.updateClient);

// Archive record (Soft delete)
router.delete('/:id', clientController.deleteClient);

module.exports = router;

