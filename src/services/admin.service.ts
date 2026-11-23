import { useAppDataStore } from '../store/useAppDataStore';
import type { Supplier } from '../types/commerce';

export const adminService = {
  getDashboardSnapshot() {
    const { orders, products, users, suppliers, returns } =
      useAppDataStore.getState();

    const validOrders = orders.filter((o) => o.orderStatus !== 'cancelled');
    const totalRevenue = validOrders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter(
      (o) =>
        o.orderStatus === 'pending' ||
        o.orderStatus === 'confirmed' ||
        o.orderStatus === 'assigned'
    ).length;
    const deliveredOrders = orders.filter(
      (o) => o.orderStatus === 'delivered'
    ).length;
    const customers = users.filter((u) => u.role === 'customer');
    const lowStockProducts = products.filter((p) => p.stock <= 10);

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      pendingOrders,
      deliveredOrders,
      totalSuppliers: suppliers.length,
      openReturns: returns.filter((r) => r.status === 'requested').length,
      lowStockProducts,
    };
  },

  assignSupplier(orderId: string, supplierId: string) {
    useAppDataStore.getState().assignSupplierToOrder(orderId, supplierId);
  },

  addSupplier(supplier: Supplier) {
    useAppDataStore.getState().addSupplier(supplier);
  },
};
