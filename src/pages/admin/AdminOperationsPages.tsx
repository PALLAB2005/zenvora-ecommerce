import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input, Label, Select } from '../../components/ui/FormControls';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { REVENUE_SERIES } from '../../data/seedData';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';
import { formatCurrency, formatDate } from '../../utils/commerceRules';

export function AdminPurchaseOrdersPage() {
  const purchaseOrders = useAppDataStore((s) => s.purchaseOrders);
  const suppliers = useAppDataStore((s) => s.suppliers);
  const products = useAppDataStore((s) => s.products);
  const createPurchaseOrder = useAppDataStore((s) => s.createPurchaseOrder);
  const markPurchaseOrderReceived = useAppDataStore((s) => s.markPurchaseOrderReceived);
  const pushToast = useToastStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [qty, setQty] = useState('20');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    const prod = products.find((p) => p.id === productId);
    if (!sup || !prod) return;
    const count = Math.max(1, Number(qty) || 10);
    createPurchaseOrder({
      id: `PO-${Math.floor(402 + Math.random() * 500)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      items: [{ productId: prod.id, productName: prod.name, sku: prod.sku, qty: count, unitCost: prod.costPrice }],
      totalCost: count * prod.costPrice,
      status: 'sent',
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    });
    setOpen(false);
    pushToast({ title: 'Purchase order dispatched to supplier', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Purchase Orders</h1>
          <p className="mt-1 text-sm text-[#737373]">Replenish workshop stock directly with partner suppliers.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Purchase Order
        </Button>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-sm">
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td className="py-3 px-4 font-mono text-xs font-semibold">{po.id}</td>
                  <td className="py-3 px-4">{po.supplierName}</td>
                  <td className="py-3 px-4 text-xs text-[#737373]">
                    {po.items.map((i) => `${i.productName} ×${i.qty}`).join(', ')}
                  </td>
                  <td className="py-3 px-4"><StatusLabel status={po.status} /></td>
                  <td className="py-3 px-4 text-right font-semibold tabular-nums">{formatCurrency(po.totalCost)}</td>
                  <td className="py-3 px-4 text-right">
                    {po.status !== 'received' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          markPurchaseOrderReceived(po.id);
                          pushToast({ title: `${po.id} received — stock updated`, variant: 'success' });
                        }}
                      >
                        Mark Received
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create Purchase Order">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="po-sup">Supplier</Label>
            <Select id="po-sup" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="po-prod">Product</Label>
            <Select id="po-prod" value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.costPrice)}/unit)</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="po-qty">Quantity</Label>
            <Input id="po-qty" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Issue PO</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export function AdminPaymentsPage() {
  const orders = useAppDataStore((s) => s.orders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Payments Ledger</h1>
        <p className="mt-1 text-sm text-[#737373]">Track Razorpay, UPI, Card, and Cash on Delivery settlements.</p>
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-sm">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 px-4 font-mono text-xs font-semibold">#{o.id}</td>
                  <td className="py-3 px-4">{o.customerName}</td>
                  <td className="py-3 px-4 uppercase text-xs font-medium text-[#737373]">{o.paymentMethod}</td>
                  <td className="py-3 px-4"><StatusLabel status={o.paymentStatus} /></td>
                  <td className="py-3 px-4 text-right font-semibold tabular-nums">{formatCurrency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminShippingPage() {
  const orders = useAppDataStore((s) => s.orders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Shipping & Carrier Tracking</h1>
        <p className="mt-1 text-sm text-[#737373]">Active shipments, carrier assignments, and delivery windows.</p>
      </div>
      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Carrier & Tracking</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-sm">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 px-4 font-mono text-xs font-semibold">#{o.id}</td>
                  <td className="py-3 px-4">{o.shippingAddress.city}, {o.shippingAddress.state}</td>
                  <td className="py-3 px-4 capitalize text-xs">{o.deliveryMethod}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#737373]">
                    {o.trackingNumber ? `${o.carrier || 'Carrier'} · ${o.trackingNumber}` : 'Pending dispatch'}
                  </td>
                  <td className="py-3 px-4"><StatusLabel status={o.orderStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminCouponsPage() {
  const coupons = useAppDataStore((s) => s.coupons);
  const addCoupon = useAppDataStore((s) => s.addCoupon);
  const toggleCoupon = useAppDataStore((s) => s.toggleCoupon);
  const pushToast = useToastStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('80');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    addCoupon({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value) || 10,
      minOrderAmount: Number(minOrderAmount) || 0,
      active: true,
      expiresAt: '2028-12-31T23:59:59Z',
      usageCount: 0,
    });
    setOpen(false);
    setCode('');
    pushToast({ title: 'Coupon published', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Promotional Coupons</h1>
          <p className="mt-1 text-sm text-[#737373]">Manage discount rules applied at cart and checkout.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Coupon
        </Button>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4 text-right">Min Order</th>
                <th className="py-3 px-4 text-right">Redemptions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-sm">
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td className="py-3 px-4 font-mono font-bold text-[#171717]">{c.code}</td>
                  <td className="py-3 px-4 text-[#737373]">
                    {c.type === 'percentage'
                      ? `${c.value}% off`
                      : c.type === 'fixed'
                      ? `${formatCurrency(c.value)} off`
                      : 'Free shipping'}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(c.minOrderAmount)}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{c.usageCount}</td>
                  <td className="py-3 px-4"><StatusLabel status={c.active ? 'active' : 'draft'} /></td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => toggleCoupon(c.code)}>
                      {c.active ? 'Pause' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create Coupon">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="c-code">Coupon Code</Label>
            <Input id="c-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="STUDIO20" className="font-mono uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="c-type">Type</Label>
              <Select id="c-type" value={type} onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="c-val">Value</Label>
              <Input id="c-val" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="c-min">Minimum Order ($)</Label>
            <Input id="c-min" type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Coupon</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export function AdminReviewsPage() {
  const reviews = useAppDataStore((s) => s.reviews);
  const updateReviewStatus = useAppDataStore((s) => s.updateReviewStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Customer Reviews</h1>
        <p className="mt-1 text-sm text-[#737373]">Moderate product reviews displayed on the storefront.</p>
      </div>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-[#171717]">{r.productName}</span>
                <StatusLabel status={r.status} />
              </div>
              <p className="text-sm font-semibold text-[#171717] mt-1">{r.title}</p>
              <p className="text-xs text-[#737373] mt-0.5">{r.comment}</p>
              <p className="text-[11px] text-[#737373] mt-1">By {r.authorName} · {formatDate(r.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => updateReviewStatus(r.id, 'approved')}>Approve</Button>
              <Button variant="outline" size="sm" onClick={() => updateReviewStatus(r.id, 'hidden')}>Hide</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReturnsPage() {
  const returns = useAppDataStore((s) => s.returns);
  const updateReturnStatus = useAppDataStore((s) => s.updateReturnStatus);
  const pushToast = useToastStore((s) => s.pushToast);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Returns & Refunds</h1>
        <p className="mt-1 text-sm text-[#737373]">Review customer return claims and authorize refunds.</p>
      </div>
      <div className="space-y-3">
        {returns.map((ret) => (
          <div key={ret.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold">{ret.id}</span>
                <span className="text-xs text-[#737373]">Order #{ret.orderId}</span>
                <StatusLabel status={ret.status} />
              </div>
              <p className="text-sm font-semibold text-[#171717] mt-1">
                {ret.customerName} · <span className="tabular-nums">{formatCurrency(ret.amount)}</span>
              </p>
              <p className="text-xs text-[#737373] mt-0.5">{ret.reason}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  updateReturnStatus(ret.id, 'refunded');
                  pushToast({ title: `Refunded ${formatCurrency(ret.amount)} for #${ret.orderId}`, variant: 'success' });
                }}
              >
                Issue Refund
              </Button>
              <Button variant="outline" size="sm" onClick={() => updateReturnStatus(ret.id, 'rejected')}>
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const products = useAppDataStore((s) => s.products);
  const orders = useAppDataStore((s) => s.orders);

  const avgOrderValue =
    orders.length > 0 ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Commerce Analytics</h1>
        <p className="mt-1 text-sm text-[#737373]">Gross revenue, margin performance, and order unit economics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
          <p className="text-xs text-[#737373]">Average Order Value</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(avgOrderValue)}</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
          <p className="text-xs text-[#737373]">Catalog Gross Margin Avg</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#16A34A]">
            {Math.round(
              (products.reduce((s, p) => s + (p.price - p.costPrice) / p.price, 0) /
                Math.max(1, products.length)) *
                100
            )}
            %
          </p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
          <p className="text-xs text-[#737373]">Active SKUs</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{products.filter((p) => p.status === 'active').length}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
        <h2 className="text-base font-bold text-[#171717] mb-4">6-Month Revenue vs Cost Breakdown</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_SERIES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#737373' }} />
              <YAxis tick={{ fontSize: 12, fill: '#737373' }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} name="Revenue" />
              <Bar dataKey="cost" fill="#171717" radius={[6, 6, 0, 0]} name="Supplier COGS" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const settings = useAppDataStore((s) => s.settings);
  const updateSettings = useAppDataStore((s) => s.updateSettings);
  const pushToast = useToastStore((s) => s.pushToast);

  const [storeName, setStoreName] = useState(settings.storeName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ storeName, supportEmail, announcementText, codEnabled });
    pushToast({ title: 'Storefront settings updated', variant: 'success' });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Storefront Settings</h1>
        <p className="mt-1 text-sm text-[#737373]">Configure brand announcement banner and payment rules.</p>
      </div>
      <form onSubmit={handleSave} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
        <div>
          <Label htmlFor="set-name">Brand Name</Label>
          <Input id="set-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="set-email">Support Email</Label>
          <Input id="set-email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="set-ann">Storefront Announcement Bar</Label>
          <Input id="set-ann" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} />
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium text-[#171717] cursor-pointer">
          <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="accent-[#2563EB]" />
          Enable Cash on Delivery at Checkout
        </label>
        <Button type="submit" variant="primary">Save Settings</Button>
      </form>
    </div>
  );
}
