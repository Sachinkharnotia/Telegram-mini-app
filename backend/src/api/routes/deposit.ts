import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

router.get('/wallets', (req, res) => {
  const settings = dataStore.getSettings();
  res.json({
    bep20_wallet: settings.bep20_wallet,
    ton_wallet: settings.ton_wallet,
    min_deposit: settings.min_deposit
  });
});

router.post('/create', (req: any, res) => {
  try {
    const userId = req.user?.id || 1001;
    const { amount, network } = req.body;

    const numAmount = parseFloat(amount);
    const settings = dataStore.getSettings();
    if (isNaN(numAmount) || numAmount < settings.min_deposit) {
      return res.status(400).json({ error: `Minimum deposit is $${settings.min_deposit} USDT` });
    }

    if (network !== 'BEP20' && network !== 'TON' && network !== 'TRC20') {
      return res.status(400).json({ error: 'Invalid deposit network. Supported: BEP20, TON' });
    }

    const deposit = dataStore.createDeposit(userId, numAmount, network);
    const walletAddress = network === 'TON' ? settings.ton_wallet : settings.bep20_wallet;

    res.json({
      success: true,
      deposit_id: deposit.id,
      wallet_address: walletAddress,
      amount: numAmount,
      network: deposit.network,
      status: deposit.status,
      created_at: deposit.created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Deposit creation failed' });
  }
});

router.get('/my-deposits', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const deposits = dataStore.getDeposits(userId);
  res.json({ deposits });
});

export default router;
