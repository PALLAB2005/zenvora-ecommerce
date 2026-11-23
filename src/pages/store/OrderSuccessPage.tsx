import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/SafeImage';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useOrderLookupQuery } from '../../hooks/useCommerceQueries';
import { formatCurrency, formatDate } from '../../utils/commerceRules';

export function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const { data: order } = useOrderLookupQuery(orderId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 sm:p-10">
        <div className="flex items-center gap-3 text-[#16A34A]">
          <CheckCircle2 className="h-7 w-7" />
          <span className="text-sm font-semibold uppercase tracking-wider">Order Confirmed</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#171717]">
          {order ? `Order #${order.id} Confirmed — Preparing Shipment` : 'Thank you for your order'}
        </h1>
        <p className="mt-2 text-sm text-[#737373]">
          A confirmation has been logged for {order?.customerEmail ?? 'your email'}. You can track workshop dispatch anytime.
        </p>

        {order && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] text-xs">
              <div>
                <p className="text-[#737373]">Order Date</p>
                <p className="mt-1 font-semibold text-[#171717]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[#737373]">Est. Delivery</p>
                <p className="mt-1 font-semibold text-[#171717]">{order.estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-[#737373]">Payment</p>
                <div className="mt-1">
                  <StatusLabel status={order.paymentStatus} />
                </div>
              </div>
              <div>
                <p className="text-[#737373]">Total Payable</p>
                <p className="mt-1 font-semibold tabular-nums text-[#171717]">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] rounded-xl overflow-hidden">
              {order.items.map((item) => (
                <div key={item.sku} className="p-4 flex items-center gap-4 bg-white">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-16 rounded-lg object-cover bg-[#F8F8F7] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#171717] truncate">{item.name}</p>
                    <p className="text-xs text-[#737373]">
                      {item.colorName} · Qty <span className="tabular-nums">{item.quantity}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={order ? `/track-order?orderId=${order.id}` : '/track-order'}>
            <Button variant="primary" size="lg">
              <Package className="h-4 w-4" />
              Track Shipment
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
