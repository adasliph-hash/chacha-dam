const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { sendTelegramMessage, sendTelegramMessageTo, setWebhook } = require('../services/telegram');
const { authMiddleware } = require('../middleware/auth');

const setPhoneStmt = db.prepare(
  'UPDATE telegram_users SET phone_number = ? WHERE telegram_id = ?'
);

// POST /api/telegram/setup-webhook
// Run this ONCE (from Railway Console or via an authenticated request) to
// tell Telegram where to send bot updates (e.g. shared contacts).
router.post('/setup-webhook', authMiddleware, async (req, res) => {
  try {
    const baseUrl = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const webhookUrl = `${baseUrl}/api/telegram/webhook`;
    const secret = process.env.WEBHOOK_SECRET;

    const result = await setWebhook(webhookUrl, secret);
    res.json({ success: true, webhookUrl, telegram: result });
  } catch (err) {
    console.error('setup-webhook error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/telegram/webhook
// Telegram sends bot updates here (we only care about shared contacts).
// Secured with a secret token header set when registering the webhook.
router.post('/webhook', express.json(), async (req, res) => {
  // Always 200 quickly — Telegram retries aggressively on non-200 responses
  res.sendStatus(200);

  try {
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const incoming = req.headers['x-telegram-bot-api-secret-token'];
      if (incoming !== secret) {
        console.warn('Webhook: rejected request with bad/missing secret token');
        return;
      }
    }

    const update = req.body;
    const message = update && update.message;
    const contact = message && message.contact;

    if (contact && message.from) {
      const telegramId = String(message.from.id);
      const chatId = message.chat && message.chat.id;
      setPhoneStmt.run(contact.phone_number, telegramId);

      console.log(`📞 Phone number saved for ${telegramId}`);

      const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown';

      // Notify the admin chat
      sendTelegramMessage(
        `📞 <b>Phone number shared</b>\n\n👤 ${fullName}\n☎️ ${contact.phone_number}\n🆔 ${telegramId}`
      ).catch(err => console.error('Failed to notify phone share:', err.message));

      // Confirm directly to the user who shared it
      if (chatId) {
        sendTelegramMessageTo(chatId, '✅ Thanks! Your phone number has been saved.').catch(() => {});
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }
});

module.exports = router;
