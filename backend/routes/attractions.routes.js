// routes/attractions.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
    //get all attractions
    router.get('/', async (req, res) => {
        try{
            const [rows] = await pool.query(`SELECT * FROM attraction`);
            res.json(rows);
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch attractions' });
        }
    });

    // get attraction details by ID 
    router.get('/:id', async (req, res) => {
        try{
            const attractionId = req.params.id;

            // Verify attraction ID is number
            if(isNaN(attractionId)){
                return res.status(400).json({ error: 'Invalid Attraction ID. ID must be a number' });
            }
            
            // fetch attractions
            const [rows] = await pool.query(`
                SELECT Title, AttractionID, StaffID, Location, StartTimeStamp, EndTimeStamp, Description, Picture
                FROM attraction
                WHERE AttractionId = ?`,
                [attractionId]
            );

            // If enclosure does not exist
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Attraction not found' });
            }

            res.json(rows[0]);
        }catch (err){
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch enclosure' });

        }
    });

    // get staff assigned to an attraction
    router.get('/:id/assigned-staff', authenticateToken, async (req, res) => {
        try {
            const attractionId = req.params.id;

            // Verify attraction ID is number
            if(isNaN(attractionId)){
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
    router.post('/', authenticateToken, async (req, res) =>{
        try{

            
            // Check that the user is staff with appropriate permissions
            if(req.user.staffRole !== 'Manager'){
                return res.status(403).json({error: 'Denied. Appropriate staff only'})
            }
            
            const {StaffID, Location, StartTimeStamp, EndTimeStamp, Title, Description, Picture} = req.body;

            // Ensure required feilds are entered
            if (!StaffID || !Location || !StartTimeStamp || !EndTimeStamp || !Title || !Description|| !Picture) {
                return res.status(400).json({ error: 'All fields (staffID, location, startTimeStamp, endTimeStamp, title, picture) are required' });
            }

            // add attraction
            const [result] = await pool.query(`
                INSERT INTO attraction (StaffID, Location, StartTimeStamp, EndTimeStamp, 
                    Title, Description, Picture)
                VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [StaffID, Location, StartTimeStamp, EndTimeStamp, Title, Description, Picture]
            );

            console.log("BODY RECEIVED FROM FRONTEND:", req.body);

            res.status(201).json({ 
                message: `New attraction created`,
                AttractionID: result.insertId, 
            })
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to add attraction' });
        }
    });

    // update attraction
    router.put('/:id', authenticateToken, async (req, res) => {
        try {
            // Check that the user is staff with appropriate permissions
            if(req.user.staffRole !== 'Manager'){
                return res.status(403).json({error: 'Denied. Appropriate staff only'})
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

            const {Location, StartTimeStamp, EndTimeStamp, Title, Description, Picture} = req.body;

            // check at least 1 feild is getting updated
            if (!Location && !StartTimeStamp && !EndTimeStamp && !Title && !Description && !Picture) {
                return res.status(400).json({ error: 'At least one field (location, startTimeStamp, endTimeStamp, title, description, picture) must be provided for update' });
            }

            // dynamically query fields entered
            const entryField = [];
            const values = [];

            if(Location){
                entryField.push('location = ?');
                values.push(Location);
            }
            if(StartTimeStamp){
                entryField.push('startTimeStamp = ?');
                values.push(StartTimeStamp);
            }
            if(EndTimeStamp){
                entryField.push('endTimeStamp = ?');
                values.push(EndTimeStamp);
            }
            if(Title){
                entryField.push('title = ?');
                values.push(Title);
            }
            if(Description){
                entryField.push('description = ?');
                values.push(Description);
            }
            if(Picture){
                entryField.push('picture = ?');
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
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update attraction' });
        }
    });

    router.delete('/:id', authenticateToken, async (req, res) => {
        try {
            const attractionId = req.params.id;

            // Verify attraction ID is number
            if(isNaN(attractionId)){
                return res.status(400).json({ error: 'Invalid Attraction ID. ID must be a number' });
            }

            // Check that the user is staff with appropriate permissions
            if(req.user.staffRole !== 'Manager'){
                return res.status(403).json({error: 'Denied. Manager only'})
            }

            // check if enclosure to delete exists
            const [attractionCheck] = await pool.query( 'SELECT * FROM attraction WHERE AttractionID = ?',
                [attractionId]
            );
            if (attractionCheck.length === 0) {
                return res.status(404).json({ error: 'Attraction not found' });
            }

            // delete enclosure (cascade will also remove associated)
            await pool.query(`DELETE FROM attraction WHERE AttractionID = ?`, [attractionId]);
            res.json({ message: `Attraction with ID ${attractionId} was deleted` });

        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete attraction' });
        }
    });

    return router;
};