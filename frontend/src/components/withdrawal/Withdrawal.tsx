import React, { useState } from 'react';
import { ChevronLeft, Check, AlertCircle, RefreshCw, TrendingDown, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Withdrawal: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user, updateBalance } = useAuthStore();
  const [network, setNetwork] = useState<'BEP20' | 'TON'>('BEP20');
  const [amount, setAmount] = useState('20');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lossTimeframe, setLossTimeframe] = useState<'1 day' | 'Week' | 'Month' | '1 year'>('Month');

  const userBalance = Number(user?.balance_usdt || 0);
  const minWithdrawal = 3.00;
  const withdrawalFee = 1.00;
  const numAmount = parseFloat(amount) || 0;
  const netAmount = Math.max(0, numAmount - withdrawalFee);

  const dailyLoss = numAmount * 0.015;
  const timeframeMultiplier = lossTimeframe === '1 day' ? 1 : lossTimeframe === 'Week' ? 7 : lossTimeframe === 'Month' ? 30 : 365;
  const totalPotentialLoss = dailyLoss * timeframeMultiplier;

  const isExceeding = numAmount > userBalance;

  const handleWithdrawalRequest = async () => {
    if (numAmount < minWithdrawal) {
      setErrorMsg(`Minimum withdrawal amount is $${minWithdrawal} USDT`);
      return;
    }
    if (isExceeding) {
      setErrorMsg('Insufficient USDT balance');
      return;
    }
    if (!walletAddress || walletAddress.trim().length < 6) {
      setErrorMsg('Please enter a valid destination wallet address');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    updateBalance(-numAmount, 0, { type: 'withdrawal', title: `USDT Payout Request (${network})` });

    try {
      const raw = localStorage.getItem('admin_withdrawals') || '[]';
      const wds = JSON.parse(raw);
      wds.unshift({
        id: Date.now(),
        user_id: user?.id || 10001,
        amount: numAmount,
        currency: 'USDT',
        network,
        wallet_address: walletAddress.trim(),
        status: 'pending',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('admin_withdrawals', JSON.stringify(wds));
    } catch {}

    setSubmitted(true);
    setLoading(false);

    try {
      await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          network,
          wallet_address: walletAddress.trim()
        })
      });
    } catch {}
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-24 max-w-md mx-auto p-4 space-y-5">
      
      <header className="flex items-center justify-between py-2 border-b border-[#C18DB4]/30 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/30 hover:bg-[#1A285A]">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-white font-serif-luxury">USDT Payout Gateway</h2>
            <p className="text-[11px] text-[#E2CAD8]">VextoralMining Fast Automated Payouts</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#87A7D0]">
          <span className="w-5 h-5 rounded-full bg-[#0E1B48] border border-[#C18DB4]/40 flex items-center justify-center text-white text-[10px]">1</span>
          <span className="w-5 h-5 rounded-full bg-[#0E1B48] border border-[#C18DB4]/40 flex items-center justify-center text-white text-[10px]">2</span>
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#C18DB4] to-[#87A7D0] flex items-center justify-center text-slate-950 text-[10px]">3</span>
        </div>
      </header>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-300" />
          <span>{errorMsg}</span>
        </div>
      )}

      {submitted ? (
        <div className="card-vault p-6 rounded-3xl text-center space-y-4 border border-emerald-500/40 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-500/40">
            <Check size={24} />
          </div>
          <h3 className="text-xl font-extrabold text-white font-serif-luxury">Payout Submitted</h3>
          <p className="text-xs text-[#E2CAD8]">
            Your withdrawal request for <strong>${numAmount.toFixed(2)} USDT ({network})</strong> has been placed in processing. Net payout of <strong>${netAmount.toFixed(2)} USDT</strong> will be transferred to:
          </p>
          <div className="p-3 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-xl text-xs text-white font-mono truncate">{walletAddress}</div>
          <button onClick={() => setSubmitted(false)} className="w-full py-3 btn-gold-vault text-xs font-bold rounded-xl">
            Request Another Payout
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">1. Select Payout Network</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNetwork('BEP20')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  network === 'BEP20'
                    ? 'btn-gold-vault shadow-lg'
                    : 'bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/30 hover:bg-[#0E1B48]'
                }`}
              >
                <span>USDT BEP20</span>
              </button>

              <button
                onClick={() => setNetwork('TON')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  network === 'TON'
                    ? 'btn-gold-vault shadow-lg'
                    : 'bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/30 hover:bg-[#0E1B48]'
                }`}
              >
                <span>TON Network</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-1.5">2. Destination Wallet Address</label>
            <input
              type="text"
              placeholder={`Enter your ${network} wallet address...`}
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              className="w-full px-4 py-3 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl text-white text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-white">3. Withdrawal Amount (USDT)</label>
              <span className="text-[10px] text-emerald-400 font-bold">Balance: ${userBalance.toFixed(2)} USDT</span>
            </div>
            <input
              type="number"
              min="3"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`w-full px-4 py-3.5 bg-[#0E1B48] border rounded-2xl text-white font-extrabold text-lg focus:outline-none ${
                isExceeding ? 'border-rose-500/80 text-rose-200' : 'border-[#C18DB4]/40'
              }`}
            />
          </div>

          {isExceeding && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-semibold">
              <Lock size={16} className="shrink-0" />
              <span>You only have ${userBalance.toFixed(2)} USDT — cannot withdraw more.</span>
            </div>
          )}

          {numAmount > 0 && (
            <div className="card-vault p-4 rounded-3xl border border-[#C18DB4]/40 space-y-3 bg-gradient-to-b from-[#0E1B48] via-[#0E1B48]/90 to-rose-950/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5 font-serif-luxury">
                  <TrendingDown size={16} className="text-rose-400" /> Yield Retention Estimator
                </span>
                <span className="text-[10px] text-rose-300 font-bold">Yield Missed</span>
              </div>

              <div className="flex gap-1.5">
                {(['1 day', 'Week', 'Month', '1 year'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setLossTimeframe(tf)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      lossTimeframe === tf 
                        ? 'bg-[#C18DB4] text-slate-950 shadow-md' 
                        : 'bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/30'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Potential Mining Output Missed</span>
                <p className="text-xl font-extrabold font-serif-luxury text-rose-400">- ${totalPotentialLoss.toFixed(4)} USDT</p>
                <p className="text-[10px] text-[#E2CAD8]">Holding capital in VX Tokens yields 1.5% daily continuous return</p>
              </div>
            </div>
          )}

          <div className="card-vault p-4 rounded-2xl space-y-2 text-xs border border-[#C18DB4]/30">
            <div className="flex justify-between text-[#E2CAD8]">
              <span>Requested Payout:</span>
              <span className="font-bold text-white">${numAmount.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-[#E2CAD8]">
              <span>Network Processing Fee:</span>
              <span className="font-bold text-rose-300">-${withdrawalFee.toFixed(2)} USDT</span>
            </div>
            <div className="h-px bg-[#C18DB4]/20"></div>
            <div className="flex justify-between text-white font-bold">
              <span>Net Destination Payout:</span>
              <span className="text-emerald-400 text-sm font-extrabold">${netAmount.toFixed(2)} USDT</span>
            </div>
          </div>

          <button
            onClick={handleWithdrawalRequest}
            disabled={loading || isExceeding}
            className={`w-full py-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 ${
              isExceeding 
                ? 'bg-[#0E1B48]/60 text-slate-500 border border-[#C18DB4]/20 cursor-not-allowed' 
                : 'btn-gold-vault'
            }`}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <span>Confirm Payout Request</span>}
          </button>

        </div>
      )}

    </div>
  );
};
