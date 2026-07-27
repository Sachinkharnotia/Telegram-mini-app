import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { expandTelegramApp, setTelegramHeaderColor } from './services/telegram';
import { Dashboard } from './components/dashboard/Dashboard';
import { Deposit } from './components/deposit/Deposit';
import { Mining } from './components/mining/Mining';
import { History } from './components/history/History';
import { Referral } from './components/referral/Referral';
import { Withdrawal } from './components/withdrawal/Withdrawal';
import { Profile } from './components/profile/Profile';
import { Tasks } from './components/tasks/Tasks';
import { Landing } from './components/website/Landing';
import { Loader, Home, TrendingUp, FileText, Users, User, Monitor, Smartphone, Sun, Moon } from 'lucide-react';
import { isTelegramEnvironment, getStartParam, initTelegramApp } from './utils/telegram';

const App: React.FC = () => {
  const { user, token, setAuth, isLoading, error } = useAuthStore();
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState<'app' | 'website'>(isTelegramEnvironment() ? 'app' : 'website');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

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
    
    if (!token && !window.Telegram?.WebApp?.initData) {
      setAuth('session_auth_token', {
        id: 1001,
        telegram_id: 98765432,
        first_name: 'Investor',
        is_premium: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-amber-400">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-rose-500 p-6 text-center">
        <div className="card-antigravity max-w-sm border-rose-500/30 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-2 font-serif-luxury">Authentication Error</h2>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (viewMode === 'website') {
    return (
      <div className="transition-colors duration-300">
        <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 rounded-full p-1.5 shadow-2xl backdrop-blur-md">
          <button 
            onClick={() => setViewMode('website')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'website' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Monitor size={14} /> Website
          </button>
          <button 
            onClick={() => setViewMode('app')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'app' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Smartphone size={14} /> Mini App
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-slate-800 text-amber-400 hover:bg-slate-700 transition-all border border-slate-700 ml-1"
            title="Toggle Light/Dark Theme"
          >
            {themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
        <Landing onLaunchApp={() => setViewMode('app')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] font-sans text-slate-100 overflow-hidden relative">
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-full p-1.5 shadow-2xl backdrop-blur-md opacity-75 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setViewMode('website')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${viewMode === 'website' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Monitor size={12} /> Website
        </button>
        <button 
          onClick={() => setViewMode('app')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${viewMode === 'app' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Smartphone size={12} /> Mini App
        </button>
        <button
          onClick={toggleTheme}
          className="p-1 rounded-full bg-slate-800 text-amber-400 hover:bg-slate-700 transition-all border border-slate-700"
          title="Toggle Light/Dark Theme"
        >
          {themeMode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>
      <div className="h-full overflow-y-auto overflow-x-hidden pb-20">
        <main className="relative">
          {activeTab === 'home' && <Dashboard onNavigate={(tab: string) => setActiveTab(tab)} />}
          {activeTab === 'statistics' && <Mining />}
          {activeTab === 'history' && <History />}
          {activeTab === 'referrals' && <Referral />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'withdrawal' && <Withdrawal onBack={() => setActiveTab('home')} />}
          {activeTab === 'deposit' && <Deposit onBack={() => setActiveTab('home')} />}
          {activeTab === 'tasks' && <Tasks onBack={() => setActiveTab('home')} />}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#060913]/95 backdrop-blur-2xl border-t border-amber-400/20 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {[
            { id: 'home', icon: Home, label: 'Dashboard' },
            { id: 'statistics', icon: TrendingUp, label: 'Calculator' },
            { id: 'history', icon: FileText, label: 'History' },
            { id: 'referrals', icon: Users, label: 'Referrals' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center w-16 h-14 transition-all"
              >
                <div className={`relative flex items-center justify-center p-1 rounded-full transition-all duration-300 ${isActive ? 'shadow-[0_0_15px_rgba(0,245,212,0.4)]' : ''}`}>
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 ${isActive ? 'text-teal-300 scale-110' : 'text-slate-500 hover:text-slate-300'}`} 
                  />
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${isActive ? 'text-teal-300 font-bold font-serif-luxury' : 'text-slate-500'}`}>
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
