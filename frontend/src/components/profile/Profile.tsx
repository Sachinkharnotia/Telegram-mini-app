import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  Shield, 
  Globe, 
  Moon, 
  Bell, 
  Lock, 
  HelpCircle, 
  LifeBuoy, 
  ChevronRight,
  Maximize,
  Pickaxe,
  ArrowLeft,
  CheckCircle2,
  Send,
  KeyRound,
  Sun
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const faqs = [
    { q: 'How does real-time mining work?', a: 'Mining rewards are calculated automatically based on your active USDT deposit balance and continuous allocation rate.' },
    { q: 'What is the minimum deposit & withdrawal limit?', a: 'The minimum threshold for both deposits and withdrawals is 3.00 USDT.' },
    { q: 'How do referral commissions get paid?', a: 'Referral commissions are credited instantly to your balance upon team members completing deposits or claims.' },
    { q: 'How long do TRC20 withdrawals take?', a: 'Withdrawals are processed automatically via automated gateway confirmation, typically completing within minutes.' }
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketMessage.trim()) {
      setTicketSent(true);
      setTimeout(() => {
        setTicketSent(false);
        setTicketMessage('');
      }, 3000);
    }
  };

  return (
    <div className="animate-fade-in p-4 sm:p-6 pt-6 pb-28 max-w-md mx-auto">
      
      {}
      {activeSubView === 'auth' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-antigravity rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <KeyRound size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-100 font-serif-luxury">Two-Factor Authenticator</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enhance account security by linking Google Authenticator or Telegram 2FA keys for withdrawal authorizations.
            </p>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Status</span>
                <span className="text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Verification Method</span>
                <span className="text-slate-200 font-bold">Telegram Authenticator</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveSubView(null)}
              className="w-full btn-gold-antigravity py-3.5 rounded-2xl text-xs font-bold font-serif-luxury"
            >
              Save Security Configuration
            </button>
          </div>
        </div>
      )}

      {}
      {activeSubView === 'lang' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-antigravity rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-100 font-serif-luxury">Select Display Language</h2>
            <p className="text-xs text-slate-400">Choose your preferred language for the platform interface.</p>

            <div className="space-y-2 pt-2">
              {languages.map(lang => (
                <div 
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.name);
                    setActiveSubView(null);
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedLanguage === lang.name ? 'bg-amber-500/10 border-amber-400/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-bold">{lang.name}</span>
                  </div>
                  {selectedLanguage === lang.name && <CheckCircle2 size={18} className="text-amber-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      {activeSubView === 'privacy' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-antigravity rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-100 font-serif-luxury">Privacy & Data Policy</h2>
            <div className="text-xs text-slate-400 space-y-3 leading-relaxed max-h-96 overflow-y-auto pr-2">
              <p>
                <strong>1. Data Encryption:</strong> All user account information, TRC20 wallet addresses, and transaction logs are stored with end-to-end encryption.
              </p>
              <p>
                <strong>2. Authentication Security:</strong> Authentication is handled natively through verified Telegram WebApp initData HMAC-SHA256 signatures.
              </p>
              <p>
                <strong>3. Non-Custodial Safeguards:</strong> Assets are protected by cold storage multi-signature vault architecture with strict audit compliance.
              </p>
              <p>
                <strong>4. Information Retention:</strong> Transaction records are logged for automated audit verification and compliance purposes.
              </p>
            </div>
          </div>
        </div>
      )}

      {}
      {activeSubView === 'faq' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-antigravity rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-100 font-serif-luxury">Frequently Asked Questions</h2>
            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-300">{faq.q}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      {activeSubView === 'support' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-antigravity rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-100 font-serif-luxury">Help & Support Desk</h2>
            <p className="text-xs text-slate-400">Submit a support request directly to our 24/7 technical team.</p>

            {ticketSent ? (
              <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 text-center space-y-2">
                <CheckCircle2 size={32} className="text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-100">Ticket Submitted</h4>
                <p className="text-xs text-slate-400">A support representative will reply in your Telegram chat shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Inquiry Details</label>
                  <textarea 
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full btn-gold-antigravity py-3.5 rounded-2xl text-xs font-bold font-serif-luxury flex items-center justify-center gap-2"
                >
                  <Send size={14} /> Send Support Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {}
      {!activeSubView && (
        <div className="space-y-6">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-[2px] shadow-lg">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-400 font-bold text-xl border border-slate-700">
                  {user?.first_name ? user.first_name[0] : 'U'}
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 font-serif-luxury tracking-wide">
                  {user?.first_name || 'Account Profile'}
                </h1>
                <p className="text-xs text-slate-400 font-medium">ID: {user?.telegram_id || '98765432'}</p>
              </div>
            </div>
          </header>

          <div className="card-antigravity rounded-3xl p-5 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Referral Tier:</span>
              <span className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Pickaxe size={14} className="text-amber-400" />
                Standard Tier Investor
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              
              <div 
                onClick={() => setActiveSubView('auth')}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-2xl transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                    <Shield size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Security & Authenticator</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Maximize size={16} />
                  <ChevronRight size={16} />
                </div>
              </div>

              <div 
                onClick={() => setActiveSubView('lang')}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-2xl transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                    <Globe size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">{selectedLanguage}</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>

              <div 
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-2xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                    <Bell size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Notifications</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications(!notifications);
                  }} 
                  className={`w-10 h-6 rounded-full transition-colors relative ${notifications ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>

              <div 
                onClick={() => setActiveSubView('privacy')}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-2xl transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                    <Lock size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Privacy Policy</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>

              <div 
                onClick={() => setActiveSubView('faq')}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-2xl transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                    <HelpCircle size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Frequently Asked Questions</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>

              <div 
                onClick={() => setActiveSubView('support')}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-2xl transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                    <LifeBuoy size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Help & Support Desk</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
