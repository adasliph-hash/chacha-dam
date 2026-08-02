const express = require('express');
const router = express.Router();
const { getPercentSummary } = require('../data/projectData');
const { authMiddleware } = require('../middleware/auth');

// GET /api/percent
router.get('/', authMiddleware, (req, res) => {
  try {
    const data = getPercentSummary();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Percent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;