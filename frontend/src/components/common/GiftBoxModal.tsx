import { useState } from 'react';
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

  const rewards = [
    '0.50 USDT',
    '1.25 USDT',
    '2.50 USDT',
    '3.75 USDT',
    '5.00 USDT',
    '10.00 USDT'
  ];

  if (!isOpen) return null;

  const handleOpenGift = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);

    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(true);
      setWonPrize(randomReward);
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-vault rounded-3xl p-6 max-w-sm w-full border border-amber-400/30 text-center relative space-y-5 animate-scale-up">
        
        <button 
          onClick={handleResetAndClose}
          disabled={isOpening}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider font-serif-luxury">
            <Sparkles size={12} /> Mystery Chest Rewards
          </div>
          <h3 className="text-xl font-bold font-serif-luxury text-slate-100">Daily Gift Box</h3>
        </div>

        <div className="relative py-6 flex items-center justify-center">
          <div className={`w-36 h-36 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-teal-500/20 border-2 border-amber-400/50 flex items-center justify-center relative shadow-[0_0_50px_rgba(245,158,11,0.3)] transition-transform duration-500 ${
            isOpening ? 'animate-bounce scale-110' : isOpened ? 'scale-105 border-teal-400' : 'hover:scale-105'
          }`}>
            {isOpened ? (
              <PackageOpen size={64} className="text-teal-300 animate-pulse" />
            ) : (
              <Gift size={64} className={`text-amber-400 ${isOpening ? 'animate-spin' : 'animate-pulse'}`} />
            )}

            {isOpening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={48} className="text-amber-300 animate-ping" />
              </div>
            )}
          </div>
        </div>

        {isOpened && wonPrize ? (
          <div className="bg-teal-500/10 border border-teal-400/40 rounded-2xl p-4 space-y-1 animate-bounce">
            <div className="flex items-center justify-center gap-1.5 text-teal-300 font-bold text-xs uppercase tracking-wider">
              <Award size={14} /> Gift Claimed Successfully!
            </div>
            <p className="text-2xl font-bold font-serif-luxury text-slate-100">+{wonPrize}</p>
            <p className="text-[10px] text-slate-400">Credited directly to your available balance</p>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Open your free daily mystery gift box to unlock instant USDT rewards.</p>
        )}

        {isOpened ? (
          <button
            onClick={handleResetAndClose}
            className="w-full py-4 rounded-2xl text-xs font-bold font-serif-luxury uppercase tracking-wider shadow-2xl transition-all btn-gold-vault"
          >
            Collect Reward & Close
          </button>
        ) : (
          <button
            onClick={handleOpenGift}
            disabled={isOpening}
            className={`w-full py-4 rounded-2xl text-xs font-bold font-serif-luxury uppercase tracking-wider shadow-2xl transition-all ${
              isOpening 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'btn-gold-vault'
            }`}
          >
            {isOpening ? 'Unboxing Gift Box...' : 'Open Gift Box Now'}
          </button>
        )}

      </div>
    </div>
  );
};
