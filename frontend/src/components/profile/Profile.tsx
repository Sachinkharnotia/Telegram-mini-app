import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  Globe, ChevronRight, ArrowLeft, CheckCircle2, Send, HelpCircle, LifeBuoy 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];

  const faqs = [
    { q: 'How does VX Token mining work?', a: 'Users with min 100 VX tokens automatically earn continuous daily USDT yield at the admin configured rate.' },
    { q: 'What are the supported deposit & withdrawal networks?', a: 'Deposits and withdrawals are supported via USDT BEP20 and TON networks.' },
    { q: 'Is there a maximum VX token purchase limit?', a: 'No, users can buy unlimited VX tokens provided they have minimum 100 VX per transaction.' }
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketMessage.trim()) {
      setTicketSent(true);
      setTimeout(() => {
        setTicketSent(false);
        setTicketMessage('');
      }, 3000);
    }
  };

  return (
    <div className="animate-fade-in p-4 sm:p-6 pt-6 pb-28 max-w-md mx-auto">
      
      {activeSubView === 'lang' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-4 border border-[#C18DB4]/30">
            <h2 className="text-xl font-bold text-white font-serif-luxury">Select Interface Language</h2>

            <div className="space-y-2 pt-2">
              {languages.map(lang => (
                <div 
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.name);
                    setActiveSubView(null);
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedLanguage === lang.name 
                      ? 'bg-[#0E1B48] border-[#C18DB4] text-white' 
                      : 'bg-[#0E1B48]/60 border-[#C18DB4]/30 text-[#E2CAD8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs font-bold">{lang.name}</span>
                  </div>
                  {selectedLanguage === lang.name && <CheckCircle2 size={18} className="text-[#C18DB4]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'faq' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-4 border border-[#C18DB4]/30">
            <h2 className="text-xl font-bold text-white font-serif-luxury">Frequently Asked Questions</h2>
            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl p-4 space-y-1">
                  <h4 className="text-xs font-bold text-white">{faq.q}</h4>
                  <p className="text-[11px] text-[#E2CAD8] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'support' && (
        <div className="space-y-6 animate-slide-up">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#87A7D0]"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>

          <div className="card-vault rounded-3xl p-6 space-y-4 border border-[#C18DB4]/30">
            <h2 className="text-xl font-bold text-white font-serif-luxury">Help & Support Desk</h2>
            <p className="text-xs text-[#E2CAD8]">Submit your inquiry to 24/7 platform support.</p>

            {ticketSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Ticket Submitted</h4>
                <p className="text-xs text-emerald-200">Our team will respond via Telegram support chat.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <textarea 
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your question or issue..."
                    className="w-full bg-[#0E1B48] border border-[#C18DB4]/40 rounded-2xl p-3.5 text-xs text-white outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full btn-gold-vault py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Send size={14} /> Submit Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {!activeSubView && (
        <div className="space-y-6">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C18DB4] to-[#87A7D0] p-[2px] shadow-lg">
                <div className="w-full h-full rounded-full bg-[#0E1B48] flex items-center justify-center text-white font-bold text-lg border border-[#C18DB4]/30">
                  {user?.first_name ? user.first_name[0] : 'U'}
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white font-serif-luxury tracking-wide">
                  {user?.first_name || 'Account Profile'}
                </h1>
                <p className="text-xs text-[#87A7D0]">ID: {user?.telegram_id || '98765432'}</p>
              </div>
            </div>
          </header>

          <div className="card-vault rounded-3xl p-5 border border-[#C18DB4]/30 space-y-3">
            <div 
              onClick={() => setActiveSubView('lang')}
              className="flex items-center justify-between p-4 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#87A7D0]" />
                <span className="text-xs font-semibold text-white">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#E2CAD8]">{selectedLanguage}</span>
                <ChevronRight size={16} className="text-[#E2CAD8]" />
              </div>
            </div>

            <div 
              onClick={() => setActiveSubView('faq')}
              className="flex items-center justify-between p-4 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-[#87A7D0]" />
                <span className="text-xs font-semibold text-white">Frequently Asked Questions</span>
              </div>
              <ChevronRight size={16} className="text-[#E2CAD8]" />
            </div>

            <div 
              onClick={() => setActiveSubView('support')}
              className="flex items-center justify-between p-4 bg-[#0E1B48] border border-[#C18DB4]/30 rounded-2xl cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LifeBuoy size={18} className="text-[#87A7D0]" />
                <span className="text-xs font-semibold text-white">Help & Support Desk</span>
              </div>
              <ChevronRight size={16} className="text-[#E2CAD8]" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
