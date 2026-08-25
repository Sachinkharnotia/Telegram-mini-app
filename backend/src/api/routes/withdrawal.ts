import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const handleWithdrawalRequest = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  try {
    const rawId = req.body.user_id || req.body.telegram_id || req.user?.id || 1001;
    const user = dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId);
    const userId = user ? user.id : (rawId || 1001);
    const { amount, network, wallet_address, destination_address } = req.body;
    const targetAddress = wallet_address || destination_address;

    const numAmount = parseFloat(amount);
    const settings = dataStore.getSettings();

    if (isNaN(numAmount) || numAmount < settings.min_withdrawal) {
      return res.status(400).json({ error: `Minimum withdrawal is $${settings.min_withdrawal} USDT` });
    }

    if (numAmount > settings.max_withdrawal) {
      return res.status(400).json({ error: `Maximum withdrawal limit is $${settings.max_withdrawal} USDT` });
    }

    if (!targetAddress || targetAddress.trim().length < 5) {
      return res.status(400).json({ error: 'Valid wallet address is required' });
    }

    const userDeposits = dataStore.getDeposits(userId).filter((d: any) => d.status === 'confirmed');
    const totalDeposited = userDeposits.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
    const balance = dataStore.getUserBalance(userId);
    const totalInvested = Math.max(totalDeposited, balance.total_invested || 0);

    if (totalInvested < 5.00) {
      return res.status(400).json({
        error: 'First withdrawal requires a minimum deposit of $5.00 USDT. Please make a deposit of at least $5.00 USDT to activate payouts.'
      });
    }

    const selectedNetwork = network === 'TON' ? 'TON' : 'BEP20';

    const withdrawal = dataStore.createWithdrawal(userId, numAmount, selectedNetwork, targetAddress);
    await dataStore.saveToDiskAsync();
    res.json({
      success: true,
      withdrawalId: withdrawal.id.toString(),
      withdrawal_id: withdrawal.id,
      amount: withdrawal.amount.toString(),
      fee: withdrawal.fee.toString(),
      netAmount: withdrawal.net_amount.toString(),
      net_amount: withdrawal.net_amount,
      network: withdrawal.network,
      wallet_address: withdrawal.wallet_address,
      status: withdrawal.status
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Withdrawal request failed' });
  }
};

router.post('/request', handleWithdrawalRequest);
router.post('/create', handleWithdrawalRequest);

const getWithdrawalList = async (req: any, res: any) => {
  await dataStore.syncWithPostgres();
  const rawId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined) || (req.query.telegram_id ? parseInt(req.query.telegram_id as string, 10) : undefined);
  const user = rawId ? (dataStore.findUserByTelegramId(rawId) || dataStore.findUserById(rawId)) : null;
  const userId = user ? user.id : rawId;
  const withdrawals = dataStore.getWithdrawals(userId);
  res.json({ withdrawals });
};

router.get('/my-withdrawals', getWithdrawalList);
router.get('/history', getWithdrawalList);
router.get('/list', getWithdrawalList);
router.get('/', getWithdrawalList);

export default router;
