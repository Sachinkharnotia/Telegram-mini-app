import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getMiningStatus = (req: any, res: any) => {
  const userId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : 1001);
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
};

router.get('/dashboard', getMiningStatus);
router.get('/status', getMiningStatus);
router.get('/packages', getMiningStatus);
router.get('/', getMiningStatus);

router.post('/buy-vx', (req: any, res) => {
  try {
    const userId = req.body.user_id || req.user?.id || 1001;
    const { vx_amount, amount } = req.body;
    const targetAmount = vx_amount || amount;

    const numVx = parseFloat(targetAmount);
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

const handleClaimYield = (req: any, res: any) => {
  const userId = req.body.user_id || req.user?.id || 1001;
  const result = dataStore.claimYield(userId);
  if (!result.success) {
    return res.status(400).json({ error: 'No unclaimed yield available to claim' });
  }
  const bal = dataStore.getUserBalance(userId);
  res.json({
    success: true,
    claimId: `CLM-${Date.now()}`,
    status: 'confirmed',
    transactionHash: `0x${Math.random().toString(16).substring(2, 40)}`,
    claimed_usdt: result.claimedUsdt,
    new_usdt_balance: bal.usdt_balance
  });
};

router.post('/claim-yield', handleClaimYield);
router.post('/claim', handleClaimYield);
router.post('/claims/create', handleClaimYield);

router.post('/calculator/estimate', (req: any, res) => {
  const { amount_usdt, vx_amount } = req.body;
  const settings = dataStore.getSettings();
  const vxCount = vx_amount ? parseFloat(vx_amount) : (parseFloat(amount_usdt || '0') / settings.vx_price_usdt);
  const dailyUsdt = vxCount * settings.vx_price_usdt * settings.daily_yield_rate;

  res.json({
    vx_tokens: vxCount,
    daily_yield_usdt: dailyUsdt,
    weekly_yield_usdt: dailyUsdt * 7,
    monthly_yield_usdt: dailyUsdt * 30,
    yearly_yield_usdt: dailyUsdt * 365,
    daily_rate_percent: settings.daily_yield_rate * 100
  });
});

export default router;
