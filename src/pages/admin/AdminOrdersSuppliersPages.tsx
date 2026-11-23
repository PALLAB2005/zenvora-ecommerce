import { useState } from 'react';
import { ArrowRight, Plus, Truck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { EmptyState, Tabs } from '../../components/ui/DataUI';
import { Dialog } from '../../components/ui/Dialog';
import { Input, Label, Select } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';
import type { OrderStatus } from '../../types/commerce';
import { formatCurrency, formatDate } from '../../utils/commerceRules';

export function AdminOrdersPage() {
  const orders = useAppDataStore((s) => s.orders);
  const suppliers = useAppDataStore((s) => s.suppliers);
  const assignSupplierToOrder = useAppDataStore((s) => s.assignSupplierToOrder);
  const pushToast = useToastStore((s) => s.pushToast);

  const [tab, setTab] = useState('all');

  const filtered = orders.filter((o) => {
    if (tab === 'all') return true;
    if (tab === 'unassigned') return o.fulfillmentStatus === 'unassigned' && o.orderStatus !== 'cancelled';
    return o.orderStatus === tab;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Order Management</h1>
        <p className="mt-1 text-sm text-[#737373]">Assign orders to partner suppliers, monitor dispatch, and manage status.</p>
      </div>

      <Tabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: 'all', label: `All (${orders.length})` },
          { id: 'unassigned', label: 'Needs Supplier' },
          { id: 'assigned', label: 'Assigned' },
          { id: 'processing', label: 'Processing' },
          { id: 'shipped', label: 'Shipped' },
          { id: 'delivered', label: 'Delivered' },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No orders in this queue" description="Orders matching this status filter will appear here." />
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Assign Supplier</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-sm">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F8F8F7]/60">
                    <td className="py-3 px-4 font-mono text-xs font-semibold">
                      <Link to={`/admin/orders/${o.id}`} className="text-[#2563EB] hover:underline">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#171717]">{o.customerName}</p>
                      <p className="text-xs text-[#737373]">{formatDate(o.createdAt)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusLabel status={o.paymentStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusLabel status={o.orderStatus} />
                    </td>
                    <td className="py-3 px-4 min-w-[200px]">
                      <Select
                        aria-label={`Assign supplier for order ${o.id}`}
                        value={o.supplierId || ''}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          assignSupplierToOrder(o.id, e.target.value);
                          pushToast({
                            title: `Assigned #${o.id}`,
                            description: 'Order routed to partner supplier portal.',
                            variant: 'success',
                          });
                        }}
                      >
                        <option value="">Select Supplier...</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="text-xs font-semibold text-[#2563EB] hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = useAppDataStore((s) => s.orders.find((o) => o.id === id));
  const suppliers = useAppDataStore((s) => s.suppliers);
  const assignSupplierToOrder = useAppDataStore((s) => s.assignSupplierToOrder);
  const updateOrderStatus = useAppDataStore((s) => s.updateOrderStatus);
  const updateFulfillment = useAppDataStore((s) => s.updateFulfillment);
  const pushToast = useToastStore((s) => s.pushToast);

  const [carrier, setCarrier] = useState(order?.carrier ?? 'DHL Express');
  const [tracking, setTracking] = useState(order?.trackingNumber ?? '');

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="Unable to locate this order record."
        actionLabel="Back to Orders"
        onAction={() => navigate('/admin/orders')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#737373]">ORDER #{order.id}</p>
          <h1 className="text-2xl font-bold text-[#171717]">{order.customerName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusLabel status={order.orderStatus} />
          <StatusLabel status={order.paymentStatus} />
          <StatusLabel status={order.fulfillmentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#171717]">Line Items</h2>
            <div className="divide-y divide-[#E5E5E5]">
              {order.items.map((item) => (
                <div key={item.sku} className="py-3 flex items-center gap-4">
                  <SafeImage src={item.image} alt={item.name} className="h-14 w-16 rounded-xl object-cover bg-[#F8F8F7] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#171717]">{item.name}</p>
                    <p className="text-xs text-[#737373]">
                      SKU <span className="font-mono">{item.sku}</span> · Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-right tabular-nums text-sm">
                    <p className="font-semibold text-[#171717]">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    <p className="text-xs text-[#737373]">Cost: {formatCurrency(item.costPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase text-[#737373] mb-2">Customer Contact</h3>
              <p className="font-semibold text-[#171717]">{order.customerName}</p>
              <p className="text-[#737373]">{order.customerEmail}</p>
              <p className="text-[#737373]">{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase text-[#737373] mb-2">Shipping Destination</h3>
              <p className="text-[#171717]">{order.shippingAddress.street}</p>
              <p className="text-[#737373]">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#171717]">Supplier & Fulfillment Control</h2>
            <div>
              <Label htmlFor="adm-sup">Assigned Supplier</Label>
              <Select
                id="adm-sup"
                value={order.supplierId || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    assignSupplierToOrder(order.id, e.target.value);
                    pushToast({ title: 'Supplier assigned', variant: 'success' });
                  }
                }}
              >
                <option value="">Unassigned</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="adm-status">Order Status</Label>
              <Select
                id="adm-status"
                value={order.orderStatus}
                onChange={(e) => {
                  updateOrderStatus(order.id, e.target.value as OrderStatus);
                  pushToast({ title: `Order status set to ${e.target.value}`, variant: 'success' });
                }}
              >
                {['pending', 'confirmed', 'assigned', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div className="pt-2 border-t border-[#E5E5E5] space-y-3">
              <div>
                <Label htmlFor="adm-carrier">Carrier</Label>
                <Input id="adm-carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="adm-track">Tracking Number</Label>
                <Input id="adm-track" value={tracking} onChange={(e) => setTracking(e.target.value)} className="font-mono" placeholder="DHL-9920141" />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  updateFulfillment(order.id, 'shipped', { carrier, trackingNumber: tracking });
                  pushToast({ title: 'Shipping tracking updated', variant: 'success' });
                }}
              >
                <Truck className="h-4 w-4" />
                Save Tracking & Mark Shipped
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCustomersPage() {
  const allUsers = useAppDataStore((s) => s.users);
  const users = allUsers.filter((u) => u.role === 'customer');
  const orders = useAppDataStore((s) => s.orders);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Customers</h1>
        <p className="mt-1 text-sm text-[#737373]">Registered storefront buyers and order history totals.</p>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-sm">
              {users.map((u) => {
                const custOrders = orders.filter((o) => o.customerId === u.id || o.customerEmail === u.email);
                const spend = custOrders.reduce((s, o) => s + o.total, 0);
                return (
                  <tr key={u.id}>
                    <td className="py-3 px-4 font-semibold text-[#171717]">{u.name}</td>
                    <td className="py-3 px-4 text-[#737373]">{u.email}</td>
                    <td className="py-3 px-4 text-[#737373]">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{custOrders.length}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">{formatCurrency(spend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminSuppliersPage() {
  const suppliers = useAppDataStore((s) => s.suppliers);
  const orders = useAppDataStore((s) => s.orders);
  const products = useAppDataStore((s) => s.products);
  const addSupplier = useAppDataStore((s) => s.addSupplier);
  const pushToast = useToastStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('2');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@')) {
      pushToast({ title: 'Enter supplier name and valid email', variant: 'error' });
      return;
    }
    addSupplier({
      id: `sup-${Date.now()}`,
      name: name.trim(),
      contactName: contactName.trim() || 'Operations Desk',
      email: email.trim(),
      phone: '+1 (555) 010-2040',
      location: location.trim() || 'Europe',
      leadTimeDays: Number(leadTimeDays) || 2,
      rating: 5.0,
      onTimeRate: 100,
      active: true,
      joinedAt: new Date().toISOString(),
    });
    setOpen(false);
    setName('');
    setContactName('');
    setEmail('');
    setLocation('');
    pushToast({ title: 'Supplier workshop onboarded', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Partner Suppliers</h1>
          <p className="mt-1 text-sm text-[#737373]">Fulfillment workshops, lead times, and assigned order throughput.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {suppliers.map((sup) => {
          const catalogCount = products.filter((p) => p.supplierId === sup.id).length;
          const assignedCount = orders.filter((o) => o.supplierId === sup.id).length;
          return (
            <div key={sup.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#171717]">{sup.name}</h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    {sup.location} · Contact: {sup.contactName}
                  </p>
                </div>
                <StatusLabel status={sup.active ? 'active' : 'draft'} />
              </div>

              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] text-xs">
                <div>
                  <p className="text-[#737373]">Catalog SKUs</p>
                  <p className="font-bold text-[#171717] tabular-nums mt-0.5">{catalogCount}</p>
                </div>
                <div>
                  <p className="text-[#737373]">Assigned Orders</p>
                  <p className="font-bold text-[#171717] tabular-nums mt-0.5">{assignedCount}</p>
                </div>
                <div>
                  <p className="text-[#737373]">On-Time Rate</p>
                  <p className="font-bold text-[#16A34A] tabular-nums mt-0.5">{sup.onTimeRate}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E5E5]">
                <span className="text-[#737373]">Lead time: <strong className="text-[#171717]">{sup.leadTimeDays} days</strong></span>
                <Link to={`/admin/suppliers/${sup.id}`} className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline">
                  Supplier Profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Onboard Partner Supplier">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="sup-name">Workshop / Company Name</Label>
            <Input id="sup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zurich Precision Glass" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sup-contact">Contact Name</Label>
              <Input id="sup-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sup-lead">Lead Time (Days)</Label>
              <Input id="sup-lead" type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="sup-email">Fulfillment Email</Label>
            <Input id="sup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sup-loc">Location</Label>
            <Input id="sup-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Supplier</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export function AdminSupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const supplier = useAppDataStore((s) => s.suppliers.find((sup) => sup.id === id));
  const allProducts = useAppDataStore((s) => s.products);
  const allOrders = useAppDataStore((s) => s.orders);
  const products = allProducts.filter((p) => p.supplierId === id);
  const orders = allOrders.filter((o) => o.supplierId === id);

  if (!supplier) {
    return (
      <EmptyState
        title="Supplier not found"
        description="Unable to locate this supplier profile."
        actionLabel="Back to Suppliers"
        onAction={() => navigate('/admin/suppliers')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#737373]">{supplier.location}</p>
          <h1 className="text-2xl font-bold text-[#171717]">{supplier.name}</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/suppliers')}>Back to Suppliers</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4">
          <p className="text-xs text-[#737373]">On-Time Fulfillment</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#16A34A]">{supplier.onTimeRate}%</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4">
          <p className="text-xs text-[#737373]">Avg Lead Time</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">{supplier.leadTimeDays} days</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4">
          <p className="text-xs text-[#737373]">Catalog Objects</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">{products.length}</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4">
          <p className="text-xs text-[#737373]">Assigned Orders</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">{orders.length}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-[#171717]">Supplier Product Catalog</h2>
        <div className="divide-y divide-[#E5E5E5]">
          {products.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-[#171717]">{p.name}</p>
                <p className="text-xs font-mono text-[#737373]">{p.sku}</p>
              </div>
              <div className="text-right tabular-nums text-xs">
                <p className="font-semibold text-[#171717]">Cost: {formatCurrency(p.costPrice)}</p>
                <p className="text-[#737373]">Stock: {p.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
