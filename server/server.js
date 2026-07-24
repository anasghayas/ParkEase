const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB ParkEase'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the ParkEase API' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
