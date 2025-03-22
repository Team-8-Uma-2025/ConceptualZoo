// routes/animal.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Get all animals
  router.get('/', async (req, res) => {
    try {
      // TODO: Implement getting all animals with pagination
      // HINT: Use query parameters like ?limit=10&offset=0

      const {limit = 10, offset = 0, healthStatus} = req.query;
      const parsedLimit = parseInt(limit, 10) || 10;
      const parsedOffset = parseInt(offset, 10) || 0;


      let query = 'SELECT * FROM zoodb.animals';
      let params = [];

      if(healthStatus){
        query += ' WHERE HealthStatus = ?';
        params.push(healthStatus);
      }

      query += ' LIMIT ? OFFSET ?';
      params.push(parsedLimit, parsedOffset);

      const [rows] = await pool.query(query, params);
      
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch animals' });
    }
  });
  
  // Get animal by ID
  router.get('/:id', async (req, res) => {
    try {
      // TODO: Implement getting a single animal by ID
      const animalId = req.params.id;

      const [rows] = await pool.query(
        'SELECT * FROM zoodb.animals as a WHERE a.AnimalID = ?',
        [animalId]
      );

      if(rows.length === 0)
        return res.status(404).json({error: 'Animal not found'});
      
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch animal' });
    }
  });
  
  // Add new animal (staff only)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement adding a new animal
      // Check that the user is staff and has appropriate permissions

      const {Name, Species, DateOfBirth, Gender, HealthStatus, LastVetCheckup, EnclosureID, DangerLevel} = req.body;

      // Validate input
      if (!Name || !Species || !DateOfBirth || !Gender || !HealthStatus|| !LastVetCheckup || !EnclosureID || !DangerLevel) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      if(req.user.role !== 'staff' && req.user.staffRole !== 'Manager')
        return res.status(403).json({error: 'You do not have permission to add animals.'});

      const [result] = await pool.query(
        'INSERT INTO zoodb.animals (Name, Species, DateOfBirth, Gender, HealthStatus, LastVetCheckup, EnclosureID, DangerLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [Name, Species, DateOfBirth, Gender, HealthStatus, LastVetCheckup, EnclosureID, DangerLevel]
      );

      res.status(201).json({ 
        message: 'Animal added successfully',
        AnimalID: result.insertId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add animal' });
    }
  });
  
  // Update animal (staff only)
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement updating an animal
      const animalId = req.params.id;
      
      res.json({ message: `This endpoint will update animal with ID ${animalId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update animal' });
    }
  });
  
  // Delete animal (staff only)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement deleting an animal
      const animalId = req.params.id;
      
      res.json({ message: `This endpoint will delete animal with ID ${animalId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete animal' });
    }
  });
  
  // Get animals by enclosure
  router.get('/enclosure/:id', async (req, res) => {
    try {
      // TODO: Implement getting animals by enclosure
      const enclosureId = req.params.id;

      const [rows] = await pool.query(
        'SELECT * FROM zoodb.animals as a WHERE a.EnclosureID = ?',
        [enclosureId]
      );
      
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch animals by enclosure' });
    }
  });
  
  return router;
};