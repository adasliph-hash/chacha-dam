const express = require('express');
const router = express.Router();
const { getAllUsers, getUserCount } = require('../services/userTracking');
const { authMiddleware } = require('../middleware/auth');

// GET /api/users — list all Telegram users who have opened the app
router.get('/', authMiddleware, (req, res) => {
  try {
    const users = getAllUsers();
    res.json({
      success: true,
      data: {
        total: getUserCount(),
        users
      }
    });
  } catch (err) {
    console.error('Users list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
