import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/dashboard', async (req: any, res) => {
  try {
    await dataStore.syncWithPostgres();
    const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query.telegram_id ? parseInt(req.query.telegram_id as string, 10) : undefined) || 1001;
    const user = rawId ? (dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId)) : null;
    const userId = user ? user.id : rawId;
    const balance = dataStore.getUserBalance(userId);
    const deposits = dataStore.getDeposits(userId);
    const activeDeposits = deposits.filter(d => d.status === 'confirmed').length;

    res.json({
      investment_summary: {
        total_invested: balance.total_invested || 0,
        active_deposits: activeDeposits
      },
      earnings_summary: {
        mining: balance.claimed_yield_total || 0,
        unclaimed_mining: balance.unclaimed_yield || 0,
        referral: balance.referral_earnings || 0,
        task: balance.task_earnings || 0,
        spin: balance.spin_earnings || 0,
        withdrawn: balance.withdrawn_total || 0
      },
      activity_summary: {
        last_claim: balance.last_claim_at || null,
        updated_at: balance.updated_at
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/overview', async (req, res) => {
  try {
    await dataStore.syncWithPostgres();
    const adminStats = dataStore.getAdminStats();
    res.json({
      success: true,
      total_investors: adminStats.total_users,
      active_miners: adminStats.active_users,
      total_reserve_usdt: 1250000 + adminStats.total_deposits_usdt,
      total_yield_distributed: adminStats.total_mining_yield_paid,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
