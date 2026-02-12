import mysql from 'mysql2'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticketing',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export const db = pool.promise()

// Initialize database tables on first import
const initTables = async () => {
  try {
    // Create database if it doesn't exist
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306')
    })

    const dbName = process.env.DB_NAME || 'ticketing'
    // Validate database name to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      console.error('Invalid database name format')
      return
    }

    await new Promise((resolve, reject) => {
      connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\``,
        (err) => {
          if (err) reject(err)
          else resolve(null)
          connection.end()
        }
      )
    })

    // Create tables
    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        venue VARCHAR(255) NOT NULL,
        date DATETIME NOT NULL,
        total_seats INT DEFAULT 0,
        image_url VARCHAR(500),
        left_rows INT DEFAULT 6,
        left_cols INT DEFAULT 5,
        right_rows INT DEFAULT 6,
        right_cols INT DEFAULT 5,
        back_rows INT DEFAULT 0,
        back_cols INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `

    const createSeatsTable = `
      CREATE TABLE IF NOT EXISTS seats (
        id VARCHAR(36) PRIMARY KEY,
        event_id VARCHAR(36) NOT NULL,
        row_label VARCHAR(10) NOT NULL,
        number INT NOT NULL,
        section VARCHAR(20) DEFAULT 'LEFT',
        status VARCHAR(20) DEFAULT 'AVAILABLE',
        booked_by VARCHAR(255),
        booked_at DATETIME,
        ticket_number VARCHAR(50) UNIQUE,
        booking_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE KEY unique_seat (event_id, section, row_label, number),
        INDEX idx_event_id (event_id),
        INDEX idx_booking_id (booking_id)
      )
    `

    const createBookingsTable = `
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        event_id VARCHAR(36) NOT NULL,
        customer_first_name VARCHAR(100) NOT NULL,
        customer_last_name VARCHAR(100) NOT NULL,
        seller_first_name VARCHAR(100) NOT NULL,
        seller_last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        INDEX idx_event_id (event_id)
      )
    `

    await db.query(createEventsTable)
    await db.query(createSeatsTable)
    await db.query(createBookingsTable)
    
    console.log('Database tables initialized')
  } catch (error) {
    console.error('Error initializing database tables:', error)
  }
}

// Call init on import (only runs once due to module caching)
initTables()
