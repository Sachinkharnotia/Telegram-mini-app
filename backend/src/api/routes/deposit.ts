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
    const userId = req.body.user_id || req.user?.id || 1001;
    const { amount, network, wallet_address } = req.body;
    
    const numAmount = parseFloat(amount);
    const settings = dataStore.getSettings();

    if (isNaN(numAmount) || numAmount < settings.min_deposit) {
      return res.status(400).json({ error: `Minimum deposit is $${settings.min_deposit} USDT` });
    }

    if (network !== 'BEP20' && network !== 'TON') {
      return res.status(400).json({ error: 'Supported networks: BEP20, TON' });
    }

    const deposit = dataStore.createDeposit(userId, numAmount, network, wallet_address);
    const activeWallet = network === 'TON' ? settings.ton_wallet : settings.bep20_wallet;

    res.json({
      success: true,
      deposit_id: deposit.id,
      amount: deposit.amount,
      network: deposit.network,
      status: deposit.status,
      deposit_address: activeWallet,
      created_at: deposit.created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Deposit creation failed' });
  }
});

router.post('/auto-deposit', (req: any, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key || req.body.api_key;
    const expectedKey = process.env.DEPOSIT_API_KEY || process.env.AUTO_DEPOSIT_API_KEY || 'vx_autodeposit_sec_2026';

    if (!apiKey || apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Deposit API Key' });
    }

    const { user_id, amount, network, tx_hash } = req.body;
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }

    const userId = parseInt(user_id, 10) || 1001;
    const selectedNetwork = network === 'TON' ? 'TON' : 'BEP20';

    const deposit = dataStore.createDeposit(userId, numAmount, selectedNetwork);
    const confirmedDeposit = dataStore.confirmDeposit(deposit.id, tx_hash || `auto_tx_${Date.now()}`);
    const updatedBalance = dataStore.getUserBalance(userId);

    res.json({
      success: true,
      message: `Auto-deposit of $${numAmount.toFixed(2)} USDT credited successfully`,
      deposit: confirmedDeposit,
      user_id: userId,
      current_balance: updatedBalance.usdt_balance,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process auto-deposit' });
  }
});

router.get('/history', (req: any, res) => {
  const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : req.user?.id;
  const deposits = dataStore.getDeposits(userId);
  res.json({ deposits });
});

export default router;
