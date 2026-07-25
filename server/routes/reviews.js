const express = require('express');
const { createReview, getHelperReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('household'), createReview);
router.get('/helper/:helperId', getHelperReviews);

module.exports = router;
