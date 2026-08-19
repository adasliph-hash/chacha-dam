const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db/database');
const { sendTelegramMessage } = require('../services/telegram');

const insertMember = db.prepare(`
  INSERT INTO members (full_name, id_number, phone_number, password_hash, created_at)
  VALUES (?, ?, ?, ?, ?)
`);
const findByIdNumber = db.prepare('SELECT * FROM members WHERE id_number = ?');

// POST /api/members/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, idNumber, phoneNumber, password } = req.body;

    if (!fullName || !idNumber || !phoneNumber || !password) {
      return res.status(400).json({ message: 'ሁሉንም መስኮች ይሙሉ' });
    }
    if (password.length < 4) {
      return res.status(400).json({ message: 'የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት' });
    }

    const existing = findByIdNumber.get(idNumber.trim());
    if (existing) {
      return res.status(409).json({ message: 'ይህ መለያ ቁጥር ቀድሞ ተመዝግቧል' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    insertMember.run(
      fullName.trim(),
      idNumber.trim(),
      phoneNumber.trim(),
      passwordHash,
      new Date().toISOString()
    );

    sendTelegramMessage(
      `🆕 <b>New Member Registration</b>\n\n👤 ${fullName.trim()}\n🆔 ${idNumber.trim()}\n📞 ${phoneNumber.trim()}`
    ).catch(err => console.error('Failed to notify new member:', err.message));

    res.json({ success: true, message: 'በተሳካ ሁኔታ ተመዝግበዋል!' });
  } catch (err) {
    console.error('Member register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/members/login
router.post('/login', async (req, res) => {
  try {
    const { idNumber, password } = req.body;

    if (!idNumber || !password) {
      return res.status(400).json({ message: 'መለያ ቁጥር እና የይለፍ ቃል ያስፈልጋሉ' });
    }

    const member = findByIdNumber.get(idNumber.trim());
    if (!member) {
      return res.status(401).json({ message: 'መለያ ቁጥር ወይም የይለፍ ቃል ትክክል አይደለም' });
    }

    const match = await bcrypt.compare(password, member.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'መለያ ቁጥር ወይም የይለፍ ቃል ትክክል አይደለም' });
    }

    res.json({
      success: true,
      member: { fullName: member.full_name, idNumber: member.id_number, phoneNumber: member.phone_number }
    });
  } catch (err) {
    console.error('Member login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
