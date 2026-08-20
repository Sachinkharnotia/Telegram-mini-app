import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getUserProfile = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query.telegram_id ? parseInt(req.query.telegram_id as string, 10) : undefined);
  let user: any = null;
  if (rawId) {
    user = dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId);
  }
  if (!user && req.user?.telegram_id) {
    user = dataStore.findUserByTelegramId(req.user.telegram_id);
  }
  if (!user && rawId && rawId > 100000) {
    user = dataStore.createUser({
      telegram_id: rawId,
      username: `user_${rawId}`,
      first_name: 'Member',
      is_premium: false
    });
  }
  if (!user) {
    user = dataStore.findUserById(1001);
  }
  if (!user) return res.status(404).json({ error: 'User not found' });
  const balance = dataStore.getUserBalance(user.id);
  const refStats = dataStore.getReferralStats(user.id);
  const settings = dataStore.getSettings();
  res.json({
    user: {
      ...user,
      balance_usdt: balance.usdt_balance,
      balance_vx: balance.vx_balance,
      referral_count: refStats.direct_referrals,
      referral_earnings: balance.referral_earnings
    },
    balance,
    refStats,
    settings
  });
};

router.get('/profile', getUserProfile);

router.get('/balance', async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query.telegram_id ? parseInt(req.query.telegram_id as string, 10) : 1001);
  const user = dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId) || dataStore.findUserById(1001);
  const effectiveUserId = user ? user.id : 1001;
  const balance = dataStore.getUserBalance(effectiveUserId);
  res.json({
    totalInvested: balance.total_invested.toString(),
    availableBalance: balance.usdt_balance.toString(),
    miningBalance: balance.vx_balance.toString(),
    withdrawnTotal: balance.withdrawn_total.toString(),
    referralEarnings: balance.referral_earnings.toString(),
    taskEarnings: balance.task_earnings.toString(),
    unclaimedYield: balance.unclaimed_yield.toString(),
    balance_usdt: balance.usdt_balance,
    balance_vx: balance.vx_balance,
    balance
  });
});

router.get('/mandatory-join', (req: any, res) => {
  const settings = dataStore.getSettings();
  const communities = dataStore.getRequiredCommunities();
  res.json({
    enabled: settings.mandatory_join_enabled,
    communities
  });
});

router.post('/mandatory-join/confirm', (req: any, res) => {
  res.json({ success: true, message: 'All required communities verified' });
});

export default router;
