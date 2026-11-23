import { useAppDataStore } from '../store/useAppDataStore';
import type { Order, OrderStatus } from '../types/commerce';

export const orderService = {
  async listAll(): Promise<Order[]> {
    return useAppDataStore.getState().orders;
  },

  async listByCustomer(customerId: string): Promise<Order[]> {
    return useAppDataStore
      .getState()
      .orders.filter((o) => o.customerId === customerId);
  },

  async getById(orderId: string): Promise<Order | null> {
    const normalized = orderId.trim().toUpperCase();
    return (
      useAppDataStore
        .getState()
        .orders.find((o) => o.id.toUpperCase() === normalized) ?? null
    );
  },

  async placeOrder(order: Order): Promise<Order> {
    await new Promise((r) => setTimeout(r, 250));
    useAppDataStore.getState().createOrder(order);
    return order;
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    useAppDataStore.getState().updateOrderStatus(orderId, status);
  },
};
