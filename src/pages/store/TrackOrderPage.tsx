import { useState } from 'react';
import { Check, Package, Search, Truck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataUI';
import { Input } from '../../components/ui/FormControls';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useOrderLookupQuery } from '../../hooks/useCommerceQueries';
import { formatCurrency, formatDate } from '../../utils/commerceRules';

const STEPS = ['confirmed', 'assigned', 'processing', 'packed', 'shipped', 'delivered'] as const;

export function TrackOrderPage() {
  const [params, setParams] = useSearchParams();
  const initialId = params.get('orderId') || 'KOVA-1041';
  const [inputValue, setInputValue] = useState(initialId);
  const [lookupId, setLookupId] = useState(initialId);

  const { data: order } = useOrderLookupQuery(lookupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputValue.trim().toUpperCase();
    setLookupId(cleaned);
    setParams({ orderId: cleaned });
  };

  const activeIdx = order ? STEPS.indexOf(order.orderStatus as typeof STEPS[number]) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Track Your Order</h1>
        <p className="mt-2 text-sm text-[#737373]">
          Enter your KOVA order reference (e.g., <span className="font-mono text-[#171717]">KOVA-1041</span> or <span className="font-mono text-[#171717]">KOVA-1042</span>) to view live workshop and courier progress.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto mb-10">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#737373] absolute left-3.5 top-3 pointer-events-none" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="KOVA-1041"
            aria-label="Order reference number"
            className="pl-10 font-mono uppercase"
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Track Order
        </Button>
      </form>

      {!order ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title={`No order found for "${lookupId}"`}
          description="Verify your order reference number from your confirmation receipt."
        />
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
            <div>
              <p className="text-xs font-mono text-[#737373]">ORDER #{order.id}</p>
              <h2 className="text-xl font-bold text-[#171717] mt-1">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Placed {formatDate(order.createdAt)} · Estimated arrival {order.estimatedDelivery}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusLabel status={order.orderStatus} />
              <StatusLabel status={order.paymentStatus} />
            </div>
          </div>

          {order.orderStatus !== 'cancelled' && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {STEPS.map((step, idx) => {
                const done = activeIdx >= idx;
                return (
                  <div key={step} className="flex flex-col items-start gap-2">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                        done
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-[#F8F8F7] text-[#737373] border-[#E5E5E5]'
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <span className={`text-xs capitalize ${done ? 'font-semibold text-[#171717]' : 'text-[#737373]'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {order.trackingNumber && (
            <div className="p-4 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#2563EB]" />
                <div>
                  <p className="text-xs text-[#737373]">Carrier & Tracking Number</p>
                  <p className="text-sm font-semibold font-mono text-[#171717]">
                    {order.carrier || 'Express'} · {order.trackingNumber}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#171717] tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
