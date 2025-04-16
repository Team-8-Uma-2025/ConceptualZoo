// routes/visitor.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Get all visitors (admin only)
  router.get('/', authenticateToken, async (req, res) => {
    try {
      // Check that user has admin permissions
      if (req.user.role !== 'staff' || req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }
      
      const [visitors] = await pool.query(
        'SELECT VisitorID, firstName, lastName, Username, visitDate FROM visitors'
      );
      
      res.json(visitors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visitors' });
    }
  });
  
  // Get visitor by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;
      
      // Check that user is either admin or the visitor themselves
      if (req.user.role === 'visitor' && req.user.id !== parseInt(visitorId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const [visitors] = await pool.query(
        'SELECT VisitorID, firstName, lastName, Username, visitDate, billingAddress FROM visitors WHERE VisitorID = ?',
        [visitorId]
      );
      
      if (visitors.length === 0) {
        return res.status(404).json({ error: 'Visitor not found' });
      }
      
      res.json(visitors[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visitor' });
    }
  });
  
  // Update visitor
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;
      const { firstName, lastName, billingAddress } = req.body;
      
      // Check that user is either admin or the visitor themselves
      if (req.user.role === 'visitor' && req.user.id !== parseInt(visitorId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Validate input
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
      }
      
      // Update visitor information
      const [result] = await pool.query(
        'UPDATE visitors SET firstName = ?, lastName = ?, billingAddress = ? WHERE VisitorID = ?',
        [firstName, lastName, billingAddress || null, visitorId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Visitor not found' });
      }
      
      res.json({ 
        message: 'Visitor updated successfully',
        visitor: {
          VisitorID: parseInt(visitorId),
          firstName,
          lastName,
          billingAddress
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update visitor' });
    }
  });
  
  // Delete visitor account
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;
      const { password } = req.body;
      
      // Check that user is the visitor themselves
      if (req.user.role !== 'visitor' || req.user.id !== parseInt(visitorId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Validate input
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      // Get visitor record
      const [visitors] = await pool.query(
        'SELECT Password FROM visitors WHERE VisitorID = ?',
        [visitorId]
      );
      
      if (visitors.length === 0) {
        return res.status(404).json({ error: 'Visitor not found' });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, visitors[0].Password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      // Begin transaction to delete all related data
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Delete tickets
        await connection.query('DELETE FROM tickets WHERE VisitorID = ?', [visitorId]);
        
        // Delete transactions
        await connection.query('DELETE FROM transactions WHERE VisitorID = ?', [visitorId]);
        
        // Delete visitor
        await connection.query('DELETE FROM visitors WHERE VisitorID = ?', [visitorId]);
        
        await connection.commit();
        res.json({ message: 'Account deleted successfully' });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });
  
  // Get visitor's transactions
  router.get('/:id/transactions', authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;
      
      // Check that user is either admin or the visitor themselves
      if (req.user.role === 'visitor' && req.user.id !== parseInt(visitorId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Get transactions for this visitor
      const [transactions] = await pool.query(
        `SELECT t.TransactionID, t.GiftShopID, gs.GiftShopName, t.VisitorID, t.DateTime, t.TotalPaid,
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'productID', td.ProductID,
                    'productName', p.Name,
                    'quantity', td.Quantity,
                    'unitPrice', td.UnitPrice,
                    'subtotal', (td.Quantity * td.UnitPrice)
                  )
                ) as items
         FROM transactions t
         JOIN transaction_details td ON t.TransactionID = td.TransactionID
         JOIN products p ON td.ProductID = p.ProductID
         JOIN giftshops gs ON t.GiftShopID = gs.GiftShopID
         WHERE t.VisitorID = ?
         GROUP BY t.TransactionID
         ORDER BY t.DateTime DESC`,
        [visitorId]
      );
      
      res.json(transactions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visitor transactions' });
    }
  });
  
  return router;
};