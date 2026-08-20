import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Pickaxe, 
  Sparkles, 
  ChevronDown, 
  Wallet,
  ChevronRight,
  Gift,
  Compass,
  Award,
  ShoppingCart,
  Zap,
  Clock,
  Activity
} from 'lucide-react';
import { SpinWheelModal } from '../common/SpinWheelModal';
import { GiftBoxModal } from '../common/GiftBoxModal';
import { AdminPanel } from '../admin/AdminPanel';

export const Dashboard = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { user, updateBalance, fetchUserBalance } = useAuthStore();
  const [engineSettings, setEngineSettings] = useState({
    vxPriceUsdt: 0.10,
    dailyYieldRate: 0.015,
    minVxMining: 100
  });

  const [unclaimedYield, setUnclaimedYield] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const walletBalance = Number(user?.balance_usdt || 0);
  const vxBalance = Number(user?.balance_vx || 0);
  const [expandActivities, setExpandActivities] = useState(true);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [buyVxModalOpen, setBuyVxModalOpen] = useState(false);
  const [buyVxInput, setBuyVxInput] = useState('100');
  const [buyVxMsg, setBuyVxMsg] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    fetchUserBalance();
    const interval = setInterval(() => {
      fetchUserBalance();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('platform_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          const p = parsed.mining?.vx_price_usdt || parsed.vx_price_usdt || 0.10;
          const y = parsed.mining?.daily_yield_rate || parsed.daily_yield_rate || 1.5;
          const minVx = parsed.mining?.min_mining_power || 100;
          const numY = Number(y) < 1 ? Number(y) : Number(y) / 100;
          setEngineSettings({
            vxPriceUsdt: Number(p),
            dailyYieldRate: numY,
            minVxMining: Number(minVx)
          });
        }
      } catch {}
    };
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  const isEligibleToMine = vxBalance >= engineSettings.minVxMining;
  const capitalValue = vxBalance * engineSettings.vxPriceUsdt;
  const dailyUsdtYield = isEligibleToMine ? capitalValue * engineSettings.dailyYieldRate : 0;
  const hourlyUsdtYield = dailyUsdtYield / 24;

  useEffect(() => {
    if (!localStorage.getItem('vx_last_claim_ts')) {
      localStorage.setItem('vx_last_claim_ts', (Date.now() - 7200000).toString());
    }
  }, []);

  useEffect(() => {
    if (!isEligibleToMine) {
      setUnclaimedYield(0);
      setElapsedSeconds(0);
      return;
    }

    const updateAccrual = () => {
      const lastClaimTs = localStorage.getItem('vx_last_claim_ts') 
        ? parseInt(localStorage.getItem('vx_last_claim_ts') as string, 10) 
        : Date.now();
      const elapsed = Math.max(0, (Date.now() - lastClaimTs) / 1000);
      const exactAccrued = elapsed * (dailyUsdtYield / 86400);
      setElapsedSeconds(elapsed);
      setUnclaimedYield(exactAccrued);
    };

    updateAccrual();
    const interval = setInterval(updateAccrual, 100);
    return () => clearInterval(interval);
  }, [isEligibleToMine, dailyUsdtYield]);

  const formatElapsedTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
  };

  const cycleProgress = Math.min(100, (elapsedSeconds / 86400) * 100);

  const handleClaim = () => {
    if (unclaimedYield > 0) {
      setIsClaiming(true);
      const claimAmount = parseFloat(unclaimedYield.toFixed(4));
      updateBalance(claimAmount, 0, { type: 'mining_yield', title: 'VX Yield Claim' });
      localStorage.setItem('vx_last_claim_ts', Date.now().toString());
      setUnclaimedYield(0);
      setElapsedSeconds(0);
      setTimeout(() => {
        setIsClaiming(false);
      }, 600);

      const API_URL = 'https://backend-ten-amber-99.vercel.app';
      fetch(`${API_URL}/api/mining/claim-yield`, { method: 'POST' }).catch(() => {
        fetch('/api/mining/claim-yield', { method: 'POST' }).catch(() => {});
      });
    }
  };

  const handleBuyVX = async () => {
    const vxAmt = parseFloat(buyVxInput);
    if (isNaN(vxAmt) || vxAmt < 100) {
      setBuyVxMsg('Minimum purchase is 100 VX');
      return;
    }

    const costUsdt = vxAmt * engineSettings.vxPriceUsdt;
    if (walletBalance < costUsdt) {
      setBuyVxMsg(`Insufficient balance. Requires $${costUsdt.toFixed(2)} USDT.`);
      return;
    }

    updateBalance(-costUsdt, vxAmt, { type: 'vx_purchase', title: 'VX Token Purchase' });
    setBuyVxMsg('Successfully purchased VX Tokens!');
    setTimeout(() => {
      setBuyVxModalOpen(false);
      setBuyVxMsg('');
    }, 1200);

    try {
      const API_URL = 'https://backend-ten-amber-99.vercel.app';
      await fetch(`${API_URL}/api/mining/buy-vx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vx_amount: vxAmt })
      });
    } catch {
      try {
        await fetch('/api/mining/buy-vx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vx_amount: vxAmt })
        });
      } catch {}
    }
  };

  if (showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  return (
    <div className="animate-fade-in p-4 sm:p-6 pt-6 pb-28 max-w-md mx-auto space-y-5">
      
      <SpinWheelModal 
        isOpen={wheelOpen}
        onClose={() => setWheelOpen(false)}
        onRewardWon={(prize) => {
          const isVx = prize.toUpperCase().includes('VX');
          const amountNum = parseFloat(prize.replace(/[^0-9.]/g, '')) || 0;
          if (amountNum > 0) {
            if (isVx) {
              updateBalance(0, amountNum, { type: 'spin_reward', title: `Lucky Wheel Spin: +${amountNum} VX` });
            } else {
              updateBalance(amountNum, 0, { type: 'spin_reward', title: `Lucky Wheel Spin: +$${amountNum.toFixed(2)} USDT` });
            }
          }
        }}
      />

      <GiftBoxModal 
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        onRewardWon={(prize: string) => {
          const isVx = prize.toUpperCase().includes('VX');
          const amountNum = parseFloat(prize.replace(/[^0-9.]/g, '')) || 0;
          if (amountNum > 0) {
            if (isVx) {
              updateBalance(0, amountNum, { type: 'gift_reward', title: `Daily Gift Box: +${amountNum} VX` });
            } else {
              updateBalance(amountNum, 0, { type: 'gift_reward', title: `Daily Gift Box: +$${amountNum.toFixed(2)} USDT` });
            }
          }
        }}
      />

      <header className="flex justify-between items-center py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0E1B48] via-[#C18DB4]/30 to-[#87A7D0]/30 border border-[#C18DB4]/40 flex items-center justify-center text-[#C18DB4] shadow-lg shadow-black/40">
            <Pickaxe size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white font-serif-luxury tracking-wide">
                ⛏️ {user?.first_name || 'Member'}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#87A7D0]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>VX Mining Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.('profile')}
            className="w-10 h-10 rounded-full bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-slate-200 font-bold text-sm hover:border-[#C18DB4] transition-colors shadow-md"
          >
            {user?.first_name ? user.first_name[0] : 'U'}
          </button>
        </div>
      </header>

      {}
      <div className="card-vault rounded-3xl p-5 sm:p-6 relative overflow-hidden space-y-4 text-center border border-[#C18DB4]/40 shadow-2xl bg-gradient-to-b from-[#0E1B48]/90 via-[#0A1435]/95 to-[#0E1B48]/90">
        
        {}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0E1B48] border border-[#C18DB4]/40 text-[#E2CAD8] text-[9px] font-bold uppercase tracking-wider font-serif-luxury">
            <Sparkles size={11} className="text-[#C18DB4]" /> Dynamic USDT Yield
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
            <Clock size={11} className="text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>⏱️ {formatElapsedTime(elapsedSeconds)}</span>
          </div>
        </div>

        {}
        <div className="py-1">
          <div className="text-3xl sm:text-4xl font-extrabold font-serif-luxury text-white tracking-tight drop-shadow-md">
            + ${unclaimedYield.toFixed(4)} <span className="text-lg font-bold text-[#C18DB4]">USDT</span>
          </div>
          
          {}
          <div className="mt-2 flex items-center justify-center gap-2 flex-wrap text-[11px] font-medium text-[#E2CAD8]">
            <span className="inline-flex items-center gap-1 bg-[#0E1B48] px-2.5 py-0.5 rounded-lg border border-[#C18DB4]/20 text-amber-300 font-bold">
              ⚡ +${hourlyUsdtYield.toFixed(3)} / hr
            </span>
            <span className="text-[#87A7D0]">•</span>
            <span className="inline-flex items-center gap-1 bg-[#0E1B48] px-2.5 py-0.5 rounded-lg border border-[#C18DB4]/20 text-emerald-300 font-bold">
              +${dailyUsdtYield.toFixed(2)} / 24 hrs
            </span>
          </div>
        </div>

        {}
        <div className="space-y-1.5 text-left bg-[#08102B]/80 p-3 rounded-2xl border border-[#C18DB4]/20">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-[#87A7D0] flex items-center gap-1">
              <Activity size={11} className="text-[#C18DB4]" /> 24-Hour Yield Cycle
            </span>
            <span className="text-white font-mono">{cycleProgress.toFixed(1)}% ({formatElapsedTime(elapsedSeconds)} / 24h)</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#0E1B48] overflow-hidden p-[1px] border border-[#C18DB4]/30">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#C18DB4] via-[#87A7D0] to-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(193,141,180,0.5)]"
              style={{ width: `${Math.max(2, cycleProgress)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] text-[#E2CAD8]/70 pt-0.5">
            <span>Accumulating live from {vxBalance.toLocaleString()} VX</span>
            <span className="text-amber-300 font-semibold">Max Daily: ${dailyUsdtYield.toFixed(2)} USDT</span>
          </div>
        </div>

        {}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleClaim}
            disabled={isClaiming || unclaimedYield <= 0}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-xl transition-all ${
              isClaiming || unclaimedYield <= 0
                ? 'bg-[#0E1B48]/60 text-slate-500 border border-[#C18DB4]/20 cursor-not-allowed'
                : 'btn-gold-vault hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isClaiming ? 'Claiming to Wallet...' : 'Claim Yield'}
          </button>

          <button
            onClick={() => setBuyVxModalOpen(true)}
            className="px-4 py-3.5 rounded-2xl text-xs font-extrabold bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/40 hover:bg-[#1A285A] hover:border-[#C18DB4] flex items-center gap-1.5 transition-all shadow-md active:scale-98"
          >
            <ShoppingCart size={14} className="text-[#C18DB4]" /> Buy VX
          </button>
        </div>
      </div>

      <div 
        onClick={() => setBuyVxModalOpen(true)}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0E1B48] via-purple-900/60 to-[#C18DB4]/40 border border-[#C18DB4]/50 shadow-lg flex items-center justify-between cursor-pointer hover:border-[#C18DB4] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">$</span>
          <div>
            <h4 className="text-xs font-bold text-white font-serif-luxury">Increase balance to 100+ VX</h4>
            <p className="text-[10px] text-[#E2CAD8]">Your daily yield will speed up to 1.5% per day continuously.</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-[#C18DB4] shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30 space-y-1">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <span className="text-xs text-[#E2CAD8] font-medium">VX Token Balance</span>
          </div>
          <p className="text-lg font-extrabold text-white font-serif-luxury">{vxBalance.toLocaleString()} VX</p>
          <span className="text-[10px] text-[#87A7D0]">Valued at ${(vxBalance * engineSettings.vxPriceUsdt).toFixed(2)} USDT</span>
        </div>

        <div className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30 space-y-1">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-[#87A7D0]" />
            <span className="text-xs text-[#E2CAD8] font-medium">USDT Balance</span>
          </div>
          <p className="text-lg font-extrabold text-white font-serif-luxury">${walletBalance.toFixed(2)} USDT</p>
          <span className="text-[10px] text-emerald-400">Available to withdraw/buy VX</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => onNavigate?.('deposit')}
          className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30 hover:border-[#C18DB4]/60 transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#87A7D0]">
              <ArrowDownLeft size={20} />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-white font-serif-luxury">Deposit</span>
              <span className="text-[10px] text-[#E2CAD8]">BEP20 & TON</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#87A7D0] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate?.('withdrawal')}
          className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30 hover:border-[#C18DB4]/60 transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#C18DB4]">
              <ArrowUpRight size={20} />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-white font-serif-luxury">Withdraw</span>
              <span className="text-[10px] text-[#E2CAD8]">Fast Payout</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#C18DB4] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="card-vault p-4 rounded-3xl border border-[#C18DB4]/40 bg-gradient-to-br from-[#0E1B48] via-indigo-950/60 to-[#0E1B48] space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0E1B48] border border-[#C18DB4]/30 text-[10px] font-bold text-[#87A7D0]">
            <Sparkles size={10} className="text-[#C18DB4]" /> TOP RECOMMENDATION
          </div>
          <span className="text-[10px] text-amber-300 font-bold">10% Yield Commission</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-white font-serif-luxury">Invite & Earn Multi-Tier Rewards</h3>
            <p className="text-[10px] text-[#E2CAD8]">Get +$0.50 USDT instant bonus for each invited friend</p>
          </div>
          <button 
            onClick={() => onNavigate?.('referrals')}
            className="btn-gold-vault px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-lg hover:scale-105 transition-transform"
          >
            Invite Friends
          </button>
        </div>
      </div>

      <div className="card-vault rounded-2xl p-2.5 border border-[#C18DB4]/30 flex items-center justify-between overflow-hidden text-xs text-[#E2CAD8] bg-gradient-to-r from-[#0E1B48] via-[#0E1B48]/80 to-[#C18DB4]/20 shadow-md">
        <div className="flex items-center gap-2 font-bold text-white truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[#87A7D0]">Real-time:</span>
          <span className="truncate">Active Member — claimed yield +0.0520 USDT (2s ago)</span>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div 
          onClick={() => setExpandActivities(!expandActivities)}
          className="card-vault rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-[#C18DB4]/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#C18DB4]">
              <Gift size={20} />
            </div>
            <div>
              <span className="text-sm font-bold text-white font-serif-luxury tracking-wide">Welfare & Rewards Hub</span>
              <p className="text-[11px] text-[#E2CAD8]">Daily Gift Chest, Spin & Tasks</p>
            </div>
          </div>
          <ChevronDown size={18} className={`text-[#C18DB4] transition-transform duration-300 ${expandActivities ? 'rotate-180' : ''}`} />
        </div>

        {expandActivities && (
          <div className="space-y-3 animate-slide-up">
            <div className="grid grid-cols-2 gap-3.5">
              <div 
                onClick={() => setGiftModalOpen(true)}
                className="card-vault rounded-2xl p-4 border border-[#C18DB4]/40 cursor-pointer hover:border-[#C18DB4]/70 transition-all space-y-2 group shadow-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#C18DB4] group-hover:scale-110 transition-transform">
                  <Gift size={18} />
                </div>
                <h4 className="text-xs font-bold text-white font-serif-luxury">Daily Gift Box</h4>
                <p className="text-[10px] text-[#E2CAD8] font-bold">Unbox mystery reward &rarr;</p>
              </div>

              <div 
                onClick={() => setWheelOpen(true)}
                className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30 cursor-pointer hover:border-[#C18DB4]/60 transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#87A7D0] group-hover:rotate-45 transition-transform">
                  <Compass size={18} />
                </div>
                <h4 className="text-xs font-bold text-white font-serif-luxury">Lucky Wheel Draw</h4>
                <p className="text-[10px] text-[#E2CAD8]">Spin to win USDT & VX &rarr;</p>
              </div>
            </div>

            <div 
              onClick={() => onNavigate?.('tasks')}
              className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30 flex items-center justify-between cursor-pointer hover:border-[#C18DB4]/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#E2CAD8]">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-serif-luxury">Daily Task Rewards</h4>
                  <p className="text-[10px] text-[#E2CAD8]">Complete community tasks</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#C18DB4]" />
            </div>
          </div>
        )}
      </div>

      {buyVxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-vault max-w-sm w-full p-6 rounded-3xl space-y-4 border border-[#C18DB4]/40">
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-white font-serif-luxury">Buy VX Tokens</h3>
              <p className="text-xs text-[#E2CAD8]">Rate: 100 VX = $10.00 USDT (Min: 100 VX)</p>
            </div>

            {buyVxMsg && (
              <p className="text-xs text-center font-bold text-amber-300 p-2 bg-[#0E1B48] rounded-xl">{buyVxMsg}</p>
            )}

            <div>
              <label className="text-xs text-[#E2CAD8] block mb-1 font-bold">VX Token Amount</label>
              <input
                type="number"
                min="100"
                value={buyVxInput}
                onChange={e => setBuyVxInput(e.target.value)}
                className="w-full px-4 py-3 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-xl text-white text-sm font-bold focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#0E1B48]/80 border border-[#C18DB4]/30 text-xs space-y-1">
              <div className="flex justify-between text-[#E2CAD8]">
                <span>Required USDT:</span>
                <span className="font-bold text-white">${((parseFloat(buyVxInput) || 0) * engineSettings.vxPriceUsdt).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-[#E2CAD8]">
                <span>Available Balance:</span>
                <span className="font-bold text-emerald-400">${walletBalance.toFixed(2)} USDT</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleBuyVX} className="flex-1 py-3 btn-gold-vault text-xs font-bold rounded-xl">
                Confirm Purchase
              </button>
              <button onClick={() => setBuyVxModalOpen(false)} className="px-4 py-3 bg-[#0E1B48] text-[#E2CAD8] text-xs rounded-xl font-bold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
