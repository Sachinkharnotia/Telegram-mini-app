import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/stats', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const user = dataStore.findUserById(userId);
  const bal = dataStore.getUserBalance(userId);
  const settings = dataStore.getSettings();

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'VXMiningBot';
  const referralCode = user ? `ref_${user.telegram_id}` : `ref_98765432`;
  const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;

  res.json({
    referral_code: referralCode,
    referral_link: referralLink,
    total_earned: bal.referral_earnings,
    tier1_commission_rate: settings.referral_commission_tier1 * 100,
    tier2_commission_rate: settings.referral_commission_tier2 * 100,
    fixed_reward: settings.referral_fixed_reward,
    enabled: settings.referral_enabled
  });
});

export default router;
