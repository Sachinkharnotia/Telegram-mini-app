import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { pool } from '../../config/database';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const balanceResult = await pool.query('SELECT * FROM user_balances WHERE user_id = $1', [userId]);
    const balance = balanceResult.rows[0] || {};
    
    const depositResult = await pool.query('SELECT COUNT(*) as count FROM deposits WHERE user_id = $1 AND status = \'confirmed\'', [userId]);
    const totalDeposits = parseInt(depositResult.rows[0].count);
    
    res.json({
      investment_summary: {
        total_invested: balance.total_invested || 0,
        active_deposits: totalDeposits
      },
      earnings_summary: {
        mining: balance.mining_balance || 0,
        referral: balance.referral_earnings || 0,
        task: balance.task_earnings || 0,
        withdrawn: balance.withdrawn_total || 0
      },
      activity_summary: {
        last_claim: balance.last_claim_at || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
