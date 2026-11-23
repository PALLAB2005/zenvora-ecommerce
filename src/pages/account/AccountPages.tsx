import { useState } from 'react';
import { MapPin, Package, Plus, Trash2, ArrowRight, Heart } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataUI';
import { Dialog } from '../../components/ui/Dialog';
import { Input, Label, Textarea } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { canTransitionOrderStatus, formatCurrency, formatDate } from '../../utils/commerceRules';

export function AccountProfilePage() {
  const currentUser = useAppDataStore((s) => s.currentUser)!;
  const allOrders = useAppDataStore((s) => s.orders);
  const allAddresses = useAppDataStore((s) => s.addresses);
  const orders = allOrders.filter(
    (o) => o.customerId === currentUser.id || o.customerEmail === currentUser.email
  );
  const addresses = allAddresses.filter((a) => a.userId === currentUser.id);
  const updateProfile = useAppDataStore((s) => s.updateProfile);
  const pushToast = useToastStore((s) => s.pushToast);

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(currentUser.id, { name, phone });
    pushToast({ title: 'Profile updated', variant: 'success' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Member since {formatDate(currentUser.createdAt)} · {orders.length} orders placed
          </p>
        </div>
        <Link to="/shop">
          <Button variant="primary">Explore New Arrivals</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl">
          <p className="text-xs text-[#737373]">Total Orders</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">{orders.length}</p>
        </div>
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl">
          <p className="text-xs text-[#737373]">Saved Addresses</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">{addresses.length}</p>
        </div>
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl">
          <p className="text-xs text-[#737373]">Total Spent</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#171717]">
            {formatCurrency(orders.reduce((s, o) => s + o.total, 0))}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#171717]">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prof-name">Full Name</Label>
            <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="prof-phone">Mobile Number</Label>
            <Input id="prof-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="prof-email">Email Address</Label>
          <Input id="prof-email" value={currentUser.email} disabled />
        </div>
        <Button type="submit" variant="primary">Save Profile</Button>
      </form>
    </div>
  );
}

export function AccountOrdersPage() {
  const navigate = useNavigate();
  const currentUser = useAppDataStore((s) => s.currentUser)!;
  const allOrders = useAppDataStore((s) => s.orders);
  const orders = allOrders.filter(
    (o) => o.customerId === currentUser.id || o.customerEmail === currentUser.email
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">My Orders</h1>
        <p className="mt-1 text-sm text-[#737373]">Track active shipments, download receipts, or request returns.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No orders yet"
          description="Your completed purchases and direct workshop dispatches will appear here."
          actionLabel="Start Shopping"
          onAction={() => navigate('/shop')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <SafeImage
                  src={order.items[0]?.image || ''}
                  alt={order.items[0]?.name || order.id}
                  className="h-16 w-20 rounded-xl object-cover bg-[#F8F8F7] border border-[#E5E5E5] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-[#171717]">#{order.id}</span>
                    <StatusLabel status={order.orderStatus} />
                  </div>
                  <p className="text-sm font-medium text-[#171717] mt-1 truncate">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-[#737373] mt-0.5">
                    {formatDate(order.createdAt)} · Est. {order.estimatedDelivery}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <span className="text-base font-bold tabular-nums text-[#171717]">
                  {formatCurrency(order.total)}
                </span>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  View Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = useAppDataStore((s) => s.orders.find((o) => o.id === id));
  const updateOrderStatus = useAppDataStore((s) => s.updateOrderStatus);
  const createReturnRequest = useAppDataStore((s) => s.createReturnRequest);
  const pushToast = useToastStore((s) => s.pushToast);

  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="Unable to locate this order record."
        actionLabel="Back to My Orders"
        onAction={() => navigate('/account/orders')}
      />
    );
  }

  const canCancel = canTransitionOrderStatus(order.orderStatus, 'cancelled', 'customer');

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnReason.trim().length < 8) {
      pushToast({ title: 'Please describe your return reason', variant: 'error' });
      return;
    }
    createReturnRequest({
      id: `RET-${Math.floor(210 + Math.random() * 780)}`,
      orderId: order.id,
      customerName: order.customerName,
      reason: returnReason.trim(),
      amount: order.total,
      status: 'requested',
      createdAt: new Date().toISOString(),
    });
    setReturnOpen(false);
    setReturnReason('');
    pushToast({ title: 'Return request submitted', description: 'Our admin team will review within 24h.', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#737373]">ORDER #{order.id}</p>
          <h1 className="text-2xl font-bold text-[#171717] mt-0.5">Order Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusLabel status={order.orderStatus} />
          <StatusLabel status={order.paymentStatus} />
        </div>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm pb-6 border-b border-[#E5E5E5]">
          <div>
            <p className="text-xs font-semibold uppercase text-[#737373]">Shipping Address</p>
            <p className="mt-1.5 font-medium text-[#171717]">{order.shippingAddress.fullName}</p>
            <p className="text-[#737373]">{order.shippingAddress.street}</p>
            <p className="text-[#737373]">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#737373]">Dispatch & Tracking</p>
            <p className="mt-1.5 font-medium text-[#171717] capitalize">{order.deliveryMethod} Delivery</p>
            <p className="text-[#737373]">Est. {order.estimatedDelivery}</p>
            {order.trackingNumber && (
              <p className="mt-1 font-mono text-xs text-[#2563EB]">
                {order.carrier}: {order.trackingNumber}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#737373]">Summary</p>
            <p className="mt-1.5 text-[#737373]">Subtotal: <span className="tabular-nums text-[#171717]">{formatCurrency(order.subtotal)}</span></p>
            <p className="text-[#737373]">Shipping: <span className="tabular-nums text-[#171717]">{formatCurrency(order.shippingFee)}</span></p>
            <p className="font-bold text-[#171717] mt-1">Total: <span className="tabular-nums">{formatCurrency(order.total)}</span></p>
          </div>
        </div>

        <div className="divide-y divide-[#E5E5E5]">
          {order.items.map((item) => (
            <div key={item.sku} className="py-3.5 flex items-center gap-4">
              <SafeImage src={item.image} alt={item.name} className="h-14 w-16 rounded-xl object-cover bg-[#F8F8F7] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#171717]">{item.name}</p>
                <p className="text-xs text-[#737373]">{item.colorName} · Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E5E5E5]">
          <Link to={`/track-order?orderId=${order.id}`}>
            <Button variant="primary">Track Shipment</Button>
          </Link>
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => {
                updateOrderStatus(order.id, 'cancelled');
                pushToast({ title: `Order #${order.id} cancelled`, variant: 'default' });
              }}
            >
              Cancel Order
            </Button>
          )}
          {order.orderStatus === 'delivered' && (
            <Button variant="outline" onClick={() => setReturnOpen(true)}>
              Request Return
            </Button>
          )}
        </div>
      </div>

      <Dialog open={returnOpen} onClose={() => setReturnOpen(false)} title={`Request Return · #${order.id}`}>
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ret-reason">Reason for return</Label>
            <Textarea
              id="ret-reason"
              rows={3}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Explain condition or reason for return..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Return Request</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export function AccountAddressesPage() {
  const currentUser = useAppDataStore((s) => s.currentUser)!;
  const allAddresses = useAppDataStore((s) => s.addresses);
  const addresses = allAddresses.filter((a) => a.userId === currentUser.id);
  const addAddress = useAppDataStore((s) => s.addAddress);
  const deleteAddress = useAppDataStore((s) => s.deleteAddress);
  const setDefaultAddress = useAppDataStore((s) => s.setDefaultAddress);
  const pushToast = useToastStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('Studio');
  const [fullName, setFullName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !pincode.trim()) {
      pushToast({ title: 'Please fill street, city, and pincode', variant: 'error' });
      return;
    }
    addAddress({
      userId: currentUser.id,
      label,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: addresses.length === 0,
    });
    setOpen(false);
    setStreet('');
    setCity('');
    setState('');
    setPincode('');
    pushToast({ title: 'Address saved', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Saved Addresses</h1>
          <p className="mt-1 text-sm text-[#737373]">Manage studio and home shipping destinations.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" />}
          title="No saved addresses"
          description="Add a shipping address for faster checkout."
          actionLabel="Add Address"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#171717]">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-xs font-semibold text-[#2563EB]">Default</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[#171717]">{addr.fullName}</p>
                <p className="text-sm text-[#737373]">{addr.street}</p>
                <p className="text-sm text-[#737373]">{addr.city}, {addr.state} {addr.pincode}</p>
                <p className="text-xs text-[#737373] mt-1">{addr.phone}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id, currentUser.id)}
                    className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[#737373]">Primary checkout address</span>
                )}
                <button
                  type="button"
                  onClick={() => deleteAddress(addr.id)}
                  aria-label={`Delete address ${addr.label}`}
                  className="text-[#737373] hover:text-[#DC2626] cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Add Shipping Address">
        <form onSubmit={handleAdd} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="addr-label">Label</Label>
              <Input id="addr-label" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="addr-name">Recipient</Label>
              <Input id="addr-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="addr-phone">Phone</Label>
            <Input id="addr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="addr-street">Street Address</Label>
            <Input id="addr-street" value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="addr-city">City</Label>
              <Input id="addr-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="addr-state">State</Label>
              <Input id="addr-state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="addr-pin">Pincode</Label>
              <Input id="addr-pin" value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Address</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export function AccountWishlistPage() {
  const navigate = useNavigate();
  const productIds = useWishlistStore((s) => s.productIds);
  const allProducts = useAppDataStore((s) => s.products);
  const products = allProducts.filter((p) => productIds.includes(p.id));

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Saved Wishlist</h1>
        <p className="mt-1 text-sm text-[#737373]">
          Objects you have bookmarked for your workspace or living space.
        </p>
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="Your wishlist is empty"
          description="Tap the heart icon on any studio object to save it here."
          actionLabel="Browse Collection"
          onAction={() => navigate('/shop')}
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountSettingsPage() {
  const currentUser = useAppDataStore((s) => s.currentUser)!;
  const changePassword = useAppDataStore((s) => s.changePassword);
  const pushToast = useToastStore((s) => s.pushToast);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      pushToast({ title: 'New password must be at least 8 characters', variant: 'error' });
      return;
    }
    const res = changePassword(currentUser.id, currentPw, newPw);
    if (!res.ok) {
      pushToast({ title: res.error || 'Unable to change password', variant: 'error' });
      return;
    }
    setCurrentPw('');
    setNewPw('');
    pushToast({ title: 'Password updated successfully', variant: 'success' });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Security & Password</h1>
        <p className="mt-1 text-sm text-[#737373]">Update your account password.</p>
      </div>

      <form onSubmit={handlePasswordChange} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
        <div>
          <Label htmlFor="curr-pw">Current Password</Label>
          <Input id="curr-pw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="new-pw">New Password</Label>
          <Input id="new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        </div>
        <Button type="submit" variant="primary">Change Password</Button>
      </form>
    </div>
  );
}
