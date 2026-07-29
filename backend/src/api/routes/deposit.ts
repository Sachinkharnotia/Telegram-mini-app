import { Router } from 'express';
import { depositService } from '../../services/deposit.service';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/create', async (req: any, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount < 10) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const depositData = await depositService.createDeposit(req.user.id, amount);
    res.status(201).json(depositData);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/history', async (req: any, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const deposits = await depositService.getUserDeposits(req.user.id, Number(limit), Number(offset));
    res.json({ deposits, total: deposits.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
