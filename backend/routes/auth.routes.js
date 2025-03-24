// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  // Register a new visitor
  router.post('/register', async (req, res) => {
    try {
      const { firstName, lastName, username, password } = req.body;
      
      // Validate input
      if (!firstName || !lastName || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      // Check if username already exists
      const [existingUsers] = await pool.query(
        'SELECT * FROM visitors WHERE Username = ?',
        [username]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new visitor
      const visitDate = new Date().toISOString().split('T')[0]; // Current date
      
      const [result] = await pool.query(
        'INSERT INTO visitors (firstName, lastName, visitDate, Username, Password, Membership) VALUES (?, ?, ?, ?, ?, ?)',
        [firstName, lastName, visitDate, username, hashedPassword, 0]
      );
      
      // Generate token
      const token = jwt.sign(
        { 
          id: result.insertId, 
          username, 
          role: 'visitor' 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      res.status(201).json({ 
        message: 'Visitor registered successfully', 
        token,
        user: {
          id: result.insertId,
          firstName,
          lastName,
          username,
          role: 'visitor'
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
  });
  
  // Register a new staff member (admin only)
  router.post('/register-staff', async (req, res) => {
    try {
      const { 
        name, role, ssn, birthdate, sex, address, 
        supervisorID, username, password, stafftype
      } = req.body;
      
      // Validate input
      if (!name || !role || !ssn || !birthdate || !sex || !address || !username || !password || !stafftype) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }
      
      // Check if username already exists
      const [existingUsers] = await pool.query(
        'SELECT * FROM staff WHERE Username = ?',
        [username]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new staff member
      const hireDate = new Date().toISOString().split('T')[0]; // Current date
      
      const [result] = await pool.query(
        'INSERT INTO staff (Name, Role, SSN, Birthdate, Sex, Address, HireDate, SupervisorID, Username, Password, StaffType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, role, ssn, birthdate, sex, address, hireDate, supervisorID, username, hashedPassword, stafftype]
      );
      
      res.status(201).json({ 
        message: 'Staff member registered successfully',
        staffId: result.insertId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Staff registration failed: ' + err.message });
    }
  });
  
  // Login (both staff and visitors)
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check visitor table first
      const [visitors] = await pool.query(
        'SELECT * FROM visitors WHERE Username = ?',
        [username]
      );
      
      if (visitors.length > 0) {
        const visitor = visitors[0];
        
        // Compare password
        const validPassword = await bcrypt.compare(password, visitor.Password);
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid password' });
        }
        
        // Generate token for visitor
        const token = jwt.sign(
          { 
            id: visitor.VisitorID, 
            username: visitor.Username, 
            role: 'visitor' 
          },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        
        return res.json({ 
          token,
          user: {
            id: visitor.VisitorID,
            firstName: visitor.firstName,
            lastName: visitor.lastName,
            role: 'visitor',
            membership: visitor.Membership
          }
        });
      }
      
      // If not found in visitors, check staff
      const [staffMembers] = await pool.query(
        'SELECT * FROM staff WHERE Username = ?',
        [username]
      );
      
      if (staffMembers.length > 0) {
        const staff = staffMembers[0];
        
        // Compare password
        const validPassword = await bcrypt.compare(password, staff.Password);
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid password' });
        }
        
        // Generate token for staff
        const token = jwt.sign(
          { 
            id: staff.Staff, 
            username: staff.Username, 
            role: 'staff',
            staffRole: staff.Role
          },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        
        return res.json({ 
          token,
          user: {
            id: staff.Staff,
            name: staff.Name,
            role: 'staff',
            staffRole: staff.Role,
            staffType: staff.StaffType
          }
        });
      }
      
      // If user not found in either table
      return res.status(404).json({ error: 'User not found' });
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed: ' + err.message });
    }
  });
  
  // Get current user information
  router.get('/me', async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Access denied' });
      }
      
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: 'Invalid token' });
        }
        
        const { id, role } = decoded;
        
        if (role === 'visitor') {
          const [visitors] = await pool.query(
            'SELECT VisitorID, firstName, lastName, Username, Membership FROM visitors WHERE VisitorID = ?',
            [id]
          );
          
          if (visitors.length === 0) {
            return res.status(404).json({ error: 'Visitor not found' });
          }
          
          return res.json({
            id: visitors[0].VisitorID,
            firstName: visitors[0].firstName,
            lastName: visitors[0].lastName,
            username: visitors[0].Username,
            role: 'visitor',
            membership: visitors[0].Membership
          });
        } else if (role === 'staff') {
          const [staffMembers] = await pool.query(
            'SELECT Staff, Name, Role, Username FROM staff WHERE Staff = ?',
            [id]
          );
          
          if (staffMembers.length === 0) {
            return res.status(404).json({ error: 'Staff member not found' });
          }
          
          return res.json({
            id: staffMembers[0].staff,
            name: staffMembers[0].Name,
            role: 'staff',
            staffRole: staffMembers[0].Role,
            staffType: staffMembers[0].StaffType,
            username: staffMembers[0].Username
          });
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get user information: ' + err.message });
    }
  });
  
  return router;
};