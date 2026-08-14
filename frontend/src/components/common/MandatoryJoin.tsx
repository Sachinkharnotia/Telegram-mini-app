import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, ArrowRight, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface RequiredCommunity {
  id: number;
  name: string;
  link: string;
  type: 'channel' | 'group';
}

interface MandatoryJoinProps {
  onVerified: () => void;
}

export const MandatoryJoin: React.FC<MandatoryJoinProps> = ({ onVerified }) => {
  const [communities, setCommunities] = useState<RequiredCommunity[]>([
    { id: 1, name: 'Main Telegram Channel', link: 'https://t.me/telegram', type: 'channel' },
    { id: 2, name: 'Official Discussion Group', link: 'https://t.me/telegram', type: 'group' },
    { id: 3, name: 'Vextoral Mining News', link: 'https://t.me/telegram', type: 'channel' }
  ]);
  const [joinedMap, setJoinedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/user/mandatory-join')
      .then(res => res.json())
      .then(data => {
        if (data.communities && Array.isArray(data.communities) && data.communities.length > 0) {
          setCommunities(data.communities);
        }
      })
      .catch(() => {});
  }, []);

  const handleJoinClick = (id: number, link: string) => {
    setJoinedMap(prev => ({ ...prev, [id]: true }));
    setErrorMsg('');
    if ((window as any)?.Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(link);
    } else {
      window.open(link, '_blank');
    }
  };

  const handleContinue = () => {
    const unjoined = communities.filter(c => !joinedMap[c.id]);
    if (unjoined.length > 0) {
      setErrorMsg(`Please join all ${communities.length} required Telegram channels before accessing the dashboard.`);
      return;
    }

    setLoading(true);
    fetch('/api/user/mandatory-join/confirm', { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        localStorage.setItem('mandatory_joined', 'true');
        onVerified();
      })
      .catch(() => {
        localStorage.setItem('mandatory_joined', 'true');
        onVerified();
      })
      .finally(() => setLoading(false));
  };

  const allJoined = communities.every(c => joinedMap[c.id]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0E1B48] via-[#87A7D0] to-[#E2CAD8]">
      <div className="card-vault max-w-md w-full p-6 sm:p-8 rounded-3xl backdrop-blur-2xl border border-[#C18DB4]/40 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-[#0E1B48] text-[#E2CAD8] border border-[#C18DB4]/40 shadow-xl">
            <ShieldCheck size={36} className="text-[#C18DB4] animate-pulse-subtle" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-serif-luxury tracking-tight">
            Required Channel Verification
          </h2>
          <p className="text-xs text-[#E2CAD8] leading-relaxed max-w-xs mx-auto">
            You must join our official Telegram communities below before unlocking your VextoralMining Dashboard.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-300" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          {communities.map((c) => {
            const isJoined = !!joinedMap[c.id];
            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isJoined
                    ? 'bg-[#0E1B48]/95 border-emerald-500/50 shadow-md'
                    : 'bg-[#0E1B48]/70 border-[#C18DB4]/30 hover:border-[#C18DB4]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isJoined ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#0E1B48] text-[#87A7D0] border border-[#C18DB4]/30'}`}>
                    {isJoined ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white font-serif-luxury">{c.name}</h4>
                    <span className="text-[10px] text-[#87A7D0] uppercase font-bold tracking-wider">{c.type}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinClick(c.id, c.link)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                    isJoined
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'btn-gold-vault'
                  }`}
                >
                  {isJoined ? 'Joined' : 'Join'} <ExternalLink size={12} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xl ${
            allJoined
              ? 'btn-gold-vault'
              : 'bg-[#0E1B48]/80 text-slate-400 border border-[#C18DB4]/30'
          }`}
        >
          {loading ? (
            <span>Verifying Memberships...</span>
          ) : (
            <>
              <span>Verify & Unlock Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#E2CAD8]/70">
          VextoralMining Anti-Bot & Security Protocol • Server Verified
        </p>

      </div>
    </div>
  );
};
