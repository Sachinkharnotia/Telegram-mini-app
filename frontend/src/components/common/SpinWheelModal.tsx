import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, RotateCw } from 'lucide-react';

interface SpinSector {
  id: number;
  label: string;
  reward_type: 'USDT' | 'VX' | 'SPIN';
  reward_amount: number;
  color: string;
}

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardWon: (reward: string) => void;
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose, onRewardWon }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const defaultSectors: SpinSector[] = [
    { id: 1, label: '+0.10 USDT', reward_type: 'USDT', reward_amount: 0.10, color: '#C18DB4' },
    { id: 2, label: '+50 VX', reward_type: 'VX', reward_amount: 50, color: '#87A7D0' },
    { id: 3, label: '+0.50 USDT', reward_type: 'USDT', reward_amount: 0.50, color: '#E2CAD8' },
    { id: 4, label: '+100 VX', reward_type: 'VX', reward_amount: 100, color: '#0E1B48' },
    { id: 5, label: '+1.00 USDT', reward_type: 'USDT', reward_amount: 1.00, color: '#C18DB4' },
    { id: 6, label: '+250 VX', reward_type: 'VX', reward_amount: 250, color: '#87A7D0' },
    { id: 7, label: '+0.25 USDT', reward_type: 'USDT', reward_amount: 0.25, color: '#E2CAD8' },
    { id: 8, label: '+500 VX', reward_type: 'VX', reward_amount: 500, color: '#0E1B48' }
  ];

  const [sectors, setSectors] = useState<SpinSector[]>(defaultSectors);

  useEffect(() => {
    if (isOpen) {
      setWonPrize(null);
      setErrorMsg('');
      fetch('/api/spin/sectors')
        .then(res => res.json())
        .then(data => {
          if (data.sectors && Array.isArray(data.sectors) && data.sectors.length > 0) {
            setSectors(data.sectors);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);
    setErrorMsg('');

    fetch('/api/spin/play', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (!data.success && data.error) {
          setErrorMsg(data.error);
          setIsSpinning(false);
          return;
        }

        const targetIndex = data.sector_index !== undefined ? data.sector_index : Math.floor(Math.random() * sectors.length);
        const degreesPerSegment = 360 / sectors.length;
        const targetCenter = targetIndex * degreesPerSegment + degreesPerSegment / 2;
        const extraTurns = 5 * 360;

        setRotationDegree(prev => {
          const currentMod = prev % 360;
          const deltaNeeded = (360 - targetCenter - currentMod + 360) % 360;
          return prev + extraTurns + (deltaNeeded === 0 ? 360 : deltaNeeded);
        });

        const prizeText = data.prize_label || sectors[targetIndex].label;

        setTimeout(() => {
          setIsSpinning(false);
          setWonPrize(prizeText);
          onRewardWon(prizeText);
        }, 3600);
      })
      .catch(() => {
        const targetIndex = Math.floor(Math.random() * sectors.length);
        const degreesPerSegment = 360 / sectors.length;
        const targetCenter = targetIndex * degreesPerSegment + degreesPerSegment / 2;
        const extraTurns = 5 * 360;

        setRotationDegree(prev => {
          const currentMod = prev % 360;
          const deltaNeeded = (360 - targetCenter - currentMod + 360) % 360;
          return prev + extraTurns + (deltaNeeded === 0 ? 360 : deltaNeeded);
        });

        const prizeText = sectors[targetIndex].label;

        setTimeout(() => {
          setIsSpinning(false);
          setWonPrize(prizeText);
          onRewardWon(prizeText);
        }, 3600);
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1B48]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-vault rounded-3xl p-6 max-w-sm w-full border border-[#C18DB4]/40 text-center relative space-y-5 animate-scale-up shadow-2xl">
        
        <button 
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 text-[#E2CAD8] hover:text-white rounded-full bg-[#0E1B48] border border-[#C18DB4]/30"
        >
          <X size={18} />
        </button>

        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1B48] border border-[#C18DB4]/40 text-[#E2CAD8] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-[#C18DB4]" /> Lucky Wheel Reward
          </div>
          <h3 className="text-xl font-extrabold font-serif-luxury text-white">Daily Spin Wheel</h3>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="relative w-64 h-64 mx-auto my-3 flex items-center justify-center">
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-[#C18DB4] drop-shadow-[0_4px_12px_rgba(193,141,180,0.9)]"></div>

          <div 
            className="w-full h-full rounded-full border-4 border-[#C18DB4]/60 shadow-[0_0_50px_rgba(193,141,180,0.4)] relative overflow-hidden transition-transform duration-[3600ms] cubic-bezier(0.12, 0.8, 0.15, 1)"
            style={{ transform: `rotate(${rotationDegree}deg)` }}
          >
            <div className="w-full h-full rounded-full bg-[#0E1B48] flex items-center justify-center relative">
              {sectors.map((p, idx) => {
                const angle = (360 / sectors.length) * idx;
                return (
                  <div 
                    key={idx}
                    className="absolute w-full h-full text-center flex items-start justify-center pt-3.5 text-[10px] font-bold text-white"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <span 
                      className="px-2 py-0.5 rounded-md bg-[#0E1B48]/90 border border-[#C18DB4]/30 shadow-md font-serif-luxury"
                      style={{ color: p.reward_type === 'USDT' ? '#E2CAD8' : '#87A7D0' }}
                    >
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute z-20 w-14 h-14 rounded-full bg-gradient-to-tr from-[#0E1B48] to-[#C18DB4] border-2 border-white flex items-center justify-center shadow-2xl">
            <Trophy size={20} className="text-white" />
          </div>
        </div>

        {wonPrize ? (
          <div className="bg-[#0E1B48] border border-[#C18DB4]/60 rounded-2xl p-4 space-y-1 animate-bounce">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C18DB4]">Reward Claimed!</p>
            <p className="text-lg font-extrabold font-serif-luxury text-white">You Won {wonPrize}</p>
          </div>
        ) : (
          <p className="text-xs text-[#E2CAD8]">Spin to win instant USDT & VX rewards credited to your wallet.</p>
        )}

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`w-full py-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 ${
            isSpinning 
              ? 'bg-[#0E1B48]/60 text-slate-500 border border-[#C18DB4]/20 cursor-not-allowed' 
              : 'btn-gold-vault'
          }`}
        >
          <RotateCw size={16} className={isSpinning ? 'animate-spin' : ''} />
          <span>{isSpinning ? 'Spinning Wheel...' : 'Spin The Wheel Now'}</span>
        </button>

      </div>
    </div>
  );
};
