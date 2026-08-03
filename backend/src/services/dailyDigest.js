const cron = require('node-cron');
const { getDailyActiveUsers, todayDateString } = require('./userTracking');
const { sendTelegramMessage } = require('./telegram');

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendDailyDigest(dateString) {
  const date = dateString || todayDateString();
  const users = getDailyActiveUsers(date);

  let message;
  if (users.length === 0) {
    message = `📅 <b>Daily App Activity — ${date}</b>\n\nNo one opened the Chacha Dam app today.`;
  } else {
    const lines = users.map((u, i) => {
      const fullName = escapeHtml([u.first_name, u.last_name].filter(Boolean).join(' ')) || 'Unknown';
      const usernamePart = u.username ? ` (@${escapeHtml(u.username)})` : '';
      return `${i + 1}. ${fullName}${usernamePart} — ${u.visit_count} visit${u.visit_count > 1 ? 's' : ''}`;
    });
    message = `📅 <b>Daily App Activity — ${date}</b>\n\n👥 <b>${users.length}</b> user(s) opened the app:\n\n${lines.join('\n')}`;
  }

  try {
    await sendTelegramMessage(message);
    console.log(`Daily digest sent for ${date} (${users.length} users)`);
  } catch (err) {
    console.error('Failed to send daily digest:', err.message);
  }
}

// Runs every day at 21:00 Addis Ababa time (Africa/Addis_Ababa = UTC+3)
function startDailyDigestScheduler() {
  cron.schedule('0 21 * * *', () => {
    sendDailyDigest();
  }, { timezone: 'Africa/Addis_Ababa' });

  console.log('📅 Daily digest scheduler started (21:00 Africa/Addis_Ababa)');
}

module.exports = { startDailyDigestScheduler, sendDailyDigest };
