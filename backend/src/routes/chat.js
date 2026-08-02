const express = require('express');
const multer = require('multer');
const router = express.Router();
const { sendTelegramMessage, sendTelegramDocument, sendTelegramPhoto } = require('../services/telegram');
const { authMiddleware } = require('../middleware/auth');

// Keep uploads in memory (not written to disk) — 20MB limit matches Telegram Bot API's practical cap
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

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

// POST /api/chat/file — accepts PDF, Word, Excel, or image attachments
router.post('/file', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const caption = (req.body.caption || '').trim().slice(0, 1000);
    const isImage = req.file.mimetype.startsWith('image/');

    if (isImage) {
      await sendTelegramPhoto(req.file.buffer, req.file.originalname, caption);
    } else {
      await sendTelegramDocument(req.file.buffer, req.file.originalname, caption);
    }

    res.json({
      success: true,
      message: 'File sent successfully',
      filename: req.file.originalname
    });
  } catch (err) {
    console.error('Chat file error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to send file'
    });
  }
});

module.exports = router;
