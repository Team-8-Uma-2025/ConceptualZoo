// routes/visitor.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Get all visitors (admin only)
  router.get('/', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement getting all visitors (admin only)
      // Check that user has admin permissions
      
      res.json({ message: "This endpoint will return all visitors" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visitors' });
    }
  });
  
  // Get visitor by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement getting a single visitor
      // Check that user is either admin or the visitor themselves
      const visitorId = req.params.id;
      
      res.json({ message: `This endpoint will return visitor with ID ${visitorId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visitor' });
    }
  });
  
  // Update visitor
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement updating a visitor
      // Check that user is either admin or the visitor themselves
      const visitorId = req.params.id;
      
      res.json({ message: `This endpoint will update visitor with ID ${visitorId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update visitor' });
    }
  });
  
  // Get visitor's transactions
  router.get('/:id/transactions', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement getting a visitor's transactions
      // Check that user is either admin or the visitor themselves
      const visitorId = req.params.id;
      
      res.json({ message: `This endpoint will return transactions for visitor ${visitorId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visitor transactions' });
    }
  });
  
  // Update visitor's membership
  router.put('/:id/membership', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement updating a visitor's membership status
      // Check that user is either admin or the visitor themselves
      const visitorId = req.params.id;
      const { membership } = req.body;
      
      res.json({ message: `This endpoint will update membership status for visitor ${visitorId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update membership' });
    }
  });
  
  return router;
};