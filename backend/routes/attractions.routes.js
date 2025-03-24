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

    // get enclosure by ID
    router.get('/:id', async (req, res) => {
        try{

        }catch (err){

        }
    })

    // add new attraction (staff'Manager' only)
    router.post('/', authenticateToken, async (req, res) =>{
        try{

            // Check that the user is staff with appropriate permissions
            if(req.user.staffRole !== 'Manager'){
                return res.status(403).json({error: 'Denied. Appropriate staff only'})
            }
            const {staffID, location, startTimeStamp, endTimeStamp, title, description, picture} = req.body;

            // Ensure required feilds are entered
            if (!staffId || !location || !startTimeStamp || !endTimeStamp || !title || !description|| !picture) {
                return res.status(400).json({ error: 'All fields (staffID, location, startTimeStamp, endTimeStamp, title, picture) are required' });
            }

            // add attraction
            const [result] = await pool.query(`
                INSERT INTO attraction (StaffID, Location, StartTimeStamp, EndTimeStamp, 
                    Title, Description, Picture)
                VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [staffID, location, startTimeStamp, endTimeStamp, title, description, picture]
            );

            res.status(201).json({ 
                message: `New attraction created`,
                attraction: result.insertId, 
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

            const {location, startTimeStamp, endTimeStamp, title, description, picture} = req.body;

            // check at least 1 feild is getting updated
            if (!location && !startTimeStamp && !endTimeStamp && !title && !description && !picture) {
                return res.status(400).json({ error: 'At least one field (location, startTimeStamp, endTimeStamp, title, description, picture) must be provided for update' });
            }

            // dynamically query fields entered
            const entryField = [];
            const values = [];

            if(location){
                entryField.push('location = ?');
                values.push(location);
            }
            if(startTimeStamp){
                entryField.push('startTimeStamp = ?');
                values.push(startTimeStamp);
            }
            if(endTimeStamp){
                entryField.push('endTimeStamp = ?');
                values.push(endTimeStamp);
            }
            if(title){
                entryField.push('title = ?');
                values.push(title);
            }
            if(description){
                entryField.push('description = ?');
                values.push(description);
            }
            if(picture){
                entryField.push('picture = ?');
                values.push(picture);
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

        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to assign staff to enclosure' });
        }
    });



    return router;
};