require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const incomeRoutes = require('./routes/income');
const costRoutes = require('./routes/costs');
const percentRoutes = require('./routes/percent');
const chatRoutes = require('./routes/chat');
const ecostRoutes = require('./routes/ecost');
const usersRoutes = require('./routes/users');
const telegramWebhookRoutes = require('./routes/telegramWebhook');

const app = express();

// Security & middleware
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/income', incomeRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/percent', percentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ecost', ecostRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/telegram', telegramWebhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Chacha Dam Backend is running',
    time: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    project: 'Chacha Dam API',
    version: '1.0.0',
    status: 'ready'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Chacha Dam Backend running on http://localhost:${PORT}`);
  require('./services/dailyDigest').startDailyDigestScheduler();

  // Register our webhook with Telegram so we can receive contact shares (phone numbers)
  const backendUrl = process.env.BACKEND_PUBLIC_URL || 'https://chacha-dam-production.up.railway.app';
  const { setWebhook } = require('./services/telegram');
  setWebhook(`${backendUrl}/api/telegram/webhook`, process.env.WEBHOOK_SECRET)
    .then(() => console.log('✅ Telegram webhook registered'))
    .catch(err => console.error('⚠️ Failed to register Telegram webhook:', err.message));
});