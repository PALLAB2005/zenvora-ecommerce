import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/commerce';

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  appliedCouponCode: string | null;
  deliveryMethod: 'standard' | 'express';
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: CartItem, openDrawer?: boolean) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  saveForLater: (sku: string) => void;
  moveToCart: (sku: string) => void;
  removeSavedItem: (sku: string) => void;
  applyCouponCode: (code: string | null) => void;
  setDeliveryMethod: (method: 'standard' | 'express') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      savedForLater: [],
      appliedCouponCode: null,
      deliveryMethod: 'standard',
      drawerOpen: false,
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      addItem: (newItem, openDrawer = true) =>
        set((state) => {
          const existing = state.items.find((i) => i.sku === newItem.sku);
          const updatedItems = existing
            ? state.items.map((i) =>
                i.sku === newItem.sku
                  ? { ...i, quantity: Math.min(i.maxStock, i.quantity + newItem.quantity) }
                  : i
              )
            : [...state.items, newItem];
          return {
            items: updatedItems,
            drawerOpen: openDrawer ? true : state.drawerOpen,
          };
        }),
      updateQuantity: (sku, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.sku !== sku)
              : state.items.map((i) =>
                  i.sku === sku ? { ...i, quantity: Math.min(i.maxStock, quantity) } : i
                ),
        })),
      removeItem: (sku) =>
        set((state) => ({
          items: state.items.filter((i) => i.sku !== sku),
        })),
      saveForLater: (sku) =>
        set((state) => {
          const target = state.items.find((i) => i.sku === sku);
          if (!target) return state;
          const alreadySaved = state.savedForLater.some((i) => i.sku === sku);
          return {
            items: state.items.filter((i) => i.sku !== sku),
            savedForLater: alreadySaved
              ? state.savedForLater
              : [...state.savedForLater, target],
          };
        }),
      moveToCart: (sku) =>
        set((state) => {
          const target = state.savedForLater.find((i) => i.sku === sku);
          if (!target) return state;
          const existing = state.items.find((i) => i.sku === sku);
          return {
            savedForLater: state.savedForLater.filter((i) => i.sku !== sku),
            items: existing
              ? state.items.map((i) =>
                  i.sku === sku
                    ? { ...i, quantity: Math.min(i.maxStock, i.quantity + 1) }
                    : i
                )
              : [...state.items, target],
          };
        }),
      removeSavedItem: (sku) =>
        set((state) => ({
          savedForLater: state.savedForLater.filter((i) => i.sku !== sku),
        })),
      applyCouponCode: (code) =>
        set({ appliedCouponCode: code ? code.trim().toUpperCase() : null }),
      setDeliveryMethod: (deliveryMethod) => set({ deliveryMethod }),
      clearCart: () => set({ items: [], appliedCouponCode: null }),
    }),
    {
      name: 'kova_cart_storage_v1',
      partialize: (state) => ({
        items: state.items,
        savedForLater: state.savedForLater,
        appliedCouponCode: state.appliedCouponCode,
        deliveryMethod: state.deliveryMethod,
      }),
    }
  )
);
