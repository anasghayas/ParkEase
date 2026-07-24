const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const upload = require('../utils/upload');
const { addSlot, getAllSlots, getMySlots, getSlotById, deleteSlot } = require('../controllers/slotController');

// Public route to search slots
router.get('/', getAllSlots);

// Protected owner route to view their own slots
router.get('/my-slots', auth, restrictTo('owner'), getMySlots);

// Public route to get a single slot
router.get('/:id', getSlotById);

// Protected owner route to add a slot with image upload
router.post('/', auth, restrictTo('owner'), upload.single('image'), addSlot);

// Protected owner route to delete a slot
router.delete('/:id', auth, restrictTo('owner'), deleteSlot);

module.exports = router;
