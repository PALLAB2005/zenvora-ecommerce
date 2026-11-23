import type { CartItem, Coupon, FulfillmentStatus, OrderStatus, Product, UserRole } from '../types/commerce';

export const FREE_SHIPPING_THRESHOLD = 150;
export const STANDARD_SHIPPING_FEE = 12;
export const EXPRESS_SHIPPING_FEE = 24;

export interface ProductFilterOptions {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  includeDrafts?: boolean;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponError?: string;
  freeShippingProgress: number;
}

export function calculateDiscountPercent(price: number, originalPrice: number): number {
  if (originalPrice <= 0 || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function calculateSupplierMargin(sellingPrice: number, costPrice: number): {
  profit: number;
  marginPercent: number;
} {
  if (sellingPrice <= 0) return { profit: 0, marginPercent: 0 };
  const profit = Number((sellingPrice - costPrice).toFixed(2));
  const marginPercent = Math.round((profit / sellingPrice) * 100);
  return { profit, marginPercent };
}

export function calculateCartTotals(
  items: Pick<CartItem, 'price' | 'quantity'>[],
  coupon: Coupon | null | undefined,
  deliveryMethod: 'standard' | 'express' = 'standard',
  now: Date = new Date()
): CartTotals {
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  if (items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      shippingFee: 0,
      total: 0,
      freeShippingProgress: 0,
    };
  }

  let discount = 0;
  let freeShippingByCoupon = false;
  let couponError: string | undefined;

  if (coupon) {
    const isExpired = new Date(coupon.expiresAt).getTime() < now.getTime();
    if (!coupon.active || isExpired) {
      couponError = `Coupon "${coupon.code}" is inactive or expired.`;
    } else if (subtotal < coupon.minOrderAmount) {
      couponError = `Minimum order of $${coupon.minOrderAmount} required for "${coupon.code}".`;
    } else {
      if (coupon.type === 'percentage') {
        discount = Number(((subtotal * coupon.value) / 100).toFixed(2));
      } else if (coupon.type === 'fixed') {
        discount = Math.min(subtotal, coupon.value);
      } else if (coupon.type === 'free_shipping') {
        freeShippingByCoupon = true;
      }
    }
  }

  const discountedSubtotal = Math.max(0, Number((subtotal - discount).toFixed(2)));
  let shippingFee = 0;

  if (deliveryMethod === 'express') {
    shippingFee = freeShippingByCoupon ? 0 : EXPRESS_SHIPPING_FEE;
  } else {
    shippingFee =
      freeShippingByCoupon || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING_FEE;
  }

  const total = Number((discountedSubtotal + shippingFee).toFixed(2));
  const freeShippingProgress = Math.min(
    100,
    Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return {
    subtotal,
    discount,
    shippingFee,
    total,
    couponError,
    freeShippingProgress,
  };
}

export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions = {}
): Product[] {
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy = 'featured',
    includeDrafts = false,
  } = options;

  const query = search?.trim().toLowerCase() ?? '';

  const filtered = products.filter((product) => {
    if (!includeDrafts && product.status !== 'active') return false;
    if (categoryId && categoryId !== 'all' && product.categoryId !== categoryId) return false;
    if (typeof minPrice === 'number' && product.price < minPrice) return false;
    if (typeof maxPrice === 'number' && product.price > maxPrice) return false;
    if (typeof minRating === 'number' && product.rating < minRating) return false;
    if (inStockOnly && product.stock <= 0) return false;
    if (query) {
      const haystack = `${product.name} ${product.categoryName} ${product.brand} ${product.sku} ${product.shortDescription}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'newest':
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'featured':
    default:
      sorted.sort(
        (a, b) =>
          Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller)) ||
          b.reviewCount - a.reviewCount
      );
      break;
  }
  return sorted;
}

const ADMIN_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'assigned', 'cancelled'],
  confirmed: ['assigned', 'processing', 'cancelled'],
  assigned: ['processing', 'cancelled'],
  processing: ['packed', 'shipped', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const SUPPLIER_FULFILLMENT_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  unassigned: [],
  pending_acceptance: ['accepted', 'rejected'],
  accepted: ['packed'],
  rejected: [],
  packed: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
};

export function canTransitionOrderStatus(
  current: OrderStatus,
  next: OrderStatus,
  role: UserRole
): boolean {
  if (role === 'customer') {
    return next === 'cancelled' && (current === 'pending' || current === 'confirmed');
  }
  if (role === 'admin') {
    return ADMIN_ORDER_TRANSITIONS[current]?.includes(next) ?? false;
  }
  return false;
}

export function canTransitionFulfillmentStatus(
  current: FulfillmentStatus,
  next: FulfillmentStatus,
  role: UserRole
): boolean {
  if (role !== 'supplier' && role !== 'admin') return false;
  return SUPPLIER_FULFILLMENT_TRANSITIONS[current]?.includes(next) ?? false;
}

export function estimateDeliveryByPincode(pincode: string): {
  valid: boolean;
  serviceable: boolean;
  daysMin: number;
  daysMax: number;
  message: string;
} {
  const cleaned = pincode.trim();
  if (!/^[A-Za-z0-9\-\s]{4,10}$/.test(cleaned)) {
    return {
      valid: false,
      serviceable: false,
      daysMin: 0,
      daysMax: 0,
      message: 'Enter a valid 4–10 character postal or pincode.',
    };
  }
  const firstChar = cleaned.charCodeAt(0);
  const daysMin = firstChar % 2 === 0 ? 2 : 3;
  const daysMax = daysMin + 2;
  return {
    valid: true,
    serviceable: true,
    daysMin,
    daysMax,
    message: `Estimated delivery in ${daysMin}–${daysMax} business days · Cash on Delivery available`,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
