import { Router } from 'express';
import { referralService } from '../../services/referral.service';
import { authMiddleware } from '../../middleware/auth';
import { Referral } from '../../models';

const router = Router();

router.use(authMiddleware);

router.get('/stats', async (req: any, res) => {
  try {
    const stats = await referralService.getReferralStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req: any, res) => {
  try {
    const history = await Referral.findByReferrerId(req.user.id);
    res.json({ referrals: history });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
