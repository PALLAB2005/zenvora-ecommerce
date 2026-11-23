import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useCartStore } from '../../store/useCartStore';
import { calculateCartTotals, formatCurrency, FREE_SHIPPING_THRESHOLD } from '../../utils/commerceRules';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { SafeImage } from '../ui/SafeImage';

export function MiniCartDrawer() {
  const navigate = useNavigate();
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const appliedCouponCode = useCartStore((s) => s.appliedCouponCode);
  const deliveryMethod = useCartStore((s) => s.deliveryMethod);
  const coupons = useAppDataStore((s) => s.coupons);

  const coupon = appliedCouponCode
    ? coupons.find((c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase())
    : null;
  const totals = calculateCartTotals(items, coupon, deliveryMethod);
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);

  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      title={`Shopping Bag (${items.reduce((s, i) => s + i.quantity, 0)})`}
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#737373]">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#171717]">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-[#16A34A]">
                  <span>Discount ({appliedCouponCode})</span>
                  <span className="tabular-nums font-medium">
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#737373]">
                <span>Estimated shipping</span>
                <span className="tabular-nums font-medium text-[#171717]">
                  {totals.shippingFee === 0 ? 'Complimentary' : formatCurrency(totals.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E5E5] text-base font-semibold text-[#171717]">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/cart');
                }}
              >
                View Bag
              </Button>
              <Button
                variant="accent"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/checkout');
                }}
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="h-14 w-14 rounded-2xl bg-[#F8F8F7] border border-[#E5E5E5] flex items-center justify-center text-[#737373] mb-4">
            <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
          </div>
          <p className="text-base font-semibold text-[#171717]">Your bag is empty</p>
          <p className="mt-1.5 text-sm text-[#737373] max-w-xs">
            Explore architectural lighting, studio audio, and minimalist living essentials.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => {
              setDrawerOpen(false);
              navigate('/shop');
            }}
          >
            Browse Collection
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5]">
            <p className="text-xs font-medium text-[#171717]">
              {remainingForFree === 0
                ? 'Your order qualifies for complimentary standard insured delivery.'
                : `Add ${formatCurrency(remainingForFree)} more for complimentary standard shipping.`}
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#E5E5E5] overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${totals.freeShippingProgress}%` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-[#E5E5E5]">
            {items.map((item) => (
              <li key={item.sku} className="py-4 flex gap-4">
                <Link
                  to={`/products/${item.slug}`}
                  onClick={() => setDrawerOpen(false)}
                  className="h-20 w-24 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] overflow-hidden shrink-0"
                >
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/products/${item.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="text-sm font-semibold text-[#171717] hover:text-[#2563EB] truncate"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.sku)}
                      aria-label={`Remove ${item.name} from bag`}
                      className="text-[#737373] hover:text-[#DC2626] cursor-pointer p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#737373] mt-0.5">
                    {item.colorName} · {item.size}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#E5E5E5] rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="h-7 w-7 inline-flex items-center justify-center text-[#171717] hover:bg-[#F8F8F7] cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="h-7 w-7 inline-flex items-center justify-center text-[#171717] hover:bg-[#F8F8F7] cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-[#171717]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
