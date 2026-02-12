const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Helper function to generate seats for an event
function generateSeatsForEvent(eventId, config) {
  const seats = [];
  const { leftRows, leftCols, rightRows, rightCols, backRows, backCols } = config;
  
  // Generate left section seats
  for (let row = 0; row < leftRows; row++) {
    const rowLabel = String.fromCharCode(65 + row); // A, B, C, ...
    for (let col = 1; col <= leftCols; col++) {
      seats.push({
        id: uuidv4(),
        event_id: eventId,
        row_label: rowLabel,
        number: col,
        section: 'LEFT',
        status: 'AVAILABLE'
      });
    }
  }
  
  // Generate right section seats
  for (let row = 0; row < rightRows; row++) {
    const rowLabel = String.fromCharCode(65 + row); // A, B, C, ...
    for (let col = 1; col <= rightCols; col++) {
      seats.push({
        id: uuidv4(),
        event_id: eventId,
        row_label: rowLabel,
        number: col,
        section: 'RIGHT',
        status: 'AVAILABLE'
      });
    }
  }
  
  // Generate back section seats if configured
  if (backRows > 0 && backCols > 0) {
    for (let row = 0; row < backRows; row++) {
      const rowLabel = String.fromCharCode(65 + row); // A, B, C, ...
      for (let col = 1; col <= backCols; col++) {
        seats.push({
          id: uuidv4(),
          event_id: eventId,
          row_label: rowLabel,
          number: col,
          section: 'BACK',
          status: 'AVAILABLE'
        });
      }
    }
  }
  
  return seats;
}

// Get all events
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY date ASC');
    
    // Get seat counts for each event
    const eventsWithCounts = await Promise.all(
      rows.map(async (event) => {
        const [counts] = await pool.query(
          'SELECT COUNT(*) as count FROM seats WHERE event_id = ?',
          [event.id]
        );
        return {
          ...event,
          _count: {
            seats: counts[0].count
          }
        };
      })
    );
    
    res.json(eventsWithCounts);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event with seats
router.get('/:id', async (req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const [seats] = await pool.query(
      'SELECT * FROM seats WHERE event_id = ? ORDER BY section, row_label, number',
      [req.params.id]
    );
    
    res.json({
      ...events[0],
      seats
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      date,
      totalSeats,
      imageUrl,
      leftRows = 6,
      leftCols = 5,
      rightRows = 6,
      rightCols = 5,
      backRows = 0,
      backCols = 0
    } = req.body;

    if (!title || !venue || !date) {
      return res.status(400).json({ error: 'Title, venue, and date are required' });
    }

    const eventId = uuidv4();
    
    // Insert event
    await pool.query(
      `INSERT INTO events (id, title, description, venue, date, total_seats, image_url, 
       left_rows, left_cols, right_rows, right_cols, back_rows, back_cols) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, title, description, venue, date, totalSeats || 0, imageUrl,
       leftRows, leftCols, rightRows, rightCols, backRows, backCols]
    );
    
    // Generate and insert seats
    const seats = generateSeatsForEvent(eventId, {
      leftRows, leftCols, rightRows, rightCols, backRows, backCols
    });
    
    if (seats.length > 0) {
      const values = seats.map(seat => [
        seat.id, seat.event_id, seat.row_label, seat.number, seat.section, seat.status
      ]);
      
      await pool.query(
        `INSERT INTO seats (id, event_id, row_label, number, section, status) VALUES ?`,
        [values]
      );
    }

    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    res.status(201).json(events[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.patch('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      date,
      totalSeats,
      imageUrl,
      leftRows,
      leftCols,
      rightRows,
      rightCols,
      backRows,
      backCols
    } = req.body;
    
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (venue !== undefined) {
      updates.push('venue = ?');
      params.push(venue);
    }
    if (date !== undefined) {
      updates.push('date = ?');
      params.push(date);
    }
    if (totalSeats !== undefined) {
      updates.push('total_seats = ?');
      params.push(totalSeats);
    }
    if (imageUrl !== undefined) {
      updates.push('image_url = ?');
      params.push(imageUrl);
    }
    if (leftRows !== undefined) {
      updates.push('left_rows = ?');
      params.push(leftRows);
    }
    if (leftCols !== undefined) {
      updates.push('left_cols = ?');
      params.push(leftCols);
    }
    if (rightRows !== undefined) {
      updates.push('right_rows = ?');
      params.push(rightRows);
    }
    if (rightCols !== undefined) {
      updates.push('right_cols = ?');
      params.push(rightCols);
    }
    if (backRows !== undefined) {
      updates.push('back_rows = ?');
      params.push(backRows);
    }
    if (backCols !== undefined) {
      updates.push('back_cols = ?');
      params.push(backCols);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(req.params.id);
    await pool.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(events[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Update seat status
router.patch('/:eventId/seats', async (req, res) => {
  try {
    const { seatIds, status, bookedBy, bookingId } = req.body;
    
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'seatIds array is required' });
    }
    
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    
    const updates = ['status = ?'];
    const params = [status];
    
    if (status === 'BOOKED') {
      updates.push('booked_by = ?', 'booked_at = NOW()');
      params.push(bookedBy || null);
      
      if (bookingId) {
        updates.push('booking_id = ?');
        params.push(bookingId);
      }
    } else if (status === 'AVAILABLE') {
      updates.push('booked_by = NULL', 'booked_at = NULL', 'booking_id = NULL', 'ticket_number = NULL');
    }
    
    // Update each seat
    for (const seatId of seatIds) {
      await pool.query(
        `UPDATE seats SET ${updates.join(', ')} WHERE id = ? AND event_id = ?`,
        [...params, seatId, req.params.eventId]
      );
    }
    
    // Return updated seats
    const placeholders = seatIds.map(() => '?').join(',');
    const [seats] = await pool.query(
      `SELECT * FROM seats WHERE id IN (${placeholders})`,
      seatIds
    );
    
    res.json(seats);
  } catch (error) {
    console.error('Error updating seats:', error);
    res.status(500).json({ error: 'Failed to update seats' });
  }
});

module.exports = router;
