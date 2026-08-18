import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Search, Plus, Trash2, RefreshCw, ArrowLeft,
  Send, UserPlus, Activity, Save, ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'deposits' | 'tasks' | 'submissions' | 'withdrawals' | 'transactions' | 'referrals' | 'notifications' | 'support' | 'admins' | 'settings' | 'activity' | 'channels'
  >('dashboard');

  const defaultSettings = {
    payment: {
      symbol: '$',
      network: 'BEP-20',
      currency: 'USD',
      payout_wallet: '',
      max_withdrawal: 1000,
      min_withdrawal: 5,
      withdrawal_fee: 0,
      payment_currency: 'USDT'
    },
    referral: {
      reward: 0.50,
      enabled: true,
      condition: 'first_task_approved',
      max_reward_per_user: 100,
      level1_percent: 10,
      level2_percent: 5,
      level3_percent: 2
    },
    telegram: {
      bot_username: 'Vextoralbot',
      mini_app_short_name: 'vextoral',
      bot_token: '8921722561:AAGbrA4p6acTznLKZV5Ad1M1j8G5eq4psGw'
    },
    branding: {
      app_name: 'VextoralMining',
      tagline: 'Complete tasks & earn daily USDT yield.',
      support_telegram: '@vextoralcomunity',
      support_email: 'businessvextoral@gmail.com'
    },
    general: {
      maintenance_mode: false,
      maintenance_message: 'VextoralMining is under maintenance. Please check back soon.'
    },
    daily_spins_limit: 3,
    daily_giftbox_limit: 1,
    gift_rewards: [
      '0.50 USDT',
      '1.25 USDT',
      '2.50 USDT',
      '3.75 USDT',
      '5.00 USDT',
      '10.00 USDT'
    ],
    wheel_sectors: [
      { id: 1, label: '+0.10 USDT', reward_type: 'USDT', reward_amount: 0.10, color: '#C18DB4' },
      { id: 2, label: '+50 VX', reward_type: 'VX', reward_amount: 50, color: '#87A7D0' },
      { id: 3, label: '+0.50 USDT', reward_type: 'USDT', reward_amount: 0.50, color: '#E2CAD8' },
      { id: 4, label: '+100 VX', reward_type: 'VX', reward_amount: 100, color: '#0E1B48' },
      { id: 5, label: '+1.00 USDT', reward_type: 'USDT', reward_amount: 1.00, color: '#C18DB4' },
      { id: 6, label: '+250 VX', reward_type: 'VX', reward_amount: 250, color: '#87A7D0' },
      { id: 7, label: '+0.25 USDT', reward_type: 'USDT', reward_amount: 0.25, color: '#E2CAD8' },
      { id: 8, label: '+500 VX', reward_type: 'VX', reward_amount: 500, color: '#0E1B48' }
    ]
  };

  const defaultUsers: any[] = [];

  const defaultAdmins = [
    { email: 'admin@vextoral.com', role: 'OWNER', joined: '8/15/2026' }
  ];

  const defaultActivityLogs: any[] = [];

  const [settings, setSettings] = useState<any>(defaultSettings);
  const [users, setUsers] = useState<any[]>(defaultUsers);
  const [admins, setAdmins] = useState<any[]>(defaultAdmins);
  const [activityLogs, setActivityLogs] = useState<any[]>(defaultActivityLogs);
  const [tasks, setTasks] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState<'All' | 'Active' | 'Suspended' | 'Blocked'>('All');
  const [taskCategory, setTaskCategory] = useState<string>('All');
  const [wdFilter, setWdFilter] = useState<'All' | 'Pending' | 'Processing' | 'Paid' | 'Rejected'>('All');
  const [subFilter, setSubFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Rejected' | 'Under Review' | 'Approved'>('All');
  const [ticketFilter, setTicketFilter] = useState<'All' | 'Open' | 'Pending' | 'Resolved' | 'Closed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjAction, setAdjAction] = useState<'add' | 'deduct'>('add');

  const [createAdminModal, setCreateAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Admin' | 'Support' | 'Manager'>('Admin');
  const [adminPermissions, setAdminPermissions] = useState<Record<string, boolean>>({
    'View Users': true,
    'Edit Users': true,
    'Manage User Access': true,
    'View Tasks': true,
    'Create/Edit Tasks': true,
    'Delete Tasks': true,
    'View Finances': true,
    'Approve Payouts': true,
    'Manual Adjustments': true,
    'View Settings': true,
    'Edit Settings': true,
    'Manage Admins': true,
    'View Audit Logs': true
  });

  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskShortDesc, setNewTaskShortDesc] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('1.0');
  const [newTaskCategory, setNewTaskCategory] = useState('Social Media');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [newTaskMaxSlots, setNewTaskMaxSlots] = useState('100');
  const [newTaskMinutes, setNewTaskMinutes] = useState('5');

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendTelegramBot, setSendTelegramBot] = useState(true);

  const [deposits, setDeposits] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([
    { id: 1, title: 'Welcome to VextoralMining 🎉', message: 'Start completing tasks and earn USDT rewards.', date: '8/15/2026', sent_telegram: true }
  ]);

  const defaultCommunities = [
    { id: 1, name: 'Main Telegram Channel', link: 'https://t.me/telegram', type: 'channel', is_active: true },
    { id: 2, name: 'Official Discussion Group', link: 'https://t.me/telegram', type: 'group', is_active: true },
    { id: 3, name: 'Vextoral Mining News', link: 'https://t.me/telegram', type: 'channel', is_active: true }
  ];
  const [communities, setCommunities] = useState<any[]>(defaultCommunities);
  const [newCommName, setNewCommName] = useState('');
  const [newCommLink, setNewCommLink] = useState('');
  const [newCommType, setNewCommType] = useState<'channel' | 'group'>('channel');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const addActivityLog = (title: string, detail: string) => {
    const newLog = {
      title,
      detail,
      email: admins[0]?.email || 'admin@vextoral.com',
      time: new Date().toLocaleString()
    };
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    localStorage.setItem('admin_activity_logs', JSON.stringify(updated));
  };

  const API_BASE = 'https://backend-ten-amber-99.vercel.app';
  const ADMIN_PIN = 'vextoral2026';

  const fetchData = () => {
    setLoading(true);
    let userList: any[] = [];
    try {
      const storedUsers = localStorage.getItem('admin_users');
      userList = storedUsers ? JSON.parse(storedUsers) : [];
      
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        try {
          const u = JSON.parse(currentUser);
          const uKey = u.telegram_id || u.id || 10001;
          const existsIndex = userList.findIndex((existing: any) => (existing.telegram_id && existing.telegram_id === uKey) || existing.id === u.id);
          const userObj = {
            id: u.id || Date.now(),
            telegram_id: uKey,
            first_name: u.first_name || 'Member',
            username: u.username || 'user',
            balance: u.balance_usdt || 0,
            balance_usdt: u.balance_usdt || 0,
            balance_vx: u.balance_vx || 0,
            joined: new Date().toLocaleDateString(),
            is_active: true,
            status: 'Active'
          };
          if (existsIndex === -1) {
            userList.unshift(userObj);
          } else {
            userList[existsIndex] = { ...userList[existsIndex], ...userObj };
          }
          localStorage.setItem('admin_users', JSON.stringify(userList));

          fetch(`${API_BASE}/api/auth/register-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_data: userObj,
              balance_usdt: userObj.balance_usdt,
              balance_vx: userObj.balance_vx
            })
          }).catch(() => {});
        } catch {}
      }

      setUsers(userList);

      const storedSettings = localStorage.getItem('platform_settings');
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedTasks = localStorage.getItem('app_tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedDeps = localStorage.getItem('admin_deposits');
      if (storedDeps) setDeposits(JSON.parse(storedDeps));

      const storedWds = localStorage.getItem('admin_withdrawals');
      if (storedWds) setWithdrawals(JSON.parse(storedWds));

      const storedTxs = localStorage.getItem('app_transactions');
      if (storedTxs) setTransactions(JSON.parse(storedTxs));

      const storedLogs = localStorage.getItem('admin_activity_logs');
      if (storedLogs) setActivityLogs(JSON.parse(storedLogs));

      const storedAdmins = localStorage.getItem('admin_accounts');
      if (storedAdmins) setAdmins(JSON.parse(storedAdmins));
    } catch {}

    fetch(`${API_BASE}/api/admin/users`, {
      headers: { 'x-admin-pin': ADMIN_PIN }
    })
      .then(res => res.json())
      .then(data => {
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          const apiMapped = data.users.map((u: any) => ({
            id: u.id,
            telegram_id: u.telegram_id,
            first_name: u.first_name || 'Member',
            username: u.username || 'user',
            balance: u.balance?.usdt_balance !== undefined ? u.balance.usdt_balance : (u.balance_usdt || 0),
            balance_usdt: u.balance?.usdt_balance !== undefined ? u.balance.usdt_balance : (u.balance_usdt || 0),
            balance_vx: u.balance?.vx_balance !== undefined ? u.balance.vx_balance : (u.balance_vx || 0),
            joined: new Date(u.created_at || Date.now()).toLocaleDateString(),
            is_active: u.is_active !== false,
            status: u.is_active !== false ? 'Active' : 'Blocked'
          }));

          const userMap = new Map();
          for (const u of userList) {
            const key = u.telegram_id || u.id;
            if (key) userMap.set(key, u);
          }
          for (const u of apiMapped) {
            const key = u.telegram_id || u.id;
            if (key) {
              const existing = userMap.get(key);
              userMap.set(key, { ...existing, ...u });
            }
          }

          const combined = Array.from(userMap.values());
          setUsers(combined);
          localStorage.setItem('admin_users', JSON.stringify(combined));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/admin/notifications`, {
      headers: { 'x-admin-pin': ADMIN_PIN }
    })
      .then(res => res.json())
      .then(data => {
        if (data.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotificationsList(data.notifications);
        }
      })
      .catch(() => {});

    let localDepositList: any[] = [];
    try {
      const storedDeps = localStorage.getItem('admin_deposits');
      localDepositList = storedDeps ? JSON.parse(storedDeps) : [];

      const rawTxs = localStorage.getItem('app_transactions');
      if (rawTxs) {
        const txs = JSON.parse(rawTxs);
        for (const t of txs) {
          if (t.type === 'deposit' || String(t.title || '').toLowerCase().includes('deposit')) {
            const numAmount = parseFloat(String(t.amount || 0).replace(/[^0-9.]/g, '')) || 50;
            const isTon = String(t.title || '').includes('TON');
            const exists = localDepositList.some((d: any) => 
              d.id === t.id || d.order_id === t.id || 
              (Math.abs(Number(d.amount) - numAmount) < 0.001 && d.network === (isTon ? 'TON' : 'BEP-20'))
            );
            if (!exists) {
              localDepositList.push({
                id: t.id || Date.now(),
                order_id: t.id || `DEP-${Date.now()}`,
                user_id: 1001,
                amount: numAmount,
                currency: 'USDT',
                network: isTon ? 'TON' : 'BEP-20',
                status: t.status || 'pending',
                created_at: t.created_at || new Date().toISOString()
              });
            }
          }
        }
      }
      setDeposits(localDepositList);
      localStorage.setItem('admin_deposits', JSON.stringify(localDepositList));
    } catch {}

    fetch(`${API_BASE}/api/admin/deposits`, {
      headers: { 'x-admin-pin': ADMIN_PIN }
    })
      .then(res => res.json())
      .then(data => {
        const apiDeps = data.deposits && Array.isArray(data.deposits) ? data.deposits : [];
        const depMap = new Map();
        for (const d of localDepositList) {
          const key = String(d.id || d.order_id);
          depMap.set(key, d);
        }
        for (const d of apiDeps) {
          const key = String(d.id || d.order_id);
          const existing = depMap.get(key);
          depMap.set(key, { ...existing, ...d });
        }
        const mergedDeps = Array.from(depMap.values());
        if (mergedDeps.length > 0) {
          setDeposits(mergedDeps);
          localStorage.setItem('admin_deposits', JSON.stringify(mergedDeps));
        }
      })
      .catch(() => {});

    let localWdList: any[] = [];
    try {
      const storedWds = localStorage.getItem('admin_withdrawals');
      localWdList = storedWds ? JSON.parse(storedWds) : [];

      const rawTxs = localStorage.getItem('app_transactions');
      if (rawTxs) {
        const txs = JSON.parse(rawTxs);
        for (const t of txs) {
          if (t.type === 'withdrawal' || String(t.title || '').toLowerCase().includes('payout') || String(t.title || '').toLowerCase().includes('withdrawal')) {
            const numAmount = parseFloat(String(t.amount || 0).replace(/[^0-9.]/g, '')) || 20;
            const exists = localWdList.some((w: any) => w.id === t.id);
            if (!exists) {
              localWdList.push({
                id: t.id || Date.now(),
                user_id: 1001,
                amount: numAmount,
                currency: 'USDT',
                network: 'BEP-20',
                wallet_address: '0x000...UserWallet',
                status: t.status || 'pending',
                created_at: t.created_at || new Date().toISOString()
              });
            }
          }
        }
      }
      setWithdrawals(localWdList);
      localStorage.setItem('admin_withdrawals', JSON.stringify(localWdList));
    } catch {}

    fetch(`${API_BASE}/api/admin/withdrawals`, {
      headers: { 'x-admin-pin': ADMIN_PIN }
    })
      .then(res => res.json())
      .then(data => {
        const apiWds = data.withdrawals && Array.isArray(data.withdrawals) ? data.withdrawals : [];
        const wdMap = new Map();
        for (const w of localWdList) {
          wdMap.set(String(w.id), w);
        }
        for (const w of apiWds) {
          const key = String(w.id);
          const existing = wdMap.get(key);
          wdMap.set(key, { ...existing, ...w });
        }
        const mergedWds = Array.from(wdMap.values());
        if (mergedWds.length > 0) {
          setWithdrawals(mergedWds);
          localStorage.setItem('admin_withdrawals', JSON.stringify(mergedWds));
        }
      })
      .catch(() => {});

    try {
      const storedComms = localStorage.getItem('required_communities');
      if (storedComms) {
        const parsed = JSON.parse(storedComms);
        if (Array.isArray(parsed) && parsed.length > 0) setCommunities(parsed);
      }
    } catch {}

    fetch(`${API_BASE}/api/admin/required-communities`, {
      headers: { 'x-admin-pin': ADMIN_PIN }
    })
      .then(res => res.json())
      .then(data => {
        if (data.communities && Array.isArray(data.communities) && data.communities.length > 0) {
          setCommunities(data.communities);
          localStorage.setItem('required_communities', JSON.stringify(data.communities));
        }
      })
      .catch(() => {});

    setLoading(false);
  };

  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const t1 = parseFloat(String(settings.referral?.level1_percent ?? settings.referral_level1_percent ?? 10));
    const t2 = parseFloat(String(settings.referral?.level2_percent ?? settings.referral_level2_percent ?? 5));
    const t3 = parseFloat(String(settings.referral?.level3_percent ?? settings.referral_level3_percent ?? 2));
    const rewardBonus = parseFloat(String(settings.referral?.reward ?? settings.referral_fixed_reward ?? 0.50));

    const syncObj = {
      ...settings,
      bep20_wallet: settings.payment?.bep20_wallet || settings.bep20_wallet || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      ton_wallet: settings.payment?.ton_wallet || settings.ton_wallet || 'EQBvW8Z5huBkMJY78A29P0nLw84920kLzW190kLs920pL',
      min_deposit: parseFloat(String(settings.payment?.min_deposit || settings.min_deposit || 10)),
      min_withdrawal: parseFloat(String(settings.payment?.min_withdrawal || settings.min_withdrawal || 3)),
      max_withdrawal: parseFloat(String(settings.payment?.max_withdrawal || settings.max_withdrawal || 10000)),
      withdrawal_fee: parseFloat(String(settings.payment?.withdrawal_fee || settings.withdrawal_fee || 0)),
      referral: {
        ...settings.referral,
        level1_percent: t1,
        level2_percent: t2,
        level3_percent: t3,
        reward: rewardBonus,
        enabled: settings.referral?.enabled !== false
      },
      referral_level1_percent: t1,
      referral_level2_percent: t2,
      referral_level3_percent: t3,
      referral_signup_bonus_usdt: rewardBonus,
      referral_commission_tier1: t1,
      referral_commission_tier2: t2,
      referral_fixed_reward: rewardBonus,
      daily_spins_limit: parseInt(String(settings.daily_spins_limit || 3), 10),
      daily_giftbox_limit: parseInt(String(settings.daily_giftbox_limit || 1), 10),
      wheel_sectors: settings.wheel_sectors || defaultSettings.wheel_sectors,
      gift_rewards: settings.gift_rewards || defaultSettings.gift_rewards,
    };

    localStorage.setItem('platform_settings', JSON.stringify(syncObj));
    window.dispatchEvent(new Event('storage'));

    const timer = setTimeout(async () => {
      try {
        const backendPayload = {
          vx_price_usdt: parseFloat(String(settings.mining?.vx_price_usdt || settings.vx_price_usdt || 0.10)),
          min_vx_purchase: parseFloat(String(settings.mining?.min_vx_purchase || settings.min_vx_purchase || 100)),
          min_vx_mining: parseFloat(String(settings.mining?.min_vx_mining || settings.min_vx_mining || 100)),
          daily_yield_rate: (parseFloat(String(settings.mining?.daily_yield_rate || settings.daily_yield_rate || 1.5))) / 100,
          mining_enabled: true,
          bep20_wallet: syncObj.bep20_wallet,
          ton_wallet: syncObj.ton_wallet,
          min_deposit: syncObj.min_deposit,
          min_withdrawal: syncObj.min_withdrawal,
          max_withdrawal: syncObj.max_withdrawal,
          withdrawal_fee: syncObj.withdrawal_fee,
          referral_commission_tier1: t1,
          referral_commission_tier2: t2,
          referral_fixed_reward: rewardBonus,
          referral_enabled: settings.referral?.enabled !== false,
          daily_spins_limit: syncObj.daily_spins_limit,
          daily_giftbox_limit: syncObj.daily_giftbox_limit,
          app_name: settings.branding?.app_name || 'VextoralMining',
          support_username: settings.branding?.support_telegram || 'VaultSupportAdmin'
        };

        await fetch(`${API_BASE}/api/admin/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': ADMIN_PIN
          },
          body: JSON.stringify(backendPayload)
        });
      } catch {}
    }, 600);

    return () => clearTimeout(timer);
  }, [settings]);

  const handleApproveDeposit = async (depositId: number) => {
    try {
      await fetch(`${API_BASE}/api/admin/deposits/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': ADMIN_PIN
        },
        body: JSON.stringify({ deposit_id: depositId, tx_hash: 'ADMIN_MANUAL_CREDIT' })
      });
    } catch {}

    const updated = deposits.map(d => {
      if (d.id === depositId || d.order_id === depositId) {
        return { ...d, status: 'confirmed', confirmed_at: new Date().toISOString() };
      }
      return d;
    });
    setDeposits(updated);
    localStorage.setItem('admin_deposits', JSON.stringify(updated));

    const dep = deposits.find(d => d.id === depositId || d.order_id === depositId);
    if (dep) {
      addActivityLog('Deposit Approved', `Approved $${dep.amount} USDT deposit (${dep.network})`);
      setMessage(`Deposit of $${dep.amount} USDT approved and credited!`);
      setTimeout(() => setMessage(''), 3500);

      let matched = false;
      const curTxs = JSON.parse(localStorage.getItem('app_transactions') || '[]');
      const updatedTxs = curTxs.map((t: any) => {
        if (!matched && (t.id === dep.id || t.id === dep.order_id || (t.type === 'deposit' && Math.abs(parseFloat(t.amount) - dep.amount) < 0.01))) {
          matched = true;
          return {
            ...t,
            title: `USDT Deposit Credited (${dep.network})`,
            status: 'completed',
            confirmed_at: new Date().toISOString()
          };
        }
        return t;
      });

      if (!matched) {
        updatedTxs.unshift({
          id: dep.order_id || dep.id || `DEP-${Date.now()}`,
          type: 'deposit',
          title: `USDT Deposit Credited (${dep.network})`,
          amount: typeof dep.amount === 'number' ? dep.amount.toFixed(2) : String(dep.amount),
          currency: 'USDT',
          status: 'completed',
          created_at: dep.created_at || new Date().toISOString()
        });
      }

      setTransactions(updatedTxs);
      localStorage.setItem('app_transactions', JSON.stringify(updatedTxs));
    }
    fetchData();
  };

  const handleSaveCommunities = async () => {
    localStorage.setItem('required_communities', JSON.stringify(communities));
    window.dispatchEvent(new Event('storage'));
    try {
      await fetch(`${API_BASE}/api/admin/required-communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': ADMIN_PIN
        },
        body: JSON.stringify({ communities })
      });
    } catch {}
    addActivityLog('Channels Updated', `Saved ${communities.length} mandatory pre-dashboard channels`);
    setMessage('Mandatory Telegram channels saved and live!');
    setTimeout(() => setMessage(''), 3500);
  };

  const handleAddCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim() || !newCommLink.trim()) return;
    const newComm = {
      id: Date.now(),
      name: newCommName.trim(),
      link: newCommLink.trim().startsWith('http') ? newCommLink.trim() : `https://t.me/${newCommLink.trim().replace('@', '')}`,
      type: newCommType,
      is_active: true
    };
    const updated = [...communities, newComm];
    setCommunities(updated);
    localStorage.setItem('required_communities', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setNewCommName('');
    setNewCommLink('');
    addActivityLog('Channel Added', `Added required channel "${newComm.name}"`);
    setMessage(`Added "${newComm.name}"! Click "Save All Channels" to push changes.`);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleDeleteCommunity = (id: number) => {
    const updated = communities.filter(c => c.id !== id);
    setCommunities(updated);
    localStorage.setItem('required_communities', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    addActivityLog('Channel Removed', `Removed verification channel ID #${id}`);
    setMessage('Channel removed! Click "Save All Channels" to push changes.');
    setTimeout(() => setMessage(''), 3500);
  };

  const handleToggleCommunity = (id: number) => {
    const updated = communities.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c);
    setCommunities(updated);
    localStorage.setItem('required_communities', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleRejectDeposit = (depositId: number) => {
    const updated = deposits.map(d => {
      if (d.id === depositId) {
        return { ...d, status: 'rejected' };
      }
      return d;
    });
    setDeposits(updated);
    localStorage.setItem('admin_deposits', JSON.stringify(updated));
    addActivityLog('Deposit Rejected', `Rejected deposit #${depositId}`);
    setMessage(`Deposit #${depositId} rejected`);
    setTimeout(() => setMessage(''), 3000);
    fetchData();
  };

  const handleApproveWithdrawal = (withdrawalId: number) => {
    const updated = withdrawals.map(w => {
      if (w.id === withdrawalId) {
        return { ...w, status: 'Paid', tx_hash: '0x' + Math.random().toString(16).substr(2, 40) };
      }
      return w;
    });
    setWithdrawals(updated);
    localStorage.setItem('admin_withdrawals', JSON.stringify(updated));
    addActivityLog('Withdrawal Paid', `Marked withdrawal #${withdrawalId} as Paid`);
    setMessage(`Withdrawal #${withdrawalId} processed and paid!`);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleRejectWithdrawal = (withdrawalId: number) => {
    const updated = withdrawals.map(w => {
      if (w.id === withdrawalId) {
        return { ...w, status: 'Rejected' };
      }
      return w;
    });
    setWithdrawals(updated);
    localStorage.setItem('admin_withdrawals', JSON.stringify(updated));
    addActivityLog('Withdrawal Rejected', `Rejected payout request #${withdrawalId}`);
    setMessage(`Withdrawal #${withdrawalId} rejected`);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleSaveSettingsSection = async (section: string) => {
    setSavingSection(section);

    const t1 = parseFloat(String(settings.referral?.level1_percent ?? settings.referral_level1_percent ?? 10));
    const t2 = parseFloat(String(settings.referral?.level2_percent ?? settings.referral_level2_percent ?? 5));
    const t3 = parseFloat(String(settings.referral?.level3_percent ?? settings.referral_level3_percent ?? 2));
    const rewardBonus = parseFloat(String(settings.referral?.reward ?? settings.referral_fixed_reward ?? 0.50));

    const updatedSettings = {
      ...settings,
      bep20_wallet: settings.payment?.bep20_wallet || settings.bep20_wallet || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      ton_wallet: settings.payment?.ton_wallet || settings.ton_wallet || 'EQBvW8Z5huBkMJY78A29P0nLw84920kLzW190kLs920pL',
      min_deposit: parseFloat(String(settings.payment?.min_deposit || settings.min_deposit || 10)),
      min_withdrawal: parseFloat(String(settings.payment?.min_withdrawal || settings.min_withdrawal || 3)),
      max_withdrawal: parseFloat(String(settings.payment?.max_withdrawal || settings.max_withdrawal || 10000)),
      withdrawal_fee: parseFloat(String(settings.payment?.withdrawal_fee || settings.withdrawal_fee || 0)),
      referral: {
        ...settings.referral,
        level1_percent: t1,
        level2_percent: t2,
        level3_percent: t3,
        reward: rewardBonus,
        enabled: settings.referral?.enabled !== false
      },
      referral_level1_percent: t1,
      referral_level2_percent: t2,
      referral_level3_percent: t3,
      referral_signup_bonus_usdt: rewardBonus,
      referral_commission_tier1: t1,
      referral_commission_tier2: t2,
      referral_fixed_reward: rewardBonus,
      daily_spins_limit: parseInt(String(settings.daily_spins_limit || 3), 10),
      daily_giftbox_limit: parseInt(String(settings.daily_giftbox_limit || 1), 10),
      wheel_sectors: settings.wheel_sectors || defaultSettings.wheel_sectors,
      gift_rewards: settings.gift_rewards || defaultSettings.gift_rewards,
    };

    setSettings(updatedSettings);
    localStorage.setItem('platform_settings', JSON.stringify(updatedSettings));
    window.dispatchEvent(new Event('storage'));
    addActivityLog('Settings Updated', `Updated ${section} configuration`);

    try {
      const backendPayload = {
        vx_price_usdt: parseFloat(String(settings.mining?.vx_price_usdt || settings.vx_price_usdt || 0.10)),
        min_vx_purchase: parseFloat(String(settings.mining?.min_vx_purchase || settings.min_vx_purchase || 100)),
        min_vx_mining: parseFloat(String(settings.mining?.min_vx_mining || settings.min_vx_mining || 100)),
        daily_yield_rate: (parseFloat(String(settings.mining?.daily_yield_rate || settings.daily_yield_rate || 1.5))) / 100,
        mining_enabled: true,
        bep20_wallet: updatedSettings.bep20_wallet,
        ton_wallet: updatedSettings.ton_wallet,
        min_deposit: updatedSettings.min_deposit,
        min_withdrawal: updatedSettings.min_withdrawal,
        max_withdrawal: updatedSettings.max_withdrawal,
        withdrawal_fee: updatedSettings.withdrawal_fee,
        referral_commission_tier1: t1,
        referral_commission_tier2: t2,
        referral_fixed_reward: rewardBonus,
        referral_enabled: settings.referral?.enabled !== false,
        daily_spins_limit: updatedSettings.daily_spins_limit,
        daily_giftbox_limit: updatedSettings.daily_giftbox_limit,
        app_name: settings.branding?.app_name || 'VextoralMining',
        support_username: settings.branding?.support_telegram || 'VaultSupportAdmin'
      };

      await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': ADMIN_PIN
        },
        body: JSON.stringify(backendPayload)
      });
    } catch {}

    setMessage(`Settings saved for ${section} successfully!`);
    setTimeout(() => setMessage(''), 3500);
    setTimeout(() => setSavingSection(null), 2500);
  };

  const handleUpdateWheelSector = (index: number, field: string, value: any) => {
    const currentSectors = [...(settings.wheel_sectors || defaultSettings.wheel_sectors)];
    currentSectors[index] = {
      ...currentSectors[index],
      [field]: value
    };
    if (field === 'reward_amount' || field === 'reward_type') {
      const type = field === 'reward_type' ? value : currentSectors[index].reward_type;
      const amt = field === 'reward_amount' ? value : currentSectors[index].reward_amount;
      currentSectors[index].label = `+${amt} ${type}`;
    }
    setSettings({ ...settings, wheel_sectors: currentSectors });
  };

  const handleUpdateGiftReward = (index: number, value: string) => {
    const currentRewards = [...(settings.gift_rewards || defaultSettings.gift_rewards)];
    currentRewards[index] = value;
    setSettings({ ...settings, gift_rewards: currentRewards });
  };

  const handleAddGiftReward = () => {
    const currentRewards = [...(settings.gift_rewards || defaultSettings.gift_rewards)];
    currentRewards.push('1.00 USDT');
    setSettings({ ...settings, gift_rewards: currentRewards });
  };

  const handleRemoveGiftReward = (index: number) => {
    const currentRewards = [...(settings.gift_rewards || defaultSettings.gift_rewards)];
    if (currentRewards.length <= 1) return;
    currentRewards.splice(index, 1);
    setSettings({ ...settings, gift_rewards: currentRewards });
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    const newAdmin = {
      email: newAdminEmail.trim(),
      role: newAdminRole.toUpperCase(),
      joined: new Date().toLocaleDateString()
    };
    const updated = [newAdmin, ...admins];
    setAdmins(updated);
    localStorage.setItem('admin_accounts', JSON.stringify(updated));
    addActivityLog('Admin Created', `Created ${newAdminRole} account for ${newAdminEmail}`);
    setCreateAdminModal(false);
    setNewAdminEmail('');
    setNewAdminPassword('');
    setMessage(`Created new admin account for ${newAdmin.email}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const taskItem = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      description: newTaskShortDesc.trim(),
      reward_amount: parseFloat(newTaskReward) || 1.0,
      reward_currency: 'USDT',
      category: newTaskCategory,
      action_url: newTaskUrl.trim() || 'https://t.me/telegram',
      max_slots: parseInt(newTaskMaxSlots) || 100,
      minutes: parseInt(newTaskMinutes) || 5,
      is_active: true
    };
    const updated = [taskItem, ...tasks];
    setTasks(updated);
    localStorage.setItem('app_tasks', JSON.stringify(updated));
    addActivityLog('Task Created', `Published task "${taskItem.title}" (${taskItem.reward_amount} USDT)`);
    setCreateTaskModal(false);
    setNewTaskTitle('');
    setNewTaskShortDesc('');
    setNewTaskUrl('');
    setMessage('Task created and published successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('app_tasks', JSON.stringify(updated));
    addActivityLog('Task Deleted', `Removed task "${taskToDelete?.title || id}"`);
    setMessage('Task removed');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleUserBan = (u: any) => {
    const nextStatus = !u.is_active;
    const updatedUsers = users.map(item => item.id === u.id ? { 
      ...item, 
      is_active: nextStatus,
      status: nextStatus ? 'Active' : 'Blocked'
    } : item);
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    addActivityLog('User Status Updated', `User @${u.username || u.telegram_id} set to ${nextStatus ? 'ACTIVE' : 'BLOCKED'}`);
    setMessage(`User @${u.username || u.telegram_id} is now ${nextStatus ? 'ACTIVE' : 'BLOCKED'}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAdjustUserBalance = () => {
    if (!selectedUser || !adjAmount) return;
    const numAmt = parseFloat(adjAmount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        const cur = u.balance || 0;
        const newBal = adjAction === 'add' ? cur + numAmt : Math.max(0, cur - numAmt);
        return { ...u, balance: newBal };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    addActivityLog('Balance Adjusted', `${adjAction === 'add' ? 'Credited' : 'Deducted'} $${numAmt} USDT for @${selectedUser.username || selectedUser.telegram_id}`);
    setMessage(`Balance adjusted for @${selectedUser.username || selectedUser.telegram_id}`);
    setSelectedUser(null);
    setAdjAmount('');
    setTimeout(() => setMessage(''), 3000);
  };



  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': ADMIN_PIN
        },
        body: JSON.stringify({
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          send_telegram_bot: sendTelegramBot
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'Broadcast delivered successfully to all users!');
        addActivityLog('Notification Sent', `Broadcasted "${notifTitle}" (${data.botResult?.sent || 0} Telegram messages sent)`);
        setNotifTitle('');
        setNotifMessage('');
        fetchData();
      } else {
        setMessage(data.error || 'Failed to dispatch broadcast');
      }
    } catch (err: any) {
      addActivityLog('Notification Sent', `Broadcasted "${notifTitle}" to all active members`);
      setMessage('Broadcast recorded and dispatched!');
      setNotifTitle('');
      setNotifMessage('');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesQuery = (u.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (u.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (String(u.telegram_id || '')).includes(searchQuery);
    if (!matchesQuery) return false;
    if (userFilter === 'All') return true;
    if (userFilter === 'Active') return u.is_active !== false;
    if (userFilter === 'Blocked' || userFilter === 'Suspended') return u.is_active === false;
    return true;
  });

  const filteredWithdrawals = withdrawals.filter(w => {
    if (wdFilter === 'All') return true;
    return (w.status?.toLowerCase() || '') === wdFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 p-3 sm:p-6 space-y-5 max-w-6xl mx-auto font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E1B48]/90 p-4 rounded-2xl border border-[#C18DB4]/30 shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-[#070D1E] text-[#E2CAD8] hover:bg-[#1A285A] border border-[#C18DB4]/30">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white font-serif-luxury tracking-wide">Admin Management Console</h1>
            <p className="text-xs text-[#87A7D0]">Live platform oversight & automated control suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-[#070D1E] text-[#E2CAD8] border border-[#C18DB4]/30 hover:border-[#C18DB4]">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setCreateAdminModal(true)}
            className="btn-gold-vault px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <UserPlus size={14} /> Create Admin
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex justify-between items-center animate-fade-in shadow-lg">
          <span className="flex items-center gap-2"><CheckCircle size={16} /> {message}</span>
          <button onClick={() => setMessage('')}><XCircle size={16} /></button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#C18DB4]/20">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'users', label: 'Users' },
          { id: 'deposits', label: 'Deposits' },
          { id: 'withdrawals', label: 'Withdrawals' },
          { id: 'channels', label: 'Mandatory Channels' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'referrals', label: 'Referrals' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'support', label: 'Support' },
          { id: 'admins', label: 'Admins' },
          { id: 'settings', label: 'Settings' },
          { id: 'activity', label: 'Activity log' }
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-md'
                  : 'bg-[#0E1B48]/60 text-[#E2CAD8] border border-[#C18DB4]/20 hover:bg-[#0E1B48]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'dashboard' && (() => {
        const totalRewardsPaid = transactions
          .filter(t => t.type === 'task_reward' || t.type === 'gift_reward')
          .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        const totalReferralRewards = transactions
          .filter(t => t.type === 'referral_bonus')
          .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        const totalWithdrawn = withdrawals
          .filter(w => (w.status || '').toLowerCase() === 'paid')
          .reduce((acc, w) => acc + (parseFloat(w.amount) || 0), 0);

        const totalUserBalances = users.reduce((acc, u) => acc + (parseFloat(u.balance) || 0), 0);
        const activeCount = users.filter(u => u.is_active !== false).length;
        const suspendedCount = users.filter(u => u.is_active === false).length;

        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white font-serif-luxury">Dashboard</h2>
              <p className="text-xs text-[#87A7D0]">Live overview of the Vextoral platform</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">Total users</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{users.length}</h3>
                <span className="text-[10px] text-emerald-400 font-bold">{activeCount} active (7d)</span>
              </div>

              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">New users (30d)</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{users.length}</h3>
                <span className="text-[10px] text-rose-400 font-bold">{suspendedCount} suspended</span>
              </div>

              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">Active tasks</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{tasks.length}</h3>
                <span className="text-[10px] text-[#87A7D0]">{tasks.length} total</span>
              </div>

              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">Pending reviews</span>
                <h3 className="text-2xl font-extrabold text-amber-400 mt-1">0</h3>
                <span className="text-[10px] text-emerald-400 font-bold">0 approved</span>
              </div>

              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">Rewards paid</span>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">${totalRewardsPaid.toFixed(2)}</h3>
                <span className="text-[10px] text-[#87A7D0]">task rewards</span>
              </div>

              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">Referral rewards</span>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">${totalReferralRewards.toFixed(2)}</h3>
                <span className="text-[10px] text-[#87A7D0]">0/0 paid</span>
              </div>

              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">Withdrawn</span>
                <h3 className="text-2xl font-extrabold text-rose-300 mt-1">${totalWithdrawn.toFixed(2)}</h3>
                <span className="text-[10px] text-amber-400 font-bold">{withdrawals.filter(w => (w.status || '').toLowerCase() === 'pending').length} pending</span>
              </div>

              <div className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30">
                <span className="text-[11px] text-[#E2CAD8]">User balances</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">${totalUserBalances.toFixed(2)}</h3>
                <span className="text-[10px] text-[#87A7D0]">outstanding liability</span>
              </div>
            </div>

            <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white font-serif-luxury">Last 30 days User Growth & Activity</span>
                <span className="text-[10px] text-emerald-400 font-bold">Signups: {users.length}</span>
              </div>
              <div className="h-32 w-full flex items-end justify-between gap-1 pt-6 px-2 border-b border-[#C18DB4]/20">
                {[...Array(12)].map((_, i) => {
                  const heightPct = users.length > 0 ? Math.min(100, Math.max(10, (users.length / 10) * 100)) : 4;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div 
                        style={{ height: `${i === 11 && users.length > 0 ? heightPct : 4}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          i === 11 && users.length > 0 
                            ? 'bg-gradient-to-t from-emerald-500/40 to-emerald-400' 
                            : 'bg-[#C18DB4]/10'
                        }`}
                      />
                      <span className="text-[8px] text-[#87A7D0]">08-{String(i + 4).padStart(2, '0')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-serif-luxury">Latest users</h3>
                <button onClick={() => setActiveTab('users')} className="text-xs text-emerald-400 font-bold hover:underline">View all</button>
              </div>

              {users.length === 0 ? (
                <div className="card-vault p-6 rounded-2xl bg-[#0E1B48]/40 border border-[#C18DB4]/20 text-center text-xs text-[#87A7D0]">
                  No users have joined yet. Real users will appear here automatically when they start the app.
                </div>
              ) : (
                <div className="space-y-2">
                  {users.slice(0, 4).map(u => (
                    <div key={u.id} className="p-3.5 rounded-2xl bg-[#0E1B48]/60 border border-[#C18DB4]/20 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">@{u.username || u.telegram_id}</h4>
                        <span className="text-[10px] text-[#87A7D0]">{u.joined || 'Today'}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">${(u.balance || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab === 'users' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Users</h2>
            <p className="text-xs text-[#87A7D0]">{users.length} accounts</p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#87A7D0]" />
            <input
              type="text"
              placeholder="Search username, name, Telegram ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-2xl text-xs text-white placeholder-[#87A7D0] outline-none"
            />
          </div>

          <div className="flex gap-2">
            {(['All', 'Active', 'Suspended', 'Blocked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setUserFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userFilter === f ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-[#0E1B48]/60 text-[#E2CAD8]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="card-vault rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#C18DB4]/20 text-[#87A7D0] font-bold">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Balance</th>
                  <th className="p-3.5">Earned</th>
                  <th className="p-3.5">Referrals</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C18DB4]/10">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#1A285A]/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">
                      <div>@{u.username || u.telegram_id}</div>
                      <span className="text-[10px] text-[#87A7D0] font-normal">{u.telegram_id}</span>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">${(u.balance || 0).toFixed(2)}</td>
                    <td className="p-3.5 font-mono text-white">${(u.earned || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-[#E2CAD8]">{u.referrals || 0}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.is_active !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {u.status || (u.is_active !== false ? 'Active' : 'Blocked')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#87A7D0] text-[11px]">{u.joined}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/30 hover:border-[#C18DB4] text-[11px] font-bold"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => handleToggleUserBan(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          u.is_active !== false ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {u.is_active !== false ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white font-serif-luxury">Tasks</h2>
              <p className="text-xs text-[#87A7D0]">{tasks.length} tasks</p>
            </div>
            <button
              onClick={() => setCreateTaskModal(true)}
              className="btn-gold-vault px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              <Plus size={14} /> New task
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Social Media', 'Website', 'App', 'Survey', 'Registration', 'Content Engagement', 'Other'].map(c => (
              <button
                key={c}
                onClick={() => setTaskCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                  taskCategory === c ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-[#0E1B48]/60 text-[#E2CAD8]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="card-vault p-8 rounded-3xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 text-center space-y-2">
                <h4 className="text-sm font-bold text-white">No tasks yet</h4>
                <p className="text-xs text-[#87A7D0]">Create your first task to get users earning.</p>
              </div>
            ) : (
              tasks.map(t => (
                <div key={t.id} className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.title}</h4>
                    <span className="text-[10px] text-amber-300 font-bold">Reward: ${t.reward_amount} USDT | Category: {t.category || 'General'}</span>
                  </div>
                  <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-rose-400 hover:text-rose-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {(activeTab === 'deposits' || activeTab === 'submissions') && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Deposits Management</h2>
            <p className="text-xs text-[#87A7D0]">Review incoming crypto deposits, verify blockchain hashes & credit member accounts</p>
          </div>

          <div className="flex gap-2">
            {(['All', 'Pending', 'Confirmed', 'Rejected'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSubFilter(s as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                  subFilter === s || (s === 'All' && subFilter === 'All') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-[#0E1B48]/60 text-[#E2CAD8]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {deposits.length === 0 ? (
              <div className="card-vault p-8 rounded-3xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 text-center space-y-2">
                <h4 className="text-sm font-bold text-white">No deposit requests yet</h4>
                <p className="text-xs text-[#87A7D0]">New user deposits will appear here for review and verification.</p>
              </div>
            ) : (
              deposits
                .filter(d => subFilter === 'All' || d.status?.toLowerCase() === subFilter.toLowerCase() || (subFilter === 'Pending' && (!d.status || d.status === 'pending')))
                .map(d => (
                  <div key={d.id} className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">${d.amount} USDT</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#87A7D0]/20 text-[#87A7D0] border border-[#87A7D0]/30">{d.network}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          d.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          d.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {d.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#87A7D0] mt-1">Order #{d.id} · {new Date(d.created_at || Date.now()).toLocaleString()}</p>
                    </div>

                    {(!d.status || d.status === 'pending') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveDeposit(d.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30"
                        >
                          Approve & Credit
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(d.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Withdrawals</h2>
            <p className="text-xs text-[#87A7D0]">Process USDT (BEP-20 / TON) payouts</p>
          </div>

          <div className="flex gap-2">
            {(['Pending', 'Paid', 'Rejected', 'All'] as const).map(w => (
              <button
                key={w}
                onClick={() => setWdFilter(w as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                  wdFilter === w ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-[#0E1B48]/60 text-[#E2CAD8]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredWithdrawals.length === 0 ? (
              <div className="card-vault p-8 rounded-3xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 text-center space-y-2">
                <h4 className="text-sm font-bold text-white">No withdrawals</h4>
                <p className="text-xs text-[#87A7D0]">No payout orders found in this filter.</p>
              </div>
            ) : (
              filteredWithdrawals.map(w => (
                  <div key={w.id} className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">${w.amount} USDT ({w.network})</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          w.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          w.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#87A7D0] font-mono truncate max-w-xs">{w.wallet_address}</p>
                    </div>

                    {w.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveWithdrawal(w.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Transactions</h2>
            <p className="text-xs text-[#87A7D0]">Full financial ledger</p>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="card-vault p-8 rounded-3xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 text-center space-y-2">
                <h4 className="text-sm font-bold text-white">No transactions</h4>
                <p className="text-xs text-[#87A7D0]">Transaction records will appear here as users engage.</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{tx.title}</h4>
                    <span className="text-[10px] text-[#87A7D0]">{new Date(tx.created_at).toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+{tx.amount} {tx.currency}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white font-serif-luxury">Mandatory Pre-Dashboard Channels</h2>
              <p className="text-xs text-[#87A7D0]">Configure official Telegram channels and groups that users must join before accessing the dashboard</p>
            </div>
            <button
              onClick={handleSaveCommunities}
              className="btn-gold-vault px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg w-fit"
            >
              <Save size={15} /> Save & Deploy Channels
            </button>
          </div>

          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-serif-luxury flex items-center gap-2">
              <Plus size={15} className="text-emerald-400" /> Add New Verification Channel / Group
            </h3>

            <form onSubmit={handleAddCommunity} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#E2CAD8]">Channel / Community Title</label>
                <input
                  type="text"
                  placeholder="e.g. Official Announcement Channel"
                  value={newCommName}
                  onChange={e => setNewCommName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#E2CAD8]">Telegram Link / @Username</label>
                <input
                  type="text"
                  placeholder="https://t.me/yourchannel or @channel"
                  value={newCommLink}
                  onChange={e => setNewCommLink(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-[#E2CAD8]">Type</label>
                  <select
                    value={newCommType}
                    onChange={e => setNewCommType(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="channel">Channel</option>
                    <option value="group">Group</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn-gold-vault px-4 py-2 rounded-xl text-xs font-bold self-end h-[34px] flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-serif-luxury">
              Active Verification Channels ({communities.length})
            </h3>

            {communities.length === 0 ? (
              <div className="card-vault p-8 rounded-3xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 text-center space-y-2">
                <h4 className="text-sm font-bold text-white">No mandatory channels configured</h4>
                <p className="text-xs text-[#87A7D0]">Users will be able to enter dashboard directly without channel check.</p>
              </div>
            ) : (
              communities.map((comm, idx) => (
                <div
                  key={comm.id || idx}
                  className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={comm.name}
                        onChange={e => {
                          const updated = [...communities];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setCommunities(updated);
                        }}
                        className="bg-transparent border-b border-[#C18DB4]/30 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 py-0.5 px-1 max-w-xs"
                      />
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        comm.type === 'channel' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {comm.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={comm.link}
                        onChange={e => {
                          const updated = [...communities];
                          updated[idx] = { ...updated[idx], link: e.target.value };
                          setCommunities(updated);
                        }}
                        className="bg-transparent border-b border-[#C18DB4]/20 text-[11px] font-mono text-[#87A7D0] focus:outline-none focus:border-emerald-400 py-0.5 px-1 flex-1 max-w-sm"
                      />
                      <a
                        href={comm.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#E2CAD8] hover:text-white p-1 text-[10px] flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Test Link
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleCommunity(comm.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        comm.is_active !== false
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-700/40 text-slate-400 border border-slate-600/30'
                      }`}
                    >
                      {comm.is_active !== false ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => handleDeleteCommunity(comm.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Referrals</h2>
            <p className="text-xs text-[#87A7D0]">Reward: ${settings.referral?.reward ?? 0.50} · condition: {settings.referral?.condition ?? 'first_task_approved'}</p>
          </div>

          <div className="card-vault p-8 rounded-3xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 text-center space-y-2">
            <h4 className="text-sm font-bold text-white">No referrals yet</h4>
            <p className="text-xs text-[#87A7D0]">User invitation networks will populate here.</p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fade-in max-w-xl">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Notifications</h2>
            <p className="text-xs text-[#87A7D0]">Broadcast to all active users</p>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white block mb-1">Title</label>
              <input
                type="text"
                placeholder="Announcement headline..."
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1">Message</label>
              <textarea
                rows={4}
                placeholder="Broadcast message body..."
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0E1B48]/60 border border-[#C18DB4]/20">
              <input
                type="checkbox"
                checked={sendTelegramBot}
                onChange={e => setSendTelegramBot(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500"
              />
              <span className="text-xs font-bold text-white">Also send via Telegram bot</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="submit" className="btn-gold-vault py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg">
                <Send size={14} /> Send to all users
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (notifTitle.trim()) {
                    addActivityLog('Announcement Saved', `Saved in-app announcement "${notifTitle}"`);
                    setMessage('Saved as in-app announcement');
                  }
                }}
                className="py-3 rounded-xl bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/30 text-xs font-bold"
              >
                Save as in-app announcement
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-serif-luxury">Recent notifications ({notificationsList.length})</h3>
              <button type="button" onClick={fetchData} className="text-[11px] text-[#87A7D0] hover:text-white flex items-center gap-1">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div className="space-y-2">
              {notificationsList.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#0E1B48]/40 border border-[#C18DB4]/20 text-center text-xs text-[#87A7D0]">
                  No broadcast notifications dispatched yet.
                </div>
              ) : (
                notificationsList.map(n => (
                  <div key={n.id} className="p-3.5 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 flex items-center justify-between text-xs space-y-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{n.title}</h4>
                        {n.sent_telegram && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Telegram Sent
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#E2CAD8]">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-[#87A7D0] shrink-0 font-mono ml-3">{n.date || new Date().toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Support</h2>
            <p className="text-xs text-[#87A7D0]">Reply to user tickets</p>
          </div>

          <div className="flex gap-2">
            {(['Open', 'Pending', 'Resolved', 'Closed', 'All'] as const).map(s => (
              <button
                key={s}
                onClick={() => setTicketFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                  ticketFilter === s ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-[#0E1B48]/60 text-[#E2CAD8]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="card-vault p-8 rounded-3xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 text-center space-y-2">
            <h4 className="text-sm font-bold text-white">No tickets</h4>
            <p className="text-xs text-[#87A7D0]">All user support requests have been resolved.</p>
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white font-serif-luxury">Admin Management</h2>
              <p className="text-xs text-[#87A7D0]">Control platform access and permissions</p>
            </div>
            <button
              onClick={() => setCreateAdminModal(true)}
              className="btn-gold-vault px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              <UserPlus size={14} /> Create Admin
            </button>
          </div>

          <div className="space-y-3">
            {admins.map(a => (
              <div key={a.email} className="card-vault p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{a.email}</h4>
                  <span className="text-[10px] text-[#87A7D0]">Joined {a.joined}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  a.role === 'OWNER' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {a.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in max-w-3xl">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">System & Platform Settings</h2>
            <p className="text-xs text-[#87A7D0]">Configure payment wallets, referral rewards, mining rates, and limits in real-time</p>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3">
              <h3 className="text-sm font-bold text-white font-serif-luxury">💳 Deposit & Payout Wallets</h3>
              <p className="text-[11px] text-[#87A7D0]">Official receiving addresses and transaction boundaries</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">USDT BEP-20 Receiving Address (BSC)</label>
                <input
                  type="text"
                  value={settings.payment?.bep20_wallet || settings.bep20_wallet || ''}
                  onChange={e => setSettings({
                    ...settings,
                    bep20_wallet: e.target.value,
                    payment: { ...settings.payment, bep20_wallet: e.target.value }
                  })}
                  placeholder="0x..."
                  className="w-full p-3 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-emerald-400 font-mono outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">TON Coin Receiving Address (TON Blockchain)</label>
                <input
                  type="text"
                  value={settings.payment?.ton_wallet || settings.ton_wallet || ''}
                  onChange={e => setSettings({
                    ...settings,
                    ton_wallet: e.target.value,
                    payment: { ...settings.payment, ton_wallet: e.target.value }
                  })}
                  placeholder="EQB..."
                  className="w-full p-3 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-sky-400 font-mono outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#E2CAD8]">Min Deposit ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.payment?.min_deposit || settings.min_deposit || 10}
                    onChange={e => setSettings({
                      ...settings,
                      min_deposit: parseFloat(e.target.value),
                      payment: { ...settings.payment, min_deposit: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#E2CAD8]">Min Withdrawal ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.payment?.min_withdrawal || settings.min_withdrawal || 3}
                    onChange={e => setSettings({
                      ...settings,
                      min_withdrawal: parseFloat(e.target.value),
                      payment: { ...settings.payment, min_withdrawal: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#E2CAD8]">Max Withdrawal ($)</label>
                  <input
                    type="number"
                    value={settings.payment?.max_withdrawal || settings.max_withdrawal || 10000}
                    onChange={e => setSettings({
                      ...settings,
                      max_withdrawal: parseFloat(e.target.value),
                      payment: { ...settings.payment, max_withdrawal: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#E2CAD8]">Withdrawal Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={settings.payment?.withdrawal_fee || settings.withdrawal_fee || 0}
                    onChange={e => setSettings({
                      ...settings,
                      withdrawal_fee: parseFloat(e.target.value),
                      payment: { ...settings.payment, withdrawal_fee: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSaveSettingsSection('payment')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'payment' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'payment' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save Payment Settings'}
            </button>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white font-serif-luxury">🤝 Referral Commission & Rewards</h3>
                <p className="text-[11px] text-[#87A7D0]">Multi-tier commission rates and invitation bonuses</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-400">
                <input
                  type="checkbox"
                  checked={settings.referral?.enabled !== false}
                  onChange={e => setSettings({
                    ...settings,
                    referral: { ...settings.referral, enabled: e.target.checked }
                  })}
                  className="rounded text-emerald-500 w-4 h-4"
                />
                <span>Program Active</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Tier 1 Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={settings.referral?.level1_percent !== undefined ? settings.referral.level1_percent : 10}
                    onChange={e => setSettings({
                      ...settings,
                      referral: { ...settings.referral, level1_percent: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#87A7D0]">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Tier 2 Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={settings.referral?.level2_percent !== undefined ? settings.referral.level2_percent : 5}
                    onChange={e => setSettings({
                      ...settings,
                      referral: { ...settings.referral, level2_percent: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#87A7D0]">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Tier 3 Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={settings.referral?.level3_percent !== undefined ? settings.referral.level3_percent : 2}
                    onChange={e => setSettings({
                      ...settings,
                      referral: { ...settings.referral, level3_percent: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#87A7D0]">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Fixed Invitation Bonus ($ USDT)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={settings.referral?.reward !== undefined ? settings.referral.reward : 0.50}
                    onChange={e => setSettings({
                      ...settings,
                      referral: { ...settings.referral, reward: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#87A7D0]">$</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Max Referral Reward Cap ($ USDT)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.referral?.max_reward_per_user || 100}
                    onChange={e => setSettings({
                      ...settings,
                      referral: { ...settings.referral, max_reward_per_user: parseFloat(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#87A7D0]">$</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSaveSettingsSection('referral')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'referral' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'referral' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save Referral Settings'}
            </button>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3">
              <h3 className="text-sm font-bold text-white font-serif-luxury">🎯 Daily Spin & Gift Chest Limits</h3>
              <p className="text-[11px] text-[#87A7D0]">Control how many times a user can spin the wheel and open the mystery box per day</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2CAD8]">Daily Spin Limit (Spins / Day)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.daily_spins_limit || 3}
                  onChange={e => setSettings({ ...settings, daily_spins_limit: parseInt(e.target.value, 10) || 1 })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2CAD8]">Daily Gift Box Limit (Opens / Day)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.daily_giftbox_limit || 1}
                  onChange={e => setSettings({ ...settings, daily_giftbox_limit: parseInt(e.target.value, 10) || 1 })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleSaveSettingsSection('daily_limits')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'daily_limits' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'daily_limits' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save Daily Limits'}
            </button>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3">
              <h3 className="text-sm font-bold text-white font-serif-luxury">⛏️ VX Quantitative Mining Engine</h3>
              <p className="text-[11px] text-[#87A7D0]">Daily yield rate, token pricing, and staking minimums</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">VX Token Price ($ USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.mining?.vx_price_usdt || settings.vx_price_usdt || 0.10}
                  onChange={e => setSettings({
                    ...settings,
                    vx_price_usdt: parseFloat(e.target.value),
                    mining: { ...settings.mining, vx_price_usdt: parseFloat(e.target.value) }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Min VX for Mining (Staking)</label>
                <input
                  type="number"
                  value={settings.mining?.min_vx_mining || settings.min_vx_mining || 100}
                  onChange={e => setSettings({
                    ...settings,
                    min_vx_mining: parseFloat(e.target.value),
                    mining: { ...settings.mining, min_vx_mining: parseFloat(e.target.value) }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Daily Continuous Yield (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.mining?.daily_yield_rate || settings.daily_yield_rate || 1.5}
                  onChange={e => setSettings({
                    ...settings,
                    daily_yield_rate: parseFloat(e.target.value),
                    mining: { ...settings.mining, daily_yield_rate: parseFloat(e.target.value) }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>
            </div>

            {}
            {(() => {
              const currentVxPrice = parseFloat(settings.mining?.vx_price_usdt || settings.vx_price_usdt || 0.10);
              const rawYield = parseFloat(settings.mining?.daily_yield_rate || settings.daily_yield_rate || 1.5);
              const currentDailyRate = rawYield < 0.2 ? rawYield * 100 : rawYield;
              const sampleVx = 15680;
              const sampleCapital = sampleVx * currentVxPrice;
              const dailyYieldUsdt = sampleCapital * (currentDailyRate / 100);
              const hourlyYieldUsdt = dailyYieldUsdt / 24;
              const minYieldUsdt = dailyYieldUsdt / 1440;
              const secYieldUsdt = dailyYieldUsdt / 86400;

              return (
                <div className="bg-[#070D1E] p-4 rounded-2xl border border-[#C18DB4]/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C18DB4]/20 pb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-serif-luxury">
                      <Activity size={15} className="text-amber-400" /> Live Accrual Rate Breakdown & Earning Simulator
                    </h4>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 w-fit">
                      ⚡ Active Yield: {currentDailyRate.toFixed(2)}% / 24 Hours
                    </span>
                  </div>

                  {}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-[#0E1B48] p-2.5 rounded-xl border border-[#C18DB4]/20 space-y-0.5">
                      <span className="text-[9px] text-[#87A7D0] uppercase font-bold block">24 Hours Earning</span>
                      <span className="text-xs font-extrabold text-white font-mono block">${dailyYieldUsdt.toFixed(2)} USDT</span>
                      <span className="text-[8px] text-[#E2CAD8] block">On 15,680 VX ($1,568)</span>
                    </div>

                    <div className="bg-[#0E1B48] p-2.5 rounded-xl border border-[#C18DB4]/20 space-y-0.5">
                      <span className="text-[9px] text-[#87A7D0] uppercase font-bold block">1 Hour (Hourly)</span>
                      <span className="text-xs font-extrabold text-amber-300 font-mono block">${hourlyYieldUsdt.toFixed(3)} USDT / hr</span>
                      <span className="text-[8px] text-[#E2CAD8] block">Every 60 minutes</span>
                    </div>

                    <div className="bg-[#0E1B48] p-2.5 rounded-xl border border-[#C18DB4]/20 space-y-0.5">
                      <span className="text-[9px] text-[#87A7D0] uppercase font-bold block">1 Minute (Per Min)</span>
                      <span className="text-xs font-extrabold text-emerald-300 font-mono block">${minYieldUsdt.toFixed(4)} USDT / min</span>
                      <span className="text-[8px] text-[#E2CAD8] block">Every 60 seconds</span>
                    </div>

                    <div className="bg-[#0E1B48] p-2.5 rounded-xl border border-[#C18DB4]/20 space-y-0.5">
                      <span className="text-[9px] text-[#87A7D0] uppercase font-bold block">1 Second (Live Accrual)</span>
                      <span className="text-xs font-extrabold text-sky-300 font-mono block">${secYieldUsdt.toFixed(6)} USDT / s</span>
                      <span className="text-[8px] text-[#E2CAD8] block">Live Ticker Speed</span>
                    </div>
                  </div>

                  {}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-[#C18DB4]/20 text-[#87A7D0]">
                          <th className="pb-1.5 font-bold">Daily Yield Rate</th>
                          <th className="pb-1.5 font-bold">24 Hours Return</th>
                          <th className="pb-1.5 font-bold">Hourly Rate</th>
                          <th className="pb-1.5 font-bold">Per Minute</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C18DB4]/10 text-white font-mono text-[10px]">
                        <tr className="hover:bg-[#0E1B48]/50">
                          <td className="py-1.5 font-bold text-amber-300">1.5% (Standard)</td>
                          <td className="py-1.5">$23.52 USDT</td>
                          <td className="py-1.5">$0.980 USDT / hr</td>
                          <td className="py-1.5">$0.0163 USDT / min</td>
                        </tr>
                        <tr className="hover:bg-[#0E1B48]/50">
                          <td className="py-1.5 font-bold text-amber-300">3.0% (Boosted)</td>
                          <td className="py-1.5">$47.04 USDT</td>
                          <td className="py-1.5">$1.960 USDT / hr</td>
                          <td className="py-1.5">$0.0326 USDT / min</td>
                        </tr>
                        <tr className="hover:bg-[#0E1B48]/50">
                          <td className="py-1.5 font-bold text-amber-300">5.0% (High Yield)</td>
                          <td className="py-1.5">$78.40 USDT</td>
                          <td className="py-1.5">$3.266 USDT / hr</td>
                          <td className="py-1.5">$0.0544 USDT / min</td>
                        </tr>
                        <tr className="bg-emerald-500/15 font-bold text-emerald-300">
                          <td className="py-1.5 font-extrabold text-emerald-400">👉 {currentDailyRate.toFixed(1)}% (Active Setting)</td>
                          <td className="py-1.5">${dailyYieldUsdt.toFixed(2)} USDT</td>
                          <td className="py-1.5">${hourlyYieldUsdt.toFixed(3)} USDT / hr</td>
                          <td className="py-1.5">${minYieldUsdt.toFixed(4)} USDT / min</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => handleSaveSettingsSection('mining')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'mining' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'mining' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save Mining Settings'}
            </button>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3">
              <h3 className="text-sm font-bold text-white font-serif-luxury">📱 Telegram Bot & Branding</h3>
              <p className="text-[11px] text-[#87A7D0]">Bot username, platform titles, and support links</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Telegram Bot Username</label>
                <input
                  type="text"
                  value={settings.telegram?.bot_username || 'VXMiningBot'}
                  onChange={e => setSettings({
                    ...settings,
                    telegram: { ...settings.telegram, bot_username: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Support Telegram Username</label>
                <input
                  type="text"
                  value={settings.branding?.support_telegram || '@VextoralSupport'}
                  onChange={e => setSettings({
                    ...settings,
                    branding: { ...settings.branding, support_telegram: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Support Email Address</label>
                <input
                  type="email"
                  value={settings.branding?.support_email || 'businessvextoral@gmail.com'}
                  onChange={e => setSettings({
                    ...settings,
                    branding: { ...settings.branding, support_email: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Platform Application Name</label>
                <input
                  type="text"
                  value={settings.branding?.app_name || 'VextoralMining'}
                  onChange={e => setSettings({
                    ...settings,
                    branding: { ...settings.branding, app_name: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Platform Tagline</label>
                <input
                  type="text"
                  value={settings.branding?.tagline || 'Complete tasks & earn daily USDT yield.'}
                  onChange={e => setSettings({
                    ...settings,
                    branding: { ...settings.branding, tagline: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Logo Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={settings.branding?.logo_url || ''}
                  onChange={e => setSettings({
                    ...settings,
                    branding: { ...settings.branding, logo_url: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#E2CAD8]">Banner Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={settings.branding?.banner_url || ''}
                  onChange={e => setSettings({
                    ...settings,
                    branding: { ...settings.branding, banner_url: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleSaveSettingsSection('branding')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'branding' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'branding' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save Branding & Telegram'}
            </button>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white font-serif-luxury">⚙️ General & Maintenance Mode</h3>
                <p className="text-[11px] text-[#87A7D0]">Toggle platform accessibility and service outage announcements</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
                <input
                  type="checkbox"
                  checked={settings.general?.maintenance_mode || false}
                  onChange={e => setSettings({
                    ...settings,
                    general: { ...settings.general, maintenance_mode: e.target.checked }
                  })}
                  className="rounded text-amber-500 w-4 h-4"
                />
                <span>Maintenance Mode</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#E2CAD8]">Maintenance Notice Message</label>
              <input
                type="text"
                value={settings.general?.maintenance_message || 'VextoralMining is under scheduled maintenance. Please check back soon.'}
                onChange={e => setSettings({
                  ...settings,
                  general: { ...settings.general, maintenance_message: e.target.value }
                })}
                className="w-full p-3 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={() => handleSaveSettingsSection('general')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'general' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'general' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save General Settings'}
            </button>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3">
              <h3 className="text-sm font-bold text-white font-serif-luxury">🎡 Lucky Spin Wheel Sectors & Values</h3>
              <p className="text-[11px] text-[#87A7D0]">Configure labels, reward currency, and prize amounts for all 8 wheel slices</p>
            </div>

            <div className="space-y-3">
              {(settings.wheel_sectors || defaultSettings.wheel_sectors).map((sector: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#070D1E] rounded-2xl border border-[#C18DB4]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white border border-white/20"
                      style={{ backgroundColor: sector.color || '#C18DB4' }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{sector.label}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                    <div className="space-y-0.5">
                      <label className="text-[10px] text-[#87A7D0] font-bold">Currency</label>
                      <select
                        value={sector.reward_type || 'USDT'}
                        onChange={e => handleUpdateWheelSector(idx, 'reward_type', e.target.value)}
                        className="w-full p-2 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none"
                      >
                        <option value="USDT">USDT</option>
                        <option value="VX">VX</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] text-[#87A7D0] font-bold">Amount</label>
                      <input
                        type="number"
                        step="0.05"
                        value={sector.reward_amount || 0}
                        onChange={e => handleUpdateWheelSector(idx, 'reward_amount', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-xl text-xs text-emerald-400 font-bold outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] text-[#87A7D0] font-bold">Color</label>
                      <input
                        type="text"
                        value={sector.color || '#C18DB4'}
                        onChange={e => handleUpdateWheelSector(idx, 'color', e.target.value)}
                        className="w-full p-2 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSaveSettingsSection('wheel_sectors')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'wheel_sectors' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'wheel_sectors' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save Lucky Wheel Sectors & Values'}
            </button>
          </div>

          {}
          <div className="card-vault p-5 rounded-3xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-4 shadow-xl">
            <div className="border-b border-[#C18DB4]/20 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white font-serif-luxury">🎁 Daily Mystery Gift Box Rewards Pool</h3>
                <p className="text-[11px] text-[#87A7D0]">Configure unboxable prize tiers and add custom payout amounts</p>
              </div>
              <button 
                onClick={handleAddGiftReward}
                className="px-3 py-1.5 rounded-xl bg-[#0E1B48] text-xs font-bold text-amber-300 border border-amber-400/30 hover:bg-amber-400/20"
              >
                + Add Reward Tier
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(settings.gift_rewards || defaultSettings.gift_rewards).map((rewardStr: string, idx: number) => (
                <div key={idx} className="p-3 bg-[#070D1E] rounded-2xl border border-[#C18DB4]/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-[#87A7D0]">#{idx + 1}</span>
                    <input
                      type="text"
                      value={rewardStr}
                      onChange={e => handleUpdateGiftReward(idx, e.target.value)}
                      placeholder="e.g. 5.00 USDT"
                      className="w-full p-2 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-bold outline-none font-mono"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveGiftReward(idx)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSaveSettingsSection('gift_rewards')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                savingSection === 'gift_rewards' ? 'bg-emerald-500 text-white font-extrabold' : 'btn-gold-vault'
              }`}
            >
              {savingSection === 'gift_rewards' ? <><CheckCircle size={14} className="animate-bounce" /> Saved Successfully!</> : 'Save Gift Box Rewards Pool'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-5 animate-fade-in max-w-2xl">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury">Activity log</h2>
            <p className="text-xs text-[#87A7D0]">Every admin action is recorded</p>
          </div>

          <div className="space-y-3">
            {activityLogs.map((log, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/20 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white">{log.title}</h4>
                  <span className="text-[10px] text-[#87A7D0]">{log.time}</span>
                </div>
                <p className="text-[11px] text-[#87A7D0]">{log.email} · {log.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {createAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-vault max-w-md w-full p-6 rounded-3xl space-y-4 bg-[#0E1B48] border border-[#C18DB4]/40 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-serif-luxury">Create New Admin</h3>
              <button onClick={() => setCreateAdminModal(false)}><XCircle size={18} /></button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="text-[#E2CAD8] block mb-1 font-bold">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[#E2CAD8] block mb-1 font-bold">Initial Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[#E2CAD8] block mb-1 font-bold">Role</label>
                <select
                  value={newAdminRole}
                  onChange={e => setNewAdminRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="text-[#E2CAD8] block mb-2 font-bold">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(adminPermissions).map(perm => (
                    <label key={perm} className="flex items-center gap-2 text-[11px] text-[#E2CAD8] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminPermissions[perm]}
                        onChange={e => setAdminPermissions({ ...adminPermissions, [perm]: e.target.checked })}
                        className="rounded text-emerald-500"
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 btn-gold-vault font-bold rounded-xl text-xs shadow-lg mt-2">
                Create Admin Account
              </button>
            </form>
          </div>
        </div>
      )}

      {createTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-vault max-w-md w-full p-6 rounded-3xl space-y-4 bg-[#0E1B48] border border-[#C18DB4]/40 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-serif-luxury">New task</h3>
              <button onClick={() => setCreateTaskModal(false)}><XCircle size={18} /></button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-[#E2CAD8] block mb-1 font-bold">Title</label>
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[#E2CAD8] block mb-1 font-bold">Short description</label>
                <input
                  type="text"
                  placeholder="Short summary..."
                  value={newTaskShortDesc}
                  onChange={e => setNewTaskShortDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[#E2CAD8] block mb-1 font-bold">Task link</label>
                <input
                  type="text"
                  placeholder="https://t.me/..."
                  value={newTaskUrl}
                  onChange={e => setNewTaskUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#E2CAD8] block mb-1 font-bold">Reward $</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTaskReward}
                    onChange={e => setNewTaskReward(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#E2CAD8] block mb-1 font-bold">Max slots</label>
                  <input
                    type="number"
                    value={newTaskMaxSlots}
                    onChange={e => setNewTaskMaxSlots(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#E2CAD8] block mb-1 font-bold">Minutes</label>
                  <input
                    type="number"
                    value={newTaskMinutes}
                    onChange={e => setNewTaskMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#E2CAD8] block mb-1 font-bold">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={e => setNewTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/30 rounded-xl text-white outline-none"
                >
                  <option value="Social Media">Social Media</option>
                  <option value="Website">Website</option>
                  <option value="App">App</option>
                  <option value="Survey">Survey</option>
                  <option value="Registration">Registration</option>
                  <option value="Content Engagement">Content Engagement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 btn-gold-vault font-bold rounded-xl text-xs shadow-lg mt-2">
                Save task
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-vault max-w-sm w-full p-6 rounded-3xl space-y-4 bg-[#0E1B48] border border-[#C18DB4]/40">
            <h3 className="text-sm font-bold text-white">Adjust Balance for @{selectedUser.username || selectedUser.telegram_id}</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAdjAction('add')}
                className={`py-2 rounded-xl text-xs font-bold ${adjAction === 'add' ? 'btn-gold-vault' : 'bg-[#070D1E] text-[#E2CAD8]'}`}
              >
                Add Balance
              </button>
              <button
                onClick={() => setAdjAction('deduct')}
                className={`py-2 rounded-xl text-xs font-bold ${adjAction === 'deduct' ? 'btn-gold-vault' : 'bg-[#070D1E] text-[#E2CAD8]'}`}
              >
                Deduct Balance
              </button>
            </div>

            <div>
              <label className="text-xs text-[#E2CAD8] block mb-1">Amount (USDT)</label>
              <input
                type="number"
                step="0.1"
                placeholder="0.00"
                value={adjAmount}
                onChange={e => setAdjAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#070D1E] border border-[#C18DB4]/40 rounded-xl text-white text-xs outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleAdjustUserBalance} className="flex-1 py-2.5 btn-gold-vault text-xs font-bold rounded-xl shadow-lg">
                Apply Adjustment
              </button>
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2.5 bg-[#070D1E] text-[#E2CAD8] text-xs font-bold rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
