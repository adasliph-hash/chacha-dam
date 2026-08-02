const https = require('https');

/**
 * Send a message to Telegram using Bot API
 * @param {string} text - The message to send
 * @returns {Promise<object>}
 */
function sendTelegramMessage(text) {
  return new Promise((resolve, reject) => {
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!token || !chatId || token === 'replace-later' || chatId === 'replace-later') {
      return reject(new Error('BOT_TOKEN or CHAT_ID is not configured in .env'));
    }

    const data = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.ok) {
            resolve(json);
          } else {
            reject(new Error(json.description || 'Telegram API error'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { sendTelegramMessage };