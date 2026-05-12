import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SearchHistoryState {
  history: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addSearch: (query) => {
        const current = get().history;
        const newQuery = query.trim();
        if (!newQuery) return;
        
        // Buang yang sama, tambahkan di awal
        const filtered = current.filter(item => item.toLowerCase() !== newQuery.toLowerCase());
        const updated = [newQuery, ...filtered].slice(0, 10); // Simpan max 10
        set({ history: updated });
      },
      removeSearch: (query) => {
        set({ history: get().history.filter(item => item !== query) });
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'search-history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
