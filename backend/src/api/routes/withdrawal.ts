import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const handleWithdrawalRequest = (req: any, res: any) => {
  try {
    const userId = req.body.user_id || req.user?.id || 1001;
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

    const selectedNetwork = network === 'TON' ? 'TON' : 'BEP20';

    const withdrawal = dataStore.createWithdrawal(userId, numAmount, selectedNetwork, targetAddress);
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

router.get('/my-withdrawals', (req: any, res) => {
  const userId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : 1001);
  const withdrawals = dataStore.getWithdrawals(userId);
  res.json({ withdrawals });
});

router.get('/list', (req: any, res) => {
  const userId = req.user?.id || (req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined);
  const withdrawals = dataStore.getWithdrawals(userId);
  res.json({ withdrawals });
});

export default router;
