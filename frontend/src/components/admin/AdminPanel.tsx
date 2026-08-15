import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Settings, CheckCircle, XCircle, 
  Search, Plus, Trash2, Save, RefreshCw, Layers, ArrowLeft,
  Briefcase, Activity
} from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'vx' | 'finance' | 'communities' | 'tasks' | 'settings'>('stats');
  const defaultStats = {
    total_users: 0,
    active_users: 0,
    total_deposits_usdt: 0.00,
    total_withdrawals_usdt: 0.00,
    total_vx_purchased: 0,
    total_mining_yield_paid: 0.00,
    pending_withdrawals_count: 0,
    pending_deposits_count: 0
  };

  const defaultSettings = {
    vx_price_usdt: 0.10,
    min_vx_purchase: 100,
    min_mining_vx: 100,
    mining_rate_percent: 1.50,
    min_deposit_usdt: 10.00,
    min_withdrawal_usdt: 20.00,
    withdrawal_fee_percent: 2.00,
    bep20_wallet: '',
    ton_wallet: '',
    deposit_address_bep20: '',
    deposit_address_ton: '',
    referral_level1_percent: 10.0,
    referral_level2_percent: 5.0,
    referral_level3_percent: 2.0,
    referral_signup_bonus_usdt: 0.50,
    support_telegram: 'https://t.me/telegram',
    official_channel: 'https://t.me/telegram'
  };

  const defaultUsers: any[] = [];
  const defaultDeposits: any[] = [];
  const defaultWithdrawals: any[] = [];
  const defaultCommunities = [
    { id: 1, name: 'Main Telegram Channel', link: 'https://t.me/telegram', type: 'channel' },
    { id: 2, name: 'Official Discussion Group', link: 'https://t.me/telegram', type: 'group' },
    { id: 3, name: 'Vextoral Mining News', link: 'https://t.me/telegram', type: 'channel' }
  ];
  const defaultTasks: any[] = [];

  const [stats, setStats] = useState<any>(defaultStats);
  const [settings, setSettings] = useState<any>(defaultSettings);
  const [users, setUsers] = useState<any[]>(defaultUsers);
  const [deposits, setDeposits] = useState<any[]>(defaultDeposits);
  const [withdrawals, setWithdrawals] = useState<any[]>(defaultWithdrawals);
  const [communities, setCommunities] = useState<any[]>(defaultCommunities);
  const [tasks, setTasks] = useState<any[]>(defaultTasks);

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjCurrency, setAdjCurrency] = useState<'USDT' | 'VX'>('USDT');
  const [adjAction, setAdjAction] = useState<'add' | 'deduct'>('add');

  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityLink, setNewCommunityLink] = useState('');
  const [newCommunityType, setNewCommunityType] = useState<'channel' | 'group'>('channel');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');
  const [newTaskCurrency, setNewTaskCurrency] = useState<'USDT' | 'VX'>('USDT');
  const [newTaskUrl, setNewTaskUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'communities') {
        const localComm = localStorage.getItem('required_communities');
        if (localComm) setCommunities(JSON.parse(localComm));
        const res = await fetch('/api/admin/required-communities');
        const data = await res.json();
        if (data.communities && Array.isArray(data.communities) && data.communities.length > 0) {
          setCommunities(data.communities);
        }
      } else if (activeTab === 'tasks') {
        const localTasks = localStorage.getItem('app_tasks');
        if (localTasks) setTasks(JSON.parse(localTasks));
        const res = await fetch('/api/admin/tasks');
        const data = await res.json();
        if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          setTasks(data.tasks);
        }
      } else if (activeTab === 'settings' || activeTab === 'vx') {
        const localSettings = localStorage.getItem('platform_settings');
        if (localSettings) setSettings(JSON.parse(localSettings));
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      } else if (activeTab === 'users') {
        const localUsers = localStorage.getItem('admin_users');
        if (localUsers) setUsers(JSON.parse(localUsers));
        const res = await fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
        }
      } else if (activeTab === 'stats') {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data.stats || defaultStats);
      } else if (activeTab === 'finance') {
        const depRes = await fetch('/api/admin/deposits');
        const depData = await depRes.json();
        setDeposits(depData.deposits && depData.deposits.length > 0 ? depData.deposits : defaultDeposits);

        const wdRes = await fetch('/api/admin/withdrawals');
        const wdData = await wdRes.json();
        setWithdrawals(wdData.withdrawals && wdData.withdrawals.length > 0 ? wdData.withdrawals : defaultWithdrawals);
      }
    } catch {
      if (activeTab === 'stats') setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    localStorage.setItem('platform_settings', JSON.stringify(settings));
    setMessage('Settings saved successfully!');
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch {}
  };

  const handleAdjustUserBalance = async () => {
    if (!selectedUser || !adjAmount) return;
    const numAmt = parseFloat(adjAmount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        const currentUsdt = u.balance?.usdt_balance || 0;
        const currentVx = u.balance?.vx_balance || 0;
        const newUsdt = adjCurrency === 'USDT' 
          ? (adjAction === 'add' ? currentUsdt + numAmt : Math.max(0, currentUsdt - numAmt))
          : currentUsdt;
        const newVx = adjCurrency === 'VX'
          ? (adjAction === 'add' ? currentVx + numAmt : Math.max(0, currentVx - numAmt))
          : currentVx;
        return {
          ...u,
          balance: { ...u.balance, usdt_balance: newUsdt, vx_balance: newVx }
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    setMessage(`Balance adjusted for ${selectedUser.first_name || 'User'}`);
    setSelectedUser(null);
    setAdjAmount('');

    try {
      await fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          amount: numAmt,
          currency: adjCurrency,
          action: adjAction
        })
      });
    } catch {}
  };

  const handleToggleUserBan = async (u: any) => {
    const nextStatus = !u.is_active;
    const updatedUsers = users.map(item => item.id === u.id ? { ...item, is_active: nextStatus } : item);
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    setMessage(`User ${u.first_name || 'Account'} is now ${nextStatus ? 'UNBANNED' : 'BANNED'}`);

    try {
      await fetch('/api/admin/users/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: u.id,
          is_active: nextStatus,
          ban_reason: nextStatus ? undefined : 'Banned by admin'
        })
      });
    } catch {}
  };

  const handleConfirmDeposit = async (depId: number) => {
    const updated = deposits.map(d => d.id === depId ? { ...d, status: 'confirmed' } : d);
    setDeposits(updated);
    setMessage('Deposit confirmed!');
    try {
      await fetch('/api/admin/deposits/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit_id: depId })
      });
    } catch {}
  };

  const handleUpdateWithdrawal = async (wdId: number, status: 'approved' | 'rejected') => {
    const updated = withdrawals.map(w => w.id === wdId ? { ...w, status } : w);
    setWithdrawals(updated);
    setMessage(`Withdrawal ${status}`);
    try {
      await fetch('/api/admin/withdrawals/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal_id: wdId, status })
      });
    } catch {}
  };

  const handleAddCommunity = async () => {
    if (!newCommunityName.trim() || !newCommunityLink.trim()) return;
    const newComm = {
      id: Date.now(),
      name: newCommunityName.trim(),
      link: newCommunityLink.trim(),
      type: newCommunityType,
      is_active: true,
      sort_order: communities.length + 1
    };
    const updated = [...communities, newComm];
    setCommunities(updated);
    localStorage.setItem('required_communities', JSON.stringify(updated));
    setNewCommunityName('');
    setNewCommunityLink('');
    setMessage('Community added successfully');

    try {
      await fetch('/api/admin/required-communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communities: updated })
      });
    } catch {}
  };

  const handleRemoveCommunity = async (id: number) => {
    const updated = communities.filter(c => c.id !== id);
    setCommunities(updated);
    localStorage.setItem('required_communities', JSON.stringify(updated));
    setMessage('Community removed successfully');

    try {
      await fetch('/api/admin/required-communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communities: updated })
      });
    } catch {}
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !newTaskReward.trim()) return;
    const taskItem = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      reward_amount: parseFloat(newTaskReward) || 1.0,
      reward_currency: newTaskCurrency,
      action_url: newTaskUrl.trim() || 'https://t.me/telegram',
      type: 'social_follow',
      is_active: true
    };
    const updated = [...tasks, taskItem];
    setTasks(updated);
    localStorage.setItem('app_tasks', JSON.stringify(updated));
    setNewTaskTitle('');
    setNewTaskReward('');
    setNewTaskUrl('');
    setMessage('Task created successfully');

    try {
      await fetch('/api/admin/tasks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskItem)
      });
    } catch {}
  };

  const handleDeleteTask = async (id: number) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('app_tasks', JSON.stringify(updated));
    setMessage('Task deleted successfully');

    try {
      await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 space-y-6">
      
      <div className="flex items-center justify-between gap-4 card-vault p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-[#0E1B48] text-[#E2CAD8] hover:bg-[#1A285A]">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white font-serif-luxury">Admin Panel</h1>
            <p className="text-xs text-[#E2CAD8]">Platform Configuration & Control</p>
          </div>
        </div>

        <button onClick={fetchData} className="p-2.5 rounded-xl btn-gold-vault">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><XCircle size={14} /></button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'stats', label: 'Analytics', icon: Activity },
          { id: 'users', label: 'User Manager', icon: Users },
          { id: 'vx', label: 'VX & Mining', icon: Briefcase },
          { id: 'finance', label: 'Finance (Dep/Wd)', icon: DollarSign },
          { id: 'communities', label: 'Communities', icon: Layers },
          { id: 'tasks', label: 'Task Manager', icon: CheckCircle },
          { id: 'settings', label: 'App Settings', icon: Settings }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive ? 'btn-gold-vault shadow-lg' : 'bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/30 hover:bg-[#0E1B48]'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Total Registered Users</span>
            <h3 className="text-xl font-extrabold text-white mt-1">{stats?.total_users || 0}</h3>
          </div>
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Active Users</span>
            <h3 className="text-xl font-extrabold text-emerald-400 mt-1">{stats?.active_users || 0}</h3>
          </div>
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Total Confirmed Deposits</span>
            <h3 className="text-xl font-extrabold text-[#87A7D0] mt-1">${Number(stats?.total_deposits_usdt || 0).toFixed(2)}</h3>
          </div>
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Total Approved Withdrawals</span>
            <h3 className="text-xl font-extrabold text-rose-300 mt-1">${Number(stats?.total_withdrawals_usdt || 0).toFixed(2)}</h3>
          </div>
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Total VX Tokens Purchased</span>
            <h3 className="text-xl font-extrabold text-[#E2CAD8] mt-1">{Number(stats?.total_vx_purchased || 0).toLocaleString()} VX</h3>
          </div>
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Total Mining Yield Paid</span>
            <h3 className="text-xl font-extrabold text-amber-300 mt-1">${Number(stats?.total_mining_yield_paid || 0).toFixed(2)}</h3>
          </div>
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Pending Withdrawals</span>
            <h3 className="text-xl font-extrabold text-amber-400 mt-1">{stats?.pending_withdrawals_count || 0}</h3>
          </div>
          <div className="card-vault p-4 rounded-2xl">
            <span className="text-[10px] text-[#E2CAD8]">Pending Deposits</span>
            <h3 className="text-xl font-extrabold text-sky-400 mt-1">{stats?.pending_deposits_count || 0}</h3>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-[#E2CAD8]" />
              <input
                type="text"
                placeholder="Search Telegram ID or Username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchData()}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-xs text-white placeholder-[#E2CAD8]/60 focus:outline-none"
              />
            </div>
            <button onClick={fetchData} className="px-4 py-2.5 btn-gold-vault text-xs">Search</button>
          </div>

          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="card-vault p-6 rounded-2xl text-center text-xs text-[#E2CAD8] space-y-2">
                <p>No external users found in query.</p>
                <p className="text-[11px] text-[#87A7D0]">Real user profiles appear here in real-time as they connect to your bot.</p>
              </div>
            ) : (
              users.map(u => (
                <div key={u.id} className="card-vault p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{u.first_name || 'Member'} {u.last_name || ''}</h4>
                      {u.username && <span className="text-[10px] text-[#87A7D0]">@{u.username}</span>}
                      {u.is_admin && <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">ADMIN</span>}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        u.is_active !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {u.is_active !== false ? 'ACTIVE' : 'BANNED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#E2CAD8] mt-1">ID: {u.telegram_id || u.id} | USDT: ${Number(u.balance?.usdt_balance || u.balance_usdt || 0).toFixed(2)} | VX: {Number(u.balance?.vx_balance || u.balance_vx || 0)} VX</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/30 text-xs font-bold hover:bg-[#1A285A]"
                    >
                      Adjust Balance
                    </button>
                    <button
                      onClick={() => handleToggleUserBan(u)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        u.is_active !== false 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      {u.is_active !== false ? 'Ban User' : 'Unban User'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="card-vault max-w-sm w-full p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-white">Adjust Balance for {selectedUser.first_name}</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAdjAction('add')}
                    className={`py-2 rounded-xl text-xs font-bold ${adjAction === 'add' ? 'btn-gold-vault' : 'bg-[#0E1B48] text-[#E2CAD8]'}`}
                  >
                    Add Balance
                  </button>
                  <button
                    onClick={() => setAdjAction('deduct')}
                    className={`py-2 rounded-xl text-xs font-bold ${adjAction === 'deduct' ? 'btn-gold-vault' : 'bg-[#0E1B48] text-[#E2CAD8]'}`}
                  >
                    Deduct Balance
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAdjCurrency('USDT')}
                    className={`py-2 rounded-xl text-xs font-bold ${adjCurrency === 'USDT' ? 'btn-gold-vault' : 'bg-[#0E1B48] text-[#E2CAD8]'}`}
                  >
                    USDT
                  </button>
                  <button
                    onClick={() => setAdjCurrency('VX')}
                    className={`py-2 rounded-xl text-xs font-bold ${adjCurrency === 'VX' ? 'btn-gold-vault' : 'bg-[#0E1B48] text-[#E2CAD8]'}`}
                  >
                    VX Tokens
                  </button>
                </div>

                <input
                  type="number"
                  placeholder="Enter Amount..."
                  value={adjAmount}
                  onChange={e => setAdjAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-xs text-white placeholder-[#E2CAD8]/60 focus:outline-none"
                />

                <div className="flex gap-2">
                  <button onClick={handleAdjustUserBalance} className="flex-1 py-2.5 btn-gold-vault text-xs">Confirm</button>
                  <button onClick={() => setSelectedUser(null)} className="px-4 py-2.5 bg-[#0E1B48] text-[#E2CAD8] text-xs rounded-xl">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'vx' && settings && (
        <div className="card-vault p-6 rounded-3xl space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-white font-serif-luxury">VX Token & Mining Rules</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#E2CAD8] block mb-1">VX Token Price (USDT)</label>
              <input
                type="number"
                step="0.01"
                value={settings.vx_price_usdt}
                onChange={e => setSettings({ ...settings, vx_price_usdt: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="text-[#E2CAD8] block mb-1">Minimum VX Purchase Amount</label>
              <input
                type="number"
                value={settings.min_vx_purchase}
                onChange={e => setSettings({ ...settings, min_vx_purchase: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="text-[#E2CAD8] block mb-1">Minimum VX Required To Mine</label>
              <input
                type="number"
                value={settings.min_vx_mining}
                onChange={e => setSettings({ ...settings, min_vx_mining: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="text-[#E2CAD8] block mb-1">Daily Mining Yield Rate (0.015 = 1.5%/day)</label>
              <input
                type="number"
                step="0.001"
                value={settings.daily_yield_rate}
                onChange={e => setSettings({ ...settings, daily_yield_rate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="miningEnabled"
                checked={settings.mining_enabled}
                onChange={e => setSettings({ ...settings, mining_enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-[#C18DB4]"
              />
              <label htmlFor="miningEnabled" className="text-white font-bold">Enable VX Mining Globally</label>
            </div>
          </div>

          <button onClick={handleUpdateSettings} className="w-full py-3 btn-gold-vault text-xs font-bold rounded-xl flex items-center justify-center gap-2">
            <Save size={14} /> Save Mining Settings
          </button>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="card-vault p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white">Pending Deposits ({deposits.filter(d => d.status === 'pending').length})</h3>
            <div className="space-y-2">
              {deposits.map(d => (
                <div key={d.id} className="p-3 rounded-xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white">${d.amount.toFixed(2)} USDT ({d.network})</span>
                    <p className="text-[10px] text-[#E2CAD8]">User ID: {d.user_id} | Status: {d.status}</p>
                  </div>
                  {d.status === 'pending' && (
                    <button onClick={() => handleConfirmDeposit(d.id)} className="px-3 py-1.5 btn-gold-vault text-[11px]">Confirm</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card-vault p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white">Pending Withdrawals ({withdrawals.filter(w => w.status === 'pending').length})</h3>
            <div className="space-y-2">
              {withdrawals.map(w => (
                <div key={w.id} className="p-3 rounded-xl bg-[#0E1B48]/60 border border-[#C18DB4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white">${w.amount.toFixed(2)} USDT ({w.network})</span>
                    <p className="text-[10px] text-[#E2CAD8]">Address: {w.wallet_address} | Status: {w.status}</p>
                  </div>
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateWithdrawal(w.id, 'approved')} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">Approve</button>
                      <button onClick={() => handleUpdateWithdrawal(w.id, 'rejected')} className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communities' && (
        <div className="card-vault p-6 rounded-3xl space-y-6 max-w-xl">
          <h3 className="text-sm font-bold text-white font-serif-luxury">Mandatory Required Telegram Communities</h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Channel/Group Name..."
              value={newCommunityName}
              onChange={e => setNewCommunityName(e.target.value)}
              className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-xs text-white"
            />
            <input
              type="text"
              placeholder="https://t.me/yourchannel"
              value={newCommunityLink}
              onChange={e => setNewCommunityLink(e.target.value)}
              className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-xs text-white"
            />
            <div className="flex gap-2">
              <select
                value={newCommunityType}
                onChange={e => setNewCommunityType(e.target.value as any)}
                className="px-4 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-xs text-white"
              >
                <option value="channel">Channel</option>
                <option value="group">Group</option>
              </select>
              <button onClick={handleAddCommunity} className="flex-1 py-2 btn-gold-vault text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                <Plus size={14} /> Add Community
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {communities.map(c => (
              <div key={c.id} className="p-3 rounded-xl bg-[#0E1B48]/80 border border-[#C18DB4]/30 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white">{c.name}</h4>
                  <a href={c.link} target="_blank" rel="noreferrer" className="text-[10px] text-[#87A7D0]">{c.link}</a>
                </div>
                <button onClick={() => handleRemoveCommunity(c.id)} className="p-2 text-rose-400 hover:text-rose-300">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card-vault p-6 rounded-3xl space-y-6 max-w-xl">
          <div className="flex items-center justify-between border-b border-[#C18DB4]/30 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-serif-luxury">Task Creation & Upload Portal</h3>
              <p className="text-[11px] text-[#E2CAD8]">Upload new tasks for platform users to complete and earn rewards.</p>
            </div>
            <Briefcase size={20} className="text-[#C18DB4]" />
          </div>

          <div className="space-y-3 bg-[#0E1B48]/60 p-4 rounded-2xl border border-[#C18DB4]/30">
            <div>
              <label className="text-[11px] font-bold text-white mb-1 block">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Join Official Telegram Channel"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-xs text-white outline-none focus:border-[#C18DB4]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-white mb-1 block">Reward Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 5.0"
                  value={newTaskReward}
                  onChange={e => setNewTaskReward(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-xs text-white outline-none focus:border-[#C18DB4]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-white mb-1 block">Reward Currency</label>
                <select
                  value={newTaskCurrency}
                  onChange={e => setNewTaskCurrency(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-xs text-white outline-none"
                >
                  <option value="USDT">USDT</option>
                  <option value="VX">VX Tokens</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white mb-1 block">Action Link / URL</label>
              <input
                type="text"
                placeholder="https://t.me/channel or action link..."
                value={newTaskUrl}
                onChange={e => setNewTaskUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-xs text-white outline-none focus:border-[#C18DB4]"
              />
            </div>

            <button onClick={handleAddTask} className="w-full py-3 btn-gold-vault text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg pt-2">
              <Plus size={16} /> Upload & Publish Task
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white">Active Uploaded Tasks ({tasks.length})</h4>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-[#E2CAD8] italic">No active tasks uploaded yet.</p>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className="p-3.5 rounded-2xl bg-[#0E1B48]/80 border border-[#C18DB4]/30 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-white">{t.title}</h4>
                      <span className="text-[11px] text-amber-300 font-bold">Reward: +{t.reward_amount} {t.reward_currency}</span>
                      {t.action_url && (
                        <p className="text-[10px] text-[#87A7D0] truncate max-w-xs">{t.action_url}</p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-rose-400 hover:text-rose-300 transition-colors" title="Delete Task">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="card-vault p-6 rounded-3xl space-y-6 max-w-xl">
          <div>
            <h3 className="text-sm font-bold text-white font-serif-luxury">Platform & Referral Configuration</h3>
            <p className="text-[11px] text-[#E2CAD8]">Set multi-tier referral commissions, rewards, and receiving wallets</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif-luxury">Multi-Tier Referral Commissions</h4>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[#E2CAD8] block mb-1">Tier 1 Rate (%)</label>
                  <input
                    type="number"
                    value={settings.referral_level1_percent ?? 10}
                    onChange={e => setSettings({ ...settings, referral_level1_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#E2CAD8] block mb-1">Tier 2 Rate (%)</label>
                  <input
                    type="number"
                    value={settings.referral_level2_percent ?? 5}
                    onChange={e => setSettings({ ...settings, referral_level2_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#E2CAD8] block mb-1">Tier 3 Rate (%)</label>
                  <input
                    type="number"
                    value={settings.referral_level3_percent ?? 2}
                    onChange={e => setSettings({ ...settings, referral_level3_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#E2CAD8] block mb-1">Fixed Referral Signup Bonus ($ USDT)</label>
                <input
                  type="number"
                  step="0.05"
                  value={settings.referral_signup_bonus_usdt ?? 0.50}
                  onChange={e => setSettings({ ...settings, referral_signup_bonus_usdt: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-3">
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-serif-luxury">Deposit Receiving Wallets</h4>
              
              <div>
                <label className="text-[10px] text-[#E2CAD8] block mb-1">BEP20 (USDT) Receiving Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={settings.bep20_wallet || ''}
                  onChange={e => setSettings({ ...settings, bep20_wallet: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#E2CAD8] block mb-1">TON (USDT) Receiving Wallet Address</label>
                <input
                  type="text"
                  placeholder="EQ..."
                  value={settings.ton_wallet || ''}
                  onChange={e => setSettings({ ...settings, ton_wallet: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E1B48]/70 border border-[#C18DB4]/30 space-y-3">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-serif-luxury">Withdrawal Thresholds</h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#E2CAD8] block mb-1">Min Withdrawal (USDT)</label>
                  <input
                    type="number"
                    value={settings.min_withdrawal ?? 20}
                    onChange={e => setSettings({ ...settings, min_withdrawal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#E2CAD8] block mb-1">Withdrawal Fee (USDT)</label>
                  <input
                    type="number"
                    value={settings.withdrawal_fee ?? 1}
                    onChange={e => setSettings({ ...settings, withdrawal_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <button onClick={handleUpdateSettings} className="w-full py-3.5 btn-gold-vault text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xl">
              <Save size={16} /> Save All Platform Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
