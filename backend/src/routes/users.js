const express = require('express');
const router = express.Router();
const { getAllUsers, getUserCount, getDailyActiveUsers, todayDateString } = require('../services/userTracking');
const { sendDailyDigest } = require('../services/dailyDigest');
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

module.exports = router;
