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

/**
 * ==========================================
 * ROUTE DEFINITIONS
 * ==========================================
 */

// Fetch all machines (supports ?category=&suitability=&popular=true)
router.get('/', productController.getProducts);

// Fetch featured machines for homepage (max 9)
router.get('/featured', productController.getFeaturedProducts);

// Toggle featured status for a machine
router.patch('/:id/featured', productController.toggleFeatured);

// Fetch machine details
router.get('/:id', productController.getProduct);

// Register new machine
router.post('/', productController.addProduct);

// Update machine specifications
router.put('/:id', productController.updateProduct);

// Archive machine (Soft delete)
router.delete('/:id', productController.deleteProduct);

module.exports = router;

