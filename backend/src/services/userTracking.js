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

const upsertDailyVisitStmt = db.prepare(`
  INSERT INTO visit_log (telegram_id, visit_date, visit_count)
  VALUES (@telegram_id, @visit_date, 1)
  ON CONFLICT(telegram_id, visit_date) DO UPDATE SET
    visit_count = visit_count + 1
`);

const countStmt = db.prepare('SELECT COUNT(*) AS total FROM telegram_users');
const listStmt = db.prepare('SELECT * FROM telegram_users ORDER BY last_seen DESC');
const getStmt = db.prepare('SELECT * FROM telegram_users WHERE telegram_id = ?');

const dailyActiveUsersStmt = db.prepare(`
  SELECT u.telegram_id, u.username, u.first_name, u.last_name, v.visit_count
  FROM visit_log v
  JOIN telegram_users u ON u.telegram_id = v.telegram_id
  WHERE v.visit_date = ?
  ORDER BY u.first_name COLLATE NOCASE
`);

function todayDateString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

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

  upsertDailyVisitStmt.run({
    telegram_id: telegramId,
    visit_date: todayDateString()
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

/**
 * Returns the list of users who opened the app on a given date (defaults to today, UTC).
 */
function getDailyActiveUsers(dateString) {
  return dailyActiveUsersStmt.all(dateString || todayDateString());
}

module.exports = { recordTelegramUser, getAllUsers, getUserCount, getDailyActiveUsers, todayDateString };
