import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getSpinInfo = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query.telegram_id ? parseInt(req.query.telegram_id as string, 10) : undefined);
  const user = rawId ? (dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId)) : null;
  const userId = user ? user.id : 1001;
  const sectors = dataStore.getSpinSectors();
  const settings = dataStore.getSettings();
  const dailyLimit = settings.daily_spins_limit !== undefined ? Number(settings.daily_spins_limit) : (settings.daily_free_spins !== undefined ? Number(settings.daily_free_spins) : 1);
  const spinsUsedToday = dataStore.getUserDailySpins(userId);

  res.json({
    sectors,
    spin_cost_usdt: settings.spin_cost_usdt,
    daily_free_spins: settings.daily_free_spins,
    daily_spins_limit: dailyLimit,
    spins_used_today: spinsUsedToday,
    spins_remaining: Math.max(0, dailyLimit - spinsUsedToday)
  });
};

router.get('/sectors', getSpinInfo);
router.get('/status', getSpinInfo);
router.get('/', getSpinInfo);

router.post('/play', async (req: any, res) => {
  await dataStore.syncWithPostgres();
  try {
    const rawId = req.body?.user_id || req.body?.telegram_id || req.user?.id || (req.query?.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query?.telegram_id ? parseInt(req.query.telegram_id as string, 10) : undefined);
    
    let user = null;
    if (rawId) {
      user = dataStore.findUserByTelegramId(Number(rawId)) || dataStore.findUserById(Number(rawId));
    }
    if (!user && req.user?.id) {
      user = dataStore.findUserById(req.user.id);
    }
    if (!user && rawId && Number(rawId) > 10000) {
      user = dataStore.createUser({
        telegram_id: Number(rawId),
        username: `user_${rawId}`,
        first_name: 'Member',
        is_premium: false
      });
    }
    if (!user) {
      user = dataStore.findUserById(1001);
    }
    const effectiveUserId = user ? user.id : 1001;

    const result = dataStore.spinWheel(effectiveUserId);
    await dataStore.saveToDiskAsync();
    const bal = dataStore.getUserBalance(effectiveUserId);

    res.json({
      success: true,
      sector_index: result.sectorIndex,
      reward_type: result.sector.reward_type,
      reward_amount: result.sector.reward_amount,
      prize_label: result.sector.label,
      new_usdt_balance: bal.usdt_balance,
      new_vx_balance: bal.vx_balance,
      user_id: effectiveUserId
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Spin failed' });
  }
});

export default router;
