import React, { useState } from 'react';
import { ChevronLeft, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Withdrawal: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuthStore();
  const [network, setNetwork] = useState<'BEP20' | 'TON'>('BEP20');
  const [amount, setAmount] = useState('20');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const userBalance = user?.balance ?? 50.00;
  const minWithdrawal = 3.00;
  const withdrawalFee = 1.00;
  const numAmount = parseFloat(amount) || 0;
  const netAmount = Math.max(0, numAmount - withdrawalFee);

  const handleWithdrawalRequest = async () => {
    if (numAmount < minWithdrawal) {
      setErrorMsg(`Minimum withdrawal amount is $${minWithdrawal} USDT`);
      return;
    }
    if (numAmount > userBalance) {
      setErrorMsg('Insufficient USDT balance');
      return;
    }
    if (!walletAddress || walletAddress.trim().length < 6) {
      setErrorMsg('Please enter a valid destination wallet address');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          network,
          wallet_address: walletAddress.trim()
        })
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Withdrawal request failed');
        return;
      }
      setSubmitted(true);
    } catch {
      setErrorMsg('Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-20 max-w-md mx-auto p-4 space-y-6">
      
      <header className="flex items-center gap-4 py-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-[#0E1B48] text-[#E2CAD8] hover:bg-[#1A285A]">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white font-serif-luxury">Withdraw USDT</h2>
          <p className="text-xs text-[#E2CAD8]">Fast Automated Payouts</p>
        </div>
      </header>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {submitted ? (
        <div className="card-vault p-6 rounded-3xl text-center space-y-4 border border-emerald-500/40">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-500/40">
            <Check size={24} />
          </div>
          <h3 className="text-xl font-bold text-white font-serif-luxury">Withdrawal Submitted</h3>
          <p className="text-xs text-[#E2CAD8]">
            Your withdrawal request for <strong>${numAmount.toFixed(2)} USDT ({network})</strong> has been placed in processing. Net payout of <strong>${netAmount.toFixed(2)} USDT</strong> will be transferred to:
          </p>
          <div className="p-3 bg-[#0E1B48] rounded-xl text-xs text-white font-mono truncate">{walletAddress}</div>
          <button onClick={() => setSubmitted(false)} className="w-full py-3 btn-gold-vault text-xs font-bold rounded-xl">
            Request Another Withdrawal
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-white mb-2">1. Select Network</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNetwork('BEP20')}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  network === 'BEP20'
                    ? 'btn-gold-vault shadow-lg'
                    : 'bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/30 hover:bg-[#0E1B48]'
                }`}
              >
                <span>USDT BEP20</span>
              </button>

              <button
                onClick={() => setNetwork('TON')}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
            <label className="block text-xs font-bold text-white mb-2">2. Destination Wallet Address</label>
            <input
              type="text"
              placeholder={`Enter your ${network} wallet address...`}
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              className="w-full px-4 py-3 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl text-white text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-white">3. Withdrawal Amount (USDT)</label>
              <span className="text-[10px] text-emerald-400 font-bold">Available: ${userBalance.toFixed(2)}</span>
            </div>
            <input
              type="number"
              min="3"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl text-white font-bold text-base focus:outline-none"
            />
          </div>

          <div className="card-vault p-4 rounded-2xl space-y-2 text-xs border border-[#C18DB4]/30">
            <div className="flex justify-between text-[#E2CAD8]">
              <span>Requested Amount:</span>
              <span className="font-bold text-white">${numAmount.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-[#E2CAD8]">
              <span>Network Fee:</span>
              <span className="font-bold text-rose-300">-${withdrawalFee.toFixed(2)} USDT</span>
            </div>
            <div className="h-px bg-[#C18DB4]/20"></div>
            <div className="flex justify-between text-white font-bold">
              <span>Net Payout Amount:</span>
              <span className="text-emerald-400 text-sm">${netAmount.toFixed(2)} USDT</span>
            </div>
          </div>

          <button
            onClick={handleWithdrawalRequest}
            disabled={loading}
            className="w-full py-4 btn-gold-vault text-xs font-extrabold rounded-2xl uppercase tracking-wider shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <span>Confirm Payout Request</span>}
          </button>

        </div>
      )}

    </div>
  );
};
