const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Prevent aggressive caching (especially inside Telegram's in-app WebView)
// so every deploy is picked up immediately instead of showing stale assets.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve static files (html, css, js) from this folder
app.use(express.static(__dirname));

// SPA-style fallback: any unknown route -> index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Chacha Dam Frontend running on http://localhost:${PORT}`);
});
