const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const { getStats, getAllSlotsForAdmin, updateSlotApproval } = require('../controllers/adminController');

router.use(auth, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/slots', getAllSlotsForAdmin);
router.patch('/slots/:id/approve', updateSlotApproval);

module.exports = router;
