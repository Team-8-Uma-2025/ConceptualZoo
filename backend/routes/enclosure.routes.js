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

  // enclsoure animal report with filters
  router.get('/report', async (req, res) => {
    try {
      // filters
      const {type, minCapacity, maxCapacity, vetAfter, vetBefore} = req.query;

      // base query (joins enclosures and animals tables)
      let query = `
      SELECT 
        e.EnclosureID,
        e.Name AS EnclosureName,
        e.Type AS EnclosureType,
        e.Capacity,
        e.Location,
        a.AnimalID,
        a.Name AS AnimalName,
        a.Species,
        a.Gender,
        a.HealthStatus,
        a.DangerLevel,
        a.LastVetCheckup
      FROM enclosures e
      LEFT JOIN animals a ON e.EnclosureID = a.EnclosureID
      `;

      
      const conditions = [];
      const values = [];

      // if user adds a enclosure type filter
      if(type) {
        conditions.push(`e.Type = ?`);
        values.push(type);
      }
      // add where section to query if type filter exists
      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }
      query += ` ORDER BY e.Type, e.Name`; // group output

      const [rows] = await pool.query(query, values); // execute query


      // organize report by type and enclosure
      const grouped = {};
      
      for(const row of rows) {
        const enclosureType = row.EnclosureType;
        if (!grouped[enclosureType]) grouped[enclosureType] = {};

        const enclosureID = row.EnclosureID;
        if (!grouped[enclosureType][enclosureID]) {
          grouped[enclosureType][enclosureID] = {
            EnclosureID: enclosureID,
            Name: row.EnclosureName,
            Type: enclosureType,
            Location: row.Location,
            Capacity: row.Capacity,
            Animals: [],
            HealthBreakdown: {},
            CapacityUsage: 0,
          };
        }

        // push animals and track their health, if there are animals in an enclosure
        if(row.AnimalID){
          const checkupDate = row.LastVetCheckup ? new Date(row.LastVetCheckup) : null;
          const vetAfterDate = vetAfter ? new Date(vetAfter) : null;
          const vetBeforeDate = vetBefore ? new Date(vetBefore) : null;

          if (
            (vetAfterDate && (!checkupDate || checkupDate < vetAfterDate)) ||
            (vetBeforeDate && (!checkupDate || checkupDate > vetBeforeDate))
          ) {
            continue;
          }


          grouped[enclosureType][enclosureID].Animals.push({
            AnimalID: row.AnimalID,
            Name: row.AnimalName,
            Species: row.Species,
            Gender: row.Gender,
            HealthStatus: row.HealthStatus,
            DangerLevel: row.DangerLevel,
            LastVetCheckup: row.LastVetCheckup
          });

          const health = row.HealthStatus || 'Unknown';
          grouped[enclosureType][enclosureID].HealthBreakdown[health] = 
            (grouped[enclosureType][enclosureID].HealthBreakdown[health] || 0) + 1;
        }

      }

      // calculate capacity and apply a min-max filter
      for (const type in grouped) {
        for (const id in grouped[type]) {
          const enclosure = grouped[type][id];
          const count = enclosure.Animals.length;
          enclosure.CapacityUsage = Math.round((count / enclosure.Capacity) * 100);
  
          // Apply capacity filter if present
          if (
            (minCapacity !== undefined && enclosure.CapacityUsage < parseInt(minCapacity)) ||
            (maxCapacity !== undefined && enclosure.CapacityUsage > parseInt(maxCapacity))
          ) {
            delete grouped[type][id];
          }
        }
  
        // Remove empty groups after filtering
        if (Object.keys(grouped[type]).length === 0) {
          delete grouped[type];
        }
      }

      res.json(grouped);

    } catch (err) {
      console.error('Error generating report:', err);
      res.status(500).json({ error: 'Failed to generate report' });
    }

  });
  
  // Get enclosure by ID
  router.get('/:id', async (req, res) => {
    try {
      // TODO: Implement getting a single enclosure with its animals
      const enclosureId = req.params.id;

      // Verify enclosureID is number
      if (isNaN(enclosureId)) {
        return res.status(400).json({ error: 'Invalid Enclosure ID. ID must be a number' });
      }

      // retreive enclosure details along animals
      const [rows] = await pool.query(
        `SELECT e.EnclosureID, e.Name AS EnclosureName, e.Type AS EnclosureType, 
            e.Capacity AS AnimalCapacity, e.Location, e.StaffID, e.ImageURL, e.Description, 
            s.Name AS ZookeeperName, a.AnimalID, a.Name AS AnimalName,
            a.Species, a.Gender, a.DateOfBirth, a.HealthStatus, a.DangerLevel, a.Image
        FROM enclosures AS e
        LEFT JOIN staff s ON e.StaffID = s.Staff  
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
        StaffID: rows[0].StaffID,
        ImageURL: rows[0].ImageURL,
        Description: rows[0].Description,
        ZookeeperName: rows[0].ZookeeperName,
        Animals: rows.map(row => ({
          AnimalID: row.AnimalID,
          Name: row.AnimalName,
          Species: row.Species,
          Gender: row.Gender,
          DateOfBirth: row.DateOfBirth,
          HealthStatus: row.HealthStatus,
          DangerLevel: row.DangerLevel,
          Image: row.Image,
        }))
      }

      // Return results
      res.json(enclosureData);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch enclosure' });
    }
  });

  // get all staff assigned to an enclosure in alphabetical order (first name since 1st and last name are in same attribute)
  router.get('/:id/assigned-staff', authenticateToken, async (req, res) => {
    try {
      const enclosureID = req.params.id;

      const [staff] = await pool.query(`
        SELECT s.Staff as StaffID, s.Name as NAME, s.StaffType, s.Role, sea.AssignedDate
        FROM staff_enclosure_assignments sea
        JOIN staff s ON sea.StaffID = s.Staff
        WHERE sea.EnclosureID = ?
        ORDER BY s.Name ASC
        `, [enclosureID]);
      
      res.json(staff);

    } catch (err) {
      console.error('Error fetching assigned staff:', err);
      res.status(500).json({ error: 'Failed to fetch assigned staff for enclosure' });
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
      if (req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Denied. Appropriate staff only' })
      }

      // retreive data from user in request body
      const {StaffID, Name, Type, Capacity, Location, ImageURL, Description} = req.body;

      // Ensure required feilds are entered
      if(!StaffID || !Name || !Type || !Capacity || !Location || !ImageURL || !Description){
        return res.status(400).json({error: `StaffID, Name, Type, Capacity, and Location, ImageURL, Description are required`});
      }

      // Insert data into database
      const [result] = await pool.query(
        `INSERT INTO enclosures (StaffID, Name, Type, Capacity, Location, ImageURL, Description)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [StaffID, Name, Type, Capacity, Location, ImageURL, Description]
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
      if (isNaN(enclosureId)) {
        return res.status(400).json({ error: 'Invalid Enclosure ID. ID must be a number' });
      }

      // Check that the user is staff with appropriate permissions
      if (req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Denied. staff only' })
      }

      const {StaffID, Name, Type, Capacity, Location, ImageURL, Description} = req.body; // receive entries

      // Ensure at least one entry was sent by user
      if (!StaffID && !Name && !Type && !Capacity && !Location && !ImageURL && !Description) {
        return res.status(400).json({ error: 'At least one field (Name, Type, Capacity, Location) must be provided for update' });
      }

      // dynamically query fields entered
      const entryField = [];
      const values = [];

      if (StaffID) {
        entryField.push('StaffID = ?');
        values.push(StaffID);
      }
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
      if (ImageURL) {
        entryField.push('ImageURL = ?');
        values.push(ImageURL);
      }
      if (Description) {
        entryField.push('Description = ?');
        values.push(Description);
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
      if (isNaN(enclosureId)) {
        return res.status(400).json({ error: 'Invalid Enclosure ID. ID must be a number' });
      }

      // Check that the user is staff with appropriate permissions
      if (req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Denied. staff only' })
      }

      // check if enclosure to delete exists
      const [enclosureCheck] = await pool.query('SELECT * FROM enclosures WHERE EnclosureID = ?',
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

  // Add this to routes/enclosure.routes.js

  // Complete the assignment functionality
  router.post('/:id/assign-staff', authenticateToken, async (req, res) => {
    try {
      const enclosureId = req.params.id;
      const { Staff } = req.body;

      // Verify enclosure ID is a number
      if (isNaN(enclosureId)) {
        return res.status(400).json({ error: 'Invalid Enclosure ID. ID must be a number' });
      }

      // Check that user has manager permissions
      if (req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Denied. Manager access only.' });
      }

      // Check if staff exists
      const [staffCheck] = await pool.query(
        'SELECT Staff FROM staff WHERE Staff = ?',
        [Staff]
      );

      if (staffCheck.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Check if enclosure exists
      const [enclosureCheck] = await pool.query(
        'SELECT EnclosureID FROM enclosures WHERE EnclosureID = ?',
        [enclosureId]
      );

      if (enclosureCheck.length === 0) {
        return res.status(404).json({ error: 'Enclosure not found' });
      }

      // Check if assignment already exists
      const [assignmentCheck] = await pool.query(
        'SELECT * FROM staff_enclosure_assignments WHERE EnclosureID = ? AND StaffID = ?',
        [enclosureId, Staff]
      );

      if (assignmentCheck.length > 0) {
        return res.status(400).json({ error: 'Staff is already assigned to this enclosure' });
      }

      // Create assignment
      await pool.query(
        'INSERT INTO staff_enclosure_assignments (EnclosureID, StaffID, AssignedDate) VALUES (?, ?, NOW())',
        [enclosureId, Staff]
      );

      res.status(201).json({ message: 'Staff assigned to enclosure successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to assign staff to enclosure: ' + err.message });
    }
  });

  // Remove staff from enclosure
  router.delete('/:id/staff/:staffId', authenticateToken, async (req, res) => {
    try {
      const enclosureId = req.params.id;
      const staffId = req.params.staffId;

      // Verify IDs are numbers
      if (isNaN(enclosureId) || isNaN(staffId)) {
        return res.status(400).json({ error: 'Invalid ID format. IDs must be numbers' });
      }

      // Check that user has manager permissions
      if (req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Denied. Manager access only.' });
      }

      // Check if assignment exists
      const [assignmentCheck] = await pool.query(
        'SELECT * FROM staff_enclosure_assignments WHERE EnclosureID = ? AND StaffID = ?',
        [enclosureId, staffId]
      );

      if (assignmentCheck.length === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Remove assignment
      await pool.query(
        'DELETE FROM staff_enclosure_assignments WHERE EnclosureID = ? AND StaffID = ?',
        [enclosureId, staffId]
      );

      res.json({ message: 'Staff removed from enclosure successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to remove staff from enclosure: ' + err.message });
    }
  });

  return router;
};