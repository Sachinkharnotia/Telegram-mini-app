import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { User, Deposit, Withdrawal } from '../../models';
import { pool } from '../../config/database';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

const router = Router();

router.use(authMiddleware);

const adminMiddleware = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.telegram_id.toString() !== process.env.ADMIN_TELEGRAM_ID) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.use(adminMiddleware);

router.get('/users', async (req: any, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/mining-rates', async (req: any, res) => {
  try {
    const { daily_rate } = req.body;
    await redisClient.set('current_mining_rate', daily_rate.toString());
    
    await pool.query(
      'INSERT INTO audit_logs (admin_id, action, new_values) VALUES ($1, $2, $3)',
      [req.user.id, 'update_mining_rate', JSON.stringify({ daily_rate })]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/announcements', async (req: any, res) => {
  try {
    const { title, message } = req.body;
    
    const result = await pool.query(
      'INSERT INTO notifications (user_id, type, title, message) SELECT id, $1, $2, $3 FROM users RETURNING id',
      ['announcement', title, message]
    );
    
    res.json({ success: true, count: result.rowCount });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
