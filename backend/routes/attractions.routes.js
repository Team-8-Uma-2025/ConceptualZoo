// routes/attractions.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
    //get all attractions
    router.get('/', async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM attraction`);
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch attractions' });
        }
    });

    // get attraction details by ID 
    router.get('/:id', async (req, res) => {
        try {
            const attractionId = req.params.id;

            // Verify attraction ID is number
            if (isNaN(attractionId)) {
                return res.status(400).json({ error: 'Invalid Attraction ID. ID must be a number' });
            }

            // fetch attractions with name of staff assignes to the attraction
            const [rows] = await pool.query(`
                SELECT a.Title, a.AttractionID, a.StaffID, a.Location, a.StartTimeStamp, a.EndTimeStamp, a.Description, a.Picture,
                    s.Name AS StaffName
                FROM attraction a
                LEFT JOIN staff s ON a.StaffID = s.Staff
                WHERE AttractionId = ?`,
                [attractionId]
            );

            // If enclosure does not exist
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Attraction not found' });
            }

            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch enclosure' });

        }
    });

    // get staff assigned to an attraction
    router.get('/:id/assigned-staff', authenticateToken, async (req, res) => {
        try {
            const attractionId = req.params.id;

            // Verify attraction ID is number
            if (isNaN(attractionId)) {
                return res.status(400).json({ error: 'Invalid Attraction ID. ID must be a number' });
            }

            const [rows] = await pool.query(`
                SELECT 
                    s.Staff AS StaffID, 
                    s.NAME, 
                    s.StaffType, 
                    s.Role, 
                    saa.AssignedDate
                FROM staff s
                JOIN staff_attraction_assignments saa ON s.Staff = saa.StaffID
                WHERE saa.AttractionID = ?`,
                [attractionId]
            );

            res.json(rows);

        } catch (err) {
            console.error('Error fetching staff for attraction:', err);
            res.status(500).json({ error: 'Failed to fetch staff for attraction' });
        }
    });


    // add new attraction (staff'Manager' only)
    router.post('/', authenticateToken, async (req, res) => {
        try {


            // Check that the user is staff with appropriate permissions
            if (req.user.staffRole !== 'Manager') {
                return res.status(403).json({ error: 'Denied. Appropriate staff only' })
            }

            const { StaffID, Location, StartTimeStamp, EndTimeStamp, Title, Description, Picture } = req.body;

            // Ensure required feilds are entered
            if (!StaffID || !Location || !StartTimeStamp || !Title || !Description || !Picture) {
                return res.status(400).json({ error: 'Fields (staffID, location, startTimeStamp, title, Description, picture) are required' });
            }

            // Handle EndTimeStamp: if blank, use null; otherwise, format it for MySQL.
            let formattedEndTime = null;
            if (typeof EndTimeStamp === 'string' && EndTimeStamp.trim() !== "") {
                const date = new Date(EndTimeStamp.trim());
                formattedEndTime = date.toISOString().slice(0, 19).replace('T', ' ');
            }
            // Otherwise, formattedEndTime remains null

            //const safeEndTime = EndTimeStamp === "" ? null : EndTimeStamp;

            // add attraction
            const [result] = await pool.query(`
                INSERT INTO attraction (StaffID, Location, StartTimeStamp, EndTimeStamp, 
                    Title, Description, Picture)
                VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [StaffID, Location, StartTimeStamp, formattedEndTime, Title, Description, Picture]
            );

            console.log("BODY RECEIVED FROM FRONTEND:", req.body);

            res.status(201).json({
                message: `New attraction created`,
                AttractionID: result.insertId,
            })
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to add attraction' });
        }
    });

    // update attraction
    router.put('/:id', authenticateToken, async (req, res) => {
        try {
            // Check that the user is staff with appropriate permissions
            if (req.user.staffRole !== 'Manager') {
                return res.status(403).json({ error: 'Denied. Appropriate staff only' })
            }

            const attractionId = req.params.id;

            // validate attraction ID
            if (isNaN(attractionId)) {
                return res.status(400).json({ error: 'Attreaction ID must be a number' });
            }

            // check if attraction exists
            const [attractionCheck] = await pool.query('SELECT * FROM attraction WHERE AttractionID = ?', [attractionId]);
            if (attractionCheck.length === 0) {
                return res.status(404).json({ error: 'Attraction not found' });
            }

            console.log("Received EndTimeStamp:", req.body.EndTimeStamp, "Type:", typeof req.body.EndTimeStamp);

            const { StaffID, Location, StartTimeStamp, EndTimeStamp, Title, Description, Picture } = req.body;
            
            /*
            // check at least 1 feild is getting updated
            if (!StaffID && !Location && !StartTimeStamp && !EndTimeStamp && !Title && !Description && !Picture) {
                return res.status(400).json({ error: 'At least one field (location, startTimeStamp, endTimeStamp, title, description, picture) must be provided for update' });
            }
            */

            // dynamically query fields entered
            const entryField = [];
            const values = [];

            if (req.body.hasOwnProperty('StaffID')) {
                entryField.push('StaffID = ?');
                values.push(StaffID);
            }
            if (req.body.hasOwnProperty('Location')) {
                entryField.push('Location = ?');
                values.push(Location);
            }
            if (req.body.hasOwnProperty('StartTimeStamp')) {
                entryField.push('StartTimeStamp = ?');
                values.push(StartTimeStamp);
            }
            if (req.body.hasOwnProperty('EndTimeStamp')) {
                entryField.push('EndTimeStamp = ?');
                
                // Handle null/empty case
                if (EndTimeStamp === "" || EndTimeStamp === null) {
                    values.push(null);
                } else {
                    // Parse ISO date string and format for MySQL
                    const date = new Date(EndTimeStamp);
                    const mysqlFormat = date.toISOString().slice(0, 19).replace('T', ' ');
                    values.push(mysqlFormat);
                }
            }
            if (req.body.hasOwnProperty('Title')) {
                entryField.push('Title = ?');
                values.push(Title);
            }
            if (req.body.hasOwnProperty('Description')) {
                entryField.push('Description = ?');
                values.push(Description);
            }
            if (req.body.hasOwnProperty('Picture')) {
                entryField.push('Picture = ?');
                values.push(Picture);
            }
            values.push(attractionId); // for where clause for which attraction tpo update

            //update query
            const update_query = `
                UPDATE attraction
                SET ${entryField.join(', ')}
                WHERE AttractionID = ?`;
            const [result] = await pool.query(update_query, values);

            // check if rows updated
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Attraction not found or no changes made' });
            }

            res.json({ message: `Attraction ${attractionId} updated` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update attraction. Enter at least one feild' });
        }
    });

    router.delete('/:id', authenticateToken, async (req, res) => {
        try {
            const attractionId = req.params.id;

            // Verify attraction ID is number
            if (isNaN(attractionId)) {
                return res.status(400).json({ error: 'Invalid Attraction ID. ID must be a number' });
            }

            // Check that the user is staff with appropriate permissions
            if (req.user.staffRole !== 'Manager') {
                return res.status(403).json({ error: 'Denied. Manager only' })
            }

            // check if enclosure to delete exists
            const [attractionCheck] = await pool.query('SELECT * FROM attraction WHERE AttractionID = ?',
                [attractionId]
            );
            if (attractionCheck.length === 0) {
                return res.status(404).json({ error: 'Attraction not found' });
            }

            // delete enclosure (cascade will also remove associated)
            await pool.query(`DELETE FROM attraction WHERE AttractionID = ?`, [attractionId]);
            res.json({ message: `Attraction with ID ${attractionId} was deleted` });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete attraction' });
        }
    });


    // Assign staff to attraction
    router.post('/:id/assign-staff', authenticateToken, async (req, res) => {
        try {
            const attractionId = req.params.id;
            const { Staff } = req.body;

            // Verify attraction ID is number
            if (isNaN(attractionId)) {
                return res.status(400).json({ error: 'Invalid Attraction ID. ID must be a number' });
            }

            // Check that the user is staff with appropriate permissions
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

            // Check if attraction exists
            const [attractionCheck] = await pool.query(
                'SELECT AttractionID FROM attraction WHERE AttractionID = ?',
                [attractionId]
            );

            if (attractionCheck.length === 0) {
                return res.status(404).json({ error: 'Attraction not found' });
            }

            // Check if assignment already exists
            const [assignmentCheck] = await pool.query(
                'SELECT * FROM staff_attraction_assignments WHERE AttractionID = ? AND StaffID = ?',
                [attractionId, Staff]
            );

            if (assignmentCheck.length > 0) {
                return res.status(400).json({ error: 'Staff is already assigned to this attraction' });
            }

            // Create assignment
            await pool.query(
                'INSERT INTO staff_attraction_assignments (AttractionID, StaffID, AssignedDate) VALUES (?, ?, NOW())',
                [attractionId, Staff]
            );

            res.status(201).json({ message: 'Staff assigned to attraction successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to assign staff to attraction: ' + err.message });
        }
    });

    // Remove staff from attraction
    router.delete('/:id/staff/:staffId', authenticateToken, async (req, res) => {
        try {
            const attractionId = req.params.id;
            const staffId = req.params.staffId;

            // Verify IDs are numbers
            if (isNaN(attractionId) || isNaN(staffId)) {
                return res.status(400).json({ error: 'Invalid ID format. IDs must be numbers' });
            }

            // Check that the user is staff with appropriate permissions
            if (req.user.staffRole !== 'Manager') {
                return res.status(403).json({ error: 'Denied. Manager access only.' });
            }

            // Check if assignment exists
            const [assignmentCheck] = await pool.query(
                'SELECT * FROM staff_attraction_assignments WHERE AttractionID = ? AND StaffID = ?',
                [attractionId, staffId]
            );

            if (assignmentCheck.length === 0) {
                return res.status(404).json({ error: 'Assignment not found' });
            }

            // Remove assignment
            await pool.query(
                'DELETE FROM staff_attraction_assignments WHERE AttractionID = ? AND StaffID = ?',
                [attractionId, staffId]
            );

            res.json({ message: 'Staff removed from attraction successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to remove staff from attraction: ' + err.message });
        }
    });

    // Get staff assigned to attractions (for a specific staff member)
    router.get('/:staffId/staff-assignments', authenticateToken, async (req, res) => {
        try {
            const staffId = req.params.staffId;

            // Verify staff ID is a number
            if (isNaN(staffId)) {
                return res.status(400).json({ error: 'Invalid Staff ID. ID must be a number' });
            }

            // Get attractions this staff is assigned to
            const [rows] = await pool.query(`
            SELECT a.AttractionID, a.Title, a.Location, a.StartTimeStamp, a.EndTimeStamp, 
                   a.Description, a.Picture, saa.AssignedDate
            FROM attraction a
            JOIN staff_attraction_assignments saa ON a.AttractionID = saa.AttractionID
            WHERE saa.StaffID = ?
        `, [staffId]);

            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch attractions assigned to staff: ' + err.message });
        }
    });

    return router;
};