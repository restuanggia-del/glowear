import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  namaProduk: string;
  harga: number;
  gambar: string;
  jumlah: number;
  ukuran: string;
  jenisSablon?: string;
  catatan?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, jumlah: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalHarga: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.productId === newItem.productId && item.ukuran === newItem.ukuran
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].jumlah += newItem.jumlah;
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, jumlah) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, jumlah: Math.max(1, jumlah) } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.jumlah, 0),
      totalHarga: () => get().items.reduce((acc, item) => acc + item.harga * item.jumlah, 0),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
