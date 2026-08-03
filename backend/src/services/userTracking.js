const db = require('../db/database');

const upsertStmt = db.prepare(`
  INSERT INTO telegram_users (telegram_id, username, first_name, last_name, first_seen, last_seen, visit_count)
  VALUES (@telegram_id, @username, @first_name, @last_name, @now, @now, 1)
  ON CONFLICT(telegram_id) DO UPDATE SET
    username = @username,
    first_name = @first_name,
    last_name = @last_name,
    last_seen = @now,
    visit_count = visit_count + 1
`);

const countStmt = db.prepare('SELECT COUNT(*) AS total FROM telegram_users');
const listStmt = db.prepare('SELECT * FROM telegram_users ORDER BY last_seen DESC');
const getStmt = db.prepare('SELECT * FROM telegram_users WHERE telegram_id = ?');

/**
 * Records (or updates) a Telegram user's visit.
 * @param {object} tgUser - Telegram user object from initData ({ id, username, first_name, last_name })
 * @returns {{ isNew: boolean, totalUsers: number }}
 */
function recordTelegramUser(tgUser) {
  const telegramId = String(tgUser.id);
  const existing = getStmt.get(telegramId);
  const isNew = !existing;

  upsertStmt.run({
    telegram_id: telegramId,
    username: tgUser.username || null,
    first_name: tgUser.first_name || null,
    last_name: tgUser.last_name || null,
    now: new Date().toISOString()
  });

  const { total } = countStmt.get();
  return { isNew, totalUsers: total };
}

function getAllUsers() {
  return listStmt.all();
}

function getUserCount() {
  return countStmt.get().total;
}

module.exports = { recordTelegramUser, getAllUsers, getUserCount };
