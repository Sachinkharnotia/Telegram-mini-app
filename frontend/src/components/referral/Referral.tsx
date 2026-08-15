import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Copy, Check, Users, Gift, Share2 } from 'lucide-react';

export const Referral: React.FC = () => {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [refStats, setRefStats] = useState<any>(null);

  const [commSettings, setCommSettings] = useState({
    tier1: 10,
    tier2: 5,
    tier3: 2,
    bonus: 0.50
  });

  const tgId = user?.telegram_id || user?.id || 10001;
  const botUsername = 'VXMiningBot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${tgId}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('platform_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCommSettings({
          tier1: parsed.referral_level1_percent ?? 10,
          tier2: parsed.referral_level2_percent ?? 5,
          tier3: parsed.referral_level3_percent ?? 2,
          bonus: parsed.referral_signup_bonus_usdt ?? 0.50
        });
      }
    } catch {}

    fetch('/api/referral/stats')
      .then(res => res.json())
      .then(data => {
        setRefStats(data);
      })
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent('Join me on VX Token Quantitative Mining Platform and start earning continuous daily USDT yield!');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-24 max-w-md mx-auto p-4 pt-6 space-y-6">
      
      <header className="mb-2">
        <h2 className="text-xl font-extrabold text-white font-serif-luxury">Referral Program</h2>
        <p className="text-xs text-[#E2CAD8]">Share your unique Telegram link & earn multi-tier USDT commissions</p>
      </header>

      <div className="card-vault p-5 rounded-3xl space-y-4 border border-[#C18DB4]/40">
        <span className="text-xs font-bold text-white uppercase tracking-wider font-serif-luxury">Your Unique Telegram Referral Link</span>
        
        <div className="flex items-center gap-2 bg-[#0E1B48] p-2.5 rounded-2xl border border-[#C18DB4]/30">
          <input 
            type="text" 
            readOnly 
            value={referralLink}
            className="bg-transparent text-xs text-[#E2CAD8] flex-1 outline-none px-2 font-mono truncate"
          />
          <button 
            onClick={handleCopy}
            className="btn-gold-vault px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <button
          onClick={handleTelegramShare}
          className="w-full py-3 rounded-2xl bg-[#0E1B48] text-[#87A7D0] border border-[#C18DB4]/30 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1A285A]"
        >
          <Share2 size={16} /> Share Link on Telegram
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30">
          <div className="flex items-center gap-2 text-[#E2CAD8] text-xs mb-1">
            <Users size={16} className="text-[#87A7D0]" /> Direct Referrals
          </div>
          <p className="text-xl font-extrabold text-white font-serif-luxury">{user?.referral_count ?? 0}</p>
        </div>

        <div className="card-vault rounded-2xl p-4 border border-[#C18DB4]/30">
          <div className="flex items-center gap-2 text-[#E2CAD8] text-xs mb-1">
            <Gift size={16} className="text-[#C18DB4]" /> Total Earned
          </div>
          <p className="text-xl font-extrabold text-emerald-400 font-serif-luxury">
            ${(refStats?.total_earned ?? user?.referral_earnings ?? 0).toFixed(2)} USDT
          </p>
        </div>
      </div>

      <div className="card-vault p-5 rounded-3xl space-y-4 border border-[#C18DB4]/30">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-serif-luxury">Tier Commission Structure</h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center p-3 bg-[#0E1B48] rounded-xl border border-[#C18DB4]/20">
            <span className="text-[#E2CAD8] font-medium">Tier 1 (Direct Invites)</span>
            <span className="text-emerald-400 font-bold">{commSettings.tier1}% Commission</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#0E1B48] rounded-xl border border-[#C18DB4]/20">
            <span className="text-[#E2CAD8] font-medium">Tier 2 (Secondary Invites)</span>
            <span className="text-[#87A7D0] font-bold">{commSettings.tier2}% Commission</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#0E1B48] rounded-xl border border-[#C18DB4]/20">
            <span className="text-[#E2CAD8] font-medium">Tier 3 (Sub-network)</span>
            <span className="text-purple-300 font-bold">{commSettings.tier3}% Commission</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#0E1B48] rounded-xl border border-[#C18DB4]/20">
            <span className="text-[#E2CAD8] font-medium">Fixed Signup Bonus</span>
            <span className="text-amber-300 font-bold">${commSettings.bonus.toFixed(2)} USDT / invite</span>
          </div>
        </div>
      </div>

    </div>
  );
};
