import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useI18nStore } from './store/i18nStore';
import { Dashboard } from './components/dashboard/Dashboard';
import { Deposit } from './components/deposit/Deposit';
import { Mining } from './components/mining/Mining';
import { History } from './components/history/History';
import { Referral } from './components/referral/Referral';
import { Withdrawal } from './components/withdrawal/Withdrawal';
import { Profile } from './components/profile/Profile';
import { Tasks } from './components/tasks/Tasks';
import { AdminPanel } from './components/admin/AdminPanel';
import { Landing } from './components/website/Landing';
import { Home, TrendingUp, FileText, Users, User } from 'lucide-react';
import { isTelegramEnvironment, getStartParam, initTelegramApp } from './utils/telegram';

const App: React.FC = () => {
  const { user, token, setAuth, isLoading, error, setError } = useAuthStore();
  const { t } = useI18nStore();

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab) return tab;
      if (window.location.search.includes('admin=true') || window.location.hash === '#admin') return 'admin';
      if (window.location.hash.startsWith('#')) {
        const hashTab = window.location.hash.replace('#', '');
        if (['home', 'mining', 'tasks', 'referral', 'deposit', 'withdrawal', 'history', 'profile', 'admin'].includes(hashTab)) {
          return hashTab;
        }
      }
    }
    return 'home';
  });
  const [viewMode, setViewMode] = useState<'app' | 'website'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') || urlParams.get('app') === 'true') return 'app';
      if (window.location.search.includes('admin=true') || window.location.hash === '#admin') return 'app';
    }
    return isTelegramEnvironment() ? 'app' : 'website';
  });

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('platform_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return !!(parsed.general?.maintenance_mode || parsed.maintenance_mode);
      }
    } catch {}
    return false;
  });
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('platform_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.general?.maintenance_message || parsed.announcement_text || 'VextoralMining is currently undergoing scheduled maintenance. We will be back online shortly.';
      }
    } catch {}
    return 'VextoralMining is currently undergoing scheduled maintenance. We will be back online shortly.';
  });

  useEffect(() => {
    initTelegramApp();

    const checkMaintenance = () => {
      try {
        const stored = localStorage.getItem('platform_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setMaintenanceMode(!!(parsed.general?.maintenance_mode || parsed.maintenance_mode));
          if (parsed.general?.maintenance_message) setMaintenanceMessage(parsed.general.maintenance_message);
        }
      } catch {}
    };

    window.addEventListener('storage', checkMaintenance);

    const API_URL = 'https://backend-ten-amber-99.vercel.app';
    fetch(`${API_URL}/api/user/profile?user_id=10001`)
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setMaintenanceMode(!!data.settings.maintenance_mode);
          if (data.settings.announcement_text) setMaintenanceMessage(data.settings.announcement_text);
        }
      })
      .catch(() => {});

    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      setViewMode('app');
    } else if (window.location.search.includes('admin=true') || window.location.hash === '#admin') {
      setActiveTab('admin');
      setViewMode('app');
    }

    const param = getStartParam();
    if (param) {
      if (param.startsWith('deposit')) {
        setActiveTab('deposit');
        setViewMode('app');
      } else if (param.startsWith('ref_') || param === 'referral') {
        setActiveTab('referral');
        setViewMode('app');
      } else if (param === 'mining') {
        setActiveTab('mining');
        setViewMode('app');
      } else if (param === 'tasks' || param === 'wheel') {
        setActiveTab('tasks');
        setViewMode('app');
      } else if (param === 'admin') {
        setActiveTab('admin');
        setViewMode('app');
      }
    }
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    try {
      tg?.ready?.();
      tg?.expand?.();
    } catch {}

    const tgUser = tg?.initDataUnsafe?.user;
    const initData = tg?.initData;

    if (tgUser && (tgUser.first_name || tgUser.username)) {
      const currentUser = useAuthStore.getState().user;
      const realFirstName = tgUser.first_name || tgUser.username || 'Member';
      const realUsername = tgUser.username || currentUser?.username || `user_${tgUser.id}`;
      const realLastName = tgUser.last_name || currentUser?.last_name;

      if (!currentUser || currentUser.first_name === 'Member' || currentUser.first_name !== realFirstName || currentUser.username !== realUsername) {
        const updated = {
          ...(currentUser || {}),
          id: currentUser?.id || tgUser.id,
          telegram_id: tgUser.id || currentUser?.telegram_id || 10001,
          first_name: realFirstName,
          last_name: realLastName,
          username: realUsername,
          balance_usdt: currentUser?.balance_usdt || 0.00,
          balance_vx: currentUser?.balance_vx || 0.00,
          mining_active: (currentUser?.balance_vx || 0) >= 100
        };
        useAuthStore.setState({ user: updated as any });
        localStorage.setItem('user', JSON.stringify(updated));

        try {
          const payload = {
            user_data: updated,
            user: updated,
            balance_usdt: updated.balance_usdt,
            balance_vx: updated.balance_vx,
            telegram_id: updated.telegram_id
          };
          fetch('https://backend-ten-amber-99.vercel.app/api/auth/register-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        } catch {}
      }
    }

    if (!token && !user) {
      const realUserData = {
        id: tgUser?.id || 10001,
        telegram_id: tgUser?.id || 10001,
        first_name: tgUser?.first_name || tgUser?.username || 'Member',
        last_name: tgUser?.last_name,
        username: tgUser?.username || 'member_user',
        is_verified: true,
        referrer_id: undefined,
        balance_usdt: 0.00,
        balance_vx: 0.00,
        mining_active: false,
        mining_rate: 1.50
      };

      const startParam = getStartParam() || new URLSearchParams(window.location.search).get('start') || new URLSearchParams(window.location.search).get('ref');
      const API_URL = 'https://backend-ten-amber-99.vercel.app';

      if (initData) {
        fetch(`${API_URL}/api/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData, startParam })
        })
          .then(async res => {
            const data = await res.json();
            if (res.status === 403 || (data.user && data.user.is_active === false)) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              throw new Error(data.error || 'Your account has been suspended by the administrator.');
            }
            if (data.token && data.user) {
              const fullUser = {
                ...data.user,
                first_name: tgUser?.first_name || (data.user.first_name && data.user.first_name !== 'Member' ? data.user.first_name : (tgUser?.username || 'Member')),
                username: tgUser?.username || data.user.username || 'user',
                balance_usdt: data.balance?.usdt_balance ?? data.user.balance_usdt ?? 0,
                balance_vx: data.balance?.vx_balance ?? data.user.balance_vx ?? 0
              };
              setAuth(data.token, fullUser);
            } else {
              setAuth(`tg-${realUserData.id}`, realUserData);
            }
          })
          .catch(err => {
            if (err?.message?.includes('suspended') || err?.message?.includes('banned')) {
              setError(err.message);
              return;
            }
            fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData, startParam })
            })
              .then(async res => {
                const data = await res.json();
                if (res.status === 403 || (data.user && data.user.is_active === false)) {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  throw new Error(data.error || 'Your account has been suspended by the administrator.');
                }
                if (data.token && data.user) {
                  const fullUser = {
                    ...data.user,
                    first_name: tgUser?.first_name || (data.user.first_name && data.user.first_name !== 'Member' ? data.user.first_name : (tgUser?.username || 'Member')),
                    username: tgUser?.username || data.user.username || 'user',
                    balance_usdt: data.balance?.usdt_balance ?? data.user.balance_usdt ?? 0,
                    balance_vx: data.balance?.vx_balance ?? data.user.balance_vx ?? 0
                  };
                  setAuth(data.token, fullUser);
                } else {
                  setAuth(`tg-${realUserData.id}`, realUserData);
                }
              })
              .catch(err2 => {
                if (err2?.message?.includes('suspended') || err2?.message?.includes('banned')) {
                  setError(err2.message);
                } else {
                  setAuth(`tg-${realUserData.id}`, realUserData);
                }
              });
          });
      } else {
        setAuth(`tg-${realUserData.id}`, realUserData);
      }
    }
  }, [token, user, setAuth]);

  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#0E1B48] text-slate-100 p-4 sm:p-6 overflow-y-auto">
        <AdminPanel onBack={() => { setActiveTab('home'); setViewMode('app'); }} />
      </div>
    );
  }

  if (maintenanceMode) {
    return (
      <div className="min-h-screen bg-[#070D1E] flex flex-col items-center justify-center text-slate-100 p-6 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-[#C18DB4] to-[#87A7D0] p-[2px] shadow-[0_0_50px_rgba(251,191,36,0.3)] animate-pulse">
          <div className="w-full h-full rounded-3xl bg-[#0E1B48] flex items-center justify-center border border-amber-400/40">
            <span className="text-3xl">⚙️</span>
          </div>
        </div>

        <div className="card-vault p-6 rounded-3xl max-w-sm w-full text-center space-y-4 border border-amber-500/40 shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Scheduled Maintenance
          </div>

          <h2 className="text-xl font-extrabold text-white font-serif-luxury">System Upgrade in Progress</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {maintenanceMessage}
          </p>

          <p className="text-[11px] text-[#87A7D0] bg-[#070D1E]/60 p-3 rounded-2xl border border-[#C18DB4]/20">
            🔒 All user balances, mining yields, and investments remain fully safe, secure, and actively accruing.
          </p>

          <div className="pt-2">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full btn-gold-vault py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E1B48] flex flex-col items-center justify-center text-slate-100 p-6 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#C18DB4] via-[#87A7D0] to-[#E2CAD8] p-[2px] shadow-[0_0_50px_rgba(193,141,180,0.5)] animate-pulse">
          <div className="w-full h-full rounded-3xl bg-[#0E1B48] flex items-center justify-center border border-[#C18DB4]/30">
            <span className="text-3xl font-extrabold text-white font-serif-luxury tracking-tight">VM</span>
          </div>
        </div>

        <div className="text-center space-y-2 max-w-xs w-full">
          <h2 className="text-xl font-extrabold text-white font-serif-luxury tracking-wide">VextoralMining</h2>
          <p className="text-xs text-[#87A7D0] font-medium">Connecting to VextoralMining server...</p>
          <div className="w-full h-1.5 rounded-full bg-[#0E1B48] border border-[#C18DB4]/30 overflow-hidden mt-3">
            <div className="h-full bg-gradient-to-r from-[#87A7D0] via-[#C18DB4] to-[#E2CAD8] rounded-full w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1B48] flex items-center justify-center text-slate-100 p-4">
        <div className="card-vault p-6 rounded-3xl max-w-sm w-full text-center space-y-4 border border-rose-500/40">
          <h3 className="text-lg font-bold text-rose-300 font-serif-luxury">Authentication Failure</h3>
          <p className="text-xs text-slate-300">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-gold-vault px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'website') {
    return (
      <div className="min-h-screen bg-transparent font-sans text-slate-100">
        <Landing onLaunchApp={() => setViewMode('app')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 overflow-hidden relative">
      <div className="h-full overflow-y-auto overflow-x-hidden pb-20">
        <main className="relative">
          {(activeTab === 'home' || activeTab === 'dashboard') && <Dashboard onNavigate={(tab: string) => setActiveTab(tab)} />}
          {(activeTab === 'mining' || activeTab === 'statistics' || activeTab === 'calculator') && <Mining />}
          {activeTab === 'history' && <History />}
          {(activeTab === 'referrals' || activeTab === 'referral') && <Referral />}
          {activeTab === 'profile' && <Profile onNavigate={(tab: string) => setActiveTab(tab)} />}
          {activeTab === 'withdrawal' && <Withdrawal onBack={() => setActiveTab('home')} />}
          {activeTab === 'deposit' && <Deposit onBack={() => setActiveTab('home')} />}
          {activeTab === 'tasks' && <Tasks onBack={() => setActiveTab('home')} />}
          {activeTab === 'admin' && <AdminPanel onBack={() => setActiveTab('profile')} />}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E1B48]/95 backdrop-blur-2xl border-t border-[#C18DB4]/30 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {[
            { id: 'home', icon: Home, label: t.navHome, match: ['home', 'dashboard'] },
            { id: 'mining', icon: TrendingUp, label: 'Mining', match: ['mining', 'statistics', 'calculator'] },
            { id: 'history', icon: FileText, label: t.navHistory, match: ['history'] },
            { id: 'referrals', icon: Users, label: t.navRef, match: ['referrals', 'referral'] },
            { id: 'profile', icon: User, label: t.navProfile, match: ['profile'] }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = item.match.includes(activeTab);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-[#E2CAD8]/70 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#C18DB4]/30 to-transparent rounded-xl -z-10" />
                )}
                <Icon
                  size={20}
                  className={`transition-transform duration-300 ${
                    isActive ? 'scale-110 stroke-[2.5] text-[#C18DB4]' : 'stroke-[1.75]'
                  }`}
                />
                <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-white font-serif-luxury' : 'text-[#E2CAD8]/70'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#87A7D0] shadow-[0_0_8px_#87A7D0]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default App;
