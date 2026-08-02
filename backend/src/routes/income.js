const express = require('express');
const router = express.Router();
const { getIncomeSummary } = require('../data/projectData');
const { authMiddleware } = require('../middleware/auth');

// GET /api/income
router.get('/', authMiddleware, (req, res) => {
  try {
    const data = getIncomeSummary();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Income error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;