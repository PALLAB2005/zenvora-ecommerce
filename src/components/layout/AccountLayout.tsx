import { Heart, LogOut, MapPin, Package, Settings, User } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';

const ACCOUNT_NAV = [
  { label: 'Profile Overview', to: '/account/profile', icon: User },
  { label: 'My Orders', to: '/account/orders', icon: Package },
  { label: 'Saved Addresses', to: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'Security & Settings', to: '/account/settings', icon: Settings },
];

export function AccountLayout() {
  const navigate = useNavigate();
  const currentUser = useAppDataStore((s) => s.currentUser);
  const logout = useAppDataStore((s) => s.logout);
  const pushToast = useToastStore((s) => s.pushToast);

  const handleLogout = () => {
    logout();
    pushToast({ title: 'Signed out', variant: 'default' });
    navigate('/');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-5 space-y-5">
          <div className="pb-4 border-b border-[#E5E5E5]">
            <p className="text-xs text-[#737373]">Customer Account</p>
            <p className="text-base font-bold text-[#171717] mt-0.5 truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-[#737373] truncate">{currentUser?.email}</p>
          </div>

          <nav className="space-y-1">
            {ACCOUNT_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#171717] text-white'
                      : 'text-[#737373] hover:bg-white hover:text-[#171717]'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer mt-2"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-9 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
