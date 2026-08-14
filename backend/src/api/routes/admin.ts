import { Router } from 'express';
import { dataStore } from '../../services/store';

const router = Router();

const checkAdmin = (req: any, res: any, next: any) => {
  const userId = req.user?.id || 1001;
  const user = dataStore.findUserById(userId);
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
  next();
};

router.use(checkAdmin);

router.get('/stats', (req, res) => {
  const stats = dataStore.getAdminStats();
  res.json({ stats });
});

router.get('/settings', (req, res) => {
  const settings = dataStore.getSettings();
  res.json({ settings });
});

router.post('/settings', (req, res) => {
  const updated = dataStore.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

router.get('/users', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  let users = dataStore.getAllUsers();
  
  if (query) {
    users = users.filter(u => 
      u.telegram_id.toString().includes(query) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.first_name && u.first_name.toLowerCase().includes(query))
    );
  }

  const userList = users.map(u => ({
    ...u,
    balance: dataStore.getUserBalance(u.id)
  }));

  res.json({ users: userList });
});

router.post('/users/update-balance', (req, res) => {
  const { user_id, amount, currency, action } = req.body;
  const numUserId = parseInt(user_id, 10);
  const numAmount = parseFloat(amount);

  if (isNaN(numUserId) || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid user or amount' });
  }

  const user = dataStore.findUserById(numUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (currency === 'VX') {
    if (action === 'add') {
      dataStore.creditBalance(numUserId, numAmount, 'vx_balance');
    } else {
      const bal = dataStore.getUserBalance(numUserId);
      bal.vx_balance = Math.max(0, bal.vx_balance - numAmount);
    }
  } else {
    if (action === 'add') {
      dataStore.creditBalance(numUserId, numAmount, 'usdt_balance');
    } else {
      dataStore.deductUSDTBalance(numUserId, numAmount);
    }
  }

  dataStore.addTransaction({
    id: Date.now(),
    user_id: numUserId,
    type: 'admin_adjustment',
    amount: numAmount,
    currency: currency === 'VX' ? 'VX' : 'USDT',
    description: `Admin ${action}ed ${numAmount} ${currency}`,
    status: 'completed',
    created_at: new Date()
  });

  res.json({ success: true, balance: dataStore.getUserBalance(numUserId) });
});

router.post('/users/update-status', (req, res) => {
  const { user_id, is_active, ban_reason } = req.body;
  const user = dataStore.updateUserStatus(parseInt(user_id, 10), !!is_active, ban_reason);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user });
});

router.get('/required-communities', (req, res) => {
  const communities = dataStore.getAllRequiredCommunities();
  res.json({ communities });
});

router.post('/required-communities', (req, res) => {
  const { communities } = req.body;
  if (Array.isArray(communities)) {
    dataStore.setRequiredCommunities(communities);
  }
  res.json({ success: true, communities: dataStore.getAllRequiredCommunities() });
});

router.get('/deposits', (req, res) => {
  const deposits = dataStore.getDeposits();
  res.json({ deposits });
});

router.post('/deposits/confirm', (req, res) => {
  const { deposit_id, tx_hash } = req.body;
  const dep = dataStore.confirmDeposit(parseInt(deposit_id, 10), tx_hash);
  if (!dep) return res.status(400).json({ error: 'Deposit not found or already processed' });
  res.json({ success: true, deposit: dep });
});

router.get('/withdrawals', (req, res) => {
  const withdrawals = dataStore.getWithdrawals();
  res.json({ withdrawals });
});

router.post('/withdrawals/update-status', (req, res) => {
  const { withdrawal_id, status, tx_hash, reason } = req.body;
  const wd = dataStore.updateWithdrawalStatus(parseInt(withdrawal_id, 10), status, tx_hash, reason);
  if (!wd) return res.status(400).json({ error: 'Withdrawal not found' });
  res.json({ success: true, withdrawal: wd });
});

router.get('/tasks', (req, res) => {
  const tasks = dataStore.getAllTasks();
  res.json({ tasks });
});

router.post('/tasks/save', (req, res) => {
  const task = dataStore.saveTask(req.body);
  res.json({ success: true, task });
});

router.delete('/tasks/:id', (req, res) => {
  const success = dataStore.deleteTask(parseInt(req.params.id, 10));
  res.json({ success });
});

export default router;
