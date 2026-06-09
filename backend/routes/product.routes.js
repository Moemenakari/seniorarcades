/**
 * ============================================================
 * PRODUCT (MACHINE) ROUTES
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Defines API endpoints for arcade machine inventory 
 * management.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { adminProtect } = require('../middleware/admin.middleware');

/**
 * ==========================================
 * ROUTE DEFINITIONS
 * ==========================================
 */

// Fetch all machines (supports ?category=&suitability=&popular=true)
router.get('/', productController.getProducts);

// Fetch featured machines for homepage (max 9)
router.get('/featured', productController.getFeaturedProducts);

// Fetch machine details
router.get('/:id', productController.getProduct);

// Admin-only write/featured routes
router.patch('/:id/featured', adminProtect, productController.toggleFeatured);
router.post('/', adminProtect, productController.addProduct);
router.put('/:id', adminProtect, productController.updateProduct);
router.delete('/:id', adminProtect, productController.deleteProduct);

module.exports = router;

