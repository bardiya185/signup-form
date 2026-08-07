'use client';
import { create } from 'zustand';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
}

interface UiState {
  theme: 'light' | 'dark';
  toasts: Toast[];
  mobileMenuOpen: boolean;
  megaMenuOpen: boolean;
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toast: (type: Toast['type'], message: string, title?: string) => void;
  dismissToast: (id: number) => void;
  setMobileMenu: (open: boolean) => void;
  setMegaMenu: (open: boolean) => void;
}

let toastSeq = 0;

export const useUiStore = create<UiState>((set, get) => ({
  theme: 'light',
  toasts: [],
  mobileMenuOpen: false,
  megaMenuOpen: false,

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gnk_theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),

  toast: (type, message, title) => {
    const id = ++toastSeq;
    set({ toasts: [...get().toasts.slice(-3), { id, type, message, title }] });
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setMegaMenu: (open) => set({ megaMenuOpen: open }),
}));

export const toast = {
  success: (message: string, title?: string) => useUiStore.getState().toast('success', message, title),
  error: (message: string, title?: string) => useUiStore.getState().toast('error', message, title),
  info: (message: string, title?: string) => useUiStore.getState().toast('info', message, title),
};

/** خواندن تم ذخیره‌شده هنگام بوت */
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  const saved = window.localStorage.getItem('gnk_theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const theme = saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light';
  useUiStore.getState().setTheme(theme);
}
