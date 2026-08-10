import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/user';
import depositRoutes from './api/routes/deposit';
import miningRoutes from './api/routes/mining';
import withdrawalRoutes from './api/routes/withdrawal';
import referralRoutes from './api/routes/referral';
import tasksRoutes from './api/routes/tasks';
import transactionsRoutes from './api/routes/transactions';
import statsRoutes from './api/routes/stats';
import adminRoutes from './api/routes/admin';
import { MiningCalculator } from './jobs/miningCalculator';
import { tronIndexer } from './jobs/tronIndexer';
import { yieldWorkerService } from './jobs/yieldQueue';
import { telegramBotService } from './services/telegramBot';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/telegram', authLimiter);

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    await telegramBotService.handleWebhookUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/mining', miningRoutes);
app.use('/api/finance', withdrawalRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

wss.on('connection', (ws, req) => {
  ws.on('error', console.error);
  
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);

  ws.on('close', () => {
    clearInterval(pingInterval);
  });
});

const calculator = new MiningCalculator();
calculator.start();

tronIndexer.startPeriodicIndexer(30000);
yieldWorkerService.startYieldCron(60000);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
