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
  ShieldAlert,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { SpinWheelModal } from '../common/SpinWheelModal';
import { GiftBoxModal } from '../common/GiftBoxModal';
import { AdminPanel } from '../admin/AdminPanel';

export const Dashboard = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { user, updateBalance } = useAuthStore();
  const [unclaimedYield, setUnclaimedYield] = useState(0.00);
  const [isClaiming, setIsClaiming] = useState(false);
  const [walletBalance, setWalletBalance] = useState(Number(user?.balance_usdt || 0));
  const [vxBalance, setVxBalance] = useState(Number(user?.balance_vx || 0));
  const [expandActivities, setExpandActivities] = useState(true);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [buyVxModalOpen, setBuyVxModalOpen] = useState(false);
  const [buyVxInput, setBuyVxInput] = useState('100');
  const [buyVxMsg, setBuyVxMsg] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const vxPriceUsdt = 0.10;
  const minVxMining = 100;
  const dailyYieldRate = 0.015;

  const isEligibleToMine = vxBalance >= minVxMining;
  const dailyUsdtYield = isEligibleToMine ? vxBalance * vxPriceUsdt * dailyYieldRate : 0;

  useEffect(() => {
    if (user) {
      setWalletBalance(Number(user.balance_usdt || 0));
      setVxBalance(Number(user.balance_vx || 0));
    }
  }, [user?.balance_usdt, user?.balance_vx]);

  useEffect(() => {
    fetch('/api/mining/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.usdt_balance !== undefined) setWalletBalance(data.usdt_balance);
        if (data.vx_balance !== undefined) setVxBalance(data.vx_balance);
        if (data.unclaimed_yield !== undefined) setUnclaimedYield(data.unclaimed_yield);
      })
      .catch(() => {});
  }, []);

  const handleClaim = () => {
    if (unclaimedYield > 0) {
      setIsClaiming(true);
      const claimAmount = parseFloat(unclaimedYield.toFixed(4));
      updateBalance(claimAmount, 0, { type: 'mining_yield', title: 'VX Yield Claim' });
      setWalletBalance(prev => prev + claimAmount);
      setUnclaimedYield(0);
      setTimeout(() => {
        setIsClaiming(false);
      }, 600);

      fetch('/api/mining/claim-yield', { method: 'POST' }).catch(() => {});
    }
  };

  const handleBuyVX = async () => {
    const vxAmt = parseFloat(buyVxInput);
    if (isNaN(vxAmt) || vxAmt < 100) {
      setBuyVxMsg('Minimum purchase is 100 VX');
      return;
    }

    const costUsdt = vxAmt * vxPriceUsdt;
    if (walletBalance < costUsdt) {
      setBuyVxMsg(`Insufficient balance. Requires $${costUsdt.toFixed(2)} USDT.`);
      return;
    }

    updateBalance(-costUsdt, vxAmt, { type: 'vx_purchase', title: 'VX Token Purchase' });
    setWalletBalance(prev => Math.max(0, prev - costUsdt));
    setVxBalance(prev => prev + vxAmt);
    setBuyVxMsg('Successfully purchased VX Tokens!');
    setTimeout(() => {
      setBuyVxModalOpen(false);
      setBuyVxMsg('');
    }, 1200);

    try {
      await fetch('/api/mining/buy-vx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vx_amount: vxAmt })
      });
    } catch {}
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isEligibleToMine) {
        setUnclaimedYield(prev => prev + (dailyUsdtYield / 86400));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isEligibleToMine, dailyUsdtYield]);

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
              setVxBalance(prev => prev + amountNum);
            } else {
              updateBalance(amountNum, 0, { type: 'spin_reward', title: `Lucky Wheel Spin: +$${amountNum.toFixed(2)} USDT` });
              setWalletBalance(prev => prev + amountNum);
            }
          }
        }}
      />

      <GiftBoxModal 
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        onRewardWon={(prize) => {
          const isVx = prize.toUpperCase().includes('VX');
          const amountNum = parseFloat(prize.replace(/[^0-9.]/g, '')) || 0;
          if (amountNum > 0) {
            if (isVx) {
              updateBalance(0, amountNum, { type: 'gift_reward', title: `Mystery Gift Chest: +${amountNum} VX` });
              setVxBalance(prev => prev + amountNum);
            } else {
              updateBalance(amountNum, 0, { type: 'gift_reward', title: `Mystery Gift Chest: +$${amountNum.toFixed(2)} USDT` });
              setWalletBalance(prev => prev + amountNum);
            }
          }
        }}
      />

      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C18DB4] via-[#E2CAD8] to-[#87A7D0] flex items-center justify-center text-[#0E1B48] font-bold shadow-lg">
            <Pickaxe size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 font-serif-luxury tracking-wide">
              {user?.first_name || 'Valued Member'}
            </h1>
            <p className="text-xs text-[#87A7D0] font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isEligibleToMine ? 'VX Mining Active' : 'Hold 100+ VX to Mine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/30"
            >
              <ShieldAlert size={14} /> Admin
            </button>
          )}
          <button 
            onClick={() => onNavigate?.('profile')}
            className="w-10 h-10 rounded-full bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-slate-200 font-bold text-sm hover:border-[#C18DB4] transition-colors shadow-md"
          >
            {user?.first_name ? user.first_name[0] : 'U'}
          </button>
        </div>
      </header>

      <div className="card-vault rounded-3xl p-6 relative overflow-hidden space-y-4 text-center border border-[#C18DB4]/30 shadow-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1B48]/80 border border-[#C18DB4]/40 text-[#E2CAD8] text-[10px] font-bold uppercase tracking-widest font-serif-luxury">
          <Sparkles size={12} className="text-[#C18DB4]" /> Dynamic USDT Yield Accrual
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-extrabold font-serif-luxury text-white tracking-tight">
            + ${unclaimedYield.toFixed(4)} USDT
          </div>
          <p className="text-xs text-[#E2CAD8] mt-1 font-medium">
            {isEligibleToMine ? `Earning ~$${dailyUsdtYield.toFixed(2)} USDT / day (${vxBalance} VX)` : 'Hold min 100 VX to start mining yield'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClaim}
            disabled={isClaiming || unclaimedYield <= 0}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-xl transition-all ${
              isClaiming || unclaimedYield <= 0
                ? 'bg-[#0E1B48]/60 text-slate-500 border border-[#C18DB4]/20'
                : 'btn-gold-vault'
            }`}
          >
            {isClaiming ? 'Claiming...' : 'Claim Yield'}
          </button>

          <button
            onClick={() => setBuyVxModalOpen(true)}
            className="px-4 py-3.5 rounded-2xl text-xs font-extrabold bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/40 hover:bg-[#1A285A] flex items-center gap-1"
          >
            <ShoppingCart size={14} /> Buy VX
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
          <span className="text-[10px] text-[#87A7D0]">Valued at ${(vxBalance * vxPriceUsdt).toFixed(2)} USDT</span>
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
            <Sparkles size={10} className="text-[#C18DB4]" /> AI RECOMMENDATION
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
                <span className="font-bold text-white">${((parseFloat(buyVxInput) || 0) * vxPriceUsdt).toFixed(2)} USDT</span>
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
