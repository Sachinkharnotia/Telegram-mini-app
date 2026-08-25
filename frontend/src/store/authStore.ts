import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (token: string, user: User) => void;
  updateBalance: (usdtDelta: number, vxDelta?: number, txMeta?: { type: string; title: string }) => void;
  fetchUserBalance: () => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
  isLoading: false,
  error: null,
  
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    try {
      const rawUsers = localStorage.getItem('admin_users') || '[]';
      const userList = JSON.parse(rawUsers);
      const existingIndex = userList.findIndex((u: any) => u.id === user.id || (user.telegram_id && u.telegram_id === user.telegram_id));
      if (existingIndex !== -1) {
        userList[existingIndex] = {
          ...userList[existingIndex],
          ...user,
          last_active: new Date().toISOString()
        };
      } else {
        userList.unshift({
          id: user.id || Date.now(),
          telegram_id: user.telegram_id || user.id || 10001,
          first_name: user.first_name || 'Member',
          username: user.username || 'user',
          balance_usdt: user.balance_usdt || 0,
          balance_vx: user.balance_vx || 0,
          joined: new Date().toLocaleDateString(),
          is_active: true
        });
      }
      localStorage.setItem('admin_users', JSON.stringify(userList));
    } catch {}

    try {
      fetch('https://backend-ten-amber-99.vercel.app/api/auth/register-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_data: user,
          balance_usdt: user.balance_usdt || 0,
          balance_vx: user.balance_vx || 0
        })
      }).catch(() => {});
    } catch {}

    set({ token, user, error: null });
  },

  updateBalance: (usdtDelta: number, vxDelta = 0, txMeta) => {
    set((state) => {
      if (!state.user) return state;
      const currentUsdt = Number(state.user.balance_usdt || 0);
      const currentVx = Number(state.user.balance_vx || 0);
      const newUsdt = Math.max(0, parseFloat((currentUsdt + usdtDelta).toFixed(4)));
      const newVx = Math.max(0, parseFloat((currentVx + vxDelta).toFixed(2)));
      
      const updatedUser = {
        ...state.user,
        balance_usdt: newUsdt,
        balance_vx: newVx,
        mining_active: newVx >= 100
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));

      try {
        const rawUsers = localStorage.getItem('admin_users') || '[]';
        const userList = JSON.parse(rawUsers);
        const existingIndex = userList.findIndex((u: any) => u.id === state.user?.id || (state.user?.telegram_id && u.telegram_id === state.user.telegram_id));
        if (existingIndex !== -1) {
          userList[existingIndex] = {
            ...userList[existingIndex],
            balance_usdt: newUsdt,
            balance_vx: newVx,
            last_active: new Date().toISOString()
          };
        } else {
          userList.unshift({
            id: updatedUser.id || Date.now(),
            telegram_id: updatedUser.telegram_id || updatedUser.id || 10001,
            first_name: updatedUser.first_name || 'Member',
            username: updatedUser.username || 'user',
            balance_usdt: newUsdt,
            balance_vx: newVx,
            joined: new Date().toLocaleDateString(),
            is_active: true
          });
        }
        localStorage.setItem('admin_users', JSON.stringify(userList));
      } catch {}

      if (txMeta && (usdtDelta !== 0 || vxDelta !== 0)) {
        try {
          const raw = localStorage.getItem('app_transactions') || '[]';
          const txs = JSON.parse(raw);
          txs.unshift({
            id: `TX-${Date.now()}`,
            type: txMeta.type,
            title: txMeta.title,
            amount: usdtDelta !== 0 ? Math.abs(usdtDelta).toFixed(2) : Math.abs(vxDelta).toFixed(0),
            currency: usdtDelta !== 0 ? 'USDT' : 'VX',
            status: 'confirmed',
            created_at: new Date().toISOString()
          });
          localStorage.setItem('app_transactions', JSON.stringify(txs.slice(0, 50)));
        } catch {}
      }

      try {
        const payload = {
          user_data: updatedUser,
          user: updatedUser,
          balance_usdt: newUsdt,
          balance_vx: newVx,
          telegram_id: updatedUser.telegram_id || updatedUser.id
        };
        const API_URL = 'https://backend-ten-amber-99.vercel.app';
        fetch(`${API_URL}/api/auth/register-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {
          fetch('/api/auth/register-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        });
      } catch {}

      return { user: updatedUser };
    });
  },
  
  fetchUserBalance: async () => {
    const currentUser = get().user;
    if (!currentUser) return;
    const targetId = currentUser.telegram_id || currentUser.id;
    const API_URL = 'https://backend-ten-amber-99.vercel.app';
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    try {
      let res = await fetch(`${API_URL}/api/user/profile?user_id=${targetId}`);
      if (!res.ok) {
        res = await fetch(`/api/user/profile?user_id=${targetId}`);
      }
      const data = await res.json();
      if (data.user || data.balance) {
        const serverUsdt = Number(data.balance?.usdt_balance ?? data.user?.balance_usdt ?? currentUser.balance_usdt ?? 0);
        const serverVx = Number(data.balance?.vx_balance ?? data.user?.balance_vx ?? currentUser.balance_vx ?? 0);

        const realFirstName = tgUser?.first_name 
          || (currentUser.first_name && currentUser.first_name !== 'Member' ? currentUser.first_name : (data.user?.first_name && data.user?.first_name !== 'Member' ? data.user.first_name : (tgUser?.first_name || 'Member')));
        
        const realUsername = tgUser?.username || currentUser.username || data.user?.username || `user_${targetId}`;
        const realLastName = tgUser?.last_name || currentUser.last_name || data.user?.last_name;

        const updated = {
          ...currentUser,
          ...(data.user || {}),
          first_name: realFirstName,
          username: realUsername,
          last_name: realLastName,
          balance_usdt: serverUsdt,
          balance_vx: serverVx,
          referral_count: data.user?.referral_count ?? currentUser.referral_count,
          referral_earnings: data.user?.referral_earnings ?? currentUser.referral_earnings
        };
        localStorage.setItem('user', JSON.stringify(updated));
        set({ user: updated });
      }
    } catch {}
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, error: null });
  },
  
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
