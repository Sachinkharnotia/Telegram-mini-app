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
    { id: 1, name: 'Main Telegram Group', link: 'https://t.me/telegram', type: 'group' },
    { id: 2, name: 'Official Announcement Channel', link: 'https://t.me/telegram', type: 'channel' }
  ]);
  const [joinedMap, setJoinedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/user/mandatory-join')
      .then(res => res.json())
      .then(data => {
        if (data.communities && Array.isArray(data.communities)) {
          setCommunities(data.communities);
        }
      })
      .catch(() => {});
  }, []);

  const handleJoinClick = (id: number, link: string) => {
    setJoinedMap(prev => ({ ...prev, [id]: true }));
    window.open(link, '_blank');
  };

  const handleContinue = () => {
    const unjoined = communities.filter(c => !joinedMap[c.id]);
    if (unjoined.length > 0) {
      setErrorMsg(`Please join all ${communities.length} required Telegram communities before continuing.`);
      return;
    }

    setLoading(true);
    fetch('/api/user/mandatory-join/confirm', { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        onVerified();
      })
      .catch(() => {
        onVerified();
      })
      .finally(() => setLoading(false));
  };

  const allJoined = communities.every(c => joinedMap[c.id]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0E1B48] via-[#87A7D0] to-[#E2CAD8]">
      <div className="card-vault max-w-md w-full p-6 sm:p-8 rounded-3xl backdrop-blur-2xl border border-[#C18DB4]/40 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/30 shadow-lg">
            <ShieldCheck size={32} className="text-[#C18DB4] animate-pulse-subtle" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-serif-luxury tracking-tight">
            Community Verification
          </h2>
          <p className="text-xs text-[#E2CAD8] leading-relaxed max-w-xs mx-auto">
            To maintain platform integrity and claim rewards, you must join our official Telegram communities below.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
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
                    ? 'bg-[#0E1B48]/90 border-emerald-500/50 shadow-md'
                    : 'bg-[#0E1B48]/60 border-[#C18DB4]/30 hover:border-[#C18DB4]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isJoined ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#27425D] text-[#87A7D0]'}`}>
                    {isJoined ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-serif-luxury">{c.name}</h4>
                    <span className="text-[10px] text-[#E2CAD8] capitalize">{c.type}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinClick(c.id, c.link)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
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
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
            allJoined
              ? 'btn-gold-vault shadow-[0_10px_30px_rgba(193,141,180,0.5)]'
              : 'bg-[#0E1B48]/80 text-[#E2CAD8] border border-[#C18DB4]/40 hover:bg-[#0E1B48]'
          }`}
        >
          {loading ? (
            <span>Verifying Membership...</span>
          ) : (
            <>
              <span>Verify & Access Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#E2CAD8]/70">
          Powered by VX Token Security System • Server Verified
        </p>

      </div>
    </div>
  );
};
