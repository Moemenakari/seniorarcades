/**
 * ============================================================
 * GAME CONFIGURATION ROUTES
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Defines API endpoints for game settings and 
 * meta-data management.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');

/**
 * ==========================================
 * ROUTE DEFINITIONS
 * ==========================================
 */

// Fetch all games/meta-data
router.get('/', gameController.getGames);

// Add new game record
router.post('/', gameController.addGame);

// Update game settings
router.put('/:id', gameController.updateGame);

// Delete game record
router.delete('/:id', gameController.deleteGame);

module.exports = router;
