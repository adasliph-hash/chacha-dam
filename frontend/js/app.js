document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (api.getToken()) {
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
      if (tab === 'income' && window.loadIncome) window.loadIncome();
      if (tab === 'costs' && window.loadCosts) window.loadCosts();
      if (tab === 'percent' && window.loadPercent) window.loadPercent();
      if (tab === 'ecost' && window.loadEcost) window.loadEcost();
    });
  });
});