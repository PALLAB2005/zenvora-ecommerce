import { useState } from 'react';
import {
  ClipboardCheck,
  DollarSign,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  User,
  Warehouse,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';

const SUPPLIER_NAV = [
  { label: 'Dashboard', to: '/supplier/dashboard', icon: LayoutDashboard },
  { label: 'Assigned Orders', to: '/supplier/orders', icon: ShoppingBag },
  { label: 'Products', to: '/supplier/products', icon: Package },
  { label: 'Inventory', to: '/supplier/inventory', icon: Warehouse },
  { label: 'Fulfillment', to: '/supplier/fulfillment', icon: ClipboardCheck },
  { label: 'Earnings', to: '/supplier/earnings', icon: DollarSign },
  { label: 'Profile', to: '/supplier/profile', icon: User },
];

export function SupplierLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppDataStore((s) => s.currentUser);
  const suppliers = useAppDataStore((s) => s.suppliers);
  const logout = useAppDataStore((s) => s.logout);
  const pushToast = useToastStore((s) => s.pushToast);

  const [mobileOpen, setMobileOpen] = useState(false);

  const supplier = suppliers.find((s) => s.id === (currentUser?.supplierId || 'sup-nordic'));
  const activeNav = SUPPLIER_NAV.find((n) => location.pathname.startsWith(n.to));

  const SidebarLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav aria-label="Supplier Navigation" className="space-y-1">
      {SUPPLIER_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-[#171717] text-white'
                : 'text-[#525252] hover:bg-white hover:text-[#171717]'
            }`
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F8F7] text-[#171717]">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#F8F8F7] border-r border-[#E5E5E5] p-4">
        <div className="px-2 py-2 mb-5">
          <Link to="/supplier/dashboard" className="font-display text-base font-bold tracking-[0.12em]">
            KOVA SUPPLIER
          </Link>
          <p className="text-xs text-[#737373] mt-1 truncate">{supplier?.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
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
              pushToast({ title: 'Signed out of Supplier Portal', variant: 'default' });
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E5E5] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open supplier sidebar"
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-[#F8F8F7] cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm text-[#737373] truncate">
              <span>Supplier Portal</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-[#171717]">{activeNav?.label || 'Workspace'}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-[#171717]">{supplier?.name}</p>
            <p className="text-[11px] text-[#737373]">{supplier?.location}</p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Supplier Menu" side="left">
        <SidebarLinks onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </div>
  );
}
