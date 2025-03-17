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

    // add new attraction (staff only)
    router.post('/', authenticateToken, async (req, res) =>{
        try{

        } catch(err) {
            
        }
    });

 





    return router;
};