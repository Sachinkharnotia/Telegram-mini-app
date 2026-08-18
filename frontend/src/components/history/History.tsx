import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, ShoppingCart, RefreshCw, Pickaxe, Award } from 'lucide-react';

export const History: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    let localTxs: any[] = [];
    try {
      const stored = localStorage.getItem('app_transactions');
      if (stored) localTxs = JSON.parse(stored);
      if (!Array.isArray(localTxs)) localTxs = [];

      const rawDeps = localStorage.getItem('admin_deposits');
      if (rawDeps) {
        const deps = JSON.parse(rawDeps);
        for (const d of deps) {
          const exists = localTxs.some(t => t.id === d.id || t.id === d.order_id);
          if (!exists) {
            localTxs.push({
              id: d.order_id || d.id || `DEP-${Date.now()}`,
              type: 'deposit',
              title: d.status === 'confirmed' ? `USDT Deposit Credited (${d.network})` : `USDT Deposit (${d.network})`,
              amount: typeof d.amount === 'number' ? d.amount.toFixed(2) : String(d.amount),
              currency: 'USDT',
              status: d.status || 'pending',
              created_at: d.created_at || new Date().toISOString()
            });
          }
        }
      }

      const rawWds = localStorage.getItem('admin_withdrawals');
      if (rawWds) {
        const wds = JSON.parse(rawWds);
        for (const w of wds) {
          const exists = localTxs.some(t => t.id === w.id);
          if (!exists) {
            localTxs.push({
              id: w.id || `WD-${Date.now()}`,
              type: 'withdrawal',
              title: `USDT Payout Request (${w.network || 'BEP-20'})`,
              amount: typeof w.amount === 'number' ? w.amount.toFixed(2) : String(w.amount),
              currency: 'USDT',
              status: w.status || 'pending',
              created_at: w.created_at || new Date().toISOString()
            });
          }
        }
      }

      localTxs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setTransactions(localTxs);
      localStorage.setItem('app_transactions', JSON.stringify(localTxs));
    } catch {}

    const API_URL = 'https://backend-ten-amber-99.vercel.app';
    fetch(`${API_URL}/api/transactions/history`)
      .then(res => res.json())
      .then(data => {
        const apiTxs = data.transactions && Array.isArray(data.transactions) ? data.transactions : [];
        const txMap = new Map();
        for (const t of localTxs) {
          txMap.set(String(t.id || `${t.created_at}_${t.amount}`), t);
        }
        for (const t of apiTxs) {
          const key = String(t.id || `${t.created_at}_${t.amount}`);
          const existing = txMap.get(key);
          txMap.set(key, { ...existing, ...t });
        }
        const merged = Array.from(txMap.values());
        merged.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setTransactions(merged);
        localStorage.setItem('app_transactions', JSON.stringify(merged));
      })
      .catch(() => {
        fetch('/api/transactions/history')
          .then(res => res.json())
          .then(data => {
            if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
              const txMap = new Map();
              for (const t of localTxs) txMap.set(String(t.id || `${t.created_at}_${t.amount}`), t);
              for (const t of data.transactions) {
                const key = String(t.id || `${t.created_at}_${t.amount}`);
                txMap.set(key, { ...txMap.get(key), ...t });
              }
              const merged = Array.from(txMap.values());
              merged.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
              setTransactions(merged);
              localStorage.setItem('app_transactions', JSON.stringify(merged));
            }
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  };

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={16} className="text-emerald-400" />;
      case 'withdrawal': return <ArrowUpRight size={16} className="text-rose-400" />;
      case 'vx_purchase': return <ShoppingCart size={16} className="text-[#87A7D0]" />;
      case 'mining_yield': return <Pickaxe size={16} className="text-amber-400" />;
      default: return <Award size={16} className="text-[#C18DB4]" />;
    }
  };

  const getTxTitle = (tx: any) => {
    switch (tx.type) {
      case 'mining_yield': return 'VX Yield Claim';
      case 'deposit': return 'USDT Deposit';
      case 'withdrawal': return 'USDT Payout Request';
      case 'vx_purchase': return 'VX Token Purchase';
      case 'referral_commission': return 'Ambassador Referral Bonus';
      case 'task_reward': return 'Bounty Task Reward';
      case 'spin_reward': return 'Lucky Wheel Spin Win';
      default: return tx.description || 'Financial Transaction';
    }
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-24 max-w-md mx-auto p-4 pt-6 space-y-5">
      
      <header className="flex justify-between items-center py-2 border-b border-[#C18DB4]/30 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-white font-serif-luxury">Financial Stream Ledger</h2>
          <p className="text-xs text-[#E2CAD8]">VextoralMining Audit Record</p>
        </div>
        <button onClick={fetchHistory} className="p-2.5 rounded-2xl bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/30">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="space-y-2.5">
        {transactions.length === 0 ? (
          <div className="card-vault p-6 rounded-3xl text-center text-xs text-[#E2CAD8]">
            No financial transaction records found yet.
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="card-vault p-4 rounded-2xl flex items-center justify-between gap-3 border border-[#C18DB4]/30 hover:border-[#C18DB4]/60 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center shadow-md">
                  {getTxIcon(tx.type)}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white font-serif-luxury">{getTxTitle(tx)}</h4>
                  <span className="text-[10px] text-[#E2CAD8]">
                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-extrabold font-mono ${
                  tx.type === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount} {tx.currency || 'USDT'}
                </span>
                <span className="block text-[9px] text-[#87A7D0] uppercase font-bold tracking-wider">{tx.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
