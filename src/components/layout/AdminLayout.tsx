import { useState } from 'react';
import {
  BarChart3,
  Bell,
  Box,
  CreditCard,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Warehouse,
  ClipboardList,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Inventory', to: '/admin/inventory', icon: Warehouse },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Suppliers', to: '/admin/suppliers', icon: Box },
  { label: 'Purchase Orders', to: '/admin/purchase-orders', icon: ClipboardList },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Shipping', to: '/admin/shipping', icon: Truck },
  { label: 'Coupons', to: '/admin/coupons', icon: Tag },
  { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
  { label: 'Returns & Refunds', to: '/admin/returns', icon: RotateCcw },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppDataStore((s) => s.currentUser);
  const logout = useAppDataStore((s) => s.logout);
  const products = useAppDataStore((s) => s.products);
  const orders = useAppDataStore((s) => s.orders);
  const pushToast = useToastStore((s) => s.pushToast);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const lowStockCount = products.filter((p) => p.stock <= 10).length;
  const unassignedCount = orders.filter((o) => o.fulfillmentStatus === 'unassigned' && o.orderStatus !== 'cancelled').length;
  const activeNav = ADMIN_NAV.find((n) => location.pathname.startsWith(n.to));

  const SidebarLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav aria-label="Admin Navigation" className="space-y-0.5">
      {ADMIN_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-[#171717] text-white'
                : 'text-[#525252] hover:bg-white hover:text-[#171717]'
            }`
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F8F7] text-[#171717]">
      {/* Fixed Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#F8F8F7] border-r border-[#E5E5E5] p-4">
        <div className="flex items-center justify-between px-2 py-2 mb-4">
          <Link to="/admin/dashboard" className="font-display text-base font-bold tracking-[0.12em]">
            KOVA ADMIN
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <SidebarLinks />
        </div>

        <div className="pt-4 mt-4 border-t border-[#E5E5E5] space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#525252] hover:bg-white hover:text-[#171717]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Storefront
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              pushToast({ title: 'Signed out of Admin Console', variant: 'default' });
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E5E5] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin sidebar"
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-[#F8F8F7] cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm text-[#737373] truncate">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-[#171717]">
                {activeNav?.label || 'Operations'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Operations alerts"
                className="relative h-9 w-9 rounded-lg border border-[#E5E5E5] bg-white inline-flex items-center justify-center hover:bg-[#F8F8F7] cursor-pointer"
              >
                <Bell className="h-4 w-4 text-[#171717]" />
                {lowStockCount + unassignedCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-semibold inline-flex items-center justify-center tabular-nums">
                    {lowStockCount + unassignedCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E5E5] rounded-2xl shadow-xl p-4 z-50 space-y-2.5 text-xs">
                  <p className="font-semibold text-[#171717]">Operations Alerts</p>
                  <Link
                    to="/admin/inventory"
                    onClick={() => setNotifOpen(false)}
                    className="block p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]"
                  >
                    {lowStockCount} products at low workshop stock (&le;10 units)
                  </Link>
                  <Link
                    to="/admin/orders"
                    onClick={() => setNotifOpen(false)}
                    className="block p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]"
                  >
                    {unassignedCount} orders awaiting supplier assignment
                  </Link>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E5E5]">
              <div className="text-right">
                <p className="text-xs font-semibold text-[#171717]">{currentUser?.name}</p>
                <p className="text-[11px] text-[#737373]">Operations Lead</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="KOVA Admin" side="left">
        <SidebarLinks onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </div>
  );
}
