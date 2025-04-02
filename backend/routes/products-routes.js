// routes/products.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (pool) => {
  // Get all products
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM products');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Get product by ID
  router.get('/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      const [rows] = await pool.query('SELECT * FROM products WHERE ProductID = ?', [productId]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  // Add new product (Gift Shop Manager only)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      // Check that user is Gift Shop Clerk with Manager role
      if (req.user.role !== 'staff' || 
          req.user.staffType !== 'Gift Shop Clerk' || 
          req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Unauthorized. Manager access only.' });
      }

      const { Name, Description, Price, Category } = req.body;

      // Validate input
      if (!Name || !Price || !Category) {
        return res.status(400).json({ error: 'Name, Price, and Category are required' });
      }

      const [result] = await pool.query(
        'INSERT INTO products (Name, Description, Price, Category, availability) VALUES (?, ?, ?, ?, ?)',
        [Name, Description || null, Price, Category, true]
      );

      res.status(201).json({ 
        message: 'Product added successfully',
        productId: result.insertId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add product' });
    }
  });

  // Update product (Gift Shop Manager only)
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      // Check that user is Gift Shop Clerk with Manager role
      if (req.user.role !== 'staff' || 
          req.user.staffType !== 'Gift Shop Clerk' || 
          req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Unauthorized. Manager access only.' });
      }

      const productId = req.params.id;
      const { Name, Description, Price, Category, availability } = req.body;

      // Build a dynamic UPDATE query
      const fields = [];
      const values = [];

      if (Name !== undefined) {
        fields.push('Name = ?');
        values.push(Name);
      }
      if (Description !== undefined) {
        fields.push('Description = ?');
        values.push(Description);
      }
      if (Price !== undefined) {
        fields.push('Price = ?');
        values.push(Price);
      }
      if (Category !== undefined) {
        fields.push('Category = ?');
        values.push(Category);
      }
      if (availability !== undefined) {
        fields.push('availability = ?');
        values.push(availability);
      }

      // If no fields were provided, return an error
      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Add the product ID to the values array
      values.push(productId);

      // Execute the update query
      const [result] = await pool.query(
        `UPDATE products SET ${fields.join(', ')} WHERE ProductID = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Delete product (Gift Shop Manager only)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      // Check that user is Gift Shop Clerk with Manager role
      if (req.user.role !== 'staff' || 
          req.user.staffType !== 'Gift Shop Clerk' || 
          req.user.staffRole !== 'Manager') {
        return res.status(403).json({ error: 'Unauthorized. Manager access only.' });
      }

      const productId = req.params.id;

      // Check if product exists
      const [productCheck] = await pool.query('SELECT * FROM products WHERE ProductID = ?', [productId]);
      if (productCheck.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Delete the product
      await pool.query('DELETE FROM products WHERE ProductID = ?', [productId]);

      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  return router;
};