const express = require('express');
const router = express.Router();
const { getCostSummary } = require('../data/projectData');
const { authMiddleware } = require('../middleware/auth');

// GET /api/costs
router.get('/', authMiddleware, (req, res) => {
  try {
    const data = getCostSummary();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Costs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;