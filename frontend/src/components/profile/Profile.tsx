import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useI18nStore, type LanguageCode } from '../../store/i18nStore';
import { 
  Globe, ChevronRight, ArrowLeft, CheckCircle2, Send, HelpCircle, LifeBuoy, 
  ShieldCheck, Moon, Sun, Bell, Lock, QrCode, ArrowDownLeft, ArrowUpRight, Pickaxe, Copy, Check, KeyRound
} from 'lucide-react';

interface ProfileProps {
  onNavigate?: (tab: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage, t } = useI18nStore();

  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(() => {
    return localStorage.getItem('2fa_enabled') === 'true';
  });
  const [totpSecret] = useState<string>('VXTR-88A1-99C2-44X7');
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpCopied, setTotpCopied] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: 'Русский' }
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const faqs = [
    { q: 'How does VextoralMining token mining work?', a: 'Users with min 100 VX tokens automatically earn continuous daily USDT yield at the admin configured rate.' },
    { q: 'What are the supported deposit & withdrawal networks?', a: 'Deposits and withdrawals are supported via USDT BEP20 and TON networks.' },
    { q: 'Is there a maximum VX token purchase limit?', a: 'No, users can buy unlimited VX tokens provided they have minimum 100 VX per transaction.' },
    { q: 'Is my Telegram Account automatically verified?', a: 'Yes, your account is automatically verified server-side via Telegram initData authentication.' }
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

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setTotpCopied(true);
    setTimeout(() => setTotpCopied(false), 2000);
  };

  const handleEnable2FA = () => {
    if (totpCode.trim().length < 6) {
      setTotpError('Please enter a valid 6-digit authenticator code');
      return;
    }
    setIsVerifying2FA(true);
    setTotpError('');

    setTimeout(() => {
      setIsVerifying2FA(false);
      setIs2FAEnabled(true);
      localStorage.setItem('2fa_enabled', 'true');
      setTotpCode('');
    }, 1000);
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    localStorage.setItem('2fa_enabled', 'false');
    setTotpCode('');
    setTotpError('');
  };

  return (
    <div className="animate-fade-in p-4 sm:p-6 pt-4 pb-28 max-w-md mx-auto space-y-4">
      
      {activeSubView === 'lang' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-4 border border-[#C18DB4]/30">
            <h2 className="text-xl font-bold text-white font-serif-luxury">{t.language}</h2>

            <div className="space-y-2 pt-2">
              {languages.map(lang => (
                <div 
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setActiveSubView(null);
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    language === lang.code 
                      ? 'bg-[#0E1B48] border-[#C18DB4] text-white' 
                      : 'bg-[#0E1B48]/60 border-[#C18DB4]/30 text-[#E2CAD8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs font-bold">{lang.name}</span>
                  </div>
                  {language === lang.code && <CheckCircle2 size={18} className="text-[#C18DB4]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'privacy' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-4 border border-[#C18DB4]/30">
            <h2 className="text-xl font-bold text-white font-serif-luxury">{t.privacy}</h2>
            <div className="space-y-3 text-xs text-[#E2CAD8] leading-relaxed">
              <p>VextoralMining is committed to protecting your privacy. We use Telegram WebApp initData HMAC-SHA256 authentication to verify user identity strictly server-side.</p>
              <p>No personal passwords or financial keys are stored. All wallet interactions execute via secure blockchain nodes (USDT BEP20 & TON).</p>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'authenticator' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-5 border border-[#C18DB4]/30 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0E1B48] border border-[#C18DB4]/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
              <ShieldCheck size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white font-serif-luxury">{t.authenticator} Security</h2>
              <p className="text-xs text-[#E2CAD8]">Protect payouts and account actions with 2FA Authenticator (Google Authenticator / Authy).</p>
            </div>

            {is2FAEnabled ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 size={14} /> 2FA Protection Active
                  </div>
                  <p className="text-xs text-emerald-100">Your account payouts are protected with 2FA verification.</p>
                </div>

                <button 
                  onClick={handleDisable2FA}
                  className="w-full py-3.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition-colors"
                >
                  Disable 2FA Protection
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1 text-left">
                <div className="p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl space-y-2">
                  <label className="text-[11px] font-bold text-[#87A7D0] uppercase tracking-wider block">1. 2FA Secret Key</label>
                  <div className="flex items-center justify-between bg-[#0E1B48]/80 p-2.5 rounded-xl border border-[#C18DB4]/20">
                    <span className="text-xs font-mono font-bold text-amber-300">{totpSecret}</span>
                    <button 
                      onClick={handleCopySecret}
                      className="p-1.5 rounded-lg bg-[#0E1B48] text-[#E2CAD8] hover:text-white border border-[#C18DB4]/30"
                    >
                      {totpCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl space-y-2">
                  <label className="text-[11px] font-bold text-[#87A7D0] uppercase tracking-wider block">2. Enter 6-Digit Code</label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={totpCode}
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 bg-[#0E1B48]/80 border border-[#C18DB4]/40 rounded-xl text-white font-mono text-center font-bold tracking-widest text-lg focus:outline-none"
                    />
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87A7D0]" />
                  </div>
                  {totpError && <p className="text-[11px] text-rose-300 font-bold">{totpError}</p>}
                </div>

                <button 
                  onClick={handleEnable2FA}
                  disabled={isVerifying2FA}
                  className="w-full py-3.5 btn-gold-vault text-xs font-extrabold rounded-2xl uppercase tracking-wider shadow-xl flex items-center justify-center gap-2"
                >
                  {isVerifying2FA ? 'Verifying Code...' : 'Enable 2FA Protection'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {activeSubView === 'faq' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-4 border border-[#C18DB4]/30">
            <h2 className="text-xl font-bold text-white font-serif-luxury">{t.faq}</h2>
            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl p-4 space-y-1">
                  <h4 className="text-xs font-bold text-white">{faq.q}</h4>
                  <p className="text-[11px] text-[#E2CAD8] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'support' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-4 border border-[#C18DB4]/30">
            <h2 className="text-xl font-bold text-white font-serif-luxury">Official Community & Support</h2>
            <p className="text-xs text-[#E2CAD8]">Join our official community channel for announcements, updates, and 24/7 member assistance.</p>

            <a
              href="https://t.me/vextoralcomunity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-gold-vault py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
            >
              <Send size={16} /> Join Official Community (@vextoralcomunity)
            </a>

            <div className="border-t border-[#C18DB4]/20 pt-4">
              <h4 className="text-xs font-bold text-white mb-2">Or submit a support inquiry:</h4>
              {ticketSent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Inquiry Submitted</h4>
                  <p className="text-xs text-emerald-200">Our team will respond in the official community chat.</p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-3">
                  <textarea 
                    rows={3}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your question or issue..."
                    className="w-full bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl p-3 text-xs text-white outline-none"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#0E1B48] text-[#87A7D0] border border-[#C18DB4]/30 text-xs font-bold hover:bg-[#1A285A]"
                  >
                    Submit Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {!activeSubView && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0E1B48]/60 p-3 rounded-2xl border border-[#C18DB4]/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C18DB4] via-[#87A7D0] to-emerald-400 p-[2px] shadow-lg relative">
                <div className="w-full h-full rounded-full bg-[#0E1B48] flex items-center justify-center text-white font-bold text-lg border border-[#C18DB4]/30">
                  {user?.first_name ? user.first_name[0].toUpperCase() : 'M'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-sky-500 text-white rounded-full p-0.5 shadow-md">
                  <CheckCircle2 size={14} className="fill-sky-500 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold text-white font-serif-luxury tracking-wide">
                    {user?.first_name || 'Member'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-bold">
                    <CheckCircle2 size={10} /> {t.verified}
                  </span>
                </div>
                <p className="text-[11px] text-[#87A7D0]">ID: {user?.telegram_id || user?.id || '8140274501'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-extrabold text-[#C18DB4] font-serif-luxury tracking-wide">VextoralMining</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button 
              onClick={() => onNavigate?.('deposit')}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-400/40 text-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <ArrowDownLeft size={14} className="text-sky-300" /> + {t.deposit}
            </button>

            <div className="py-2 px-3 rounded-2xl bg-[#0E1B48] border border-[#C18DB4]/30 text-center">
              <span className="text-[9px] text-[#87A7D0] uppercase font-bold block">USDT</span>
              <span className="text-xs font-bold text-white">${Number(user?.balance_usdt || 0).toFixed(2)}</span>
            </div>

            <div className="py-2 px-3 rounded-2xl bg-[#0E1B48] border border-[#C18DB4]/30 text-center">
              <span className="text-[9px] text-[#87A7D0] uppercase font-bold block">VX TOKENS</span>
              <span className="text-xs font-bold text-amber-300">{Number(user?.balance_vx || 0)} VX</span>
            </div>

            <button 
              onClick={() => onNavigate?.('withdrawal')}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <ArrowUpRight size={14} className="text-purple-300" /> {t.withdraw}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0E1B48] via-purple-900/60 to-[#C18DB4]/40 border border-[#C18DB4]/50 shadow-lg space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">$</span>
              <h4 className="text-xs font-extrabold text-white font-serif-luxury">Increase balance to 100 VX</h4>
            </div>
            <p className="text-[11px] text-[#E2CAD8] pl-8">Your income will speed up to 1.5% per day continuously.</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#E2CAD8] px-1">
            <Pickaxe size={14} className="text-amber-400" />
            <span>Invited by:</span>
            <span className="font-bold text-white">⛏️ {user?.referrer_name || 'Vextoral Official'}</span>
          </div>

          <div className="card-vault rounded-3xl p-3 border border-[#C18DB4]/30 space-y-2">
            <div 
              onClick={() => setActiveSubView('authenticator')}
              className="flex items-center justify-between p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer hover:border-[#C18DB4]"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">{t.authenticator}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${is2FAEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                  {is2FAEnabled ? '2FA Enabled' : 'Setup 2FA'}
                </span>
                <QrCode size={16} className="text-[#87A7D0]" />
              </div>
            </div>

            <div 
              onClick={() => setActiveSubView('lang')}
              className="flex items-center justify-between p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer hover:border-[#C18DB4]"
            >
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#87A7D0]" />
                <span className="text-xs font-bold text-white">{t.language}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#E2CAD8]">{currentLangObj.flag} {currentLangObj.name}</span>
                <ChevronRight size={16} className="text-[#E2CAD8]" />
              </div>
            </div>

            <div 
              onClick={toggleTheme}
              className="flex items-center justify-between p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer hover:border-[#C18DB4]"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={18} className="text-amber-400" /> : <Sun size={18} className="text-amber-400" />}
                <span className="text-xs font-bold text-white">{t.theme}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#E2CAD8]">{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
                <ChevronRight size={16} className="text-[#E2CAD8]" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-purple-400" />
                <span className="text-xs font-bold text-white">{t.notifications}</span>
              </div>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>

            <div 
              onClick={() => setActiveSubView('privacy')}
              className="flex items-center justify-between p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer hover:border-[#C18DB4]"
            >
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-[#87A7D0]" />
                <span className="text-xs font-bold text-white">{t.privacy}</span>
              </div>
              <ChevronRight size={16} className="text-[#E2CAD8]" />
            </div>

            <div 
              onClick={() => setActiveSubView('faq')}
              className="flex items-center justify-between p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer hover:border-[#C18DB4]"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-[#87A7D0]" />
                <span className="text-xs font-bold text-white">{t.faq}</span>
              </div>
              <ChevronRight size={16} className="text-[#E2CAD8]" />
            </div>

            <div 
              onClick={() => setActiveSubView('support')}
              className="flex items-center justify-between p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer hover:border-[#C18DB4]"
            >
              <div className="flex items-center gap-3">
                <LifeBuoy size={18} className="text-[#87A7D0]" />
                <span className="text-xs font-bold text-white">Official Community & Support</span>
              </div>
              <ChevronRight size={16} className="text-[#E2CAD8]" />
            </div>
          </div>

          <div 
            onDoubleClick={() => {
              const pin = prompt('Enter Admin Master PIN to unlock admin mode:');
              if (pin === 'vextoral2026' || pin === 'admin123') {
                if (onNavigate) onNavigate('admin');
              }
            }}
            className="text-center text-[10px] text-[#87A7D0]/40 pt-2 cursor-pointer select-none"
          >
            VextoralMining v2.4.0 (Production)
          </div>
        </div>
      )}

    </div>
  );
};
