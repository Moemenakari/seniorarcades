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
const { adminProtect } = require('../middleware/admin.middleware');

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
 * These routes modify gallery data and require admin credentials.
 */
// Add a new gallery image
router.post('/gallery', adminProtect, sponsorshipController.addImage);

// Update an existing gallery image
router.put('/gallery/:id', adminProtect, sponsorshipController.updateImage);

// Set a specific image as the main hero image
router.put('/gallery/:id/main', adminProtect, sponsorshipController.setMainImage);

// Delete a gallery image
router.delete('/gallery/:id', adminProtect, sponsorshipController.deleteImage);

module.exports = router;
