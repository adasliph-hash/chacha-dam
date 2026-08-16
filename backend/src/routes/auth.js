const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();
const { recordTelegramUser } = require('../services/userTracking');
const { sendTelegramMessage } = require('../services/telegram');
const db = require('../db/database');

// Verifies that initData was genuinely produced by Telegram for our bot
function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;
  params.delete('hash');

  const pairs = [];
  for (const [key, value] of params.entries()) {
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return computedHash === hash;
}

// POST /api/auth/telegram-login
// Called automatically by the frontend when opened inside Telegram.
router.post('/telegram-login', (req, res) => {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ message: 'initData is required' });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ message: 'Bot token not configured on server' });
    }

    if (!verifyTelegramInitData(initData, botToken)) {
      return res.status(401).json({ message: 'Invalid Telegram data' });
    }

    const params = new URLSearchParams(initData);

    // Reject stale requests (older than 24h)
    const authDate = Number(params.get('auth_date') || 0);
    if (!authDate || Date.now() / 1000 - authDate > 60 * 60 * 24) {
      return res.status(401).json({ message: 'Telegram session expired, please reopen the app' });
    }

    const userJson = params.get('user');
    const tgUser = userJson ? JSON.parse(userJson) : null;
    if (!tgUser || !tgUser.id) {
      return res.status(400).json({ message: 'No Telegram user info found' });
    }

    // Optional: restrict to a specific set of Telegram user IDs.
    // Set ALLOWED_TELEGRAM_IDS="123456789,987654321" in Railway Variables to enable.
    const allowList = process.env.ALLOWED_TELEGRAM_IDS;
    if (allowList) {
      const allowedIds = allowList.split(',').map(s => s.trim());
      if (!allowedIds.includes(String(tgUser.id))) {
        return res.status(403).json({ message: 'Your Telegram account is not authorized' });
      }
    }

    const displayName = tgUser.username || tgUser.first_name || `user_${tgUser.id}`;

    // Track this user (new or returning) and notify the admin chat about new users
    const { isNew, totalUsers } = recordTelegramUser(tgUser);
    if (isNew) {
      const escapeHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const fullName = escapeHtml([tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ')) || 'Unknown';
      const usernamePart = tgUser.username ? `@${escapeHtml(tgUser.username)}` : '(no username)';
      sendTelegramMessage(
        `🆕 <b>New Chacha Dam App User</b>\n\n👤 ${fullName} ${usernamePart}\n🆔 ${tgUser.id}\n\n👥 Total users: <b>${totalUsers}</b>`
      )
        .then(() => console.log(`New user notification sent for ${tgUser.id}`))
        .catch(err => console.error('Failed to notify new user:', err.message));
    }

    // Bot owner check — the owner gets admin-level privileges (e.g. broadcasting notifications)
    const ownerIds = (process.env.OWNER_TELEGRAM_IDS || '1380255277').split(',').map(s => s.trim());
    const isOwner = ownerIds.includes(String(tgUser.id));

    const token = jwt.sign(
      { user: displayName, telegramId: tgUser.id, role: isOwner ? 'admin' : 'member' },
      process.env.JWT_SECRET || 'temporary-secret-change-me',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { username: displayName, telegramId: tgUser.id },
      isOwner,
      hasPhone: !!(db.prepare('SELECT phone_number FROM telegram_users WHERE telegram_id = ?').get(String(tgUser.id)) || {}).phone_number
    });
  } catch (err) {
    console.error('Telegram login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login (fallback for access outside Telegram, e.g. admin/testing)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Temporary simple check (later we will use real hash from .env)
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'chacha123'; // temporary plain password

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { user: username, role: 'admin' },
      process.env.JWT_SECRET || 'temporary-secret-change-me',
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      isOwner: true,
      token,
      user: { username, role: 'admin' }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;