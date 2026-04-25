import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode'; 
import { setTokenStore } from '../services/apiClient';
import type { User, Notification } from '../types';

// THÊM: helper decode role từ JWT token
const getRoleFromToken = (token: string | null): 'USER' | 'STAFF' | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ scope: string }>(token);
    console.log('JWT decoded:', decoded); 
    return decoded.scope?.includes('ROLE_STAFF') ? 'STAFF' : 'USER';
  } catch {
    return null;
  }
};

// Auth store
interface AuthState {
  user: User | null;
  token: string | null;
  role: 'USER' | 'STAFF' | null; // ← THÊM
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('jwt_token'); // ← ĐỔI: tách ra biến riêng để dùng cho role

  const store = {
    user: null,
    token: savedToken,                        // ← ĐỔI: dùng savedToken thay vì gọi thẳng
    role: getRoleFromToken(savedToken),        // ← THÊM: decode role ngay khi init
    isLoading: false,
    error: null,

    setUser: (user: User | null) => set({ user }),
    setToken: (token: string | null) => {
      if (token) {
        localStorage.setItem('jwt_token', token);
      } else {
        localStorage.removeItem('jwt_token');
      }
      set({ token, role: getRoleFromToken(token) }); // ← ĐỔI: set role cùng lúc với token
    },
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    logout: () => {
      localStorage.removeItem('jwt_token');
      set({ user: null, token: null, role: null }); // ← ĐỔI: clear role khi logout
    },
  };

  // Sync with API interceptor
  setTokenStore(store);

  return store;
});

// UI store for global notifications, loading, errors
interface UIState {
  notifications: Notification[];
  isLoadingGlobal: boolean;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoadingGlobal: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  notifications: [],
  isLoadingGlobal: false,

  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  setLoadingGlobal: (loading: boolean) => set({ isLoadingGlobal: loading }),
}));