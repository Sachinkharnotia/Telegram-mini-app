import React, { useState } from 'react';
import { X, Sparkles, Trophy } from 'lucide-react';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardWon: (reward: string) => void;
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose, onRewardWon }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  const prizes = [
    { label: '0.10 USDT', color: '#8a2387' },
    { label: '0.50 USDT', color: '#ff416c' },
    { label: '1.00 USDT', color: '#d946ef' },
    { label: '0.25 USDT', color: '#8a2387' },
    { label: '2.50 USDT', color: '#ff416c' },
    { label: '5.00 USDT', color: '#d946ef' },
    { label: '0.05 USDT', color: '#8a2387' },
    { label: '10.00 USDT', color: '#ffd700' }
  ];

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);

    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[randomIndex];

    const degreesPerSegment = 360 / prizes.length;
    const extraSpins = 5 * 360;
    const targetDegree = extraSpins + (360 - (randomIndex * degreesPerSegment + degreesPerSegment / 2));
    
    setRotationDegree(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize.label);
      onRewardWon(prize.label);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-vault rounded-3xl p-6 max-w-sm w-full border border-amber-400/30 text-center relative space-y-5 animate-scale-up">
        
        <button 
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Daily Wheel Bonus
          </div>
          <h3 className="text-xl font-bold font-serif-luxury text-slate-100">Lucky Spin Wheel</h3>
        </div>

        {}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          
          {}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(255,215,0,0.8)]"></div>

          {}
          <div 
            className="w-full h-full rounded-full border-4 border-amber-400/50 shadow-[0_0_40px_rgba(217,70,239,0.3)] relative overflow-hidden transition-transform duration-[3500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{ transform: `rotate(${rotationDegree}deg)` }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#161122] via-[#241738] to-[#120e1a] flex items-center justify-center relative">
              {prizes.map((p, idx) => {
                const angle = (360 / prizes.length) * idx;
                return (
                  <div 
                    key={idx}
                    className="absolute w-full h-full text-center flex items-start justify-center pt-3 text-[10px] font-bold text-slate-100"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <span 
                      className="px-2 py-0.5 rounded bg-slate-900/80 border border-white/10 shadow-sm"
                      style={{ color: p.color === '#ffd700' ? '#ffd700' : '#f5d0fe' }}
                    >
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {}
          <div className="absolute z-20 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white flex items-center justify-center shadow-2xl">
            <Trophy size={20} className="text-slate-950" />
          </div>
        </div>

        {}
        {wonPrize ? (
          <div className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-4 space-y-1 animate-bounce">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Congratulations!</p>
            <p className="text-lg font-bold font-serif-luxury text-slate-100">You Won +{wonPrize}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Spin to win instant USDT rewards credited directly to your balance.</p>
        )}

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`w-full py-4 rounded-2xl text-xs font-bold font-serif-luxury uppercase tracking-wider shadow-2xl transition-all ${
            isSpinning 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'btn-gold-vault'
          }`}
        >
          {isSpinning ? 'Spinning Wheel...' : 'Spin The Wheel Now'}
        </button>

      </div>
    </div>
  );
};
