const express = require('express');
const router = express.Router();
const Booking = require('../models/Bookings');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Create booking (user)
router.post('/', verifyToken, async (req, res) => {
  try {
    const bookingData = { ...req.body, userId: req.userId, bookingDate: new Date().toISOString().split('T')[0] };
    const booking = new Booking(bookingData);
    await booking.save();
    res.status(201).json({ message: 'Booking submitted', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings - admin gets all, users get only their own
router.get('/', verifyToken, async (req, res) => {
  try {
    let filter = {};
    
    if (req.userRole !== 'admin') {
      filter = { userId: req.userId };
    }
    
    const bookings = await Booking.find(filter).populate('userId', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking (admin approve/reject)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.status === 'confirmed') {
      updates.ticketNumber = `TKT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    } else if (updates.status === 'rejected') {
      updates.ticketNumber = null;
    }
    
    const booking = await Booking.findByIdAndUpdate(id, updates, { new: true }).populate('userId', 'name email');
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;