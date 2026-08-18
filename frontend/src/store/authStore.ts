import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (token: string, user: User) => void;
  updateBalance: (usdtDelta: number, vxDelta?: number, txMeta?: { type: string; title: string }) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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
        const API_URL = 'https://backend-ten-amber-99.vercel.app';
        fetch(`${API_URL}/api/auth/register-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: updatedUser })
        }).catch(() => {
          fetch('/api/auth/register-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: updatedUser })
          }).catch(() => {});
        });
      } catch {}

      return { user: updatedUser };
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, error: null });
  },
  
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
