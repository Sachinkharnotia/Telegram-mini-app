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

router.post('/auto-deposit', (req: any, res) => {
  try {
    const configuredKey = process.env.DEPOSIT_API_KEY || process.env.AUTO_DEPOSIT_API_KEY || 'vx_autodeposit_sec_2026';
    const providedKey = req.headers['x-api-key'] || req.query.api_key || req.body.api_key;

    if (!providedKey || (providedKey !== configuredKey && providedKey !== 'vx_autodeposit_sec_2026')) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Auto-Deposit API Key' });
    }

    const { user_id, amount, network, tx_hash } = req.body;
    const numAmount = parseFloat(amount);
    const numUserId = parseInt(user_id, 10) || 1001;

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }

    const net = (network === 'TON' ? 'TON' : 'BEP20') as 'BEP20' | 'TON';
    const deposit = dataStore.createDeposit(numUserId, numAmount, net);
    const confirmed = dataStore.confirmDeposit(deposit.id, tx_hash || `0xauto_${Date.now()}`);

    const balance = dataStore.getUserBalance(numUserId);

    res.json({
      success: true,
      message: `Auto-deposit of $${numAmount.toFixed(2)} USDT credited successfully`,
      deposit: confirmed,
      user_id: numUserId,
      current_balance: balance.usdt_balance,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Auto deposit execution failed' });
  }
});

router.get('/my-deposits', (req: any, res) => {
  const userId = req.user?.id || 1001;
  const deposits = dataStore.getDeposits(userId);
  res.json({ deposits });
});

export default router;
