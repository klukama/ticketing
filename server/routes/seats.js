const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get seats for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const [seats] = await pool.query(
      'SELECT * FROM seats WHERE event_id = ? ORDER BY section, row_label, number',
      [req.params.eventId]
    );
    res.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

module.exports = router;
