import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/user';
import depositRoutes from './api/routes/deposit';
import miningRoutes from './api/routes/mining';
import withdrawalRoutes from './api/routes/withdrawal';
import referralRoutes from './api/routes/referral';
import tasksRoutes from './api/routes/tasks';
import spinRoutes from './api/routes/spin';
import transactionsRoutes from './api/routes/transactions';
import adminRoutes from './api/routes/admin';
import statsRoutes from './api/routes/stats';
import { telegramBotService } from './services/telegramBot';

dotenv.config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'online', service: 'VextoralMining API Engine', version: '2.4.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    await telegramBotService.handleWebhookUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// User & Profile Routes (Singular & Plural Aliases)
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes);

// Deposit Routes (Singular & Plural Aliases)
app.use('/api/deposit', depositRoutes);
app.use('/api/deposits', depositRoutes);

// Mining & Yield Routes
app.use('/api/mining', miningRoutes);
app.use('/api/claims', miningRoutes);
app.use('/api/calculator', miningRoutes);

// Withdrawal & Finance Routes (Singular & Plural Aliases)
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/finance', withdrawalRoutes);

// Referral Routes (Singular & Plural Aliases)
app.use('/api/referral', referralRoutes);
app.use('/api/referrals', referralRoutes);

// Tasks Routes
app.use('/api/tasks', tasksRoutes);

// Lucky Wheel & Spin Routes
app.use('/api/spin', spinRoutes);

// Transactions & History Routes
app.use('/api/transactions', transactionsRoutes);

// Admin Control Routes
app.use('/api/admin', adminRoutes);

// Public & User Stats Routes
app.use('/api/stats', statsRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
