async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');

  errorEl.textContent = '';

  try {
    const data = await api.apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    api.setToken(data.token);
    showApp();
  } catch (err) {
    errorEl.textContent = err.message || 'Login failed';
  }
}

// Auto-login when the app is opened inside Telegram — no password needed.
// Returns true if it successfully logged the user in.
async function tryTelegramAutoLogin() {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg || !tg.initData) {
    return false; // Not opened inside Telegram (e.g. testing in a normal browser)
  }

  tg.ready();

  try {
    const data = await api.apiFetch('/api/auth/telegram-login', {
      method: 'POST',
      body: JSON.stringify({ initData: tg.initData })
    });

    api.setToken(data.token);
    showApp();
    maybeRequestPhoneNumber(tg);
    return true;
  } catch (err) {
    console.error('Telegram auto-login failed:', err);
    return false;
  }
}

// Asks the user (once) to share their phone number via Telegram's native
// permission prompt. The number itself is delivered to our bot as a message
// and stored server-side via the /api/telegram/webhook endpoint.
function maybeRequestPhoneNumber(tg) {
  if (typeof tg.requestContact !== 'function') return; // older Telegram client
  if (localStorage.getItem('phoneShareAsked')) return;

  localStorage.setItem('phoneShareAsked', '1');
  try {
    tg.requestContact((sent) => {
      console.log('Phone number share requested, user responded:', sent);
    });
  } catch (err) {
    console.error('requestContact failed:', err);
  }
}

function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  // Load first tab
  if (window.loadIncome) window.loadIncome();
}

function logout() {
  api.clearToken();
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

window.auth = { handleLogin, showApp, logout, tryTelegramAutoLogin };