import { useAppDataStore } from '../store/useAppDataStore';
import type { FulfillmentStatus, Supplier } from '../types/commerce';

export const supplierService = {
  async list(): Promise<Supplier[]> {
    return useAppDataStore.getState().suppliers;
  },

  async getById(id: string): Promise<Supplier | null> {
    return (
      useAppDataStore.getState().suppliers.find((s) => s.id === id) ?? null
    );
  },

  async listAssignedOrders(supplierId: string) {
    return useAppDataStore
      .getState()
      .orders.filter((o) => o.supplierId === supplierId);
  },

  async listSupplierProducts(supplierId: string) {
    return useAppDataStore
      .getState()
      .products.filter((p) => p.supplierId === supplierId);
  },

  async updateOrderFulfillment(
    orderId: string,
    status: FulfillmentStatus,
    details?: { carrier?: string; trackingNumber?: string }
  ) {
    useAppDataStore.getState().updateFulfillment(orderId, status, details);
  },
};
