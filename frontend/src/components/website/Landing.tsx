import { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Lock, 
  ArrowUpRight,
  Sparkles,
  BarChart3,
  KeyRound,
  FileCheck,
  ArrowLeft,
  Activity,
  Menu,
  X,
  History,
  Share2,
  Copy,
  CheckCircle2,
  Filter,
  Terminal,
  Gift,
  ArrowDownLeft,
  Bell,
  Sliders,
  ChevronDown,
  Send,
  Wallet,
  Bot,
  Layers,
  UserCheck,
  Building2,
  Workflow,
  Headphones,
  Code2
} from 'lucide-react';
import { SpinWheelModal } from '../common/SpinWheelModal';
import { GiftBoxModal } from '../common/GiftBoxModal';
import { getTelegramDeepLink, openExternalLink, isTelegramEnvironment } from '../../utils/telegram';

class DecimalPrecise {
  private val: number;

  constructor(value: string | number) {
    this.val = typeof value === 'string' ? parseFloat(value || '0') : value;
  }

  mul(other: DecimalPrecise | number | string): DecimalPrecise {
    const multiplier = typeof other === 'object' ? other.val : (typeof other === 'string' ? parseFloat(other) : other);
    return new DecimalPrecise(this.val * multiplier);
  }

  toFixed(decimals: number = 8): string {
    if (isNaN(this.val)) return (0).toFixed(decimals);
    return this.val.toFixed(decimals);
  }
}

export const Landing = ({ onLaunchApp }: { onLaunchApp: () => void }) => {
  const [currentPage, setCurrentPage] = useState<
    'home' | 'features' | 'calculator' | 'security' | 'stats' | 'referral' | 'transactions' | 'tasks' | 'deposit' | 'withdrawal' | 'notifications' | 'admin' | 'profile'
  >('home');

  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);

  const [apiDiagnosticModal, setApiDiagnosticModal] = useState<{ title: string; data: Record<string, string> } | null>(null);

  const [contactSupportModalOpen, setContactSupportModalOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const [depositAmount, setDepositAmount] = useState('500');
  const [timeframe, setTimeframe] = useState('Month');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [txFilter, setTxFilter] = useState('all');
  const [securityModal, setSecurityModal] = useState<string | null>(null);
  const [spinWheelOpen, setSpinWheelOpen] = useState(false);
  const [giftBoxOpen, setGiftBoxOpen] = useState(false);
  const [websiteToast, setWebsiteToast] = useState<string | null>(null);

  const [miningRate, setMiningRate] = useState('0.50');
  const [minDeposit, setMinDeposit] = useState('3.00');
  const [minWithdrawal, setMinWithdrawal] = useState('3.00');
  const [announcementText, setAnnouncementText] = useState('System upgraded: Yield algorithms operating at peak efficiency.');

  const amountDecimal = new DecimalPrecise(depositAmount || '0');
  const dailyRateDecimal = new DecimalPrecise((parseFloat(miningRate) / 100).toString());
  const dailyReturn = amountDecimal.mul(dailyRateDecimal);

  const getMultiplier = (tf: string): number => {
    switch (tf) {
      case '1 day': return 1;
      case 'Week': return 7;
      case 'Month': return 30;
      case '3 months': return 90;
      case '1 year': return 365;
      default: return 30;
    }
  };

  const calculatedReturn = dailyReturn.mul(getMultiplier(timeframe)).toFixed(8);

  const showToast = (msg: string) => {
    setWebsiteToast(msg);
    setTimeout(() => setWebsiteToast(null), 3000);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSupportModalOpen(false);
    showToast('Support Ticket Submitted! Our team will reply shortly.');
    setSupportMessage('');
  };

  const mockTransactions = [
    { id: 'TX-98421', type: 'deposit', amount: '250.00000000 USDT', status: 'Confirmed', date: '2026-07-24 14:32' },
    { id: 'TX-98420', type: 'claim', amount: '12.45000000 USDT', status: 'Completed', date: '2026-07-24 12:15' },
    { id: 'TX-98419', type: 'referral', amount: '25.00000000 USDT', status: 'Credited', date: '2026-07-24 10:05' },
    { id: 'TX-98418', type: 'withdrawal', amount: '100.00000000 USDT', status: 'Confirmed', date: '2026-07-23 18:40' },
    { id: 'TX-98417', type: 'deposit', amount: '500.00000000 USDT', status: 'Confirmed', date: '2026-07-23 15:10' },
  ];

  const filteredTxs = txFilter === 'all' ? mockTransactions : mockTransactions.filter(t => t.type === txFilter);

  const copyReferralLink = () => {
    navigator.clipboard.writeText('https://t.me/VaultYieldBot?start=ref_89412');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const navigateTo = (page: typeof currentPage) => {
    setCurrentPage(page);
    setProductsDropdownOpen(false);
    setSolutionsDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 font-sans selection:bg-[#C18DB4] selection:text-slate-950 overflow-x-hidden transition-colors duration-300">
      
      <SpinWheelModal 
        isOpen={spinWheelOpen}
        onClose={() => setSpinWheelOpen(false)}
        onRewardWon={(prize) => showToast(`Lucky Wheel Prize Won: +${prize} USDT!`)}
      />

      <GiftBoxModal
        isOpen={giftBoxOpen}
        onClose={() => setGiftBoxOpen(false)}
        onRewardWon={(prize) => showToast(`Mystery Gift Opened: Won +${prize}!`)}
      />

      {}
      {apiDiagnosticModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-vault rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-400/30 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-serif-luxury text-amber-300 flex items-center gap-2">
                <Code2 size={18} /> {apiDiagnosticModal.title}
              </h3>
              <button onClick={() => setApiDiagnosticModal(null)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
              {Object.entries(apiDiagnosticModal.data).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-slate-800/50 last:border-none">
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-teal-300 font-bold">{val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setApiDiagnosticModal(null)} className="w-full btn-gold-vault py-3 rounded-xl text-xs font-bold font-serif-luxury">Close Live Telemetry Inspector</button>
          </div>
        </div>
      )}

      {}
      {contactSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-vault rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-400/30 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-serif-luxury text-slate-100 flex items-center gap-2">
                <Headphones size={20} className="text-purple-400" /> 24/7 Support Desk
              </h3>
              <button onClick={() => setContactSupportModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Your Email / Telegram Handle</label>
                <input 
                  type="text"
                  required
                  placeholder="user@domain.com or @handle"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Inquiry Subject</label>
                <input 
                  type="text"
                  required
                  placeholder="Deposit issue / Withdrawal question..."
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Description</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Provide details about your inquiry..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-400"
                />
              </div>

              <button 
                type="submit"
                className="w-full btn-gold-vault py-3.5 rounded-2xl text-xs font-bold font-serif-luxury uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Send size={14} /> Send Support Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {websiteToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles size={16} /> {websiteToast}
        </div>
      )}

      {}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#27425D] via-[#0E1B48] to-[#27425D] backdrop-blur-2xl border-b border-[#C18DB4]/40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <div 
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#C18DB4] via-[#E2CAD8] to-[#87A7D0] flex items-center justify-center text-[#0E1B48] font-bold text-base sm:text-lg shadow-[0_0_20px_rgba(193,141,180,0.4)]">
                <TrendingUp size={18} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-base sm:text-xl font-bold font-serif-luxury text-slate-100 tracking-wide">VEXTORAL MINING</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-300">
              <div className="relative">
                <button 
                  onClick={() => {
                    setProductsDropdownOpen(!productsDropdownOpen);
                    setSolutionsDropdownOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${productsDropdownOpen ? 'bg-amber-500/10 text-amber-300 border border-amber-400/30' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  Products <ChevronDown size={14} className={`transition-transform ${productsDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
              </div>

              <div className="relative">
                <button 
                  onClick={() => {
                    setSolutionsDropdownOpen(!solutionsDropdownOpen);
                    setProductsDropdownOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${solutionsDropdownOpen ? 'bg-amber-500/10 text-amber-300 border border-amber-400/30' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  Solutions <ChevronDown size={14} className={`transition-transform ${solutionsDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
              </div>

              <button onClick={() => navigateTo('calculator')} className="px-3.5 py-2 rounded-xl hover:bg-slate-800/80 hover:text-white transition-all">Yield Calculator</button>
              <button onClick={() => navigateTo('admin')} className="px-3.5 py-2 rounded-xl hover:bg-slate-800/80 hover:text-white transition-all">Admin Suite</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setContactSupportModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 hover:border-amber-400/40 transition-colors"
            >
              <Headphones size={14} className="text-amber-400" /> Contact Support
            </button>
            <button 
              onClick={onLaunchApp}
              className="btn-gold-vault px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold font-serif-luxury tracking-wider flex items-center gap-1.5"
            >
              <Send size={14} /> Open Mini App
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {}
        {productsDropdownOpen && (
          <div className="hidden lg:block fixed inset-x-0 top-16 sm:top-20 z-50 bg-[#0c0914]/98 backdrop-blur-3xl border-b border-amber-400/20 p-8 shadow-2xl animate-slide-down">
            <div className="max-w-7xl mx-auto grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-serif-luxury flex items-center gap-2">
                    <Zap size={14} /> CORE PLATFORM PRODUCTS &rarr;
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => navigateTo('deposit')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><ArrowDownLeft size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-amber-300">Deposit Gateway</h4><p className="text-[11px] text-slate-400 mt-0.5">TRC20 liquidity portal</p></div>
                  </div>
                  <div onClick={() => navigateTo('withdrawal')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform"><ArrowUpRight size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-purple-300">Instant Withdrawals</h4><p className="text-[11px] text-slate-400 mt-0.5">Automated TRC20 payouts</p></div>
                  </div>
                  <div onClick={() => navigateTo('calculator')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform"><BarChart3 size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-teal-300">Yield Calculator</h4><p className="text-[11px] text-slate-400 mt-0.5">Compute projected ROI</p></div>
                  </div>
                  <div onClick={() => navigateTo('tasks')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform"><Gift size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-purple-300">Tasks & Lucky Wheel</h4><p className="text-[11px] text-slate-400 mt-0.5">Daily gift box & wheel spin</p></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300 font-serif-luxury flex items-center gap-2">
                    <Layers size={14} /> FEATURED PRODUCTS & TOOLS (+500) &rarr;
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => navigateTo('referral')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Share2 size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-amber-300">Referral Program</h4><p className="text-[11px] text-slate-400 mt-0.5">2-Tier commission system</p></div>
                  </div>
                  <div onClick={() => navigateTo('transactions')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform"><History size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-teal-300">Transaction Stream</h4><p className="text-[11px] text-slate-400 mt-0.5">Live audit transaction log</p></div>
                  </div>
                  <div onClick={() => navigateTo('security')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform"><ShieldCheck size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-purple-300">Security Vaults</h4><p className="text-[11px] text-slate-400 mt-0.5">Cold storage multi-sig keys</p></div>
                  </div>
                  <div onClick={() => navigateTo('notifications')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Bell size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-amber-300">System Notifications</h4><p className="text-[11px] text-slate-400 mt-0.5">Live payout & security alerts</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {solutionsDropdownOpen && (
          <div className="hidden lg:block fixed inset-x-0 top-16 sm:top-20 z-50 bg-[#0c0914]/98 backdrop-blur-3xl border-b border-amber-400/20 p-8 shadow-2xl animate-slide-down">
            <div className="max-w-7xl mx-auto grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-serif-luxury flex items-center gap-2">
                    <Building2 size={14} /> INSTITUTIONAL & ENTERPRISE SOLUTIONS &rarr;
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => navigateTo('admin')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Sliders size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-amber-300">Admin Control Suite</h4><p className="text-[11px] text-slate-400 mt-0.5">Rate & parameter control</p></div>
                  </div>
                  <div onClick={() => navigateTo('stats')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform"><Activity size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-teal-300">Quantitative Analytics</h4><p className="text-[11px] text-slate-400 mt-0.5">Live TVL & telemetry stats</p></div>
                  </div>
                  <div onClick={() => navigateTo('security')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform"><Lock size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-purple-300">Non-Custodial Vaults</h4><p className="text-[11px] text-slate-400 mt-0.5">Multi-sig asset security</p></div>
                  </div>
                  <div onClick={() => navigateTo('profile')} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><UserCheck size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-amber-300">Account & KYC Compliance</h4><p className="text-[11px] text-slate-400 mt-0.5">Verified user identity</p></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300 font-serif-luxury flex items-center gap-2">
                    <Workflow size={14} /> DEVELOPER APIS & INTEGRATIONS &rarr;
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => {
                      if (isTelegramEnvironment()) {
                        onLaunchApp();
                      } else {
                        openExternalLink(getTelegramDeepLink('home'));
                        onLaunchApp();
                      }
                    }}
                    className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Send size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-amber-300">Telegram WebApp API</h4><p className="text-[11px] text-slate-400">Launch Telegram Mini App &rarr;</p></div>
                  </div>

                  <div 
                    onClick={() => navigateTo('deposit')}
                    className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-400/50 cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform"><Wallet size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-teal-300">USDT TRC20 Gateway</h4><p className="text-[11px] text-slate-400">Open TRC20 deposit portal &rarr;</p></div>
                  </div>

                  <div 
                    onClick={() => setSecurityModal('Smart Contract Audit Diagnostics')}
                    className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-400/50 cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform"><Terminal size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-purple-300">Web3.js Smart Contract</h4><p className="text-[11px] text-slate-400">Audit & multi-sig keys &rarr;</p></div>
                  </div>

                  <div 
                    onClick={() => navigateTo('notifications')}
                    className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Bot size={20} /></div>
                    <div><h4 className="text-xs font-bold text-slate-100 font-serif-luxury group-hover:text-amber-300">Automated Bot API</h4><p className="text-[11px] text-slate-400">Live webhook alerts &rarr;</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </nav>

      {}
      {currentPage === 'home' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E1B48]/80 border border-[#C18DB4]/40 text-[#E2CAD8] text-[10px] sm:text-xs font-bold font-serif-luxury tracking-wider shadow-lg backdrop-blur-md">
              <Sparkles size={13} className="text-[#C18DB4]" /> Next-Gen Quantitative USDT Yield Platform
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-luxury text-white tracking-tight leading-tight">
              Institutional Yield & Automated Mining
            </h1>

            <p className="text-[#E2CAD8] font-medium text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-2">
              Maximize your USDT holdings with real-time liquidity allocation, multi-tier referral rewards, and instant Telegram Mini App execution.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => {
                  if (isTelegramEnvironment()) {
                    onLaunchApp();
                  } else {
                    openExternalLink(getTelegramDeepLink('home'));
                    onLaunchApp();
                  }
                }}
                className="w-full sm:w-auto btn-gold-vault px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold font-serif-luxury tracking-wider flex items-center justify-center gap-2 shadow-2xl"
              >
                <Send size={16} /> Open Telegram Mini App &rarr;
              </button>
              <button 
                onClick={() => navigateTo('calculator')}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm transition-all text-center"
              >
                Open Calculator
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mt-16 sm:mt-24">
            <div onClick={() => navigateTo('deposit')} className="card-vault rounded-2xl sm:rounded-3xl p-5 border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all group">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform"><ArrowDownLeft size={18} /></div>
              <h3 className="text-base font-bold font-serif-luxury text-slate-100 mb-1">Deposit Gateway &rarr;</h3>
              <p className="text-xs text-slate-400">TRC20 deposit portal & projected yield calculation.</p>
            </div>

            <div onClick={() => navigateTo('withdrawal')} className="card-vault rounded-2xl sm:rounded-3xl p-5 border border-white/10 hover:border-teal-400/50 cursor-pointer transition-all group">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300 mb-3 group-hover:scale-110 transition-transform"><ArrowUpRight size={18} /></div>
              <h3 className="text-base font-bold font-serif-luxury text-slate-100 mb-1">Withdrawal Portal &rarr;</h3>
              <p className="text-xs text-slate-400">Instant payout portal with fee estimation.</p>
            </div>

            <div onClick={() => navigateTo('tasks')} className="card-vault rounded-2xl sm:rounded-3xl p-5 border border-white/10 hover:border-purple-400/50 cursor-pointer transition-all group">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-110 transition-transform"><Gift size={18} /></div>
              <h3 className="text-base font-bold font-serif-luxury text-slate-100 mb-1">Tasks & Wheel &rarr;</h3>
              <p className="text-xs text-slate-400">Daily gift box, spin wheel & social bounties.</p>
            </div>

            <div onClick={() => navigateTo('admin')} className="card-vault rounded-2xl sm:rounded-3xl p-5 border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all group">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform"><Sliders size={18} /></div>
              <h3 className="text-base font-bold font-serif-luxury text-slate-100 mb-1">Admin Panel &rarr;</h3>
              <p className="text-xs text-slate-400">Manage mining rates, deposits & announcements.</p>
            </div>
          </div>
        </div>
      )}

      {}
      {currentPage === 'deposit' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="card-vault rounded-3xl p-6 sm:p-8 space-y-5 border border-amber-400/30">
            <h1 className="text-2xl font-bold font-serif-luxury text-slate-100">USDT (TRC20) Deposit Portal</h1>
            <p className="text-xs text-slate-400">Minimum Deposit: 3.00 USDT. Deposits are credited after 12 blockchain confirmations.</p>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-amber-300">TRC20 Deposit Wallet Address</label>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value="TYu7x92mA18xPzQmLVn94KkLpW289s" className="bg-transparent font-mono text-xs text-white flex-1 outline-none font-bold" />
                <button onClick={() => showToast('Deposit Address Copied!')} className="btn-gold-vault px-4 py-2 rounded-xl text-xs font-bold"><Copy size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {currentPage === 'withdrawal' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="card-vault rounded-3xl p-6 sm:p-8 space-y-5 border border-purple-400/30">
            <h1 className="text-2xl font-bold font-serif-luxury text-slate-100">Instant Withdrawal Portal</h1>
            <p className="text-xs text-slate-400">Minimum Withdrawal: 3.00 USDT. Network Fee: 1.00 USDT.</p>
            <form onSubmit={(e) => { e.preventDefault(); showToast('Withdrawal Request Submitted!'); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Withdrawal Amount (USDT)</label>
                <input type="number" step="0.01" min="3.00" placeholder="50.00" required className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Destination TRC20 Wallet Address</label>
                <input type="text" placeholder="T..." required className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-amber-400 font-mono" />
              </div>
              <button type="submit" className="w-full btn-gold-vault py-3.5 rounded-2xl text-xs font-bold font-serif-luxury">Submit Withdrawal Request</button>
            </form>
          </div>
        </div>
      )}

      {}
      {currentPage === 'tasks' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-serif-luxury text-slate-100">Tasks & Rewards Hub</h1>
            <p className="text-xs text-slate-400">Complete social tasks, unlock daily gift boxes, and spin the wheel for USDT rewards.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onClick={() => setGiftBoxOpen(true)} className="card-vault rounded-3xl p-6 border border-amber-400/30 cursor-pointer hover:scale-98 transition-transform space-y-2">
              <div className="text-3xl">🎁</div>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100">Daily Gift Box</h3>
              <p className="text-xs text-slate-400">Claim consecutive login bonus payouts &rarr;</p>
            </div>
            <div onClick={() => setSpinWheelOpen(true)} className="card-vault rounded-3xl p-6 border border-teal-400/30 cursor-pointer hover:scale-98 transition-transform space-y-2">
              <div className="text-3xl">🎡</div>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100">Lucky Spin Wheel</h3>
              <p className="text-xs text-slate-400">Spin wheel daily to win up to 10.00 USDT &rarr;</p>
            </div>
          </div>
        </div>
      )}

      {}
      {currentPage === 'admin' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="card-vault rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-400/40">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-bold font-serif-luxury text-amber-300 flex items-center gap-2"><Sliders size={22} /> Platform Admin Control Suite</h1>
                <p className="text-xs text-slate-400">Configure global mining rates, minimum deposit/withdrawal parameters, and system announcements.</p>
              </div>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-400/20">Admin Authorization Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">Daily Mining Rate (%)</label>
                <input type="text" value={miningRate} onChange={(e) => setMiningRate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-bold outline-none" />
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">Minimum Deposit (USDT)</label>
                <input type="text" value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-teal-300 font-bold outline-none" />
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">Minimum Withdrawal (USDT)</label>
                <input type="text" value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-purple-300 font-bold outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Global Broadcast Announcement</label>
              <textarea rows={3} value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 outline-none" />
            </div>

            <button onClick={() => showToast('Admin System Settings Updated!')} className="w-full btn-gold-vault py-3.5 rounded-2xl text-xs font-bold font-serif-luxury">Save Admin System Configurations</button>
          </div>
        </div>
      )}

      {}
      {currentPage === 'referral' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-serif-luxury text-slate-100">Multi-Tier Referral Network</h1>
            <p className="text-slate-400 text-xs">Invite investors and earn automated commissions paid straight to your balance pool.</p>
          </div>

          <div className="card-vault rounded-3xl p-6 border border-white/10 space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Your Telegram Referral Link</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
                <input type="text" readOnly value="https://t.me/VaultYieldBot?start=ref_89412" className="bg-transparent text-xs text-amber-300 font-mono flex-1 outline-none px-3 font-bold" />
                <button onClick={copyReferralLink} className="btn-gold-vault px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">{copiedLink ? <CheckCircle2 size={14} /> : <Copy size={14} />}{copiedLink ? 'Copied' : 'Copy'}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Level 1 Commission</span>
                <p className="text-2xl font-bold font-serif-luxury text-slate-100">10.00%</p>
                <p className="text-xs text-slate-400">Direct referrals deposit & claim rewards commission.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">Level 2 Commission</span>
                <p className="text-2xl font-bold font-serif-luxury text-slate-100">5.00%</p>
                <p className="text-xs text-slate-400">Indirect referrals network activity commission.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {currentPage === 'notifications' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-serif-luxury text-slate-100">System Notification Stream</h1>
            <p className="text-slate-400 text-xs">Real-time alerts for deposit confirmations, mining rewards, and security updates.</p>
          </div>
          <div className="card-vault rounded-3xl p-6 border border-white/10 space-y-3">
            {[
              { title: 'Deposit Confirmed', msg: 'Your 250.00 USDT deposit was confirmed on TRC20 blockchain.', time: '10 mins ago' },
              { title: 'Mining Reward Credited', msg: 'Daily yield payout of 1.25 USDT credited to unclaimed pool.', time: '1 hour ago' },
              { title: 'Referral Bonus', msg: 'User @crypto_dev joined via your link. You earned 25.00 USDT.', time: '3 hours ago' },
              { title: 'Security Alert', msg: 'New login session verified via Telegram WebApp authentication.', time: '5 hours ago' }
            ].map((n, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 font-serif-luxury">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{n.msg}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {currentPage === 'profile' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="card-vault rounded-3xl p-6 sm:p-8 space-y-5 border border-amber-400/30">
            <h1 className="text-2xl font-bold font-serif-luxury text-slate-100">Investor Profile & KYC Verification</h1>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Account Username:</span>
                <span className="text-amber-300 font-bold">@crypto_investor</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">KYC Status:</span>
                <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-400/20">Verified Tier 2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bound Wallet:</span>
                <span className="text-slate-200 font-mono">TYu7x92mA18xPzQmLVn94KkLpW289s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {currentPage === 'transactions' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-serif-luxury text-slate-100">Live Transaction Stream</h1>
            <p className="text-slate-400 text-xs">Real-time audit log of platform deposits, claims, withdrawals, and commissions.</p>
          </div>

          <div className="card-vault rounded-3xl p-6 border border-white/10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Filter By Type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'deposit', 'claim', 'withdrawal', 'referral'].map((filter) => (
                  <button key={filter} onClick={() => setTxFilter(filter)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${txFilter === filter ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>{filter}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTxs.map(tx => (
                <div key={tx.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-amber-400/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-amber-300">{tx.id}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{tx.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{tx.date}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-slate-100 font-mono">{tx.amount}</p>
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-400/20">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      {currentPage === 'security' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
          {securityModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="card-vault rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-400/30 space-y-4 animate-scale-up">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold font-serif-luxury text-amber-300">{securityModal}</h3>
                  <button onClick={() => setSecurityModal(null)} className="p-1 text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                  <p className="text-teal-400 font-bold flex items-center gap-1.5"><Terminal size={14} /> AUDIT STATUS: VERIFIED</p>
                  <p>Encrypted Keys: AES-256-GCM</p>
                  <p>Gateway Latency: 42ms</p>
                  <p>Cold Storage Multi-Sig: 3/5 Signatures Active</p>
                </div>
                <button onClick={() => setSecurityModal(null)} className="w-full btn-gold-vault py-3 rounded-xl text-xs font-bold">Close Verification Window</button>
              </div>
            </div>
          )}
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-3xl font-bold font-serif-luxury text-slate-100">Enterprise Security Infrastructure</h1>
            <p className="text-slate-400 text-xs">Click any security module below to inspect real-time audit protocols and verification data.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
            <div onClick={() => setSecurityModal('Cold Storage Vault Diagnostics')} className="card-vault rounded-3xl p-6 border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><KeyRound size={22} /></div>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100 flex items-center justify-between">Cold Storage Vaults <ArrowUpRight size={16} className="text-amber-400" /></h3>
              <p className="text-slate-400 text-xs leading-relaxed">98% of asset reserves are kept offline in isolated multi-signature cold wallets.</p>
            </div>
            <div onClick={() => setSecurityModal('Encrypted Gateway Diagnostics')} className="card-vault rounded-3xl p-6 border border-white/10 hover:border-teal-400/50 cursor-pointer transition-all space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform"><Lock size={22} /></div>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100 flex items-center justify-between">Encrypted Gateway <ArrowUpRight size={16} className="text-teal-300" /></h3>
              <p className="text-slate-400 text-xs leading-relaxed">End-to-end encrypted API routing and automated TRC20 multi-confirmation checks.</p>
            </div>
            <div onClick={() => setSecurityModal('Smart Audit Protocol Diagnostics')} className="card-vault rounded-3xl p-6 border border-white/10 hover:border-purple-400/50 cursor-pointer transition-all space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform"><FileCheck size={22} /></div>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-100 flex items-center justify-between">Audited Smart Logic <ArrowUpRight size={16} className="text-purple-300" /></h3>
              <p className="text-slate-400 text-xs leading-relaxed">Real-time audit logging and continuous security validation against automated exploit vectors.</p>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'calculator' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="card-vault rounded-3xl p-6 sm:p-12 border border-amber-400/30 shadow-2xl relative overflow-hidden space-y-5">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-slate-100 text-center">Interactive Yield Calculator</h1>
            <div className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deposit Capital (USDT)</label>
                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-slate-900 border border-amber-500/30 rounded-2xl py-3.5 px-4 text-white font-bold text-xl outline-none focus:border-amber-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {['1 day', 'Week', 'Month', '3 months', '1 year'].map(tab => (
                  <button key={tab} onClick={() => setTimeframe(tab)} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border ${timeframe === tab ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>{tab}</button>
                ))}
              </div>
              <div className="border border-dashed border-teal-400/40 rounded-2xl p-6 text-center bg-teal-400/5">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">ESTIMATED YIELD OUTPUT</p>
                <div className="text-teal-300 text-3xl font-bold font-serif-luxury">+ {calculatedReturn} USDT</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'stats' && (
        <div className="animate-fade-in pt-28 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"><ArrowLeft size={16} /> Back to Home</button>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-serif-luxury text-slate-100">Live Network Statistics</h1>
            <p className="text-xs text-slate-400">Real-time metrics from our liquidity allocation protocol.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-4">
            <div className="card-vault rounded-2xl p-6 text-center border border-white/10"><p className="text-3xl font-bold font-serif-luxury text-slate-100">$48.2M+</p><p className="text-xs text-slate-400 mt-2 uppercase tracking-wider">Total Value Locked</p></div>
            <div className="card-vault rounded-2xl p-6 text-center border border-white/10"><p className="text-3xl font-bold font-serif-luxury text-teal-300">99.98%</p><p className="text-xs text-slate-400 mt-2 uppercase tracking-wider">System Uptime</p></div>
            <div className="card-vault rounded-2xl p-6 text-center border border-white/10"><p className="text-3xl font-bold font-serif-luxury text-amber-400">145,000+</p><p className="text-xs text-slate-400 mt-2 uppercase tracking-wider">Active Investors</p></div>
            <div className="card-vault rounded-2xl p-6 text-center border border-white/10"><p className="text-3xl font-bold font-serif-luxury text-slate-100">0.00s</p><p className="text-xs text-slate-400 mt-2 uppercase tracking-wider">Instant Settlements</p></div>
          </div>
        </div>
      )}

      {}
      <footer className="py-10 sm:py-12 border-t border-slate-800 text-center text-xs text-slate-500 space-y-3 px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 font-medium">
          <button onClick={() => navigateTo('home')} className="hover:text-slate-300">Home</button>
          <button onClick={() => navigateTo('deposit')} className="hover:text-slate-300">Deposit</button>
          <button onClick={() => navigateTo('withdrawal')} className="hover:text-slate-300">Withdrawal</button>
          <button onClick={() => navigateTo('calculator')} className="hover:text-slate-300">Calculator</button>
          <button onClick={() => navigateTo('referral')} className="hover:text-slate-300">Referrals</button>
          <button onClick={() => navigateTo('tasks')} className="hover:text-slate-300">Tasks & Rewards</button>
          <button onClick={() => navigateTo('transactions')} className="hover:text-slate-300">Transactions</button>
          <button onClick={() => navigateTo('notifications')} className="hover:text-slate-300">Notifications</button>
          <button onClick={() => navigateTo('stats')} className="hover:text-slate-300">Stats</button>
          <button onClick={() => navigateTo('security')} className="hover:text-slate-300">Security</button>
          <button onClick={() => navigateTo('admin')} className="hover:text-slate-300">Admin Panel</button>
        </div>
        <p>&copy; 2026 Vault Yield Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
};
