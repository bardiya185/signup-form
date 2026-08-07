'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  recent: string[];
  addRecent: (query: string) => void;
  clearRecent: () => void;
  removeRecent: (query: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recent: [],
      addRecent: (query) => {
        const q = query.trim();
        if (q.length < 2) return;
        const list = [q, ...get().recent.filter((x) => x !== q)].slice(0, 8);
        set({ recent: list });
      },
      clearRecent: () => set({ recent: [] }),
      removeRecent: (query) => set({ recent: get().recent.filter((x) => x !== query) }),
    }),
    { name: 'gnk_search' },
  ),
);
