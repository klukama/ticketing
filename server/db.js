const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ticketing',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create database if it doesn't exist
const createDatabase = () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
  });

  const dbName = process.env.DB_NAME || 'ticketing';
  // Validate database name to prevent SQL injection
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    console.error('Invalid database name format');
    connection.end();
    return;
  }

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\``,
    (err) => {
      if (err) {
        console.error('Error creating database:', err);
      } else {
        console.log('Database ready');
      }
      connection.end();
    }
  );
};

// Initialize tables
const initTables = () => {
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
  `;

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
  `;

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
  `;

  pool.query(createEventsTable, (err) => {
    if (err) {
      console.error('Error creating events table:', err);
    } else {
      console.log('Events table ready');
      
      pool.query(createSeatsTable, (err) => {
        if (err) {
          console.error('Error creating seats table:', err);
        } else {
          console.log('Seats table ready');
        }
      });
      
      pool.query(createBookingsTable, (err) => {
        if (err) {
          console.error('Error creating bookings table:', err);
        } else {
          console.log('Bookings table ready');
        }
      });
    }
  });
};

module.exports = {
  pool: pool.promise(),
  createDatabase,
  initTables
};
