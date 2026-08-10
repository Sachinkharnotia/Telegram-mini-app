import { useState } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { SpinWheelModal } from '../common/SpinWheelModal';

export const Tasks = ({ onBack }: { onBack?: () => void }) => {
  const [tasksList, setTasksList] = useState([
    { id: 1, title: 'Daily Login Reward', reward: '0.10 USDT', completed: false },
    { id: 2, title: 'Join Community Channel', reward: '1.00 USDT', completed: true },
    { id: 3, title: 'Follow Official Announcement Channel', reward: '1.00 USDT', completed: false },
    { id: 4, title: 'Platform Onboarding Guide', reward: '0.50 USDT', completed: false },
    { id: 5, title: 'Invite Active Members', reward: '5.00 USDT', completed: false }
  ]);
  const [notice, setNotice] = useState<string | null>(null);
  const [wheelModalOpen, setWheelModalOpen] = useState(false);

  const handleTaskClaim = (id: number, title: string, reward: string) => {
    setTasksList(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
    setNotice(`Claimed +${reward} for "${title}"`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRewardWon = (prize: string) => {
    setNotice(`Lucky Wheel Winner! Credited +${prize} to your balance.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDailyBox = () => {
    setNotice('Daily Chest Unlocked: Won +0.50 USDT!');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="animate-fade-in bg-background min-h-[calc(100vh-64px)] pb-20 max-w-md mx-auto">
      
      <SpinWheelModal 
        isOpen={wheelModalOpen}
        onClose={() => setWheelModalOpen(false)}
        onRewardWon={handleRewardWon}
      />

      {notice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles size={16} /> {notice}
        </div>
      )}

      <header className="flex items-center gap-4 p-4 pt-6 mb-2">
        {onBack && (
          <button className="text-white" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
        )}
        <h2 className="text-lg font-bold text-white flex-1 font-serif-luxury">
          Tasks & Rewards
        </h2>
      </header>
      
      <div className="px-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={handleDailyBox}
            className="bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-4 shadow-lg cursor-pointer active:scale-95 transition-all"
          >
            <div className="text-2xl mb-1">🎁</div>
            <div className="text-sm font-bold text-slate-100 font-serif-luxury">Daily Reward</div>
            <div className="text-xs text-amber-400 font-medium">Tap to Claim</div>
          </div>

          <div 
            onClick={() => setWheelModalOpen(true)}
            className="bg-slate-900 border border-slate-800 hover:border-teal-400/50 rounded-2xl p-4 shadow-lg cursor-pointer active:scale-95 transition-all group"
          >
            <div className="text-2xl mb-1 group-hover:rotate-45 transition-transform">🎡</div>
            <div className="text-sm font-bold text-slate-100 font-serif-luxury">Lucky Wheel</div>
            <div className="text-xs text-teal-400 font-medium">Tap to Spin Wheel &rarr;</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm font-serif-luxury">Active Tasks</h3>
          <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {tasksList.filter(t => !t.completed).length} Available
          </span>
        </div>
        
        <div className="space-y-3">
          {tasksList.map((task) => (
            <div 
              key={task.id} 
              className={`bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between p-4 transition-all ${
                task.completed ? 'opacity-50' : ''
              }`}
            >
              <div>
                <div className={`text-sm font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                  {task.title}
                </div>
                <div className="text-xs font-bold text-teal-400 mt-0.5">
                  +{task.reward}
                </div>
              </div>
              
              <button 
                onClick={() => !task.completed && handleTaskClaim(task.id, task.title, task.reward)}
                className={`py-2 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                  task.completed 
                    ? 'bg-transparent text-teal-400 cursor-not-allowed' 
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                }`}
                disabled={task.completed}
              >
                {task.completed ? 'Claimed' : 'Complete'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
