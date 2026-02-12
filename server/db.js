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

  connection.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ticketing'}`,
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
  const createTicketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      created_by VARCHAR(100),
      assigned_to VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  pool.query(createTicketsTable, (err) => {
    if (err) {
      console.error('Error creating tickets table:', err);
    } else {
      console.log('Tickets table ready');
    }
  });
};

module.exports = {
  pool: pool.promise(),
  createDatabase,
  initTables
};
