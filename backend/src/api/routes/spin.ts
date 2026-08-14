import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/sectors', (req, res) => {
  const sectors = dataStore.getSpinSectors();
  const settings = dataStore.getSettings();
  res.json({
    sectors,
    spin_cost_usdt: settings.spin_cost_usdt,
    daily_free_spins: settings.daily_free_spins
  });
});

router.post('/play', (req: any, res) => {
  try {
    const userId = req.user?.id || 1001;
    const result = dataStore.spinWheel(userId);
    const bal = dataStore.getUserBalance(userId);

    res.json({
      success: true,
      sector_index: result.sectorIndex,
      reward_type: result.sector.reward_type,
      reward_amount: result.sector.reward_amount,
      prize_label: result.sector.label,
      new_usdt_balance: bal.usdt_balance,
      new_vx_balance: bal.vx_balance
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Spin failed' });
  }
});

export default router;
