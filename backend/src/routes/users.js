const express = require('express');
const router = express.Router();
const { getAllUsers, getUserCount, getDailyActiveUsers, todayDateString } = require('../services/userTracking');
const { sendDailyDigest } = require('../services/dailyDigest');
const { sendTelegramMessageTo } = require('../services/telegram');
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

// GET /api/users/today — users who opened the app today
router.get('/today', authMiddleware, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        date: todayDateString(),
        users: getDailyActiveUsers()
      }
    });
  } catch (err) {
    console.error('Daily users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/send-daily-digest — manually trigger sending today's digest to the bot
// (the same message is normally sent automatically every day at 21:00 Addis Ababa time)
router.post('/send-daily-digest', authMiddleware, async (req, res) => {
  try {
    await sendDailyDigest();
    res.json({ success: true, message: 'Daily digest sent' });
  } catch (err) {
    console.error('Manual daily digest error:', err);
    res.status(500).json({ message: err.message || 'Failed to send digest' });
  }
});

// POST /api/users/notify-all — send a message directly to every registered user's chat
// Restricted to the bot owner/admin only (req.user.role === 'admin', set at login time)
router.post('/notify-all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the bot owner can send broadcast notifications' });
    }

    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const text = `📢 <b>Chacha Dam Notification</b>\n\n${message.trim().slice(0, 1000)}`;
    const users = getAllUsers();

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await sendTelegramMessageTo(user.telegram_id, text);
        sent++;
      } catch (err) {
        failed++;
        console.error(`Notify failed for ${user.telegram_id}:`, err.message);
      }
    }

    res.json({ success: true, total: users.length, sent, failed });
  } catch (err) {
    console.error('notify-all error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;
