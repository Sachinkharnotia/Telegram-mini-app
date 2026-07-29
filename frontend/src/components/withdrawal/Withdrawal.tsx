import React, { useState } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Withdrawal = ({ onBack }: { onBack?: () => void }) => {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState('3.00');
  const [activeTab, setActiveTab] = useState('Month');
  
  const tabs = ['1 day', 'Week', 'Month', '3 months', '1 year'];
  const userBalance = user?.balance ?? 0;
  const numAmount = parseFloat(amount || '0');
  const isBalanceSufficient = userBalance >= numAmount && numAmount >= 3.0;

  return (
    <div className="animate-fade-in bg-background min-h-[calc(100vh-64px)] pb-20 max-w-md mx-auto">
      <header className="flex items-center gap-4 p-4 pt-6 mb-2">
        <button className="text-slate-100 hover:text-white" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-100 font-serif-luxury flex-1">Withdraw Funds</h2>
      </header>
      
      <div className="flex justify-center items-center gap-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">1</div>
        <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-bold text-sm">2</div>
        <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-bold text-sm">3</div>
        <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-bold text-sm">✓</div>
      </div>
      
      <div className="px-4 space-y-6">
        <div>
          <label className="block text-slate-200 font-bold text-[15px] mb-1 font-serif-luxury">Amount (USDT)</label>
          <p className="text-slate-400 text-xs mb-3">Minimum withdrawal threshold is 3.00 USDT.</p>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900/80 border border-amber-500/30 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-400 transition-all text-lg"
          />
        </div>
        
        <div className="card-vault rounded-3xl p-5 relative overflow-hidden">
          <h3 className="text-center font-bold text-slate-100 text-base mb-4 font-serif-luxury">
            Opportunity Cost Assessment
          </h3>
          
          <div className="flex justify-between items-center bg-slate-900/90 rounded-xl p-1 mb-6 border border-slate-800">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${activeTab === tab ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="border border-dashed border-rose-500/40 rounded-2xl p-4 text-center mb-6 bg-rose-500/5">
            <p className="text-slate-400 font-bold text-[10px] tracking-wider uppercase mb-2">POTENTIAL YIELD FOREGONE</p>
            <div className="text-rose-400 text-3xl font-bold leading-none">
              - {(numAmount * 0.15 * (activeTab === '1 day' ? 1 : activeTab === 'Week' ? 7 : activeTab === 'Month' ? 30 : activeTab === '3 months' ? 90 : 365)).toFixed(2)} <span className="text-lg">USDT</span>
            </div>
          </div>
        </div>
        
        {!isBalanceSufficient && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-amber-300 font-bold text-xs pr-4">
              Insufficient balance or amount below minimum (3.00 USDT).
            </p>
            <Lock className="text-amber-400 flex-shrink-0" size={18} />
          </div>
        )}
      </div>
    </div>
  );
};
