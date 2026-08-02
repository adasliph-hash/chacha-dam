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

window.auth = { handleLogin, showApp, logout };