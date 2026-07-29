import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export const Mining = () => {
  const [amount, setAmount] = useState('100');
  const [activeTab, setActiveTab] = useState('1 day');
  const [mainTab, setMainTab] = useState("Estimated Return");
  
  const timeTabs = ['1 day', 'Week', 'Month', '3 months', '1 year'];
  const mainTabs = ['Estimated Return', 'Allocation Strategy', 'Vault Balance'];
  
  const numAmount = parseFloat(amount || '0');
  const dailyRate = numAmount * 0.005;
  
  return (
    <div className="animate-fade-in bg-background min-h-[calc(100vh-64px)] pb-20 max-w-md mx-auto">
      <header className="flex items-center gap-4 p-4 pt-6 mb-2">
        <button className="text-white">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white flex-1 font-serif-luxury">
          Yield Calculator
        </h2>
      </header>
      
      <div className="px-4 space-y-5">
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {mainTabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`py-3 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-1 ${mainTab === tab ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-slate-300 font-medium text-sm mb-2 font-serif-luxury">Deposit Capital (USDT)</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-4 pr-16 text-white focus:outline-none focus:border-amber-400 transition-colors text-lg font-medium shadow-inner"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
              USDT
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          {timeTabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${activeTab === tab ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="card-vault rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-3 font-serif-luxury">PROJECTED YIELD</p>
            <div className="text-teal-300 text-3xl font-bold leading-none tracking-tight flex items-baseline justify-center gap-2">
              <span>+ {activeTab === '1 day' ? dailyRate.toFixed(4) : (dailyRate * (activeTab === 'Week' ? 7 : activeTab === 'Month' ? 30 : activeTab === '3 months' ? 90 : 365)).toFixed(4)}</span>
              <span className="text-lg font-bold text-teal-400/80">USDT</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-lg text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Per Day</span>
            <span className="text-slate-100 font-bold font-mono">+{dailyRate.toFixed(4)} USDT</span>
          </div>
          <div className="h-px bg-slate-800"></div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Per Week</span>
            <span className="text-slate-100 font-bold font-mono">+{(dailyRate * 7).toFixed(4)} USDT</span>
          </div>
          <div className="h-px bg-slate-800"></div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Per Month</span>
            <span className="text-slate-100 font-bold font-mono">+{(dailyRate * 30).toFixed(4)} USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
