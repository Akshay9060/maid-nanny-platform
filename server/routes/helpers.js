const express = require('express');
const {
  listHelpers,
  getHelper,
  getMyHelperProfile,
  updateMyHelperProfile,
  addVerificationDocument,
} = require('../controllers/helperController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public browse/search
router.get('/', listHelpers);

// Helper self-service (must come before the /:id route)
router.get('/me/profile', protect, authorize('helper'), getMyHelperProfile);
router.put('/me/profile', protect, authorize('helper'), updateMyHelperProfile);
router.post('/me/documents', protect, authorize('helper'), addVerificationDocument);

router.get('/:id', getHelper);

module.exports = router;
