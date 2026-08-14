import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.post('/request', (req: any, res) => {
  try {
    const userId = req.user?.id || 1001;
    const { amount, network, wallet_address } = req.body;

    const numAmount = parseFloat(amount);
    const settings = dataStore.getSettings();

    if (isNaN(numAmount) || numAmount < settings.min_withdrawal) {
      return res.status(400).json({ error: `Minimum withdrawal is $${settings.min_withdrawal} USDT` });
    }

    if (numAmount > settings.max_withdrawal) {
      return res.status(400).json({ error: `Maximum withdrawal limit is $${settings.max_withdrawal} USDT` });
    }

    if (!wallet_address || wallet_address.trim().length < 5) {
      return res.status(400).json({ error: 'Valid wallet address is required' });
    }

    if (network !== 'BEP20' && network !== 'TON') {
      return res.status(400).json({ error: 'Supported networks: BEP20, TON' });
    }

    const withdrawal = dataStore.createWithdrawal(userId, numAmount, network, wallet_address);
    res.json({
      success: true,
      withdrawal_id: withdrawal.id,
      amount: withdrawal.amount,
      fee: withdrawal.fee,
      net_amount: withdrawal.net_amount,
      network: withdrawal.network,
      wallet_address: withdrawal.wallet_address,
      status: withdrawal.status
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Withdrawal request failed' });
  }
});

router.get('/my-withdrawals', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const withdrawals = dataStore.getWithdrawals(userId);
  res.json({ withdrawals });
});

export default router;
