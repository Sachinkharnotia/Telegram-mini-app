import { useState, useEffect } from 'react';
import { X, Sparkles, Gift, PackageOpen, Award } from 'lucide-react';

interface GiftBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardWon: (reward: string) => void;
}

export const GiftBoxModal = ({ isOpen, onClose, onRewardWon }: GiftBoxModalProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState(1);
  const [chestsUsedToday, setChestsUsedToday] = useState(0);

  const defaultRewards = [
    '0.50 USDT',
    '1.25 USDT',
    '2.50 USDT',
    '3.75 USDT',
    '5.00 USDT',
    '10.00 USDT'
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (isOpen) {
      setIsOpening(false);
      setIsOpened(false);
      setWonPrize(null);

      const count = Number(localStorage.getItem(`user_giftbox_${todayStr}`) || 0);
      setChestsUsedToday(count);

      try {
        const stored = localStorage.getItem('platform_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.daily_giftbox_limit !== undefined) {
            setDailyLimit(Number(parsed.daily_giftbox_limit));
          } else if (parsed.rewards?.daily_giftbox_limit !== undefined) {
            setDailyLimit(Number(parsed.rewards.daily_giftbox_limit));
          }
        }
      } catch {}
    }
  }, [isOpen, todayStr]);

  const getRewards = (): string[] => {
    try {
      const stored = localStorage.getItem('platform_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.gift_rewards && Array.isArray(parsed.gift_rewards) && parsed.gift_rewards.length > 0) {
          return parsed.gift_rewards;
        }
      }
    } catch {}
    return defaultRewards;
  };

  const rewards = getRewards();

  if (!isOpen) return null;

  const chestsRemaining = Math.max(0, dailyLimit - chestsUsedToday);
  const isLimitReached = chestsRemaining <= 0;

  const handleOpenGift = () => {
    if (isOpening || isOpened) return;
    if (isLimitReached) return;

    setIsOpening(true);

    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(true);
      setWonPrize(randomReward);
      const newCount = chestsUsedToday + 1;
      setChestsUsedToday(newCount);
      localStorage.setItem(`user_giftbox_${todayStr}`, newCount.toString());
      onRewardWon(randomReward);
    }, 2000);
  };

  const handleResetAndClose = () => {
    setIsOpening(false);
    setIsOpened(false);
    setWonPrize(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1B48]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-vault rounded-3xl p-6 max-w-sm w-full border border-[#C18DB4]/40 text-center relative space-y-5 animate-scale-up shadow-2xl">
        
        <button 
          onClick={handleResetAndClose}
          disabled={isOpening}
          className="absolute top-4 right-4 p-2 text-[#E2CAD8] hover:text-white rounded-full bg-[#0E1B48] border border-[#C18DB4]/30"
        >
          <X size={18} />
        </button>

        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1B48] border border-[#C18DB4]/40 text-[#E2CAD8] text-[10px] font-bold uppercase tracking-wider font-serif-luxury">
            <Sparkles size={12} className="text-[#C18DB4]" /> Mystery Chest Rewards
          </div>
          <h3 className="text-xl font-extrabold font-serif-luxury text-white">Daily Gift Box</h3>
          <div className="text-[11px] font-bold text-amber-400">
            Chests Today: {chestsRemaining} / {dailyLimit} Available
          </div>
        </div>

        <div className="relative py-5 flex items-center justify-center">
          <div className={`w-36 h-36 rounded-3xl bg-[#0E1B48] border-2 border-[#C18DB4]/60 flex items-center justify-center relative shadow-[0_0_50px_rgba(193,141,180,0.3)] transition-transform duration-500 ${
            isOpening ? 'animate-bounce scale-110' : isOpened ? 'scale-105 border-[#87A7D0]' : 'hover:scale-105'
          }`}>
            {isOpened ? (
              <PackageOpen size={64} className="text-[#87A7D0] animate-pulse" />
            ) : (
              <Gift size={64} className={`text-[#C18DB4] ${isOpening ? 'animate-spin' : 'animate-pulse'}`} />
            )}

            {isOpening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={48} className="text-[#E2CAD8] animate-ping" />
              </div>
            )}
          </div>
        </div>

        {isOpened && wonPrize ? (
          <div className="bg-[#0E1B48] border border-[#C18DB4]/60 rounded-2xl p-4 space-y-1 animate-bounce">
            <div className="flex items-center justify-center gap-1.5 text-[#C18DB4] font-bold text-xs uppercase tracking-wider">
              <Award size={14} /> Gift Claimed Successfully!
            </div>
            <p className="text-2xl font-extrabold font-serif-luxury text-white">+{wonPrize}</p>
            <p className="text-[10px] text-[#E2CAD8]">Credited directly to your available balance</p>
          </div>
        ) : (
          <p className="text-xs text-[#E2CAD8]">
            {isLimitReached 
              ? 'You have opened all gift chests for today.' 
              : 'Open your daily mystery gift box to unlock instant USDT rewards.'}
          </p>
        )}

        {isOpened ? (
          <button
            onClick={handleResetAndClose}
            className="w-full py-4 rounded-2xl text-xs font-extrabold font-serif-luxury uppercase tracking-wider shadow-2xl transition-all btn-gold-vault"
          >
            Collect Reward & Close
          </button>
        ) : (
          <button
            onClick={handleOpenGift}
            disabled={isOpening || isLimitReached}
            className={`w-full py-4 rounded-2xl text-xs font-extrabold font-serif-luxury uppercase tracking-wider shadow-2xl transition-all ${
              isOpening || isLimitReached
                ? 'bg-[#0E1B48]/60 text-slate-500 border border-[#C18DB4]/20 cursor-not-allowed' 
                : 'btn-gold-vault'
            }`}
          >
            {isOpening 
              ? 'Unboxing Gift Box...' 
              : isLimitReached 
                ? 'Daily Limit Reached' 
                : `Open Gift Box (${chestsRemaining} Left)`}
          </button>
        )}

      </div>
    </div>
  );
};
