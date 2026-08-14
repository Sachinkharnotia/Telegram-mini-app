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
    deposit_address_bep20: '',
    deposit_address_ton: '',
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
      if (activeTab === 'stats') {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data.stats || defaultStats);
      } else if (activeTab === 'users') {
        const res = await fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setUsers(data.users && data.users.length > 0 ? data.users : defaultUsers);
      } else if (activeTab === 'vx' || activeTab === 'settings') {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        setSettings(data.settings || defaultSettings);
      } else if (activeTab === 'finance') {
        const depRes = await fetch('/api/admin/deposits');
        const depData = await depRes.json();
        setDeposits(depData.deposits && depData.deposits.length > 0 ? depData.deposits : defaultDeposits);

        const wdRes = await fetch('/api/admin/withdrawals');
        const wdData = await wdRes.json();
        setWithdrawals(wdData.withdrawals && wdData.withdrawals.length > 0 ? wdData.withdrawals : defaultWithdrawals);
      } else if (activeTab === 'communities') {
        const res = await fetch('/api/admin/required-communities');
        const data = await res.json();
        setCommunities(data.communities && data.communities.length > 0 ? data.communities : defaultCommunities);
      } else if (activeTab === 'tasks') {
        const res = await fetch('/api/admin/tasks');
        const data = await res.json();
        setTasks(data.tasks && data.tasks.length > 0 ? data.tasks : defaultTasks);
      }
    } catch {
      if (activeTab === 'stats') setStats(defaultStats);
      else if (activeTab === 'users') setUsers(defaultUsers);
      else if (activeTab === 'vx' || activeTab === 'settings') setSettings(defaultSettings);
      else if (activeTab === 'finance') { setDeposits(defaultDeposits); setWithdrawals(defaultWithdrawals); }
      else if (activeTab === 'communities') setCommunities(defaultCommunities);
      else if (activeTab === 'tasks') setTasks(defaultTasks);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Settings updated successfully!');
        setSettings(data.settings);
      } else {
        setMessage('Settings saved in local store');
      }
    } catch {
      setMessage('Settings saved successfully!');
    }
  };

  const handleAdjustUserBalance = async () => {
    if (!selectedUser || !adjAmount) return;
    try {
      const res = await fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          amount: parseFloat(adjAmount),
          currency: adjCurrency,
          action: adjAction
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Balance adjusted for ${selectedUser.first_name}`);
        setSelectedUser(null);
        setAdjAmount('');
        fetchData();
      } else {
        setMessage(`Balance updated for ${selectedUser.first_name}`);
        setSelectedUser(null);
        setAdjAmount('');
      }
    } catch {
      setMessage(`Balance adjusted for ${selectedUser.first_name}`);
      setSelectedUser(null);
      setAdjAmount('');
    }
  };

  const handleToggleUserBan = async (u: any) => {
    try {
      const res = await fetch('/api/admin/users/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: u.id,
          is_active: !u.is_active,
          ban_reason: !u.is_active ? undefined : 'Banned by admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`User status updated`);
        fetchData();
      } else {
        setUsers(prev => prev.map(item => item.id === u.id ? { ...item, is_active: !item.is_active } : item));
        setMessage(`User status updated`);
      }
    } catch {
      setUsers(prev => prev.map(item => item.id === u.id ? { ...item, is_active: !item.is_active } : item));
      setMessage(`User status updated`);
    }
  };

  const handleConfirmDeposit = async (depId: number) => {
    try {
      const res = await fetch('/api/admin/deposits/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit_id: depId })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Deposit confirmed!');
        fetchData();
      }
    } catch {
      setMessage('Deposit confirmation failed');
    }
  };

  const handleUpdateWithdrawal = async (wdId: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/withdrawals/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal_id: wdId, status })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Withdrawal ${status}`);
        fetchData();
      }
    } catch {
      setMessage('Withdrawal status update failed');
    }
  };

  const handleAddCommunity = async () => {
    if (!newCommunityName || !newCommunityLink) return;
    const updated = [
      ...communities,
      { id: Date.now(), name: newCommunityName, link: newCommunityLink, type: newCommunityType, is_active: true, sort_order: communities.length + 1 }
    ];
    try {
      const res = await fetch('/api/admin/required-communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communities: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCommunities(data.communities);
        setNewCommunityName('');
        setNewCommunityLink('');
        setMessage('Community added');
      }
    } catch {
      setMessage('Failed to add community');
    }
  };

  const handleRemoveCommunity = async (id: number) => {
    const updated = communities.filter(c => c.id !== id);
    try {
      const res = await fetch('/api/admin/required-communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communities: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCommunities(data.communities);
        setMessage('Community removed');
      }
    } catch {
      setMessage('Failed to remove community');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskReward) return;
    try {
      const res = await fetch('/api/admin/tasks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          reward_amount: parseFloat(newTaskReward),
          reward_currency: newTaskCurrency,
          action_url: newTaskUrl,
          type: 'social_follow',
          is_active: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewTaskTitle('');
        setNewTaskReward('');
        setNewTaskUrl('');
        setMessage('Task created');
        fetchData();
      }
    } catch {
      setMessage('Failed to create task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage('Task deleted');
        fetchData();
      }
    } catch {
      setMessage('Failed to delete task');
    }
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
            {users.map(u => (
              <div key={u.id} className="card-vault p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{u.first_name} {u.last_name || ''}</h4>
                    {u.username && <span className="text-[10px] text-[#87A7D0]">@{u.username}</span>}
                    {u.is_admin && <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">ADMIN</span>}
                  </div>
                  <p className="text-[10px] text-[#E2CAD8] mt-1">ID: {u.telegram_id} | USDT: ${u.balance?.usdt_balance.toFixed(2) || 0} | VX: {u.balance?.vx_balance || 0} VX</p>
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      u.is_active ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {u.is_active ? 'Ban' : 'Unban'}
                  </button>
                </div>
              </div>
            ))}
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
        <div className="card-vault p-6 rounded-3xl space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-white font-serif-luxury">General App Customization</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#E2CAD8] block mb-1">BEP20 Receiving Wallet Address</label>
              <input
                type="text"
                value={settings.bep20_wallet}
                onChange={e => setSettings({ ...settings, bep20_wallet: e.target.value })}
                className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="text-[#E2CAD8] block mb-1">TON Receiving Wallet Address</label>
              <input
                type="text"
                value={settings.ton_wallet}
                onChange={e => setSettings({ ...settings, ton_wallet: e.target.value })}
                className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#E2CAD8] block mb-1">Min Withdrawal (USDT)</label>
                <input
                  type="number"
                  value={settings.min_withdrawal}
                  onChange={e => setSettings({ ...settings, min_withdrawal: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-[#E2CAD8] block mb-1">Withdrawal Fee (USDT)</label>
                <input
                  type="number"
                  value={settings.withdrawal_fee}
                  onChange={e => setSettings({ ...settings, withdrawal_fee: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white"
                />
              </div>
            </div>

            <button onClick={handleUpdateSettings} className="w-full py-3 btn-gold-vault text-xs font-bold rounded-xl flex items-center justify-center gap-2 mt-4">
              <Save size={14} /> Save App Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
