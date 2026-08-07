'use client';
import { create } from 'zustand';
import { getToken, http, setToken, type Envelope } from '@/lib/http';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  nationalCode: string | null;
  avatar: string | null;
  birthDate: string | null;
  gender: 'male' | 'female' | null;
  role: string;
  status: string;
  statusFa?: string;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  createdAt?: string;
}

interface MePayload {
  user: AuthUser;
  walletBalance: number;
  unreadNotifications: number;
  wishlistCount: number;
  cartItemsCount: number;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  counters: { wallet: number; notifications: number; wishlist: number; cart: number };
  setSession: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser | null) => void;
  setCounters: (c: Partial<AuthState['counters']>) => void;
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  counters: { wallet: 0, notifications: 0, wishlist: 0, cart: 0 },

  setSession: (user, token) => {
    setToken(token);
    set({ user });
  },
  setUser: (user) => set({ user }),
  setCounters: (c) => set({ counters: { ...get().counters, ...c } }),

  /** بازیابی نشست هنگام لود صفحه */
  bootstrap: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    const token = getToken();
    if (!token) return;
    set({ loading: true });
    try {
      const res = await http.get<Envelope<MePayload>>('/auth/me');
      set({
        user: res.data.user,
        counters: {
          wallet: res.data.walletBalance,
          notifications: res.data.unreadNotifications,
          wishlist: res.data.wishlistCount,
          cart: res.data.cartItemsCount,
        },
      });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await http.post('/auth/logout');
    } catch { /* توکن ممکن است منقضی شده باشد */ }
    setToken(null);
    set({ user: null, counters: { wallet: 0, notifications: 0, wishlist: 0, cart: 0 } });
  },
}));
