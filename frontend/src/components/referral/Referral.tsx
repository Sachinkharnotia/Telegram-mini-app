import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Copy, Check, Users, Gift } from 'lucide-react';

export const Referral = () => {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.telegram_id ? `REF_${user.telegram_id}` : `REF_${user?.id || 1001}`;
  const referralLink = `https://t.me/MiningAppBot?start=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in bg-background min-h-[calc(100vh-64px)] pb-24 max-w-md mx-auto p-4 pt-6 space-y-6">
      <header className="mb-2">
        <h2 className="text-xl font-bold text-slate-100 font-serif-luxury">Referral System</h2>
        <p className="text-xs text-slate-400 mt-0.5">Invite partners to earn tiered commission payouts</p>
      </header>

      <div className="card-vault rounded-3xl p-5 border border-amber-400/30 space-y-4">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-widest font-serif-luxury">Your Invitation Link</span>
        
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
          <input 
            type="text" 
            readOnly 
            value={referralLink}
            className="bg-transparent text-xs text-slate-300 flex-1 outline-none px-2 font-mono truncate"
          />
          <button 
            onClick={handleCopy}
            className="bg-amber-500 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Users size={16} className="text-amber-400" /> Total Referred
          </div>
          <p className="text-xl font-bold text-slate-100 font-serif-luxury">{user?.referral_count ?? 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Gift size={16} className="text-teal-400" /> Commission Earned
          </div>
          <p className="text-xl font-bold text-teal-300 font-serif-luxury">${(user?.referral_earnings ?? 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 font-serif-luxury">Tier Commission Structure</h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Tier 1 (Direct Invites)</span>
            <span className="text-amber-400 font-bold font-mono">10% Commission</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Tier 2 (Secondary Invites)</span>
            <span className="text-teal-400 font-bold font-mono">5% Commission</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Tier 3 (Extended Network)</span>
            <span className="text-slate-400 font-bold font-mono">2.5% Commission</span>
          </div>
        </div>
      </div>
    </div>
  );
};
