import { ChevronLeft, TrendingUp } from 'lucide-react';

export const History = () => {
  
  const transactions = [
    { id: 1, type: 'Yield Allocation', date: '2026-07-24 14:00', amount: '+0.0341 USDT' },
    { id: 2, type: 'Yield Allocation', date: '2026-07-23 14:00', amount: '+0.0341 USDT' },
    { id: 3, type: 'Deposit Confirmation', date: '2026-07-22 10:30', amount: '+10.0000 USDT' }
  ];

  return (
    <div className="animate-fade-in bg-background min-h-[calc(100vh-64px)] rounded-t-3xl max-w-md mx-auto">
      <header className="flex items-center gap-4 p-4 pt-6 mb-2">
        <button className="text-white">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white font-serif-luxury">Transaction Log</h2>
      </header>
      
      <div className="px-4 space-y-2.5 pb-8">
        {transactions.map(tx => (
          <div key={tx.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 border border-slate-700 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="text-slate-100 font-bold text-sm">{tx.type}</div>
                <div className="text-slate-500 text-xs font-medium">{tx.date}</div>
              </div>
            </div>
            <div className="text-teal-300 font-bold font-mono tracking-tight text-sm">
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
