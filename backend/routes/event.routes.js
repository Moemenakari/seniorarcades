/**
 * ============================================================
 * EVENT ROUTES
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Defines the API endpoints for event management, 
 * including creation, updates, and archival.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { guardIdParams } = require('../middleware/validateId');
guardIdParams(router);
const eventController = require('../controllers/event.controller');
const caseStudyController = require('../controllers/caseStudy.controller');

/**
 * ==========================================
 * ROUTE DEFINITIONS
 * ==========================================
 */

// Fetch all events
router.get('/', eventController.getEvents);

// Get contextual event for "Today" features
router.get('/today', eventController.getTodaysEvent);

// Fetch specific event details
router.get('/:id', eventController.getEvent);

// Create new event
router.post('/', eventController.addEvent);
router.post('/add', eventController.addEvent); // Legacy alias

// Update event properties
router.put('/:id', eventController.updateEvent);

// Update event status specifically
router.put('/:id/status', eventController.updateStatus);

// Case study: attendance, public place name and the games used
router.get('/:id/case-study', caseStudyController.getCaseStudy);
router.put('/:id/case-study', caseStudyController.saveCaseStudy);

// Archive event (Soft delete)
router.delete('/:id', eventController.archiveEvent);

module.exports = router;

