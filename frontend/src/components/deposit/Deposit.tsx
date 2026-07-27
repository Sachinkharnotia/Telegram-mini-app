import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export const Deposit = ({ onBack }: { onBack?: () => void }) => {
  const [amount, setAmount] = useState('10');
  const [activeTab, setActiveTab] = useState('Month');
  
  const timeTabs = ['1 day', 'Week', 'Month', '3 months', '1 year'];
  const depositAmount = parseFloat(amount || '0');
  const dailyRate = depositAmount * 0.015;

  return (
    <div className="animate-fade-in bg-background min-h-[calc(100vh-64px)] pb-20 max-w-md mx-auto">
      <header className="flex items-center gap-4 p-4 pt-6 mb-2">
        <button className="text-slate-100 hover:text-white" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-100 font-serif-luxury flex-1">Deposit Funds</h2>
      </header>
      
      <div className="flex justify-center items-center gap-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">1</div>
        <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-bold text-sm">2</div>
        <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-bold text-sm">✓</div>
      </div>
      
      <div className="px-4 space-y-6">
        <div>
          <label className="block text-slate-200 font-bold text-[15px] mb-2 font-serif-luxury">Amount (USDT)</label>
          <p className="text-slate-400 text-xs mb-3 leading-relaxed">
            Minimum deposit threshold is 3.00 USDT. Transfers will automatically activate your yield allocations upon network confirmation.
          </p>
          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900/80 border border-amber-500/30 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-400 transition-all text-lg"
            />
          </div>
        </div>
        
        <div className="card-antigravity rounded-3xl p-5 relative overflow-hidden shadow-xl">
          <h3 className="text-center font-bold text-slate-100 text-base mb-5 font-serif-luxury">
            Estimated Yield Output
          </h3>
          
          <div className="flex justify-between items-center gap-1.5 mb-6">
            {timeTabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border ${activeTab === tab ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="border border-dashed border-teal-400/30 rounded-2xl p-5 text-center bg-teal-400/5 mb-6">
            <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase mb-2">EXPECTED RETURN</p>
            <div className="text-teal-300 text-3xl font-bold leading-none tracking-tight flex items-baseline justify-center gap-2">
              <span>+ {(dailyRate * (activeTab === '1 day' ? 1 : activeTab === 'Week' ? 7 : activeTab === 'Month' ? 30 : activeTab === '3 months' ? 90 : 365)).toFixed(4)}</span>
              <span className="text-lg font-bold text-teal-400/80">USDT</span>
            </div>
          </div>
          
          <div className="space-y-3.5 px-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Daily Return</span>
              <span className="text-slate-100 font-bold font-mono">+{dailyRate.toFixed(4)} USDT</span>
            </div>
            <div className="h-px bg-slate-800"></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Weekly Return</span>
              <span className="text-slate-100 font-bold font-mono">+{(dailyRate * 7).toFixed(4)} USDT</span>
            </div>
            <div className="h-px bg-slate-800"></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Monthly Return</span>
              <span className="text-slate-100 font-bold font-mono">+{(dailyRate * 30).toFixed(4)} USDT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
