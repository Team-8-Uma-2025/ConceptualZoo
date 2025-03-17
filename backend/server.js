// server.js - Updated version
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Using promise version
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const attractionsRoutes = require('./routes/attractions.routes');

// Create express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Default MySQL port
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

testConnection();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Import routes
const authRoutes = require('./routes/auth.routes')(pool, jwt, bcrypt);
const staffRoutes = require('./routes/staff.routes')(pool, authenticateToken);
// const animalRoutes = require('./routes/animal.routes')(pool, authenticateToken);
const enclosureRoutes = require('./routes/enclosure.routes')(pool, authenticateToken);
const attractionRoutes = require('./routes/attractions.routes')(pool, authenticateToken);
// const visitorRoutes = require('./routes/visitor.routes')(pool, authenticateToken);
// const ticketRoutes = require('./routes/ticket.routes')(pool, authenticateToken);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
// app.use('/api/animals', animalRoutes);
app.use('/api/enclosures', enclosureRoutes(pool));
app.use('/api/attractions', attractionRoutes(pool));
// app.use('/api/visitors', visitorRoutes);
// app.use('/api/tickets', ticketRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Wild Wood Zoo API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));