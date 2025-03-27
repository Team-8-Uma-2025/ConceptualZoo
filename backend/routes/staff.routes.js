// routes/staff.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Middleware to check if user is admin or manager
  const isAdminOrManager = (req, res, next) => {
    if (req.user.role !== 'staff' || req.user.staffRole !== 'Manager') {
      return res.status(403).json({ error: 'Access denied. Requires manager privileges.' });
    }
    next();
  };
  
  // Get all staff members (admin only)
  router.get('/', authenticateToken, isAdminOrManager, async (req, res) => {
    try {
      const [staff] = await pool.query(
        'SELECT Staff, Name, Role, StaffType, Username FROM staff'
      );
      
      res.json(staff);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch staff members: ' + err.message });
    }
  });
  
  // Get staff member by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      
      // Staff can view their own record, or managers can view any record
      if (req.user.role !== 'staff' || 
         (req.user.id !== parseInt(id) && 
          req.user.staffRole !== 'Manager')) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const [staff] = await pool.query(
        'SELECT Staff, Name, Role, Birthdate, Sex, Address, HireDate, SupervisorID, Username FROM staff WHERE Staff = ?',
        [id]
      );
      
      if (staff.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      
      res.json(staff[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch staff member: ' + err.message });
    }
  });
  
  // Update staff member
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { name, role, address, supervisorID } = req.body;
      
      // Staff can update their own record (limited fields), or managers can update any record
      if (req.user.role !== 'staff' || 
         (req.user.id !== parseInt(id) && 
          req.user.staffRole !== 'Manager')) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Regular staff can only update their address
      if (req.user.id === parseInt(id) && req.user.staffRole !== 'Manager') {
        await pool.query(
          'UPDATE staff SET Address = ? WHERE Staff = ?',
          [address, id]
        );
        
        return res.json({ message: 'Staff address updated successfully' });
      }
      
      // Managers can update more fields
      await pool.query(
        'UPDATE staff SET Name = ?, Role = ?, Address = ?, SupervisorID = ? WHERE Staff = ?',
        [name, role, address, supervisorID, id]
      );
      
      res.json({ message: 'Staff member updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update staff member: ' + err.message });
    }
  });
  
  // Get staff by enclosure
  router.get('/enclosure/:id', authenticateToken, async (req, res) => {
    try {
      const enclosureId = req.params.id;
      
      const [staff] = await pool.query(
        'SELECT s.Staff, s.Name, s.Role FROM staff s JOIN enclosures e ON s.Staff = e.Staff WHERE e.EnclosureID = ?',
        [enclosureId]
      );
      
      res.json(staff);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch staff for enclosure: ' + err.message });
    }
  });
  
  return router;
};