// routes/notification.routes.js
const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get all notifications for a specific staff type
  router.get('/', authenticateToken, async (req, res) => {
    try {
      // Check that user is staff
      if (req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Access denied. Staff only.' });
      }
      
      // Get staff info - use username as a backup
      let staffResult;
      
      if (req.user.id) {
        [staffResult] = await pool.query(
          'SELECT * FROM staff WHERE Staff = ?',
          [req.user.id]
        );
      }
      
      // If not found by ID, try username
      if (!staffResult || staffResult.length === 0) {
        [staffResult] = await pool.query(
          'SELECT * FROM staff WHERE Username = ?',
          [req.user.username]
        );
      }
      
      if (staffResult.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      
      const staffType = staffResult[0].StaffType;
      const role = staffResult[0].Role;
      
      let notifications;
      
      // If manager, get all notifications
      if (role === 'Manager') {
        [notifications] = await pool.query(
          'SELECT * FROM notification ORDER BY NotificationID DESC'
        );
      } else {
        // Otherwise, get notifications for this staff type
        [notifications] = await pool.query(
          'SELECT * FROM notification WHERE StaffType = ? ORDER BY NotificationID DESC',
          [staffType]
        );
      }
      
      res.json(notifications);
    } catch (err) {
      console.error('Error in notification route:', err);
      res.status(500).json({ error: 'Failed to fetch notifications. Please try again later.' });
    }
  });
  
  // Mark a notification as acknowledged
  router.put('/:id/acknowledge', authenticateToken, async (req, res) => {
    try {
      const notificationId = req.params.id;
      
      // Check that user is staff
      if (req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Access denied. Staff only.' });
      }
      
      // Get staff info
      let staffResult;
      
      if (req.user.id) {
        [staffResult] = await pool.query(
          'SELECT * FROM staff WHERE Staff = ?',
          [req.user.id]
        );
      }
      
      // If not found by ID, try username
      if (!staffResult || staffResult.length === 0) {
        [staffResult] = await pool.query(
          'SELECT * FROM staff WHERE Username = ?',
          [req.user.username]
        );
      }
      
      if (staffResult.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      
      const staffType = staffResult[0].StaffType;
      const role = staffResult[0].Role;
      
      // Check if notification exists and belongs to this staff type (or user is a manager)
      let notificationResult;
      
      if (role === 'Manager') {
        [notificationResult] = await pool.query(
          'SELECT * FROM notification WHERE NotificationID = ?',
          [notificationId]
        );
      } else {
        [notificationResult] = await pool.query(
          'SELECT * FROM notification WHERE NotificationID = ? AND StaffType = ?',
          [notificationId, staffType]
        );
      }
      
      if (notificationResult.length === 0) {
        return res.status(404).json({ error: 'Notification not found or access denied' });
      }
      
      // Update notification to acknowledged
      await pool.query(
        'UPDATE notification SET Acknowledged = 1 WHERE NotificationID = ?',
        [notificationId]
      );
      
      res.json({ message: 'Notification acknowledged successfully' });
    } catch (err) {
      console.error('Error acknowledging notification:', err);
      res.status(500).json({ error: 'Failed to acknowledge notification. Please try again later.' });
    }
  });

  return router;
};