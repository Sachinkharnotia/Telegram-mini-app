import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const getTransactionsHistory = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query.telegram_id ? parseInt(req.query.telegram_id as string, 10) : undefined);
  const user = rawId ? (dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId)) : null;
  const userId = user ? user.id : rawId;
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
