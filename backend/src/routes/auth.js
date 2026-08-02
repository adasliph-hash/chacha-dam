const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Temporary simple check (later we will use real hash from .env)
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'chacha123'; // temporary plain password

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { user: username, role: 'admin' },
      process.env.JWT_SECRET || 'temporary-secret-change-me',
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      token,
      user: { username, role: 'admin' }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;