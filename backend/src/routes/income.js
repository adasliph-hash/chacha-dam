const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();
const { getIncomeSummary } = require('../data/projectData');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db/database');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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

// GET /api/income/template — download all bill items as an Excel file to edit offline
router.get('/template', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the bot owner can download the template' });
    }

    const rows = db.prepare(`
      SELECT bi.id, b.id AS bill_id, b.name AS bill_name, bi.no, bi.description, bi.ach, bi.inc
      FROM bill_items bi
      JOIN bills b ON b.id = bi.bill_id
      ORDER BY b.id, bi.id
    `).all();

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ['id', 'bill_id', 'bill_name', 'no', 'description', 'ach', 'inc']
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Income');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="income-template.xlsx"');
    res.send(buffer);
  } catch (err) {
    console.error('Income template error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/income/upload-excel — bulk update items from an uploaded Excel file
// Expected columns: id, ach, inc (extra columns like bill_name/description are ignored)
router.post('/upload-excel', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the bot owner can upload' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let updated = 0;
    let skipped = 0;

    const tx = db.transaction((rows) => {
      for (const row of rows) {
        const id = row.id;
        const ach = Number(row.ach);
        const inc = Number(row.inc);

        if (!id || isNaN(ach) || isNaN(inc)) {
          skipped++;
          continue;
        }

        const result = updateItemStmt.run(ach, inc, id);
        if (result.changes > 0) updated++;
        else skipped++;
      }
    });

    tx(rows);

    res.json({ success: true, updated, skipped, totalRows: rows.length });
  } catch (err) {
    console.error('Income upload-excel error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;