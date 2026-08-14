import React, { useState, useEffect } from 'react';
import { ChevronLeft, Sparkles, Gift, Compass } from 'lucide-react';
import { SpinWheelModal } from '../common/SpinWheelModal';
import { GiftBoxModal } from '../common/GiftBoxModal';

export const Tasks: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [wheelModalOpen, setWheelModalOpen] = useState(false);
  const [giftBoxModalOpen, setGiftBoxModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch('/api/tasks/list')
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasksList(data.tasks);
      })
      .catch(() => {});
  };

  const handleTaskClaim = async (task: any) => {
    if (task.action_url) {
      window.open(task.action_url, '_blank');
    }

    try {
      const res = await fetch('/api/tasks/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id })
      });
      const data = await res.json();
      if (data.success) {
        setNotice(`Claimed +${task.reward_amount} ${task.reward_currency} for "${task.title}"!`);
        fetchTasks();
      } else {
        setNotice(data.error || 'Failed to claim task');
      }
    } catch {
      setNotice('Task claim failed');
    }
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="animate-fade-in min-h-[calc(100vh-64px)] pb-24 max-w-md mx-auto p-4 space-y-5">
      
      <SpinWheelModal 
        isOpen={wheelModalOpen}
        onClose={() => setWheelModalOpen(false)}
        onRewardWon={(prize) => {
          setNotice(`Won +${prize} from Lucky Wheel!`);
          setTimeout(() => setNotice(null), 3500);
        }}
      />

      <GiftBoxModal
        isOpen={giftBoxModalOpen}
        onClose={() => setGiftBoxModalOpen(false)}
        onRewardWon={(prize) => {
          setNotice(`Unboxed +${prize} from Mystery Chest!`);
          setTimeout(() => setNotice(null), 3500);
        }}
      />

      {notice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0E1B48] text-white border border-[#C18DB4] px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles size={16} className="text-[#C18DB4]" /> {notice}
        </div>
      )}

      <header className="flex items-center gap-4 py-2">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl bg-[#0E1B48] text-[#E2CAD8] hover:bg-[#1A285A]">
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h2 className="text-xl font-extrabold text-white font-serif-luxury">Tasks & Rewards</h2>
          <p className="text-xs text-[#E2CAD8]">Complete Community Tasks & Spin Wheel</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3.5">
        <div 
          onClick={() => setGiftBoxModalOpen(true)}
          className="card-vault p-4 rounded-3xl border border-[#C18DB4]/40 cursor-pointer hover:border-[#C18DB4]/70 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#C18DB4] group-hover:scale-110 transition-transform">
            <Gift size={20} />
          </div>
          <h4 className="text-xs font-bold text-white font-serif-luxury">Daily Gift Box</h4>
          <p className="text-[10px] text-[#E2CAD8] font-bold">Unbox mystery gift &rarr;</p>
        </div>

        <div 
          onClick={() => setWheelModalOpen(true)}
          className="card-vault p-4 rounded-3xl border border-[#C18DB4]/30 cursor-pointer hover:border-[#C18DB4]/60 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#0E1B48] border border-[#C18DB4]/30 flex items-center justify-center text-[#87A7D0] group-hover:rotate-45 transition-transform">
            <Compass size={20} />
          </div>
          <h4 className="text-xs font-bold text-white font-serif-luxury">Lucky Wheel Draw</h4>
          <p className="text-[10px] text-[#87A7D0]">Spin wheel & win &rarr;</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider font-serif-luxury">Available Earning Tasks</h3>

        {tasksList.map(task => (
          <div 
            key={task.id} 
            className={`card-vault p-4 rounded-2xl flex items-center justify-between gap-3 border border-[#C18DB4]/30 transition-all ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div>
              <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-[#E2CAD8]' : 'text-white'}`}>
                {task.title}
              </h4>
              <span className="text-[10px] font-bold text-amber-300">
                +{task.reward_amount} {task.reward_currency}
              </span>
            </div>

            <button 
              onClick={() => !task.completed && handleTaskClaim(task)}
              disabled={task.completed}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                task.completed 
                  ? 'bg-transparent text-emerald-400 font-bold cursor-not-allowed' 
                  : 'btn-gold-vault'
              }`}
            >
              {task.completed ? 'Completed' : 'Claim Task'}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
