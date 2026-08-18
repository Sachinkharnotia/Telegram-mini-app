import React, { useState } from 'react';
import { Pickaxe } from 'lucide-react';

export const Mining: React.FC = () => {
  const [vxAmount, setVxAmount] = useState('500');
  const [activeTimeframe, setActiveTimeframe] = useState<'1 day' | 'Week' | 'Month' | '1 year'>('Month');
  const [engineSettings, setEngineSettings] = useState({
    price: 0.10,
    yieldRate: 0.015
  });

  React.useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('platform_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          const p = parsed.mining?.vx_price_usdt || parsed.vx_price_usdt || 0.10;
          const y = parsed.mining?.daily_yield_rate || parsed.daily_yield_rate || 1.5;
          const numY = Number(y) < 1 ? Number(y) : Number(y) / 100;
          setEngineSettings({ price: Number(p), yieldRate: numY });
        }
      } catch {}
    };
    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  const numVx = parseFloat(vxAmount) || 0;
  const usdtValue = numVx * engineSettings.price;
  const dailyRate = usdtValue * engineSettings.yieldRate;

  const multiplier = activeTimeframe === '1 day' ? 1 : activeTimeframe === 'Week' ? 7 : activeTimeframe === 'Month' ? 30 : 365;
  const projectedReturn = dailyRate * multiplier;

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-24 max-w-md mx-auto p-4 space-y-5">
      
      <header className="py-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white font-serif-luxury">VX Yield Calculator</h2>
          <p className="text-xs text-[#E2CAD8]">Simulate USDT Mining Earnings From VX Balance</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[#0E1B48] text-[#C18DB4] border border-[#C18DB4]/30">
          <Pickaxe size={20} />
        </div>
      </header>

      <div className="card-vault p-5 rounded-3xl space-y-4 border border-[#C18DB4]/40">
        <div>
          <label className="block text-xs font-bold text-white mb-2">Simulated VX Token Balance</label>
          <div className="relative">
            <input
              type="number"
              min="100"
              value={vxAmount}
              onChange={e => setVxAmount(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl text-white font-bold text-lg focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#87A7D0]">VX</span>
          </div>
          <span className="text-[10px] text-[#E2CAD8] mt-1 block">Capital Value: ${usdtValue.toFixed(2)} USDT</span>
        </div>

        <div className="flex gap-2">
          {(['1 day', 'Week', 'Month', '1 year'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTimeframe === tf ? 'btn-gold-vault shadow-md' : 'bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/20'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="card-vault p-6 rounded-3xl text-center space-y-2 border border-[#C18DB4]/40 shadow-xl">
        <span className="text-[10px] uppercase font-bold text-[#E2CAD8] tracking-widest">Projected USDT Yield Output</span>
        <div className="text-3xl font-extrabold text-white font-serif-luxury">
          + ${projectedReturn.toFixed(4)} USDT
        </div>
        <p className="text-[11px] text-emerald-400 font-bold">1.5% Daily Continuous Return</p>
      </div>

      <div className="card-vault p-5 rounded-3xl space-y-3 text-xs border border-[#C18DB4]/30">
        <div className="flex justify-between text-[#E2CAD8]">
          <span>Daily Return:</span>
          <span className="font-bold text-white">+${dailyRate.toFixed(4)} USDT</span>
        </div>
        <div className="h-px bg-[#C18DB4]/20"></div>
        <div className="flex justify-between text-[#E2CAD8]">
          <span>Weekly Return:</span>
          <span className="font-bold text-white">+${(dailyRate * 7).toFixed(4)} USDT</span>
        </div>
        <div className="h-px bg-[#C18DB4]/20"></div>
        <div className="flex justify-between text-[#E2CAD8]">
          <span>Monthly Return:</span>
          <span className="font-bold text-white">+${(dailyRate * 30).toFixed(4)} USDT</span>
        </div>
        <div className="h-px bg-[#C18DB4]/20"></div>
        <div className="flex justify-between text-[#E2CAD8]">
          <span>Annual Projected Output:</span>
          <span className="font-bold text-emerald-400">+${(dailyRate * 365).toFixed(2)} USDT</span>
        </div>
      </div>

    </div>
  );
};
