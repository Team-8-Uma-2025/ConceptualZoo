// routes/enclosure.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Get all enclosures
  router.get('/', async (req, res) => {
    try {
      const [enclosures] = await pool.query('SELECT * FROM enclosures');
      res.json(enclosures);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch enclosures: ' + err.message });
    }
  });

  // Get enclosure by ID
  router.get('/:id', async (req, res) => {
    try {
      const enclosureId = req.params.id;

      // Get the enclosure
      const [enclosures] = await pool.query(
        'SELECT * FROM enclosures WHERE EnclosureID = ?',
        [enclosureId]
      );

      if (enclosures.length === 0) {
        return res.status(404).json({ error: 'Enclosure not found' });
      }

      // Get animals in this enclosure
      const [animals] = await pool.query(
        'SELECT * FROM animals WHERE EnclosureID = ?',
        [enclosureId]
      );

      // Return combined data
      res.json({
        ...enclosures[0],
        animals: animals
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch enclosure' });
    }
  });

  // Get enclosures managed by a specific staff member
  router.get('/staff/:id', authenticateToken, async (req, res) => {
    try {
      const staffId = req.params.id;

      const [enclosures] = await pool.query(
        'SELECT * FROM enclosures WHERE StaffID = ?',
        [staffId]
      );

      res.json(enclosures);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch enclosures for staff member: ' + err.message });
    }
  });

  // Add new enclosure (staff only)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement adding a new enclosure
      // Check that the user is staff with appropriate permissions

      res.status(201).json({ message: 'This endpoint will create a new enclosure' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add enclosure' });
    }
  });

  // Update enclosure (staff only)
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement updating an enclosure
      const enclosureId = req.params.id;

      res.json({ message: `This endpoint will update enclosure with ID ${enclosureId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update enclosure' });
    }
  });

  // Delete enclosure (staff only)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement deleting an enclosure
      // NOTE: May need to handle moving animals first
      const enclosureId = req.params.id;

      res.json({ message: `This endpoint will delete enclosure with ID ${enclosureId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete enclosure' });
    }
  });

  // Assign staff to enclosure
  router.post('/:id/assign-staff', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement assigning staff to an enclosure
      const enclosureId = req.params.id;
      const { Staff } = req.body;

      res.json({ message: `This endpoint will assign staff ${Staff} to enclosure ${enclosureId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to assign staff to enclosure' });
    }
  });

  return router;
};