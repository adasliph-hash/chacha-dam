(function () {
  function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  }

  function getSavedPreference() {
    return localStorage.getItem('themePreference'); // 'light' | 'dark' | null (auto = follow Telegram/system)
  }

  function detectTelegramTheme() {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.colorScheme) return tg.colorScheme; // 'light' or 'dark'
    return null;
  }

  function initTheme() {
    const saved = getSavedPreference();
    if (saved) {
      applyTheme(saved === 'dark');
      return;
    }
    const tgTheme = detectTelegramTheme();
    if (tgTheme) {
      applyTheme(tgTheme === 'dark');
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
  }

  function toggleTheme() {
    const isDark = !document.body.classList.contains('dark-theme');
    applyTheme(isDark);
    localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // If the user hasn't manually overridden, follow Telegram's theme live
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.onEvent) {
      tg.onEvent('themeChanged', () => {
        if (!getSavedPreference()) {
          applyTheme(tg.colorScheme === 'dark');
        }
      });
    }

    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  window.themeToggle = toggleTheme;
})();
