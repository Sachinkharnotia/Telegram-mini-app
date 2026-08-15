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
