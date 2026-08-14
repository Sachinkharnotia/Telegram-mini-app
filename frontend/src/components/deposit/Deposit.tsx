import React, { useState, useEffect } from 'react';
import { ChevronLeft, Copy, Check, QrCode, RefreshCw } from 'lucide-react';

export const Deposit: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [network, setNetwork] = useState<'BEP20' | 'TON'>('BEP20');
  const [amount, setAmount] = useState('50');
  const [bep20Wallet, setBep20Wallet] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [tonWallet, setTonWallet] = useState('EQBvW8Z5huBkMJY78A29P0nLw84920kLzW190kLs920pL');
  const [copied, setCopied] = useState(false);
  const [txSubmitted, setTxSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/deposit/wallets')
      .then(res => res.json())
      .then(data => {
        if (data.bep20_wallet) setBep20Wallet(data.bep20_wallet);
        if (data.ton_wallet) setTonWallet(data.ton_wallet);
      })
      .catch(() => {});
  }, []);

  const activeWallet = network === 'TON' ? tonWallet : bep20Wallet;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateDeposit = async () => {
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt < 10) {
      setErrorMsg('Minimum deposit amount is $10 USDT');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/deposit/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmt, network })
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Failed to submit deposit');
        return;
      }
      setTxSubmitted(true);
    } catch {
      setErrorMsg('Failed to submit deposit request');
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
          <h2 className="text-lg font-bold text-white font-serif-luxury">Deposit USDT</h2>
          <p className="text-xs text-[#E2CAD8]">Select Network & Send Transfer</p>
        </div>
      </header>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {txSubmitted ? (
        <div className="card-vault p-6 rounded-3xl text-center space-y-4 border border-emerald-500/40">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-500/40">
            <Check size={24} />
          </div>
          <h3 className="text-xl font-bold text-white font-serif-luxury">Deposit Order Created</h3>
          <p className="text-xs text-[#E2CAD8]">
            Your deposit request for <strong>${amount} USDT ({network})</strong> has been registered. Your internal balance will update upon network confirmation.
          </p>
          <button onClick={() => setTxSubmitted(false)} className="w-full py-3 btn-gold-vault text-xs font-bold rounded-xl">
            Make Another Deposit
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
            <label className="block text-xs font-bold text-white mb-2">2. Deposit Amount (USDT)</label>
            <input
              type="number"
              min="10"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl text-white font-bold text-base focus:outline-none"
            />
            <span className="text-[10px] text-[#E2CAD8] mt-1 block">Minimum Deposit: $10.00 USDT</span>
          </div>

          <div className="card-vault p-5 rounded-3xl space-y-4 border border-[#C18DB4]/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode size={16} className="text-[#C18DB4]" /> Deposit Address
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Auto-Detected</span>
            </div>

            <div className="p-3 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl flex items-center justify-between gap-2">
              <span className="text-xs text-white font-mono truncate select-all">{activeWallet}</span>
              <button onClick={handleCopy} className="p-2 rounded-xl bg-[#27425D] text-white hover:bg-[#1A285A] shrink-0">
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>

            <p className="text-[10px] text-[#E2CAD8] leading-relaxed">
              Send exact USDT amount to the wallet above via <strong>{network}</strong>. Balance updates automatically upon confirmation.
            </p>
          </div>

          <button
            onClick={handleCreateDeposit}
            disabled={loading}
            className="w-full py-4 btn-gold-vault text-xs font-extrabold rounded-2xl uppercase tracking-wider shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <span>I Have Transferred ${amount} USDT</span>}
          </button>

        </div>
      )}

    </div>
  );
};
