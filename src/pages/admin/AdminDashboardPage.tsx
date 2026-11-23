import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../../components/ui/SafeImage';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { REVENUE_SERIES } from '../../data/seedData';
import { adminService } from '../../services/admin.service';
import { useAppDataStore } from '../../store/useAppDataStore';
import { formatCurrency, formatDate } from '../../utils/commerceRules';

export function AdminDashboardPage() {
  const orders = useAppDataStore((s) => s.orders);
  const products = useAppDataStore((s) => s.products);
  const users = useAppDataStore((s) => s.users);
  const snapshot = adminService.getDashboardSnapshot();

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(snapshot.totalRevenue), sub: 'All confirmed orders' },
    { label: 'Total Orders', value: String(snapshot.totalOrders), sub: `${snapshot.pendingOrders} active pending` },
    { label: 'Delivered Orders', value: String(snapshot.deliveredOrders), sub: 'Completed fulfillment' },
    { label: 'Active Catalog', value: String(snapshot.totalProducts), sub: `${snapshot.lowStockProducts.length} low stock` },
    { label: 'Customers', value: String(snapshot.totalCustomers), sub: 'Registered buyers' },
    { label: 'Partner Suppliers', value: String(snapshot.totalSuppliers), sub: 'Active ateliers' },
  ];

  const topProducts = [...products]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 4);

  const recentCustomers = users.filter((u) => u.role === 'customer').slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Operations Overview
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Live revenue, workshop inventory, and direct fulfillment metrics.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            to="/admin/products/new"
            className="h-10 px-4 rounded-[10px] bg-[#171717] text-white text-xs font-semibold inline-flex items-center hover:bg-[#2E2E2E]"
          >
            Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="h-10 px-4 rounded-[10px] bg-white border border-[#E5E5E5] text-[#171717] text-xs font-semibold inline-flex items-center hover:bg-[#F8F8F7]"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-[#E5E5E5] rounded-2xl p-4 sm:p-5">
            <p className="text-xs font-medium text-[#737373]">{k.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-[#171717]">{k.value}</p>
            <p className="mt-1 text-[11px] text-[#737373]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[#171717]">Revenue vs Supplier Cost</h2>
              <p className="text-xs text-[#737373]">6-month gross revenue & workshop COGS (USD)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={2} name="Revenue" isAnimationActive={false} />
                <Area type="monotone" dataKey="cost" stroke="#171717" fill="#171717" fillOpacity={0.05} strokeWidth={2} name="Supplier Cost" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-base font-bold text-[#171717]">Monthly Order Volume</h2>
            <p className="text-xs text-[#737373]">Completed & active dispatches</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#171717" radius={[6, 6, 0, 0]} name="Orders" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171717]">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#2563EB] inline-flex items-center gap-1 hover:underline">
              All Orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[11px] font-semibold uppercase tracking-wider text-[#737373] bg-[#F8F8F7]">
                  <th className="py-2.5 px-4">Order</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-sm">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-[#F8F8F7]/60">
                    <td className="py-3 px-4 font-mono text-xs font-semibold">
                      <Link to={`/admin/orders/${o.id}`} className="text-[#2563EB] hover:underline">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{o.customerName}</td>
                    <td className="py-3 px-4">
                      <StatusLabel status={o.orderStatus} />
                    </td>
                    <td className="py-3 px-4 text-xs text-[#737373]">
                      {o.supplierName || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">
                      {formatCurrency(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                Low-Stock Alerts
              </h2>
              <Link to="/admin/inventory" className="text-xs font-semibold text-[#2563EB] hover:underline">
                Restock
              </Link>
            </div>
            {snapshot.lowStockProducts.length === 0 ? (
              <p className="text-xs text-[#737373]">All SKUs are adequately stocked.</p>
            ) : (
              <ul className="divide-y divide-[#E5E5E5]">
                {snapshot.lowStockProducts.map((p) => (
                  <li key={p.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-[#171717] truncate">{p.name}</span>
                    <span className="font-mono font-semibold text-[#DC2626] shrink-0 tabular-nums">
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-[#171717]">Best-Selling Objects</h2>
            <ul className="divide-y divide-[#E5E5E5]">
              {topProducts.map((p) => (
                <li key={p.id} className="py-2.5 flex items-center gap-3">
                  <SafeImage src={p.images[0]} alt={p.name} className="h-9 w-11 rounded-lg object-cover bg-[#F8F8F7] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#171717] truncate">{p.name}</p>
                    <p className="text-[11px] text-[#737373] tabular-nums">{p.reviewCount} verified sales</p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">{formatCurrency(p.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-bold text-[#171717]">Recent Customers</h2>
            <ul className="divide-y divide-[#E5E5E5]">
              {recentCustomers.map((c) => (
                <li key={c.id} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#171717]">{c.name}</span>
                  <span className="text-[#737373]">{formatDate(c.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
