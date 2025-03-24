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
      // Ensure the user is staff
      if (req.user.role !== 'staff' && req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'You do not have permission to update animals' });
      }
  
      const animalId = req.params.id;
  
      // Build a dynamic UPDATE query
      const fields = [];
      const values = [];
  
      // Only push fields that were actually provided in the body
      if (req.body.Name !== undefined) {
        fields.push('Name = ?');
        values.push(req.body.Name);
      }
      if (req.body.Species !== undefined) {
        fields.push('Species = ?');
        values.push(req.body.Species);
      }
      if (req.body.DateOfBirth !== undefined) {
        fields.push('DateOfBirth = ?');
        values.push(req.body.DateOfBirth);
      }
      if (req.body.Gender !== undefined) {
        fields.push('Gender = ?');
        values.push(req.body.Gender);
      }
      if (req.body.HealthStatus !== undefined) {
        fields.push('HealthStatus = ?');
        values.push(req.body.HealthStatus);
      }
      if (req.body.LastVetCheckup !== undefined) {
        fields.push('LastVetCheckup = ?');
        values.push(req.body.LastVetCheckup);
      }
      if (req.body.EnclosureID !== undefined) {
        fields.push('EnclosureID = ?');
        values.push(req.body.EnclosureID);
      }
      if (req.body.DangerLevel !== undefined) {
        fields.push('DangerLevel = ?');
        values.push(req.body.DangerLevel);
      }
  
      // If no fields were provided, return an error
      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
  
      // Build the final SQL, e.g. "UPDATE animals SET Name=?, Species=? WHERE AnimalID=?"
      const sql = `UPDATE animals SET ${fields.join(', ')} WHERE AnimalID = ?`;
      values.push(animalId); // the last parameter in the WHERE clause
  
      // Execute the query
      const [result] = await pool.query(sql, values);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Animal not found' });
      }
  
      // Optionally, fetch the updated row to return it
      const [updatedRows] = await pool.query('SELECT * FROM animals WHERE AnimalID = ?', [animalId]);
      res.json({ message: 'Animal updated successfully', animal: updatedRows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update animal' });
    }
  });
  
  // Delete animal (staff only)
  router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Ensure the user is staff
    if (req.user.role !== 'staff' && req.user.staffRole !== 'Manager') {
      return res.status(403).json({ error: 'You do not have permission to delete animals' });
    }

    const animalId = req.params.id;

    // Perform the DELETE query
    const [result] = await pool.query(
      'DELETE FROM animals WHERE AnimalID = ?',
      [animalId]
    );

    // If no rows were deleted, the animal doesn't exist
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json({ message: 'Animal deleted successfully' });
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