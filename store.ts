import { create } from 'zustand';
import { User } from './types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  toasts: Toast[];
  login: (email: string) => void;
  logout: () => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('tp_auth'),
  toasts: [],
  login: (email) => {
    localStorage.setItem('tp_auth', 'true');
    set({ 
      isAuthenticated: true, 
      user: { id: '1', email, name: 'Admin User', avatarUrl: 'https://picsum.photos/100' } 
    });
  },
  logout: () => {
    localStorage.removeItem('tp_auth');
    set({ isAuthenticated: false, user: null });
  },
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
