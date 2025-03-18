// api/index.js - Adapter for Vercel serverless functions
const path = require('path');
const app = require('../backend/server');

// Export the Express app as a Vercel serverless function
module.exports = app;