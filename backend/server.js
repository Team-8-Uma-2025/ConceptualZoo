// server.js - Updated version
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Create express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://conceptual-zoo-wildwood.vercel.app",
      "https://conceptual-zoo-wildwood.vercel.app/",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5, // Reduced for serverless
  queueLimit: 0,
});

// Test database connection only in development
if (process.env.NODE_ENV !== "production") {
  async function testConnection() {
    try {
      const connection = await pool.getConnection();
      console.log("Connected to MySQL database");
      connection.release();
    } catch (err) {
      console.error("Database connection failed:", err);
    }
  }
  testConnection();
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Import routes
const authRoutes = require('./routes/auth.routes')(pool, jwt, bcrypt);
const staffRoutes = require('./routes/staff.routes')(pool, authenticateToken);
const animalRoutes = require('./routes/animal.routes')(pool, authenticateToken);
const notificationRoutes = require('./routes/notification.routes')(pool, authenticateToken);
const enclosureRoutes = require('./routes/enclosure.routes')(pool, authenticateToken);
// const visitorRoutes = require('./routes/visitor.routes')(pool, authenticateToken);
const ticketRoutes = require('./routes/ticket.routes')(pool, authenticateToken);
const observationRoutes = require('./routes/observation.routes')(pool, authenticateToken);
const attractionRoutes = require('./routes/attractions.routes')(pool, authenticateToken);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/enclosures', enclosureRoutes);
// app.use('/api/visitors', visitorRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/attractions', attractionRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Wild Wood Zoo API is running");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working correctly",
    method: req.method,
    url: req.url,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Only start server in development, not in Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// For Vercel serverless
module.exports = app;
