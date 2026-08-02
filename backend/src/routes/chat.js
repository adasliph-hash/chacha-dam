const express = require('express');
const router = express.Router();
const { sendTelegramMessage } = require('../services/telegram');
const { authMiddleware } = require('../middleware/auth');

// POST /api/chat
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Limit message length for safety
    const cleanMessage = message.trim().slice(0, 1000);

    // Send to Telegram
    await sendTelegramMessage(`📢 <b>Chacha Dam Chat</b>\n\n${cleanMessage}`);

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to send message'
    });
  }
});

module.exports = router;