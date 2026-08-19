const express = require('express');
const router = express.Router();
const { getIncomeSummary } = require('../data/projectData');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db/database');

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

const updateItemStmt = db.prepare(`
  UPDATE bill_items SET ach = ?, inc = ? WHERE id = ?
`);

// PUT /api/income/item/:id — edit a single bill item's Achieved/Amount values
// Restricted to the bot owner / admin (req.user.role === 'admin')
router.put('/item/:id', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the bot owner can edit figures' });
    }

    const { ach, inc } = req.body;
    if (ach == null || inc == null || isNaN(ach) || isNaN(inc)) {
      return res.status(400).json({ message: 'Valid ach and inc numbers are required' });
    }

    const result = updateItemStmt.run(Number(ach), Number(inc), req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Income item update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;