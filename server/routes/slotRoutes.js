const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const upload = require('../utils/upload');
const { addSlot, getAllSlots, getMySlots } = require('../controllers/slotController');

// Public route to search slots
router.get('/', getAllSlots);

// Protected owner route to view their own slots
router.get('/my-slots', auth, restrictTo('owner'), getMySlots);

// Protected owner route to add a slot with image upload
router.post('/', auth, restrictTo('owner'), upload.single('image'), addSlot);

module.exports = router;
