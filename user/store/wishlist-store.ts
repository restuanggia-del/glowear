import { create } from 'zustand';
import { api } from '../services/api';

interface WishlistState {
  wishlistIds: string[];
  setWishlist: (ids: string[]) => void;
  toggleWishlist: (userId: string, productId: string) => Promise<void>;
  checkIsWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],
  setWishlist: (ids) => set({ wishlistIds: ids }),
  
  toggleWishlist: async (userId, productId) => {
    const { wishlistIds } = get();
    const isCurrentlyWishlisted = wishlistIds.includes(productId);
    
    // Optimistic UI update
    if (isCurrentlyWishlisted) {
      set({ wishlistIds: wishlistIds.filter(id => id !== productId) });
    } else {
      set({ wishlistIds: [...wishlistIds, productId] });
    }

    try {
      if (isCurrentlyWishlisted) {
        await api.delete(`/wishlist/${userId}/${productId}`);
      } else {
        await api.post('/wishlist', { userId, productId });
      }
    } catch (error) {
      console.error("Gagal toggle wishlist:", error);
      // Revert optimistic update on error
      if (isCurrentlyWishlisted) {
        set({ wishlistIds: [...get().wishlistIds, productId] });
      } else {
        set({ wishlistIds: get().wishlistIds.filter(id => id !== productId) });
      }
    }
  },

  checkIsWishlisted: (productId) => {
    return get().wishlistIds.includes(productId);
  }
}));
