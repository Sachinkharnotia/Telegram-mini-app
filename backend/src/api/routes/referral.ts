import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getReferralInfo = (req: any, res: any) => {
  const userId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : 1001);
  const user = dataStore.findUserById(userId);
  const bal = dataStore.getUserBalance(userId);
  const settings = dataStore.getSettings();

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'VXMiningBot';
  const referralCode = user ? `ref_${user.telegram_id}` : `ref_98765432`;
  const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;

  const t1 = settings.referral_commission_tier1 > 1 ? settings.referral_commission_tier1 : settings.referral_commission_tier1 * 100;
  const t2 = settings.referral_commission_tier2 > 1 ? settings.referral_commission_tier2 : settings.referral_commission_tier2 * 100;

  res.json({
    referral_code: referralCode,
    referral_link: referralLink,
    referralCode,
    referralLink,
    total_earned: bal.referral_earnings,
    totalEarnings: bal.referral_earnings.toString(),
    tier1_commission_rate: t1,
    tier2_commission_rate: t2,
    tier3_commission_rate: 2,
    fixed_reward: settings.referral_fixed_reward,
    tier1Referrals: [],
    tier2Referrals: [],
    enabled: settings.referral_enabled
  });
};

router.get('/stats', getReferralInfo);
router.get('/me', getReferralInfo);

export default router;
