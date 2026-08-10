import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Pickaxe, 
  Sparkles, 
  ChevronDown, 
  Wallet,
  ChevronRight,
  Gift,
  CalendarCheck,
  Compass,
  Award
} from 'lucide-react';
import { SpinWheelModal } from '../common/SpinWheelModal';

export const Dashboard = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { user } = useAuthStore();
  const [unclaimedYield, setUnclaimedYield] = useState(0.78704215);
  const [claimedYield, setClaimedYield] = useState(1.42500000);
  const [isClaiming, setIsClaiming] = useState(false);
  const [coinsAnimation, setCoinsAnimation] = useState<Array<{ id: number; left: number }>>([]);
  const [walletBalance, setWalletBalance] = useState(user?.balance ?? 0);
  const [expandActivities, setExpandActivities] = useState(true);
  const [wheelOpen, setWheelOpen] = useState(false);

  const handleClaim = () => {
    if (unclaimedYield > 0) {
      setIsClaiming(true);
      const newCoins = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 80 + 10,
      }));
      setCoinsAnimation(newCoins);

      setTimeout(() => {
        setClaimedYield((prev: number) => prev + unclaimedYield);
        setWalletBalance((prev: number) => prev + unclaimedYield);
        setUnclaimedYield(0);
        setIsClaiming(false);
        setCoinsAnimation([]);
      }, 1200);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setUnclaimedYield((prev: number) => prev + 0.00000015);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-fade-in p-4 sm:p-6 pt-6 pb-28 max-w-md mx-auto space-y-5">
      
      <SpinWheelModal 
        isOpen={wheelOpen}
        onClose={() => setWheelOpen(false)}
        onRewardWon={(prize) => {
          const amountNum = parseFloat(prize) || 0;
          setWalletBalance((prev: number) => prev + amountNum);
        }}
      />

      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Pickaxe size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 font-serif-luxury tracking-wide">
              {user?.first_name || 'Valued Member'}
            </h1>
            <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Quantitative AI Active
            </p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate?.('profile')}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm hover:border-amber-400 transition-colors shadow-md"
        >
          {user?.first_name ? user.first_name[0] : 'U'}
        </button>
      </header>

      <div className="card-vault rounded-3xl p-6 relative overflow-hidden space-y-4 text-center border border-amber-400/30 shadow-2xl">
        {coinsAnimation.map(coin => (
          <div 
            key={coin.id}
            className="absolute top-0 text-amber-400 animate-bounce pointer-events-none text-xl"
            style={{ left: `${coin.left}%`, animationDuration: '1s' }}
          >
            🪙
          </div>
        ))}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest font-serif-luxury">
          <Sparkles size={12} /> Real-Time Unclaimed Rewards
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-bold font-serif-luxury text-amber-300 tracking-tight">
            + {unclaimedYield.toFixed(8)} USDT
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Accumulating 24/7 continuous profit</p>
        </div>

        <button
          onClick={handleClaim}
          disabled={isClaiming || unclaimedYield === 0}
          className={`w-full py-4 rounded-2xl text-xs font-bold font-serif-luxury uppercase tracking-wider shadow-xl transition-all ${
            isClaiming || unclaimedYield === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'btn-gold-vault'
          }`}
        >
          {isClaiming ? 'Transferring To Balance...' : 'Claim Earnings To Wallet'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => onNavigate?.('deposit')}
          className="card-vault rounded-2xl p-4 border border-teal-400/30 hover:border-teal-400/60 transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <ArrowDownLeft size={20} />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-slate-100 font-serif-luxury">Deposit</span>
              <span className="text-[10px] text-slate-400 font-medium">Add USDT</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-teal-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onNavigate?.('withdrawal')}
          className="card-vault rounded-2xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <ArrowUpRight size={20} />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-slate-100 font-serif-luxury">Withdraw</span>
              <span className="text-[10px] text-slate-400 font-medium">Payout TRC20</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-purple-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="card-vault rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">Claimed Profit</span>
          </div>
          <p className="text-lg font-bold text-amber-300 font-serif-luxury">{claimedYield.toFixed(4)} USDT</p>
        </div>

        <div className="card-vault rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-teal-300" />
            <span className="text-xs text-slate-400 font-medium">Wallet Balance</span>
          </div>
          <p className="text-lg font-bold text-teal-300 font-serif-luxury">${walletBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div 
          onClick={() => setExpandActivities(!expandActivities)}
          className="card-vault rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-amber-400/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Gift size={20} />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200 font-serif-luxury tracking-wide">Welfare & Rewards Hub</span>
              <p className="text-[11px] text-slate-400">Daily Spin, Check-in & Tasks</p>
            </div>
          </div>
          <ChevronDown size={18} className={`text-amber-400 transition-transform duration-300 ${expandActivities ? 'rotate-180' : ''}`} />
        </div>

        {expandActivities && (
          <div className="space-y-3 animate-slide-up">
            <div className="grid grid-cols-2 gap-3.5">
              <div 
                onClick={() => setWheelOpen(true)}
                className="card-vault rounded-2xl p-4 border border-teal-400/30 cursor-pointer hover:border-teal-400/60 transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-400/10 flex items-center justify-center text-teal-300 group-hover:rotate-45 transition-transform">
                  <Compass size={18} />
                </div>
                <h4 className="text-xs font-bold text-slate-100 font-serif-luxury">Lucky Wheel Draw</h4>
                <p className="text-[10px] text-slate-400">Tap to spin wheel &rarr;</p>
              </div>

              <div 
                onClick={() => onNavigate?.('tasks')}
                className="card-vault rounded-2xl p-4 border border-amber-400/30 cursor-pointer hover:border-amber-400/60 transition-all space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
                  <CalendarCheck size={18} />
                </div>
                <h4 className="text-xs font-bold text-slate-100 font-serif-luxury">Daily Check-in</h4>
                <p className="text-[10px] text-slate-400">Consecutive check-in bonuses</p>
              </div>
            </div>

            <div 
              onClick={() => onNavigate?.('tasks')}
              className="card-vault rounded-2xl p-4 border border-purple-400/30 flex items-center justify-between cursor-pointer hover:border-purple-400/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-300">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-serif-luxury">Community Discussion</h4>
                  <p className="text-[10px] text-slate-400">Join the official Telegram group</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-purple-300" />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
