import { Router } from 'express';
import { User } from '../models';
import { authMiddleware } from '../../middleware/auth';
import { validateWalletAddress } from '../../utils/crypto';

const router = Router();

router.use(authMiddleware);

router.get('/profile', async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', async (req: any, res) => {
  try {
    const { wallet_address } = req.body;
    
    if (wallet_address && !validateWalletAddress(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    const user = await User.updateWallet(req.user.id, wallet_address);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
