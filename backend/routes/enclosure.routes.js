// routes/enclosure.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Get all enclosures
  router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM enclosures');
    
    // Convert ImageData BLOB to Base64 string
    const enclosures = rows.map(enclosure => {
      if (enclosure.ImageData) {
        // Convert Buffer -> Base64
        const base64Image = enclosure.ImageData.toString('base64');
        // Optional: store it in a separate field
        enclosure.ImageData = base64Image;
      }
      return enclosure;
    });

    res.json(enclosures);
  } catch (err) {
    console.error('Error fetching enclosures:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
  
  // Get enclosure by ID
  router.get('/:id', async (req, res) => {
    try {
      // TODO: Implement getting a single enclosure with its animals
      const enclosureId = req.params.id;
      
      // Verify enclosureID is number
      if(isNaN(enclosureId)){
        return res.status(400).json({ error: 'Invalid Enclosure ID. ID must be a number' });
      }

      // retreive enclosure details along animals
      const [rows] = await pool.query(
        `SELECT e.EnclosureID, e.Name AS EnclosureName, e.Type AS EnclosureType, 
            e.Capacity AS AnimalCapacity, e.Location, a.AnimalID, a.Name AS AnimalName,
            a.Species, a.Gender, a.DateOfBirth, a.HealthStatus, a.DangerLevel
        FROM enclosures AS e  
        LEFT JOIN animals AS a ON e.EnclosureID = a.EnclosureID
        WHERE e.EnclosureID = ?`,

        [enclosureId] // replaces placeholder
      ); 

      // If enclosure does not exist
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Enclosure not found' });
      }

      // Format json data to have animals data more organized with their enclosure
      const enclosureData = {
        EnclosureID: rows[0].EnclosureID,
        Name: rows[0].EnclosureName,
        Type: rows[0].EnclosureType,
        Capacity: rows[0].AnimalCapacity,
        Location: rows[0].Location,
        Animals: rows.map(row => ({
          AnimalID: row.AnimalID,
          Name: row.AnimalName,
          Species: row.Species,
          Gender: row.Gender,
          DateOfBirth: row.DateOfBirth,
          HealthStatus: row.HealthStatus,
          DangerLevel: row.DangerLevel
        }))
      }

      // Return results
      res.json(enclosureData);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch enclosure' });
    }
  });

  // Get enclosures for a specific staff member (considering both direct management and assignments)
  router.get('/staff/:id', authenticateToken, async (req, res) => {
    try {
      const staffId = req.params.id;

      // Query to get enclosures managed directly or assigned to the staff member
      const [enclosures] = await pool.query(`
        SELECT DISTINCT 
          e.EnclosureID, 
          e.Name, 
          e.Type, 
          e.Capacity, 
          e.Location, 
          s.Staff AS ManagerID, 
          s.Name AS ManagerName,
          s.StaffType AS ManagerType,
          CASE 
            WHEN e.StaffID = ? THEN 'Manager'
            ELSE 'Assigned'
          END AS StaffRelation
        FROM enclosures e
        LEFT JOIN staff s ON e.StaffID = s.Staff
        LEFT JOIN staff_enclosure_assignments sea ON e.EnclosureID = sea.EnclosureID
        WHERE e.StaffID = ? OR sea.StaffID = ?
      `, [staffId, staffId, staffId]);

      res.json(enclosures);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch enclosures for staff member: ' + err.message });
    }
  });

  //Get enclosures by type
  router.get('/type/:type', async (req, res) => {
    const { type } = req.params;
    try {
      const [rows] = await pool.query(
        'SELECT * FROM zoodb.enclosures WHERE Type = ?',
        [type]
      );
      return res.json(rows);
    } catch (err) {
      console.error('Error fetching enclosures by type:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Add new enclosure (staff only)
  router.post('/', authenticateToken, async (req, res) => {
    try {

      // Check that the user is staff with appropriate permissions
      if(req.user.staffRole !== 'Manager'){
        return res.status(403).json({error: 'Denied. Appropriate staff only'})
      }
      
      // retreive data from user in request body
      const {StaffID, Name, Type, Capacity, Location} = req.body;

      // Ensure required feilds are entered
      if(!StaffID || !Name || !Type || !Capacity || !Location){
        return res.status(400).json({error: `StaffID, Name, Type, Capacity, and Location are required`});
      }

      // Insert data into database
      const [result] = await pool.query(
        `INSERT INTO enclosures (StaffID, Name, Type, Capacity, Location)
        VALUES (?, ?, ?, ?, ?)`,
        [StaffID, Name, Type, Capacity, Location]
      );

      // successful creation 
      res.status(201).json({ 
        message: 'New enclosure created', 
        EnclosureID: result.insertId // return enclosure created
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add enclosure' });
    }
  });
  
  // Update enclosure (Manager only)
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      // TODO: Implement updating an enclosure
      const enclosureId = req.params.id;
      
      // Verify enclosureID is number
      if(isNaN(enclosureId)){
        return res.status(400).json({ error: 'Invalid Enclosure ID. ID must be a number' });
      }

      // Check that the user is staff with appropriate permissions
      if(req.user.staffRole !== 'Manager'){
        return res.status(403).json({error: 'Denied. staff only'})
      }

      const {Name, Type, Capacity, Location} = req.body; // receive entries

      // Ensure at least one entry was sent by user
      if (!Name && !Type && !Capacity && !Location) {
        return res.status(400).json({ error: 'At least one field (Name, Type, Capacity, Location) must be provided for update' });
      }

      // dynamically query fields entered
      const entryField = [];
      const values = [];

      if(Name){
        entryField.push('Name = ?');
        values.push(Name);
      }
      if (Type) {
        entryField.push('Type = ?');
        values.push(Type);
      }
      if (Capacity) {
        entryField.push('Capacity = ?');
        values.push(Capacity);
      }
      if (Location) {
        entryField.push('Location = ?');
        values.push(Location);
      }
      values.push(enclosureId); // for WHERE clause for which enclosure to update
      
      // update query
      const query = `
        UPDATE enclosures
        SET ${entryField.join(', ')}
        WHERE EnclosureID = ?`;
      const [result] = await pool.query(query, values);

      // check if rows updated
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Enclosure not found or no changes made' });
      }

      res.json({ message: `Enclosure ${enclosureId} updated` });
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
      
      // Verify enclosureID is number
      if(isNaN(enclosureId)){
        return res.status(400).json({ error: 'Invalid Enclosure ID. ID must be a number' });
      }

      // Check that the user is staff with appropriate permissions
      if(req.user.staffRole !== 'Manager'){
        return res.status(403).json({error: 'Denied. staff only'})
      }

      // check if enclosure to delete exists
      const [enclosureCheck] = await pool.query( 'SELECT * FROM enclosures WHERE EnclosureID = ?',
        [enclosureId]
      );

      if (enclosureCheck.length === 0) {
        return res.status(404).json({ error: 'Enclosure not found.' });
      }

      // delete enclosure (cascade will also remove associated animals)
      await pool.query(`DELETE FROM enclosures WHERE EnclosureID = ?`, [enclosureId]);

      res.json({ message: `Enclosure with ID ${enclosureId} and its animals were deleted` });
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
      res.status(500).json({ error: 'Failed to fetch staff assigned to enclosure' });
    }
    
  });
  
  return router;
};