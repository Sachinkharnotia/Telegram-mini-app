import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/history', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const transactions = dataStore.getTransactions(userId);
  res.json({ transactions });
});

export default router;
