const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const { 
  createBooking, 
  getCustomerBookings, 
  getOwnerBookings, 
  updateBookingStatus 
} = require('../controllers/bookingController');

// Customer routes
router.post('/', auth, restrictTo('customer'), createBooking);
router.get('/my-bookings', auth, restrictTo('customer'), getCustomerBookings);

// Owner routes
router.get('/requests', auth, restrictTo('owner'), getOwnerBookings);
router.patch('/:id/status', auth, restrictTo('owner'), updateBookingStatus);

module.exports = router;
