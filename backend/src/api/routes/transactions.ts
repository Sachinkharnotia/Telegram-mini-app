import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getTransactionsHistory = (req: any, res: any) => {
  const userId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined);
  const transactions = dataStore.getTransactions(userId);
  res.json({
    transactions,
    total: transactions.length
  });
};

router.get('/history', getTransactionsHistory);
router.get('/list', getTransactionsHistory);
router.get('/', getTransactionsHistory);

export default router;
