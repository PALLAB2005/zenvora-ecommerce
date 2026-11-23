import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AccountLayout } from './components/layout/AccountLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { StoreLayout } from './components/layout/StoreLayout';
import { SupplierLayout } from './components/layout/SupplierLayout';
import { Toaster } from './components/ui/Toaster';

import { HomePage } from './pages/store/HomePage';
import { ShopPage } from './pages/store/ShopPage';
import { CategoriesPage } from './pages/store/CategoriesPage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';
import { CartPage } from './pages/store/CartPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { OrderSuccessPage } from './pages/store/OrderSuccessPage';
import { TrackOrderPage } from './pages/store/TrackOrderPage';
import { AboutPage, ContactPage, PoliciesPage } from './pages/store/StaticPages';

import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from './pages/auth/AuthPages';

import {
  AccountAddressesPage,
  AccountOrderDetailPage,
  AccountOrdersPage,
  AccountProfilePage,
  AccountSettingsPage,
  AccountWishlistPage,
} from './pages/account/AccountPages';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import {
  AdminCategoriesPage,
  AdminInventoryPage,
  AdminProductFormPage,
  AdminProductsPage,
} from './pages/admin/AdminProductsPages';
import {
  AdminCustomersPage,
  AdminOrderDetailPage,
  AdminOrdersPage,
  AdminSupplierDetailPage,
  AdminSuppliersPage,
} from './pages/admin/AdminOrdersSuppliersPages';
import {
  AdminAnalyticsPage,
  AdminCouponsPage,
  AdminPaymentsPage,
  AdminPurchaseOrdersPage,
  AdminReturnsPage,
  AdminReviewsPage,
  AdminSettingsPage,
  AdminShippingPage,
} from './pages/admin/AdminOperationsPages';

import {
  SupplierDashboardPage,
  SupplierEarningsPage,
  SupplierFulfillmentPage,
  SupplierInventoryPage,
  SupplierOrderDetailPage,
  SupplierOrdersPage,
  SupplierProductsPage,
  SupplierProfilePage,
} from './pages/supplier/SupplierPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Customer Storefront */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/policies" element={<PoliciesPage />} />

            {/* Public Wishlist convenience & Protected Customer Account */}
            <Route path="/account/wishlist" element={<AccountWishlistPage />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/account/profile" replace />} />
              <Route path="profile" element={<AccountProfilePage />} />
              <Route path="orders" element={<AccountOrdersPage />} />
              <Route path="orders/:id" element={<AccountOrderDetailPage />} />
              <Route path="addresses" element={<AccountAddressesPage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Admin Operations Console */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/:id/edit" element={<AdminProductFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="suppliers" element={<AdminSuppliersPage />} />
            <Route path="suppliers/:id" element={<AdminSupplierDetailPage />} />
            <Route path="purchase-orders" element={<AdminPurchaseOrdersPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="shipping" element={<AdminShippingPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="returns" element={<AdminReturnsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Supplier Fulfillment Portal */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute allowedRoles={['supplier', 'admin']}>
                <SupplierLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/supplier/dashboard" replace />} />
            <Route path="dashboard" element={<SupplierDashboardPage />} />
            <Route path="orders" element={<SupplierOrdersPage />} />
            <Route path="orders/:id" element={<SupplierOrderDetailPage />} />
            <Route path="products" element={<SupplierProductsPage />} />
            <Route path="inventory" element={<SupplierInventoryPage />} />
            <Route path="fulfillment" element={<SupplierFulfillmentPage />} />
            <Route path="earnings" element={<SupplierEarningsPage />} />
            <Route path="profile" element={<SupplierProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
