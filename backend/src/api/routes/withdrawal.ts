import { Router } from 'express';
import { withdrawalService } from '../../services/withdrawal.service';
import { authMiddleware } from '../../middleware/auth';
import { validateWalletAddress } from '../../utils/crypto';

const router = Router();

router.use(authMiddleware);

router.post('/claim', async (req: any, res) => {
  try {
    const { amount } = req.body;
    const result = await withdrawalService.claimEarnings(req.user.id, amount);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/withdraw', async (req: any, res) => {
  try {
    const { amount, wallet_address } = req.body;
    
    if (!wallet_address || !validateWalletAddress(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    const result = await withdrawalService.createWithdrawal(req.user.id, amount, wallet_address);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
