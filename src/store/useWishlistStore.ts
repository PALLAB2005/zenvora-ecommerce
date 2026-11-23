import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  toggleWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: ['prod-1', 'prod-6'],
      toggleWishlist: (productId) => {
        const exists = get().productIds.includes(productId);
        set((state) => ({
          productIds: exists
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        }));
        return !exists;
      },
      removeFromWishlist: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: 'kova_wishlist_storage_v1' }
  )
);
