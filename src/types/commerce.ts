export type UserRole = 'customer' | 'admin' | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  supplierId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  price: number;
  originalPrice: number;
  costPrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  shortDescription: string;
  description: string;
  specifications: ProductSpec[];
  variants: ProductVariant[];
  supplierId: string;
  status: 'active' | 'draft';
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  colorName: string;
  size: string;
  sku: string;
  quantity: number;
  maxStock: number;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount: number;
  active: boolean;
  expiresAt: string;
  usageCount: number;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'razorpay' | 'upi' | 'card';
export type PaymentStatus = 'paid' | 'pending_cod' | 'awaiting_payment' | 'refunded' | 'failed';
export type FulfillmentStatus =
  | 'unassigned'
  | 'pending_acceptance'
  | 'accepted'
  | 'rejected'
  | 'packed'
  | 'shipped'
  | 'delivered';

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  colorName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  deliveryMethod: 'standard' | 'express';
  estimatedDelivery: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  supplierId?: string;
  supplierName?: string;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  leadTimeDays: number;
  rating: number;
  onTimeRate: number;
  active: boolean;
  joinedAt: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: { productId: string; productName: string; sku: string; qty: number; unitCost: number }[];
  totalCost: number;
  status: 'draft' | 'sent' | 'received';
  expectedDate: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  authorRole?: string;
  rating: number;
  title: string;
  comment: string;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  reason: string;
  amount: number;
  status: 'requested' | 'approved' | 'refunded' | 'rejected';
  createdAt: string;
}
