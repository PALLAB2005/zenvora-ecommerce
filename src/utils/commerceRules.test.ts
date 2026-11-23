import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  calculateDiscountPercent,
  calculateSupplierMargin,
  canTransitionFulfillmentStatus,
  canTransitionOrderStatus,
  estimateDeliveryByPincode,
  filterAndSortProducts,
} from './commerceRules';
import type { Coupon, Product } from '../types/commerce';

const sampleProducts: Product[] = [
  {
    id: 'p1',
    slug: 'arc-desk-lamp',
    name: 'Arc Cantilever Lamp',
    brand: 'KOVA',
    categoryId: 'lighting',
    categoryName: 'Lighting',
    sku: 'KV-LMP-01',
    price: 220,
    originalPrice: 260,
    costPrice: 95,
    stock: 14,
    rating: 4.9,
    reviewCount: 64,
    images: ['/img1.jpg'],
    shortDescription: 'Brushed titanium desk lamp',
    description: 'Full description',
    specifications: [],
    variants: [],
    supplierId: 'sup-1',
    status: 'active',
    isBestSeller: true,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'p2',
    slug: 'monolith-speaker',
    name: 'Monolith Acoustic Speaker',
    brand: 'KOVA',
    categoryId: 'audio',
    categoryName: 'Audio',
    sku: 'KV-AUD-02',
    price: 120,
    originalPrice: 120,
    costPrice: 54,
    stock: 0,
    rating: 4.4,
    reviewCount: 22,
    images: ['/img2.jpg'],
    shortDescription: 'Compact wireless speaker',
    description: 'Full description',
    specifications: [],
    variants: [],
    supplierId: 'sup-2',
    status: 'active',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'p3',
    slug: 'draft-tray',
    name: 'Draft Prototype Tray',
    brand: 'KOVA',
    categoryId: 'workspace',
    categoryName: 'Workspace',
    sku: 'KV-WRK-99',
    price: 85,
    originalPrice: 85,
    costPrice: 30,
    stock: 5,
    rating: 5.0,
    reviewCount: 1,
    images: ['/img3.jpg'],
    shortDescription: 'Internal draft item',
    description: 'Draft',
    specifications: [],
    variants: [],
    supplierId: 'sup-1',
    status: 'draft',
    createdAt: '2026-11-10T10:00:00Z',
  },
];

test('calculateDiscountPercent returns rounded percentage', () => {
  assert.equal(calculateDiscountPercent(220, 260), 15);
  assert.equal(calculateDiscountPercent(100, 100), 0);
  assert.equal(calculateDiscountPercent(100, 0), 0);
});

test('calculateSupplierMargin computes profit and margin percent', () => {
  assert.deepEqual(calculateSupplierMargin(200, 80), { profit: 120, marginPercent: 60 });
});

test('calculateCartTotals handles percentage coupons and free shipping threshold', () => {
  const coupon: Coupon = {
    code: 'KOVA15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 100,
    active: true,
    expiresAt: '2028-01-01T00:00:00Z',
    usageCount: 10,
  };

  // Subtotal $120 -> 15% discount = $18 -> discounted subtotal $102 (< $150 free shipping) -> +$12 shipping = $114
  const underThreshold = calculateCartTotals(
    [{ price: 120, quantity: 1 }],
    coupon,
    'standard',
    new Date('2026-11-21T00:00:00Z')
  );
  assert.equal(underThreshold.subtotal, 120);
  assert.equal(underThreshold.discount, 18);
  assert.equal(underThreshold.shippingFee, 12);
  assert.equal(underThreshold.total, 114);

  // Subtotal $220 -> 15% discount = $33 -> discounted $187 (>= $150) -> free standard shipping -> $187
  const overThreshold = calculateCartTotals(
    [{ price: 220, quantity: 1 }],
    coupon,
    'standard',
    new Date('2026-11-21T00:00:00Z')
  );
  assert.equal(overThreshold.shippingFee, 0);
  assert.equal(overThreshold.total, 187);
});

test('calculateCartTotals reports error when coupon minimum is not met', () => {
  const coupon: Coupon = {
    code: 'WELCOME20',
    type: 'fixed',
    value: 20,
    minOrderAmount: 150,
    active: true,
    expiresAt: '2028-01-01T00:00:00Z',
    usageCount: 0,
  };
  const res = calculateCartTotals([{ price: 100, quantity: 1 }], coupon, 'standard');
  assert.equal(res.discount, 0);
  assert.match(res.couponError ?? '', /Minimum order/);
});

test('filterAndSortProducts excludes drafts by default and filters by stock/category/sort', () => {
  const activeOnly = filterAndSortProducts(sampleProducts);
  assert.equal(activeOnly.length, 2);

  const inStock = filterAndSortProducts(sampleProducts, { inStockOnly: true });
  assert.equal(inStock.length, 1);
  assert.equal(inStock[0].id, 'p1');

  const priceAsc = filterAndSortProducts(sampleProducts, { sortBy: 'price-asc' });
  assert.deepEqual(
    priceAsc.map((p) => p.id),
    ['p2', 'p1']
  );
});

test('order and fulfillment transitions enforce role permissions', () => {
  assert.equal(canTransitionOrderStatus('pending', 'cancelled', 'customer'), true);
  assert.equal(canTransitionOrderStatus('shipped', 'cancelled', 'customer'), false);
  assert.equal(canTransitionOrderStatus('assigned', 'processing', 'admin'), true);
  assert.equal(canTransitionFulfillmentStatus('pending_acceptance', 'accepted', 'supplier'), true);
  assert.equal(canTransitionFulfillmentStatus('pending_acceptance', 'accepted', 'customer'), false);
});

test('estimateDeliveryByPincode validates format and returns serviceable window', () => {
  assert.equal(estimateDeliveryByPincode('12').valid, false);
  const ok = estimateDeliveryByPincode('94107');
  assert.equal(ok.valid, true);
  assert.equal(ok.serviceable, true);
});
