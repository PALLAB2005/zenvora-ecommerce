import { ShieldAlert } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAppDataStore } from '../../store/useAppDataStore';
import type { UserRole } from '../../types/commerce';

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}) {
  const currentUser = useAppDataStore((s) => s.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F7] px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded-2xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-[#FEF2F2] text-[#DC2626] mx-auto flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-[#171717]">Role Access Required</h1>
          <p className="text-sm text-[#737373]">
            You are signed in as <span className="font-semibold text-[#171717]">{currentUser.role}</span> ({currentUser.email}). This workspace requires <span className="font-semibold text-[#171717]">{allowedRoles.join(' or ')}</span> permissions.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/login">
              <Button variant="primary">Switch Account</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Storefront</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
