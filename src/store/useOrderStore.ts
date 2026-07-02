import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '../types';

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getUserOrders: (userId: string) => Order[];
  getAllOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        set((state) => ({ orders: [order, ...state.orders] }));
      },
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        }));
      },
      getUserOrders: (userId) => {
        return get().orders.filter((o) => o.userId === userId);
      },
      getAllOrders: () => {
        return get().orders;
      },
    }),
    {
      name: 'order-storage',
    }
  )
);
