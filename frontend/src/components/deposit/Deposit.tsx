import React, { useState, useEffect } from 'react';
import { ChevronLeft, Copy, Check, QrCode, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Deposit: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuthStore();
  const [network, setNetwork] = useState<'BEP20' | 'TON'>('BEP20');
  const [amount, setAmount] = useState('50');
  const [bep20Wallet, setBep20Wallet] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [tonWallet, setTonWallet] = useState('EQBvW8Z5huBkMJY78A29P0nLw84920kLzW190kLs920pL');
  const [copied, setCopied] = useState(false);
  const [txSubmitted, setTxSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastOrderId, setLastOrderId] = useState<string>('');

  const loadWallets = () => {
    try {
      const stored = localStorage.getItem('platform_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.bep20_wallet || parsed.deposit_address_bep20) {
          setBep20Wallet(parsed.bep20_wallet || parsed.deposit_address_bep20);
        }
        if (parsed.ton_wallet || parsed.deposit_address_ton) {
          setTonWallet(parsed.ton_wallet || parsed.deposit_address_ton);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadWallets();

    const API_URL = 'https://backend-ten-amber-99.vercel.app';
    fetch(`${API_URL}/api/deposit/wallets`)
      .then(res => res.json())
      .then(data => {
        if (data.bep20_wallet) setBep20Wallet(data.bep20_wallet);
        if (data.ton_wallet) setTonWallet(data.ton_wallet);
      })
      .catch(() => {
        fetch('/api/deposit/wallets')
          .then(res => res.json())
          .then(data => {
            if (data.bep20_wallet) setBep20Wallet(data.bep20_wallet);
            if (data.ton_wallet) setTonWallet(data.ton_wallet);
          })
          .catch(() => {});
      });

    window.addEventListener('storage', loadWallets);
    return () => window.removeEventListener('storage', loadWallets);
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
      setErrorMsg('Minimum deposit amount is $10.00 USDT');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const depositNumericId = Date.now();
    const orderId = `DEP-${depositNumericId}`;
    setLastOrderId(orderId);
    const userId = user?.id || user?.telegram_id || 10001;
    const userName = user?.first_name || user?.username || 'Member';

    try {
      const raw = localStorage.getItem('admin_deposits') || '[]';
      const deps = JSON.parse(raw);
      deps.unshift({
        id: depositNumericId,
        order_id: orderId,
        user_id: userId,
        user_name: userName,
        amount: numAmt,
        currency: 'USDT',
        network,
        wallet_address: activeWallet,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('admin_deposits', JSON.stringify(deps));

      const rawTxs = localStorage.getItem('app_transactions') || '[]';
      const txs = JSON.parse(rawTxs);
      txs.unshift({
        id: orderId,
        type: 'deposit',
        title: `USDT Deposit Order (${network})`,
        amount: numAmt.toFixed(2),
        currency: 'USDT',
        status: 'pending',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('app_transactions', JSON.stringify(txs.slice(0, 50)));
    } catch {}

    setTxSubmitted(true);
    setLoading(false);

    try {
      const API_URL = 'https://backend-ten-amber-99.vercel.app';
      await fetch(`${API_URL}/api/deposit/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: depositNumericId, order_id: orderId, amount: numAmt, network, user_id: userId })
      });
    } catch {
      try {
        await fetch('/api/deposit/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: depositNumericId, order_id: orderId, amount: numAmt, network, user_id: userId })
        });
      } catch {}
    }
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-20 max-w-md mx-auto p-4 space-y-6">
      
      <header className="flex items-center gap-4 py-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-[#0E1B48] text-[#E2CAD8] hover:bg-[#1A285A]">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white font-serif-luxury">
            {network === 'TON' ? 'Deposit TON Coin' : 'Deposit USDT (BEP-20)'}
          </h2>
          <p className="text-xs text-[#E2CAD8]">Select Asset & Send Blockchain Transfer</p>
        </div>
      </header>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {txSubmitted ? (
        <div className="card-vault p-6 rounded-3xl text-center space-y-4 border border-emerald-500/40">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
            <Check size={28} />
          </div>
          <h3 className="text-xl font-bold text-white font-serif-luxury">Deposit Order Created</h3>
          <p className="text-xs text-[#E2CAD8]">
            Your deposit order for <strong className="text-emerald-400 font-mono text-sm">{parseFloat(amount || '0').toFixed(2)} {network === 'TON' ? 'TON' : 'USDT'} ({network === 'TON' ? 'TON Network' : 'BEP-20'})</strong> has been registered with Order ID <span className="font-mono text-white">{lastOrderId}</span>.
          </p>

          <div className="p-3.5 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl text-left space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#87A7D0]">Status:</span>
              <span className="text-amber-300 font-bold uppercase">Pending Verification</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#87A7D0]">Asset / Network:</span>
              <span className="text-white font-bold">{network === 'TON' ? 'TON Coin (TON Blockchain)' : 'USDT (BEP-20 BSC)'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#87A7D0]">Amount:</span>
              <span className="text-emerald-400 font-bold font-mono">{parseFloat(amount || '0').toFixed(2)} {network === 'TON' ? 'TON' : 'USDT'}</span>
            </div>
          </div>

          <button onClick={() => setTxSubmitted(false)} className="w-full py-3.5 btn-gold-vault text-xs font-bold rounded-xl uppercase tracking-wider">
            Make Another Deposit
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-white mb-2">1. Select Asset & Network</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNetwork('BEP20')}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  network === 'BEP20'
                    ? 'btn-gold-vault shadow-lg'
                    : 'bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/30 hover:bg-[#0E1B48]'
                }`}
              >
                <span className="font-extrabold">USDT (BEP-20)</span>
                <span className="text-[10px] opacity-80">BNB Smart Chain</span>
              </button>

              <button
                onClick={() => setNetwork('TON')}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  network === 'TON'
                    ? 'btn-gold-vault shadow-lg'
                    : 'bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/30 hover:bg-[#0E1B48]'
                }`}
              >
                <span className="font-extrabold">TON Coin</span>
                <span className="text-[10px] opacity-80">TON Blockchain</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-2">
              2. Deposit Amount ({network === 'TON' ? 'TON Coin' : 'USDT'})
            </label>
            <input
              type="number"
              min={network === 'TON' ? '2' : '10'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl text-white font-bold text-base focus:outline-none"
            />
            <span className="text-[10px] text-[#E2CAD8] mt-1 block">
              {network === 'TON' ? 'Minimum Deposit: 2.00 TON Coin' : 'Minimum Deposit: $10.00 USDT'}
            </span>
          </div>

          <div className="card-vault p-5 rounded-3xl space-y-4 border border-[#C18DB4]/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode size={16} className="text-[#C18DB4]" /> {network === 'TON' ? 'TON Receiving Address' : 'BEP-20 USDT Address'}
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
              {network === 'TON' ? (
                <>Send exact <strong>TON Coin amount</strong> to the wallet above via <strong>TON Blockchain</strong>. Balance updates automatically upon confirmation.</>
              ) : (
                <>Send exact <strong>USDT amount</strong> to the wallet above via <strong>BNB Smart Chain (BEP-20)</strong>. Balance updates automatically upon confirmation.</>
              )}
            </p>
          </div>

          <button
            onClick={handleCreateDeposit}
            disabled={loading}
            className="w-full py-4 btn-gold-vault text-xs font-extrabold rounded-2xl uppercase tracking-wider shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : (
              <span>I Have Transferred {amount} {network === 'TON' ? 'TON' : 'USDT'}</span>
            )}
          </button>

        </div>
      )}

    </div>
  );
};
