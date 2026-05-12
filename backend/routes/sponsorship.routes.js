/**
 * ============================================================
 * SPONSORSHIP GALLERY ROUTES
 * ============================================================
 * Purpose: Defines API endpoints for the Human Claw Machine
 * photo gallery on the Sponsorship page.
 *
 * Public:  GET  /api/sponsorship/gallery
 * Admin:   POST, PUT, DELETE /api/sponsorship/gallery/:id
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const sponsorshipController = require('../controllers/sponsorship.controller');

/**
 * PUBLIC ROUTES
 * -------------
 * Accessible without authentication (used by the frontend).
 */
// Fetch all gallery images (sorted: main first, then by sort_order)
router.get('/gallery', sponsorshipController.getGallery);

/**
 * ADMIN ROUTES
 * ------------
 * These routes modify gallery data and should only be called
 * from the Admin Panel. No auth middleware is applied here
 * since the Admin Panel handles authentication client-side
 * (consistent with the rest of the project's admin routes).
 */
// Add a new gallery image
router.post('/gallery', sponsorshipController.addImage);

// Update an existing gallery image
router.put('/gallery/:id', sponsorshipController.updateImage);

// Set a specific image as the main hero image
router.put('/gallery/:id/main', sponsorshipController.setMainImage);

// Delete a gallery image
router.delete('/gallery/:id', sponsorshipController.deleteImage);

module.exports = router;
