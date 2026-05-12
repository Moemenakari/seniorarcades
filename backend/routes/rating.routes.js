const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { protect } = require('../utils/authMiddleware');

router.post('/game', protect, ratingController.rateGame);
router.post('/platform', protect, ratingController.ratePlatform);
router.get('/game/:productId', ratingController.getGameRatings);
router.get('/popular', ratingController.getPopularRatings);
router.get('/platform/public', ratingController.getPublicPlatformRatings);
router.get('/admin/list', ratingController.getRatingsAdmin);
router.patch('/admin/:id/hide', ratingController.hideRating);
router.delete('/admin/:id', ratingController.deleteRating);

module.exports = router;
