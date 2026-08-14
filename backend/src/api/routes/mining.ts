import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/dashboard', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const bal = dataStore.getUserBalance(userId);
  const settings = dataStore.getSettings();

  const is_eligible = bal.vx_balance >= settings.min_vx_mining && settings.mining_enabled;
  const daily_yield_usdt = is_eligible ? bal.vx_balance * settings.vx_price_usdt * settings.daily_yield_rate : 0;

  res.json({
    vx_balance: bal.vx_balance,
    usdt_balance: bal.usdt_balance,
    unclaimed_yield: bal.unclaimed_yield,
    claimed_yield_total: bal.claimed_yield_total,
    daily_yield_rate: settings.daily_yield_rate,
    daily_usdt_yield: daily_yield_usdt,
    is_eligible_to_mine: is_eligible,
    min_vx_required: settings.min_vx_mining,
    vx_price_usdt: settings.vx_price_usdt,
    min_vx_purchase: settings.min_vx_purchase,
    last_claim_at: bal.last_claim_at
  });
});

router.post('/buy-vx', (req: any, res) => {
  try {
    const userId = req.user?.id || 1001;
    const { vx_amount } = req.body;

    const numVx = parseFloat(vx_amount);
    if (isNaN(numVx) || numVx <= 0) {
      return res.status(400).json({ error: 'Invalid VX amount' });
    }

    const result = dataStore.buyVXTokens(userId, numVx);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    const bal = dataStore.getUserBalance(userId);
    res.json({
      success: true,
      vx_amount: numVx,
      usdt_cost: result.usdtCost,
      new_usdt_balance: bal.usdt_balance,
      new_vx_balance: bal.vx_balance,
      message: 'VX Tokens purchased successfully'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to purchase VX Tokens' });
  }
});

router.post('/claim-yield', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const result = dataStore.claimYield(userId);
  if (!result.success) {
    return res.status(400).json({ error: 'No unclaimed yield available to claim' });
  }
  const bal = dataStore.getUserBalance(userId);
  res.json({
    success: true,
    claimed_usdt: result.claimedUsdt,
    new_usdt_balance: bal.usdt_balance
  });
});

export default router;
