// routes/observation.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Get observations for an animal
  router.get('/animal/:id', authenticateToken, async (req, res) => {
    try {
      const animalId = req.params.id;
      
      const [observations] = await pool.query(
        `SELECT o.*, s.Name as StaffName, a.Name as AnimalName, 
        ack.Name as AcknowledgedByName
        FROM observations o
        JOIN staff s ON o.StaffID = s.Staff
        JOIN animals a ON o.AnimalID = a.AnimalID
        LEFT JOIN staff ack ON o.AcknowledgedBy = ack.Staff
        WHERE o.AnimalID = ?
        ORDER BY o.Timestamp DESC`,
        [animalId]
      );
      
      res.json(observations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch observations' });
    }
  });
  
  // Add new observation (Zookeepers, Managers, and Staff)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { animalId, title, content } = req.body;
      
      // Check if user is authorized to add observations
      const canAddObservation = 
        req.user.staffRole === 'Manager' || 
        req.user.staffType === 'Zookeeper' || 
        req.user.staffRole === 'Staff';
      
      if (!canAddObservation) {
        return res.status(403).json({ error: 'Not authorized to add observations' });
      }
      
      const [result] = await pool.query(
        'INSERT INTO observations (StaffID, AnimalID, Title, Content) VALUES (?, ?, ?, ?)',
        [req.user.id, animalId, title, content]
      );
      
      res.status(201).json({ 
        message: 'Observation added successfully',
        observationId: result.insertId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add observation' });
    }
  });
  
  // Acknowledge observation (Vets and Managers only)
  router.put('/:id/acknowledge', authenticateToken, async (req, res) => {
    try {
      const observationId = req.params.id;
      
      // Check if user is authorized to acknowledge observations
      const canAcknowledge = 
        req.user.staffRole === 'Manager' || 
        req.user.staffType === 'Vet' || 
        req.user.staffRole === 'Staff';
      
      if (!canAcknowledge) {
        return res.status(403).json({ error: 'Not authorized to acknowledge observations' });
      }
      
      const [result] = await pool.query(
        'UPDATE observations SET Acknowledged = 1, AcknowledgedBy = ?, AcknowledgedAt = NOW() WHERE ObservationID = ? AND Acknowledged = 0',
        [req.user.id, observationId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Observation not found or already acknowledged' });
      }
      
      res.json({ message: 'Observation acknowledged successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to acknowledge observation' });
    }
  });
  
  return router;
};