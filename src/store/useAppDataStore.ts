import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SEED_ADDRESSES,
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_PURCHASE_ORDERS,
  SEED_RETURNS,
  SEED_REVIEWS,
  SEED_SUPPLIERS,
  SEED_USERS,
} from '../data/seedData';
import type {
  Address,
  Category,
  Coupon,
  FulfillmentStatus,
  Order,
  OrderStatus,
  Product,
  PurchaseOrder,
  ReturnRequest,
  Review,
  Supplier,
  User,
} from '../types/commerce';

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  announcementText: string;
}

interface UserRecord extends User {
  password: string;
}

interface AppDataState {
  users: UserRecord[];
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  orders: Order[];
  purchaseOrders: PurchaseOrder[];
  coupons: Coupon[];
  reviews: Review[];
  returns: ReturnRequest[];
  addresses: Address[];
  settings: StoreSettings;

  // Auth actions
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  register: (payload: { name: string; email: string; phone: string; password: string }) => {
    ok: boolean;
    error?: string;
    user?: User;
  };
  logout: () => void;
  updateProfile: (userId: string, data: Partial<Pick<User, 'name' | 'phone'>>) => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => { ok: boolean; error?: string };

  // Address actions
  addAddress: (addr: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string, userId: string) => void;

  // Product & Category CRUD
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, newStock: number) => void;
  addCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  // Orders & Fulfillment
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignSupplierToOrder: (orderId: string, supplierId: string) => void;
  updateFulfillment: (
    orderId: string,
    fulfillmentStatus: FulfillmentStatus,
    details?: { carrier?: string; trackingNumber?: string }
  ) => void;

  // Suppliers & Purchase Orders
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  createPurchaseOrder: (po: PurchaseOrder) => void;
  markPurchaseOrderReceived: (poId: string) => void;

  // Coupons, Reviews, Returns, Settings
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;
  addReview: (review: Review) => void;
  updateReviewStatus: (id: string, status: Review['status']) => void;
  createReturnRequest: (ret: ReturnRequest) => void;
  updateReturnStatus: (id: string, status: ReturnRequest['status']) => void;
  updateSettings: (partial: Partial<StoreSettings>) => void;
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      currentUser: null,
      products: SEED_PRODUCTS,
      categories: SEED_CATEGORIES,
      suppliers: SEED_SUPPLIERS,
      orders: SEED_ORDERS,
      purchaseOrders: SEED_PURCHASE_ORDERS,
      coupons: SEED_COUPONS,
      reviews: SEED_REVIEWS,
      returns: SEED_RETURNS,
      addresses: SEED_ADDRESSES,
      settings: {
        storeName: 'KOVA Atelier',
        supportEmail: 'concierge@kovaatelier.com',
        freeShippingThreshold: 150,
        standardShippingFee: 12,
        expressShippingFee: 24,
        codEnabled: true,
        razorpayEnabled: false,
        announcementText: 'Complimentary express shipping on orders over $150 · Autumn Architectural Drop now live',
      },

      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const found = get().users.find((u) => u.email.toLowerCase() === normalized);
        if (!found) {
          return { ok: false, error: 'No account found with this email address.' };
        }
        if (found.password !== password) {
          return { ok: false, error: 'Incorrect password. Please try again.' };
        }
        const { password: _pw, ...safeUser } = found;
        set({ currentUser: safeUser });
        return { ok: true, user: safeUser };
      },

      register: ({ name, email, phone, password }) => {
        const normalized = email.trim().toLowerCase();
        if (get().users.some((u) => u.email.toLowerCase() === normalized)) {
          return { ok: false, error: 'An account with this email already exists.' };
        }
        const newRecord: UserRecord = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email: normalized,
          phone: phone.trim(),
          role: 'customer',
          password,
          createdAt: new Date().toISOString(),
        };
        const { password: _pw, ...safeUser } = newRecord;
        set((state) => ({
          users: [...state.users, newRecord],
          currentUser: safeUser,
        }));
        return { ok: true, user: safeUser };
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (userId, data) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...data } : u)),
          currentUser:
            state.currentUser?.id === userId
              ? { ...state.currentUser, ...data }
              : state.currentUser,
        })),

      changePassword: (userId, currentPassword, newPassword) => {
        const found = get().users.find((u) => u.id === userId);
        if (!found || found.password !== currentPassword) {
          return { ok: false, error: 'Current password does not match.' };
        }
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, password: newPassword } : u
          ),
        }));
        return { ok: true };
      },

      addAddress: (addr) =>
        set((state) => {
          const id = `addr-${Date.now()}`;
          const next = addr.isDefault
            ? state.addresses.map((a) =>
                a.userId === addr.userId ? { ...a, isDefault: false } : a
              )
            : state.addresses;
          return { addresses: [...next, { ...addr, id }] };
        }),

      deleteAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),

      setDefaultAddress: (id, userId) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.userId === userId ? { ...a, isDefault: a.id === id } : a
          ),
        })),

      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      adjustStock: (productId, newStock) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
          ),
        })),

      addCategory: (cat) =>
        set((state) => ({ categories: [...state.categories, cat] })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      createOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
          products: state.products.map((p) => {
            const orderedQty = order.items
              .filter((i) => i.productId === p.id)
              .reduce((sum, i) => sum + i.quantity, 0);
            return orderedQty > 0
              ? { ...p, stock: Math.max(0, p.stock - orderedQty) }
              : p;
          }),
          coupons: order.couponCode
            ? state.coupons.map((c) =>
                c.code === order.couponCode ? { ...c, usageCount: c.usageCount + 1 } : c
              )
            : state.coupons,
        })),

      updateOrderStatus: (orderId, orderStatus) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  orderStatus,
                  paymentStatus:
                    orderStatus === 'delivered' && o.paymentMethod === 'cod'
                      ? 'paid'
                      : o.paymentStatus,
                  updatedAt: new Date().toISOString(),
                }
              : o
          ),
        })),

      assignSupplierToOrder: (orderId, supplierId) =>
        set((state) => {
          const supplier = state.suppliers.find((s) => s.id === supplierId);
          return {
            orders: state.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    supplierId,
                    supplierName: supplier?.name ?? supplierId,
                    orderStatus: o.orderStatus === 'pending' || o.orderStatus === 'confirmed' ? 'assigned' : o.orderStatus,
                    fulfillmentStatus: 'pending_acceptance',
                    updatedAt: new Date().toISOString(),
                  }
                : o
            ),
          };
        }),

      updateFulfillment: (orderId, fulfillmentStatus, details) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            let nextOrderStatus = o.orderStatus;
            if (fulfillmentStatus === 'accepted') nextOrderStatus = 'processing';
            if (fulfillmentStatus === 'packed') nextOrderStatus = 'packed';
            if (fulfillmentStatus === 'shipped') nextOrderStatus = 'shipped';
            if (fulfillmentStatus === 'delivered') nextOrderStatus = 'delivered';
            if (fulfillmentStatus === 'rejected') nextOrderStatus = 'confirmed';

            return {
              ...o,
              fulfillmentStatus,
              orderStatus: nextOrderStatus,
              carrier: details?.carrier ?? o.carrier,
              trackingNumber: details?.trackingNumber ?? o.trackingNumber,
              paymentStatus:
                nextOrderStatus === 'delivered' && o.paymentMethod === 'cod'
                  ? 'paid'
                  : o.paymentStatus,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      addSupplier: (supplier) =>
        set((state) => ({ suppliers: [supplier, ...state.suppliers] })),

      updateSupplier: (id, data) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      createPurchaseOrder: (po) =>
        set((state) => ({
          purchaseOrders: [po, ...state.purchaseOrders],
        })),

      markPurchaseOrderReceived: (poId) =>
        set((state) => {
          const po = state.purchaseOrders.find((p) => p.id === poId);
          if (!po || po.status === 'received') return state;
          return {
            purchaseOrders: state.purchaseOrders.map((p) =>
              p.id === poId ? { ...p, status: 'received' } : p
            ),
            products: state.products.map((prod) => {
              const line = po.items.find((i) => i.productId === prod.id);
              return line ? { ...prod, stock: prod.stock + line.qty } : prod;
            }),
          };
        }),

      addCoupon: (coupon) =>
        set((state) => ({ coupons: [coupon, ...state.coupons] })),

      toggleCoupon: (code) =>
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.code === code ? { ...c, active: !c.active } : c
          ),
        })),

      addReview: (review) =>
        set((state) => ({
          reviews: [review, ...state.reviews],
          products: state.products.map((p) =>
            p.id === review.productId
              ? {
                  ...p,
                  reviewCount: p.reviewCount + 1,
                  rating: Number(
                    ((p.rating * p.reviewCount + review.rating) / (p.reviewCount + 1)).toFixed(1)
                  ),
                }
              : p
          ),
        })),

      updateReviewStatus: (id, status) =>
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === id ? { ...r, status } : r)),
        })),

      createReturnRequest: (ret) =>
        set((state) => ({ returns: [ret, ...state.returns] })),

      updateReturnStatus: (id, status) =>
        set((state) => {
          const ret = state.returns.find((r) => r.id === id);
          return {
            returns: state.returns.map((r) => (r.id === id ? { ...r, status } : r)),
            orders:
              status === 'refunded' && ret
                ? state.orders.map((o) =>
                    o.id === ret.orderId ? { ...o, paymentStatus: 'refunded' } : o
                  )
                : state.orders,
          };
        }),

      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: 'kova_atelier_data_v1',
    }
  )
);
