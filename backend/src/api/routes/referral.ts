import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getReferralInfo = (req: any, res: any) => {
  const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined);
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

  const effectiveUserId = user ? user.id : (rawId || 1001);
  const effectiveTgId = user ? user.telegram_id : (rawId || 10001);
  const bal = dataStore.getUserBalance(effectiveUserId);
  const settings = dataStore.getSettings();

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Vextoralbot';
  const referralCode = `ref_${effectiveTgId}`;
  const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;

  const refStats = dataStore.getReferralStats(effectiveUserId);

  const t1 = settings.referral_commission_tier1 < 1 ? Math.round(settings.referral_commission_tier1 * 100) : Number(settings.referral_commission_tier1);
  const t2 = settings.referral_commission_tier2 < 1 ? Math.round(settings.referral_commission_tier2 * 100) : Number(settings.referral_commission_tier2);
  const t3 = (settings.referral_commission_tier3 !== undefined && settings.referral_commission_tier3 < 1)
    ? Math.round(settings.referral_commission_tier3 * 100)
    : Number(settings.referral_commission_tier3 ?? 2);

  res.json({
    referral_code: referralCode,
    referral_link: referralLink,
    referralCode,
    referralLink,
    direct_referrals: refStats.direct_referrals,
    total_referrals: refStats.total_referrals,
    referral_count: refStats.direct_referrals,
    total_earned: refStats.total_earned,
    totalEarnings: refStats.total_earned.toString(),
    tier1_commission_rate: t1,
    tier2_commission_rate: t2,
    tier3_commission_rate: t3,
    fixed_reward: settings.referral_fixed_reward,
    tier1Referrals: refStats.list,
    tier2Referrals: [],
    enabled: settings.referral_enabled
  });
};

router.get('/stats', getReferralInfo);
router.get('/me', getReferralInfo);

export default router;
