import { useAppDataStore } from '../store/useAppDataStore';
import { useCartStore } from '../store/useCartStore';
import { calculateCartTotals } from '../utils/commerceRules';

export const cartService = {
  getSummary() {
    const { items, appliedCouponCode, deliveryMethod } = useCartStore.getState();
    const coupons = useAppDataStore.getState().coupons;
    const coupon = appliedCouponCode
      ? coupons.find((c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase())
      : null;
    return {
      items,
      coupon,
      totals: calculateCartTotals(items, coupon, deliveryMethod),
    };
  },

  validateCoupon(code: string) {
    const normalized = code.trim().toUpperCase();
    const coupon = useAppDataStore
      .getState()
      .coupons.find((c) => c.code.toUpperCase() === normalized);
    if (!coupon) {
      return { valid: false, error: `Coupon "${normalized}" was not found.` };
    }
    const { items, deliveryMethod } = useCartStore.getState();
    const totals = calculateCartTotals(items, coupon, deliveryMethod);
    if (totals.couponError) {
      return { valid: false, error: totals.couponError };
    }
    useCartStore.getState().applyCouponCode(coupon.code);
    return { valid: true, coupon };
  },
};
