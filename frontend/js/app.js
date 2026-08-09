document.addEventListener('DOMContentLoaded', async () => {
  const tg = window.Telegram && window.Telegram.WebApp;

  if (tg && tg.initData) {
    // Opened inside Telegram — always (re)authenticate so today's visit
    // gets recorded for the daily digest, even if a session already exists.
    const success = await auth.tryTelegramAutoLogin();
    if (!success && api.getToken()) {
      // Telegram auth call failed (e.g. brief network hiccup) but we still
      // have a valid stored session — use it rather than showing the login form.
      auth.showApp();
    }
  } else if (api.getToken()) {
    auth.showApp();
  }

  // Login form
  document.getElementById('login-form').addEventListener('submit', auth.handleLogin);

  // Logout
  document.getElementById('logout-btn').addEventListener('click', auth.logout);

  // Tab switching
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // Update active button
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(`${tab}-tab`).classList.add('active');

      // Load data
      if (tab === 'home' && window.loadHome) window.loadHome();
      if (tab === 'income' && window.loadIncome) window.loadIncome();
      if (tab === 'costs' && window.loadCosts) window.loadCosts();
      if (tab === 'ecost' && window.loadEcost) window.loadEcost();
    });
  });
});