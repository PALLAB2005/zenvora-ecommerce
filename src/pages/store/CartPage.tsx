import { useState } from 'react';
import { ArrowRight, Bookmark, Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataUI';
import { Input } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { useProductsQuery } from '../../hooks/useCommerceQueries';
import { cartService } from '../../services/cart.service';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { calculateCartTotals, formatCurrency } from '../../utils/commerceRules';

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const savedForLater = useCartStore((s) => s.savedForLater);
  const appliedCouponCode = useCartStore((s) => s.appliedCouponCode);
  const deliveryMethod = useCartStore((s) => s.deliveryMethod);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCart = useCartStore((s) => s.moveToCart);
  const removeSavedItem = useCartStore((s) => s.removeSavedItem);
  const applyCouponCode = useCartStore((s) => s.applyCouponCode);
  const setDeliveryMethod = useCartStore((s) => s.setDeliveryMethod);
  const coupons = useAppDataStore((s) => s.coupons);
  const pushToast = useToastStore((s) => s.pushToast);

  const { data: allProducts = [] } = useProductsQuery();
  const [couponInput, setCouponInput] = useState(appliedCouponCode || '');
  const [couponFeedback, setCouponFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const activeCoupon = appliedCouponCode
    ? coupons.find((c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase())
    : null;
  const totals = calculateCartTotals(items, activeCoupon, deliveryMethod);

  const recommended = allProducts
    .filter((p) => !items.some((i) => i.productId === p.id))
    .slice(0, 4);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      applyCouponCode(null);
      setCouponFeedback(null);
      return;
    }
    const res = cartService.validateCoupon(couponInput);
    if (!res.valid) {
      setCouponFeedback({ ok: false, msg: res.error || 'Invalid coupon' });
    } else {
      setCouponFeedback({ ok: true, msg: `Coupon ${res.coupon?.code} applied.` });
      pushToast({ title: `Coupon ${res.coupon?.code} applied`, variant: 'success' });
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
            Shopping Bag
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Review your items, apply studio vouchers, or save pieces for later.
          </p>
        </div>
        <Link to="/shop" className="text-sm font-semibold text-[#2563EB] hover:underline">
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<ShoppingBag className="h-9 w-9" />}
            title="Your shopping bag is currently empty"
            description="Browse our collection of architectural lamps, acoustic speakers, and minimalist studio vessels."
            actionLabel="Explore Catalog"
            onAction={() => navigate('/shop')}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.sku}
                className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-[#E5E5E5] rounded-2xl"
              >
                <Link
                  to={`/products/${item.slug}`}
                  className="h-28 w-full sm:w-32 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] overflow-hidden shrink-0"
                >
                  <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/products/${item.slug}`}
                        className="text-base font-semibold text-[#171717] hover:text-[#2563EB]"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-[#737373] mt-1">
                        {item.colorName} · {item.size} · SKU <span className="font-mono">{item.sku}</span>
                      </p>
                    </div>
                    <p className="text-base font-semibold tabular-nums text-[#171717]">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E5E5]/70">
                    <div className="inline-flex items-center border border-[#E5E5E5] rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${item.name}`}
                        className="h-8 w-8 inline-flex items-center justify-center hover:bg-[#F8F8F7] cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                        aria-label={`Increase quantity for ${item.name}`}
                        className="h-8 w-8 inline-flex items-center justify-center hover:bg-[#F8F8F7] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          saveForLater(item.sku);
                          pushToast({ title: 'Saved for later', description: item.name, variant: 'default' });
                        }}
                        className="inline-flex items-center gap-1.5 text-[#737373] hover:text-[#171717] cursor-pointer"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        Save for later
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.sku)}
                        className="inline-flex items-center gap-1.5 text-[#737373] hover:text-[#DC2626] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-4 bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-6 space-y-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-[#171717]">Order Summary</h2>

            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label htmlFor="coupon-code" className="flex items-center gap-1.5 text-xs font-semibold text-[#171717]">
                <Tag className="h-3.5 w-3.5 text-[#737373]" />
                Promo Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Try KOVA15 or WELCOME20"
                />
                <Button type="submit" variant="outline">
                  Apply
                </Button>
              </div>
              {couponFeedback && (
                <p className={`text-xs ${couponFeedback.ok ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {couponFeedback.msg}
                </p>
              )}
              {appliedCouponCode && (
                <button
                  type="button"
                  onClick={() => {
                    applyCouponCode(null);
                    setCouponInput('');
                    setCouponFeedback(null);
                  }}
                  className="text-xs text-[#737373] underline hover:text-[#171717] cursor-pointer"
                >
                  Remove coupon ({appliedCouponCode})
                </button>
              )}
            </form>

            <div className="space-y-2 pt-4 border-t border-[#E5E5E5]">
              <p className="text-xs font-semibold text-[#171717]">Shipping Speed</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('standard')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                    deliveryMethod === 'standard'
                      ? 'bg-white border-[#171717] font-semibold'
                      : 'bg-white/60 border-[#E5E5E5] text-[#737373]'
                  }`}
                >
                  <p>Standard (3–5d)</p>
                  <p className="mt-0.5 tabular-nums">Free over $150</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('express')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                    deliveryMethod === 'express'
                      ? 'bg-white border-[#171717] font-semibold'
                      : 'bg-white/60 border-[#E5E5E5] text-[#737373]'
                  }`}
                >
                  <p>Express (1–2d)</p>
                  <p className="mt-0.5 tabular-nums">$24.00</p>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#E5E5E5] text-sm">
              <div className="flex justify-between text-[#737373]">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#171717]">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-[#16A34A]">
                  <span>Discount</span>
                  <span className="tabular-nums font-medium">-{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#737373]">
                <span>Shipping</span>
                <span className="tabular-nums font-medium text-[#171717]">
                  {totals.shippingFee === 0 ? 'Complimentary' : formatCurrency(totals.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E5E5E5] text-base font-bold text-[#171717]">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </aside>
        </div>
      )}

      {savedForLater.length > 0 && (
        <section className="mt-14 pt-10 border-t border-[#E5E5E5]">
          <h2 className="text-xl font-bold text-[#171717] mb-5">
            Saved for Later ({savedForLater.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedForLater.map((item) => (
              <div
                key={item.sku}
                className="flex items-center gap-4 p-4 border border-[#E5E5E5] rounded-2xl bg-white"
              >
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-20 rounded-xl object-cover bg-[#F8F8F7] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#171717] truncate">{item.name}</p>
                  <p className="text-xs text-[#737373] tabular-nums mt-0.5">{formatCurrency(item.price)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => moveToCart(item.sku)}
                      className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Move to Bag
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedItem(item.sku)}
                      className="text-xs text-[#737373] hover:text-[#DC2626] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#E5E5E5]">
          <h2 className="text-2xl font-bold text-[#171717] mb-6">Recommended Pairings</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
