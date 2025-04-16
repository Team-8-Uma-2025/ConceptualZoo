// routes/visitor.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
  // Delete visitor account through anonymization (schema-preserving version)
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

      // Begin transaction for account anonymization
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Generate random string for anonymization
        const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const anonymousUsername = `deleted${randomSuffix}`;

        // Generate a random password hash
        const randomPassword = Math.random().toString(36).slice(-10);
        const anonymousPasswordHash = await bcrypt.hash(randomPassword, 10);

        // Update the visitor record - anonymize all PII without changing schema
        await connection.query(
          `UPDATE visitors SET 
          firstName = 'Deleted', 
          lastName = 'User', 
          Username = ?, 
          Password = ?, 
          billingAddress = NULL
         WHERE VisitorID = ?`,
          [anonymousUsername, anonymousPasswordHash, visitorId]
        );

        // Commit the transaction
        await connection.commit();

        // Send success response
        res.json({
          message: 'Account deleted successfully. All personal data has been removed.'
        });

      } catch (err) {
        // Rollback in case of errors
        await connection.rollback();
        throw err;
      } finally {
        // Release the database connection
        connection.release();
      }
    } catch (err) {
      console.error('Error during account deletion:', err);
      res.status(500).json({
        error: 'Failed to delete account. Please try again or contact support.'
      });
    }
  });

  // Change visitor password
  router.put('/:id/password', authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      // Check that user is the visitor themselves
      if (req.user.role !== 'visitor' || req.user.id !== parseInt(visitorId)) {
        return res.status(403).json({ error: 'Access denied. You can only change your own password.' });
      }

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Get visitor record to check current password
      const [visitors] = await pool.query(
        'SELECT Password FROM visitors WHERE VisitorID = ?',
        [visitorId]
      );

      if (visitors.length === 0) {
        return res.status(404).json({ error: 'Visitor not found' });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, visitors[0].Password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      const [result] = await pool.query(
        'UPDATE visitors SET Password = ? WHERE VisitorID = ?',
        [hashedPassword, visitorId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Failed to update password' });
      }

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update password' });
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