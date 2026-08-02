const express = require('express');
const router = express.Router();
const { getEcostSummary } = require('../data/projectData');
const { authMiddleware } = require('../middleware/auth');

// GET /api/ecost
router.get('/', authMiddleware, (req, res) => {
  try {
    const data = getEcostSummary();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('E-cost error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;