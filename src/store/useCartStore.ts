import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, CustomBox } from '../types';

interface CartState {
  items: CartItem[];
  customBoxes: CustomBox[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addCustomBox: (box: CustomBox) => void;
  removeCustomBox: (boxId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customBoxes: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.product.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { id: Math.random().toString(36).substr(2, 9), product, quantity }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        }));
      },
      addCustomBox: (box) => {
        set((state) => ({ customBoxes: [...state.customBoxes, box] }));
      },
      removeCustomBox: (boxId) => {
        set((state) => ({
          customBoxes: state.customBoxes.filter((b) => b.id !== boxId),
        }));
      },
      clearCart: () => set({ items: [], customBoxes: [] }),
      totalItems: () => {
        const { items, customBoxes } = get();
        return items.reduce((total, item) => total + item.quantity, 0) + customBoxes.length;
      },
      totalPrice: () => {
        const { items, customBoxes } = get();
        const itemsTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
        const boxesTotal = customBoxes.reduce((total, box) => total + box.totalPrice, 0);
        return itemsTotal + boxesTotal;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
