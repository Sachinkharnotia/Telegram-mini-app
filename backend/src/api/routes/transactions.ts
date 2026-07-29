import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { Transaction } from '../../models';

const router = Router();

router.use(authMiddleware);

router.get('/history', async (req: any, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const history = await Transaction.findByUserId(req.user.id, Number(limit), Number(offset));
    res.json({ transactions: history });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
