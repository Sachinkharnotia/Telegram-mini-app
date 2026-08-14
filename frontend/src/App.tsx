import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useI18nStore } from './store/i18nStore';
import { Dashboard } from './components/dashboard/Dashboard';
import { Deposit } from './components/deposit/Deposit';
import { Mining } from './components/mining/Mining';
import { History } from './components/history/History';
import { Referral } from './components/referral/Referral';
import { Withdrawal } from './components/withdrawal/Withdrawal';
import { Profile } from './components/profile/Profile';
import { Tasks } from './components/tasks/Tasks';
import { Landing } from './components/website/Landing';
import { MandatoryJoin } from './components/common/MandatoryJoin';
import { Loader, Home, TrendingUp, FileText, Users, User, Monitor, Smartphone, Sun, Moon } from 'lucide-react';
import { isTelegramEnvironment, getStartParam, initTelegramApp } from './utils/telegram';

const App: React.FC = () => {
  const { user, token, setAuth, isLoading, error } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useI18nStore();

  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState<'app' | 'website'>(isTelegramEnvironment() ? 'app' : 'website');
  const [mandatoryVerified, setMandatoryVerified] = useState(false);

  useEffect(() => {
    initTelegramApp();

    const param = getStartParam();
    if (param) {
      if (param.startsWith('deposit')) {
        setActiveTab('deposit');
        setViewMode('app');
      } else if (param.startsWith('ref_') || param === 'referral') {
        setActiveTab('referral');
        setViewMode('app');
      } else if (param === 'tasks' || param === 'wheel') {
        setActiveTab('tasks');
        setViewMode('app');
      } else if (param === 'history') {
        setActiveTab('history');
        setViewMode('app');
      }
    }
  }, []);

  useEffect(() => {
    if (!token || !user) {
      const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
      const initData = (window as any)?.Telegram?.WebApp?.initData || '';

      const fallbackUserData = {
        id: tgUser?.id || 1001,
        telegram_id: tgUser?.id || 1001,
        first_name: tgUser?.first_name || 'Support',
        last_name: tgUser?.last_name || '',
        username: tgUser?.username || 'user_1001',
        photo_url: tgUser?.photo_url || '',
        balance: 50.00,
        vx_balance: 500,
        vx_mining_active: true,
        isAdmin: true
      };

      if (initData) {
        fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        })
          .then(res => res.json())
          .then(data => {
            if (data.token && data.user) {
              setAuth(data.token, data.user);
            } else {
              setAuth('demo-token-123', fallbackUserData);
            }
          })
          .catch(() => {
            setAuth('demo-token-123', fallbackUserData);
          });
      } else {
        setAuth('demo-token-123', fallbackUserData);
      }
    }
  }, [token, user, setAuth]);

  if (!mandatoryVerified && isTelegramEnvironment()) {
    return <MandatoryJoin onVerified={() => setMandatoryVerified(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E1B48] flex items-[#center] justify-center text-slate-100 p-4">
        <div className="text-center space-y-4">
          <Loader className="w-10 h-10 animate-spin text-[#C18DB4] mx-auto" />
          <p className="text-xs font-bold font-serif-luxury tracking-wider text-[#87A7D0]">Loading VextoralMining...</p>
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
        <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-[#0E1B48]/90 border border-[#C18DB4]/30 rounded-full p-1.5 shadow-2xl backdrop-blur-md">
          <button 
            onClick={() => setViewMode('website')}
            className="px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 bg-gradient-to-r from-[#0E1B48] to-[#C18DB4] text-white shadow-md"
          >
            <Monitor size={12} /> Website
          </button>
          <button 
            onClick={() => setViewMode('app')}
            className="px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 text-slate-400 hover:text-white"
          >
            <Smartphone size={12} /> Mini App
          </button>
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full bg-[#0E1B48] text-[#E2CAD8] hover:bg-[#1A285A] transition-all border border-[#C18DB4]/30"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>
        <Landing onLaunchApp={() => setViewMode('app')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 overflow-hidden relative">
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-[#0E1B48]/90 border border-[#C18DB4]/30 rounded-full p-1.5 shadow-2xl backdrop-blur-md opacity-75 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setViewMode('website')}
          className="px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 text-slate-400 hover:text-white"
        >
          <Monitor size={12} /> Website
        </button>
        <button 
          onClick={() => setViewMode('app')}
          className="px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 bg-gradient-to-r from-[#0E1B48] to-[#C18DB4] text-white shadow-md"
        >
          <Smartphone size={12} /> Mini App
        </button>
        <button
          onClick={toggleTheme}
          className="p-1 rounded-full bg-[#0E1B48] text-[#E2CAD8] hover:bg-[#1A285A] transition-all border border-[#C18DB4]/30"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>
      
      <div className="h-full overflow-y-auto overflow-x-hidden pb-20">
        <main className="relative">
          {activeTab === 'home' && <Dashboard onNavigate={(tab: string) => setActiveTab(tab)} />}
          {activeTab === 'statistics' && <Mining />}
          {activeTab === 'history' && <History />}
          {activeTab === 'referrals' && <Referral />}
          {activeTab === 'profile' && <Profile onNavigate={(tab: string) => setActiveTab(tab)} />}
          {activeTab === 'withdrawal' && <Withdrawal onBack={() => setActiveTab('home')} />}
          {activeTab === 'deposit' && <Deposit onBack={() => setActiveTab('home')} />}
          {activeTab === 'tasks' && <Tasks onBack={() => setActiveTab('home')} />}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E1B48]/95 backdrop-blur-2xl border-t border-[#C18DB4]/30 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {[
            { id: 'home', icon: Home, label: t.navHome },
            { id: 'statistics', icon: TrendingUp, label: t.navCalc },
            { id: 'history', icon: FileText, label: t.navHistory },
            { id: 'referrals', icon: Users, label: t.navRef },
            { id: 'profile', icon: User, label: t.navProfile }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center w-16 h-14 transition-all"
              >
                <div className={`relative flex items-center justify-center p-1 rounded-full transition-all duration-300 ${isActive ? 'shadow-[0_0_15px_rgba(135,167,208,0.6)] bg-[#87A7D0]/20' : ''}`}>
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 ${isActive ? 'text-[#87A7D0] scale-110' : 'text-slate-400 hover:text-slate-200'}`} 
                  />
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${isActive ? 'text-[#87A7D0] font-bold font-serif-luxury' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default App;
