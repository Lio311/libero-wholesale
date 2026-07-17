import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1) => {
        // Enforce MOQ
        const qtyToAdd = Math.max(quantity, product.minOrderQty || 1);
        
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + qtyToAdd }
                  : item
              ),
              isOpen: true, // Open cart when item added
            };
          }

          return { 
            items: [...state.items, { product, quantity: qtyToAdd }],
            isOpen: true
          };
        });
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.product.id === productId);
          if (!item) return state;
          
          // Ensure min order qty is respected
          const finalQty = Math.max(quantity, item.product.minOrderQty || 1);
          
          if (finalQty <= 0) {
            return {
              items: state.items.filter((i) => i.product.id !== productId),
            };
          }
          
          return {
            items: state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity: finalQty } : i
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0),
    }),
    {
      name: 'libero-cart-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);
