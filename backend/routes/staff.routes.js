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

  // get all staff that are 'Zookeeper'
  router.get('/zookeepers', async (req, res) => {
    try {
      const [zookeepers] = await pool.query(
        "SELECT Staff, Name FROM staff WHERE StaffType = 'Zookeeper'"
      );
      
      
      res.json(zookeepers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch zookeepers: ' + err.message });
    }
  })
  
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
        'SELECT Staff, Name, Role, Birthdate, Sex, Address, HireDate, SupervisorID, StaffType, Username FROM staff WHERE Staff = ?',
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

  // Delete a staff member (admin only)
  router.delete('/:id', authenticateToken, isAdminOrManager, async (req, res) => {
    try {
      const id = req.params.id;

      // Check if the staff member exists
      const [staffCheck] = await pool.query(
        'SELECT Staff FROM staff WHERE Staff = ?',
        [id]
      );

      if (staffCheck.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Check for dependencies (e.g., staff assigned to enclosures, etc.)
      const [enclosureCheck] = await pool.query(
        'SELECT EnclosureID FROM enclosures WHERE StaffID = ? LIMIT 1',
        [id]
      );

      if (enclosureCheck.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete staff member. They are assigned to one or more enclosures. Reassign enclosures first.'
        });
      }

      // Add additional dependency checks as needed for attractions, gift shops, etc.

      // If all checks pass, delete the staff member
      await pool.query('DELETE FROM staff WHERE Staff = ?', [id]);

      res.json({ message: 'Staff member deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete staff member: ' + err.message });
    }
  });

  return router;
};

