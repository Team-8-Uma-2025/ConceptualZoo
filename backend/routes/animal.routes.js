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
      
      res.json({ message: "This endpoint will return all animals" });
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
      
      res.json({ message: `This endpoint will return animal with ID ${animalId}` });
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
      
      res.status(201).json({ message: 'This endpoint will create a new animal' });
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
      
      res.json({ message: `This endpoint will return animals in enclosure ${enclosureId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch animals by enclosure' });
    }
  });
  
  return router;
};