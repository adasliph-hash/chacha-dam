const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files (html, css, js) from this folder
app.use(express.static(__dirname));

// SPA-style fallback: any unknown route -> index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Chacha Dam Frontend running on http://localhost:${PORT}`);
});
