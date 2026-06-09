const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { protect } = require('../utils/authMiddleware');
const { adminProtect } = require('../middleware/admin.middleware');

router.post('/game', protect, ratingController.rateGame);
router.post('/platform', protect, ratingController.ratePlatform);
router.get('/game/:productId', ratingController.getGameRatings);
router.get('/popular', ratingController.getPopularRatings);
router.get('/platform/public', ratingController.getPublicPlatformRatings);

// Admin moderation routes
router.get('/admin/list', adminProtect, ratingController.getRatingsAdmin);
router.patch('/admin/:id/hide', adminProtect, ratingController.hideRating);
router.delete('/admin/:id', adminProtect, ratingController.deleteRating);

module.exports = router;
