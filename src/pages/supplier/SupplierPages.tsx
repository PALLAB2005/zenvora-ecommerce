import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Check, Package, Truck, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataUI';
import { Input, Label } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';
import { formatCurrency, formatDate } from '../../utils/commerceRules';

function useSupplierId() {
  const currentUser = useAppDataStore((s) => s.currentUser);
  return currentUser?.supplierId || 'sup-nordic';
}

export function SupplierDashboardPage() {
  const supplierId = useSupplierId();
  const allOrders = useAppDataStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.supplierId === supplierId);
  const updateFulfillment = useAppDataStore((s) => s.updateFulfillment);
  const pushToast = useToastStore((s) => s.pushToast);

  const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'pending_acceptance');
  const processingOrders = orders.filter((o) => o.fulfillmentStatus === 'accepted' || o.fulfillmentStatus === 'packed');
  const completedOrders = orders.filter((o) => o.fulfillmentStatus === 'shipped' || o.fulfillmentStatus === 'delivered');

  const kpis = [
    { label: 'Total Assigned Orders', value: orders.length },
    { label: 'Pending Acceptance', value: pendingOrders.length },
    { label: 'Processing & Packed', value: processingOrders.length },
    { label: 'Completed Dispatches', value: completedOrders.length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Workshop Fulfillment Overview</h1>
        <p className="mt-1 text-sm text-[#737373]">Accept incoming dispatches, pack items, and publish carrier tracking.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
            <p className="text-xs text-[#737373]">{k.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[#171717]">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#171717]">Action Queue</h2>
          <Link to="/supplier/orders" className="text-xs font-semibold text-[#2563EB] hover:underline">
            View All Assigned Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No assigned orders" description="New orders routed by KOVA Operations will appear here." />
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {orders.map((order) => (
              <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Link to={`/supplier/orders/${order.id}`} className="font-mono text-sm font-bold text-[#2563EB] hover:underline">
                      #{order.id}
                    </Link>
                    <StatusLabel status={order.fulfillmentStatus} />
                  </div>
                  <p className="text-sm font-medium text-[#171717] mt-1">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Ship to {order.shippingAddress.city}, {order.shippingAddress.state} · {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {order.fulfillmentStatus === 'pending_acceptance' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          updateFulfillment(order.id, 'accepted');
                          pushToast({ title: `Accepted order #${order.id}`, variant: 'success' });
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept Order
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateFulfillment(order.id, 'rejected');
                          pushToast({ title: `Declined order #${order.id}`, variant: 'default' });
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  )}
                  {order.fulfillmentStatus === 'accepted' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        updateFulfillment(order.id, 'packed');
                        pushToast({ title: `Marked #${order.id} as packed`, variant: 'success' });
                      }}
                    >
                      <Package className="h-3.5 w-3.5" />
                      Mark Packed
                    </Button>
                  )}
                  <Link to={`/supplier/orders/${order.id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SupplierOrdersPage() {
  const supplierId = useSupplierId();
  const allOrders = useAppDataStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.supplierId === supplierId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Assigned Orders</h1>
        <p className="mt-1 text-sm text-[#737373]">Orders routed to your workshop for packing and direct customer dispatch.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No assigned orders yet" description="Orders assigned to your workshop will appear here." />
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Tracking</th>
                  <th className="py-3 px-4 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-sm">
                {orders.map((o) => {
                  const payout = o.items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
                  return (
                    <tr key={o.id} className="hover:bg-[#F8F8F7]/60">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">
                        <Link to={`/supplier/orders/${o.id}`} className="text-[#2563EB] hover:underline">
                          #{o.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{o.shippingAddress.city}, {o.shippingAddress.state}</td>
                      <td className="py-3 px-4 text-xs text-[#737373]">
                        {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </td>
                      <td className="py-3 px-4"><StatusLabel status={o.fulfillmentStatus} /></td>
                      <td className="py-3 px-4 font-mono text-xs text-[#737373]">{o.trackingNumber || '—'}</td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">{formatCurrency(payout)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function SupplierOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = useAppDataStore((s) => s.orders.find((o) => o.id === id));
  const updateFulfillment = useAppDataStore((s) => s.updateFulfillment);
  const pushToast = useToastStore((s) => s.pushToast);

  const [carrier, setCarrier] = useState(order?.carrier ?? 'DHL Express');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber ?? '');

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="Unable to locate this fulfillment order."
        actionLabel="Back to Assigned Orders"
        onAction={() => navigate('/supplier/orders')}
      />
    );
  }

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      pushToast({ title: 'Enter a valid tracking number', variant: 'error' });
      return;
    }
    updateFulfillment(order.id, 'shipped', {
      carrier: carrier.trim(),
      trackingNumber: trackingNumber.trim(),
    });
    pushToast({ title: `Order #${order.id} dispatched with tracking`, variant: 'success' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#737373]">FULFILLMENT #{order.id}</p>
          <h1 className="text-2xl font-bold text-[#171717]">Dispatch Packing & Tracking</h1>
        </div>
        <StatusLabel status={order.fulfillmentStatus} />
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm pb-6 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-semibold uppercase text-[#737373]">Recipient</p>
            <p className="mt-1 font-semibold text-[#171717]">{order.shippingAddress.fullName}</p>
            <p className="text-[#737373]">{order.shippingAddress.street}</p>
            <p className="text-[#737373]">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#737373]">Workflow Actions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {order.fulfillmentStatus === 'pending_acceptance' && (
                <>
                  <Button variant="primary" size="sm" onClick={() => updateFulfillment(order.id, 'accepted')}>
                    Accept Order
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => updateFulfillment(order.id, 'rejected')}>
                    Reject Order
                  </Button>
                </>
              )}
              {order.fulfillmentStatus === 'accepted' && (
                <Button variant="primary" size="sm" onClick={() => updateFulfillment(order.id, 'packed')}>
                  Mark as Packed
                </Button>
              )}
              {order.fulfillmentStatus === 'shipped' && (
                <Button variant="accent" size="sm" onClick={() => updateFulfillment(order.id, 'delivered')}>
                  Mark Delivered
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#E5E5E5]">
          {order.items.map((item) => (
            <div key={item.sku} className="py-3 flex items-center gap-4">
              <SafeImage src={item.image} alt={item.name} className="h-14 w-16 rounded-xl object-cover bg-[#F8F8F7] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#171717]">{item.name}</p>
                <p className="text-xs text-[#737373]">
                  SKU <span className="font-mono">{item.sku}</span> · {item.colorName} · Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                Payout: {formatCurrency(item.costPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleDispatch} className="pt-6 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="sup-carrier">Carrier</Label>
            <Input id="sup-carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sup-track">Tracking Number</Label>
            <Input id="sup-track" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="font-mono" placeholder="DHL-9042100" />
          </div>
          <Button type="submit" variant="primary" size="md">
            <Truck className="h-4 w-4" />
            Save Tracking & Ship
          </Button>
        </form>
      </div>
    </div>
  );
}

export function SupplierProductsPage() {
  const supplierId = useSupplierId();
  const allProducts = useAppDataStore((s) => s.products);
  const products = allProducts.filter((p) => p.supplierId === supplierId);
  const updateProduct = useAppDataStore((s) => s.updateProduct);
  const pushToast = useToastStore((s) => s.pushToast);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Workshop Catalog</h1>
        <p className="mt-1 text-sm text-[#737373]">Toggle product availability and verify wholesale unit costs.</p>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4 text-right">Wholesale Cost</th>
              <th className="py-3 px-4 text-right">Stock</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] text-sm">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 px-4 font-semibold text-[#171717]">{p.name}</td>
                <td className="py-3 px-4 font-mono text-xs text-[#737373]">{p.sku}</td>
                <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(p.costPrice)}</td>
                <td className="py-3 px-4 text-right tabular-nums font-semibold">{p.stock}</td>
                <td className="py-3 px-4"><StatusLabel status={p.status} /></td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = p.status === 'active' ? 'draft' : 'active';
                      updateProduct(p.id, { status: next });
                      pushToast({ title: `${p.name} set to ${next}`, variant: 'default' });
                    }}
                  >
                    {p.status === 'active' ? 'Pause Listing' : 'Make Available'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SupplierInventoryPage() {
  const supplierId = useSupplierId();
  const allProducts = useAppDataStore((s) => s.products);
  const products = allProducts.filter((p) => p.supplierId === supplierId);
  const adjustStock = useAppDataStore((s) => s.adjustStock);
  const pushToast = useToastStore((s) => s.pushToast);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Workshop Inventory</h1>
        <p className="mt-1 text-sm text-[#737373]">Keep live shelf counts synced with the KOVA storefront.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <SafeImage src={p.images[0]} alt={p.name} className="h-14 w-16 rounded-xl object-cover bg-[#F8F8F7] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#171717] truncate">{p.name}</p>
                <p className="text-xs font-mono text-[#737373]">{p.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-bold tabular-nums w-10 text-center">{p.stock}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  adjustStock(p.id, p.stock + 5);
                  pushToast({ title: `Added +5 stock for ${p.name}`, variant: 'success' });
                }}
              >
                +5
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupplierFulfillmentPage() {
  const supplierId = useSupplierId();
  const allOrders = useAppDataStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.supplierId === supplierId);
  const updateFulfillment = useAppDataStore((s) => s.updateFulfillment);
  const pushToast = useToastStore((s) => s.pushToast);

  const stages = [
    { id: 'pending_acceptance', title: '1. Awaiting Acceptance' },
    { id: 'accepted', title: '2. Ready to Pack' },
    { id: 'packed', title: '3. Packed for Courier' },
    { id: 'shipped', title: '4. Dispatched' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Fulfillment Pipeline</h1>
        <p className="mt-1 text-sm text-[#737373]">Advance workshop orders from acceptance through courier handoff.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const list = orders.filter((o) => o.fulfillmentStatus === stage.id);
          return (
            <div key={stage.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                {stage.title} ({list.length})
              </h2>
              {list.length === 0 ? (
                <p className="text-xs text-[#737373] py-4">No orders in stage</p>
              ) : (
                <div className="space-y-2.5">
                  {list.map((o) => (
                    <div key={o.id} className="p-3 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] space-y-2">
                      <div className="flex items-center justify-between">
                        <Link to={`/supplier/orders/${o.id}`} className="font-mono text-xs font-bold text-[#2563EB]">
                          #{o.id}
                        </Link>
                        <span className="text-[11px] text-[#737373]">{o.shippingAddress.city}</span>
                      </div>
                      <p className="text-xs font-medium text-[#171717]">
                        {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </p>
                      {stage.id === 'pending_acceptance' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            updateFulfillment(o.id, 'accepted');
                            pushToast({ title: `Accepted #${o.id}`, variant: 'success' });
                          }}
                        >
                          Accept
                        </Button>
                      )}
                      {stage.id === 'accepted' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            updateFulfillment(o.id, 'packed');
                            pushToast({ title: `Packed #${o.id}`, variant: 'success' });
                          }}
                        >
                          Mark Packed
                        </Button>
                      )}
                      {stage.id === 'packed' && (
                        <Link to={`/supplier/orders/${o.id}`} className="block">
                          <Button variant="accent" size="sm" className="w-full">
                            Add Tracking
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SupplierEarningsPage() {
  const supplierId = useSupplierId();
  const allOrders = useAppDataStore((s) => s.orders);
  const orders = allOrders.filter(
    (o) => o.supplierId === supplierId && o.orderStatus !== 'cancelled'
  );

  const totalEarned = orders.reduce(
    (s, o) => s + o.items.reduce((acc, i) => acc + i.costPrice * i.quantity, 0),
    0
  );

  const monthly = [
    { month: 'Aug', payout: 3400 },
    { month: 'Sep', payout: 4280 },
    { month: 'Oct', payout: 5120 },
    { month: 'Nov', payout: Math.max(5800, totalEarned * 12) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Workshop Earnings</h1>
        <p className="mt-1 text-sm text-[#737373]">Wholesale payout totals across fulfilled orders.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
          <p className="text-xs text-[#737373]">Active Queue Payouts</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(totalEarned)}</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
          <p className="text-xs text-[#737373]">Orders Fulfilled</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{orders.length}</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
          <p className="text-xs text-[#737373]">Settlement Cadence</p>
          <p className="mt-1 text-2xl font-bold text-[#171717]">Net-7 Weekly</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
        <h2 className="text-base font-bold text-[#171717] mb-4">Monthly Workshop Payouts</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#737373' }} />
              <YAxis tick={{ fontSize: 12, fill: '#737373' }} />
              <Tooltip />
              <Bar dataKey="payout" fill="#171717" radius={[6, 6, 0, 0]} name="Payout (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function SupplierProfilePage() {
  const supplierId = useSupplierId();
  const supplier = useAppDataStore((s) => s.suppliers.find((sup) => sup.id === supplierId));
  const updateSupplier = useAppDataStore((s) => s.updateSupplier);
  const pushToast = useToastStore((s) => s.pushToast);

  const [contactName, setContactName] = useState(supplier?.contactName ?? '');
  const [location, setLocation] = useState(supplier?.location ?? '');
  const [leadTimeDays, setLeadTimeDays] = useState(String(supplier?.leadTimeDays ?? 2));

  if (!supplier) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupplier(supplier.id, {
      contactName,
      location,
      leadTimeDays: Number(leadTimeDays) || 2,
    });
    pushToast({ title: 'Workshop profile updated', variant: 'success' });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Workshop Profile</h1>
        <p className="mt-1 text-sm text-[#737373]">{supplier.name}</p>
      </div>
      <form onSubmit={handleSave} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
        <div>
          <Label htmlFor="sp-contact">Primary Contact</Label>
          <Input id="sp-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sp-loc">Dispatch Location</Label>
          <Input id="sp-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sp-lead">Standard Lead Time (Days)</Label>
          <Input id="sp-lead" type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} />
        </div>
        <Button type="submit" variant="primary">Save Profile</Button>
      </form>
    </div>
  );
}
