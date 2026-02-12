const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Create a booking
router.post('/', async (req, res) => {
  try {
    const {
      eventId,
      seatIds,
      customerFirstName,
      customerLastName,
      sellerFirstName,
      sellerLastName
    } = req.body;

    if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'eventId and seatIds are required' });
    }

    if (!customerFirstName || !customerLastName || !sellerFirstName || !sellerLastName) {
      return res.status(400).json({ error: 'Customer and seller names are required' });
    }

    const bookingId = uuidv4();
    
    // Create booking
    await pool.query(
      `INSERT INTO bookings (id, event_id, customer_first_name, customer_last_name, 
       seller_first_name, seller_last_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [bookingId, eventId, customerFirstName, customerLastName, sellerFirstName, sellerLastName]
    );
    
    // Update seats with booking
    const placeholders = seatIds.map(() => '?').join(',');
    await pool.query(
      `UPDATE seats SET status = 'BOOKED', booking_id = ?, 
       booked_by = ?, booked_at = NOW(), ticket_number = UUID() 
       WHERE id IN (${placeholders}) AND status = 'AVAILABLE'`,
      [bookingId, `${customerFirstName} ${customerLastName}`, ...seatIds]
    );

    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );
    
    const [seats] = await pool.query(
      `SELECT * FROM seats WHERE booking_id = ?`,
      [bookingId]
    );
    
    res.status(201).json({
      ...bookings[0],
      seats
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get bookings for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE event_id = ?',
      [req.params.eventId]
    );
    
    // Get seats for each booking
    const bookingsWithSeats = await Promise.all(
      bookings.map(async (booking) => {
        const [seats] = await pool.query(
          'SELECT * FROM seats WHERE booking_id = ?',
          [booking.id]
        );
        return {
          ...booking,
          seats
        };
      })
    );
    
    res.json(bookingsWithSeats);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
