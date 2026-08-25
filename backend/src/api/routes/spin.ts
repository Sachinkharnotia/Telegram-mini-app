import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getSpinInfo = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  const sectors = dataStore.getSpinSectors();
  const settings = dataStore.getSettings();
  res.json({
    sectors,
    spin_cost_usdt: settings.spin_cost_usdt,
    daily_free_spins: settings.daily_free_spins
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
      user = dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId);
    }
    if (!user && req.user?.id) {
      user = dataStore.findUserById(req.user.id);
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
