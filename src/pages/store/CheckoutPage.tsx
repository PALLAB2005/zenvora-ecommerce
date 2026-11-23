import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, CreditCard, Lock, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataUI';
import { Input, Label } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import type { Order, PaymentMethod } from '../../types/commerce';
import { calculateCartTotals, formatCurrency } from '../../utils/commerceRules';

const checkoutSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid mobile number'),
  fullName: z.string().min(2, 'Enter recipient full name'),
  street: z.string().min(5, 'Enter complete street address'),
  city: z.string().min(2, 'Enter city'),
  state: z.string().min(2, 'Enter state or province'),
  pincode: z.string().min(4, 'Enter valid postal/pincode').max(10),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const appliedCouponCode = useCartStore((s) => s.appliedCouponCode);
  const deliveryMethod = useCartStore((s) => s.deliveryMethod);
  const setDeliveryMethod = useCartStore((s) => s.setDeliveryMethod);
  const clearCart = useCartStore((s) => s.clearCart);

  const currentUser = useAppDataStore((s) => s.currentUser);
  const addresses = useAppDataStore((s) => s.addresses);
  const coupons = useAppDataStore((s) => s.coupons);
  const products = useAppDataStore((s) => s.products);
  const pushToast = useToastStore((s) => s.pushToast);

  const defaultAddr = currentUser
    ? addresses.find((a) => a.userId === currentUser.id && a.isDefault) ??
      addresses.find((a) => a.userId === currentUser.id)
    : null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeCoupon = appliedCouponCode
    ? coupons.find((c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase())
    : null;
  const totals = calculateCartTotals(items, activeCoupon, deliveryMethod);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: currentUser?.email ?? '',
      phone: defaultAddr?.phone ?? currentUser?.phone ?? '',
      fullName: defaultAddr?.fullName ?? currentUser?.name ?? '',
      street: defaultAddr?.street ?? '',
      city: defaultAddr?.city ?? '',
      state: defaultAddr?.state ?? '',
      pincode: defaultAddr?.pincode ?? '',
    },
  });

  if (items.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Your bag is empty"
          description="Add studio objects to your shopping bag before proceeding to checkout."
          actionLabel="Return to Shop"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitting(true);
    setGatewayNotice(null);
    try {
      const verification = await paymentService.verifyMethod(paymentMethod);
      if (verification.gatewayRequired) {
        setGatewayNotice(verification.message);
        setSubmitting(false);
        return;
      }

      const orderId = `KOVA-${Math.floor(1044 + Math.random() * 8900)}`;
      const firstProduct = products.find((p) => p.id === items[0].productId);
      const etaDate = new Date(
        Date.now() + (deliveryMethod === 'express' ? 2 : 5) * 86400000
      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newOrder: Order = {
        id: orderId,
        customerId: currentUser?.id ?? 'guest',
        customerName: values.fullName,
        customerEmail: values.email,
        customerPhone: values.phone,
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          street: values.street,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
        items: items.map((item) => {
          const prod = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            image: item.image,
            colorName: item.colorName,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.price,
            costPrice: prod?.costPrice ?? Math.round(item.price * 0.45),
          };
        }),
        subtotal: totals.subtotal,
        discount: totals.discount,
        shippingFee: totals.shippingFee,
        total: totals.total,
        couponCode: appliedCouponCode ?? undefined,
        deliveryMethod,
        estimatedDelivery: etaDate,
        paymentMethod,
        paymentStatus: 'pending_cod',
        orderStatus: 'confirmed',
        supplierId: firstProduct?.supplierId,
        fulfillmentStatus: 'unassigned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await orderService.placeOrder(newOrder);
      clearCart();
      pushToast({
        title: `Order ${orderId} confirmed`,
        description: 'Your workshop order has been logged for dispatch.',
        variant: 'success',
      });
      navigate(`/order-success?orderId=${orderId}`);
    } catch (err) {
      pushToast({
        title: 'Checkout error',
        description: err instanceof Error ? err.message : 'Unable to place order.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Checkout</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Direct workshop fulfillment with insured delivery.
          </p>
        </div>
        <Link to="/cart" className="text-sm font-medium text-[#737373] hover:text-[#171717]">
          Return to Bag
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-8">
          {/* Contact Information */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#171717]">1. Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkout-email">Email Address</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="clara@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <div>
                <Label htmlFor="checkout-phone">Mobile Number</Label>
                <Input
                  id="checkout-phone"
                  type="tel"
                  placeholder="+1 (415) 555-0192"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#171717]">2. Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="checkout-name">Recipient Full Name</Label>
                <Input
                  id="checkout-name"
                  placeholder="Clara Jensen"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
              </div>
              <div>
                <Label htmlFor="checkout-street">Street Address & Suite</Label>
                <Input
                  id="checkout-street"
                  placeholder="418 Bryant Street, Suite 4B"
                  error={errors.street?.message}
                  {...register('street')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="checkout-city">City</Label>
                  <Input id="checkout-city" placeholder="San Francisco" error={errors.city?.message} {...register('city')} />
                </div>
                <div>
                  <Label htmlFor="checkout-state">State</Label>
                  <Input id="checkout-state" placeholder="CA" error={errors.state?.message} {...register('state')} />
                </div>
                <div>
                  <Label htmlFor="checkout-pincode">Postal / Pincode</Label>
                  <Input id="checkout-pincode" placeholder="94107" error={errors.pincode?.message} {...register('pincode')} />
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Method */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#171717]">3. Delivery Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('standard')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  deliveryMethod === 'standard'
                    ? 'border-[#171717] bg-[#F8F8F7] ring-1 ring-[#171717]'
                    : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#171717]">Standard Insured</span>
                  <span className="text-xs font-semibold tabular-nums text-[#171717]">
                    {totals.subtotal - totals.discount >= 150 ? 'Free' : '$12'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#737373]">3–5 business days · Tracked courier</p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('express')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  deliveryMethod === 'express'
                    ? 'border-[#171717] bg-[#F8F8F7] ring-1 ring-[#171717]'
                    : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#171717]">Priority Air Express</span>
                  <span className="text-xs font-semibold tabular-nums text-[#171717]">$24</span>
                </div>
                <p className="mt-1 text-xs text-[#737373]">1–2 business days · Signature required</p>
              </button>
            </div>
          </section>

          {/* Payment Options */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#171717]">4. Payment Method</h2>
            <div className="space-y-2.5">
              {[
                {
                  id: 'cod' as PaymentMethod,
                  title: 'Cash on Delivery (COD)',
                  subtitle: 'Pay via cash or mobile terminal upon courier arrival. Instant order confirmation.',
                },
                {
                  id: 'razorpay' as PaymentMethod,
                  title: 'Razorpay Checkout',
                  subtitle: 'Requires live server RAZORPAY_KEY_ID configuration for settlement.',
                },
                {
                  id: 'upi' as PaymentMethod,
                  title: 'UPI Instant Transfer',
                  subtitle: 'Requires live payment gateway webhook configuration.',
                },
                {
                  id: 'card' as PaymentMethod,
                  title: 'Credit / Debit Card',
                  subtitle: 'Requires live payment gateway configuration.',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === opt.id
                      ? 'border-[#171717] bg-[#F8F8F7]'
                      : 'border-[#E5E5E5] hover:bg-[#F8F8F7]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === opt.id}
                    onChange={() => {
                      setPaymentMethod(opt.id);
                      setGatewayNotice(null);
                    }}
                    className="mt-1 accent-[#2563EB]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#171717]">{opt.title}</p>
                    <p className="text-xs text-[#737373] mt-0.5">{opt.subtitle}</p>
                  </div>
                </label>
              ))}
            </div>

            {gatewayNotice && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] text-xs text-[#92400E]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Live Payment Gateway Not Configured</p>
                  <p>{gatewayNotice}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-5 bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-6 space-y-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-[#171717]">Order Summary</h2>
          <ul className="divide-y divide-[#E5E5E5]">
            {items.map((item) => (
              <li key={item.sku} className="py-3.5 flex items-center gap-3.5">
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-16 rounded-xl object-cover bg-white border border-[#E5E5E5] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#171717] truncate">{item.name}</p>
                  <p className="text-xs text-[#737373]">
                    {item.colorName} × <span className="tabular-nums">{item.quantity}</span>
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-[#171717]">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 pt-4 border-t border-[#E5E5E5] text-sm">
            <div className="flex justify-between text-[#737373]">
              <span>Subtotal</span>
              <span className="tabular-nums text-[#171717]">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-[#16A34A]">
                <span>Coupon ({appliedCouponCode})</span>
                <span className="tabular-nums">-{formatCurrency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#737373]">
              <span>Shipping ({deliveryMethod})</span>
              <span className="tabular-nums text-[#171717]">
                {totals.shippingFee === 0 ? 'Complimentary' : formatCurrency(totals.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E5E5E5] text-lg font-bold text-[#171717]">
              <span>Total Payable</span>
              <span className="tabular-nums">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <Button type="submit" variant="accent" size="lg" loading={submitting} className="w-full">
            <Lock className="h-4 w-4" />
            Place Order · {formatCurrency(totals.total)}
          </Button>

          <div className="flex items-center justify-center gap-4 text-[11px] text-[#737373]">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
              30-day returns
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-[#171717]" />
              Insured shipping
            </span>
            <span className="inline-flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-[#171717]" />
              COD supported
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
