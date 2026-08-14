import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, ShoppingCart, Gift, RefreshCw } from 'lucide-react';

export const History: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    fetch('/api/transactions/history')
      .then(res => res.json())
      .then(data => {
        if (data.transactions) setTransactions(data.transactions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={16} className="text-emerald-400" />;
      case 'withdrawal': return <ArrowUpRight size={16} className="text-rose-400" />;
      case 'vx_purchase': return <ShoppingCart size={16} className="text-[#87A7D0]" />;
      default: return <Gift size={16} className="text-[#C18DB4]" />;
    }
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-24 max-w-md mx-auto p-4 pt-6 space-y-5">
      
      <header className="flex justify-between items-center py-2">
        <div>
          <h2 className="text-xl font-extrabold text-white font-serif-luxury">Transaction Ledger</h2>
          <p className="text-xs text-[#E2CAD8]">Complete Financial Activity Record</p>
        </div>
        <button onClick={fetchHistory} className="p-2.5 rounded-2xl bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/30">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="space-y-2.5">
        {transactions.length === 0 ? (
          <div className="card-vault p-6 rounded-3xl text-center text-xs text-[#E2CAD8]">
            No transaction records found yet.
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="card-vault p-4 rounded-2xl flex items-center justify-between gap-3 border border-[#C18DB4]/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center">
                  {getTxIcon(tx.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white capitalize">{tx.description || tx.type.replace('_', ' ')}</h4>
                  <span className="text-[10px] text-[#E2CAD8]">
                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-extrabold font-mono ${
                  tx.type === 'withdrawal' ? 'text-rose-300' : 'text-emerald-400'
                }`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount} {tx.currency || 'USDT'}
                </span>
                <span className="block text-[9px] text-[#87A7D0] uppercase font-bold">{tx.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
