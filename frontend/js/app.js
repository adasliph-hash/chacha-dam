document.addEventListener('DOMContentLoaded', async () => {
  // Check if already logged in (existing session)
  if (api.getToken()) {
    auth.showApp();
  } else {
    // Try silent Telegram login first — only falls back to the password
    // form if the app wasn't opened inside Telegram (or verification fails)
    await auth.tryTelegramAutoLogin();
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
      if (tab === 'income' && window.loadIncome) window.loadIncome();
      if (tab === 'costs' && window.loadCosts) window.loadCosts();
      if (tab === 'percent' && window.loadPercent) window.loadPercent();
      if (tab === 'ecost' && window.loadEcost) window.loadEcost();
    });
  });
});