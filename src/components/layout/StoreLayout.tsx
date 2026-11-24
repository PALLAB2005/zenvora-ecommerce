import { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { formatCurrency } from '../../utils/commerceRules';
import { MiniCartDrawer } from '../cart/MiniCartDrawer';
import { Drawer } from '../ui/Drawer';
import { SafeImage } from '../ui/SafeImage';

export function StoreLayout() {
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const announcementText = useAppDataStore((s) => s.settings.announcementText);
  const categories = useAppDataStore((s) => s.categories);
  const products = useAppDataStore((s) => s.products);
  const currentUser = useAppDataStore((s) => s.currentUser);
  const cartItems = useCartStore((s) => s.items);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const pushToast = useToastStore((s) => s.pushToast);

  const totalBagCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  const searchSuggestions = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.status === 'active' &&
            `${p.name} ${p.categoryName} ${p.shortDescription}`
              .toLowerCase()
              .includes(searchQuery.trim().toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) {
      pushToast({ title: 'Enter a valid email address', variant: 'error' });
      return;
    }
    pushToast({
      title: 'Subscribed to KOVA Dispatch',
      description: 'Use code KOVA15 at checkout for 15% off your first order.',
      variant: 'success',
    });
    setNewsletterEmail('');
  };

  const accountTarget =
    currentUser?.role === 'admin'
      ? '/admin/dashboard'
      : currentUser?.role === 'supplier'
      ? '/supplier/dashboard'
      : currentUser
      ? '/account/profile'
      : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#171717]">
      {/* Slim Announcement Bar (<= 40px) */}
      {!bannerDismissed && (
        <div className="h-9 bg-[#171717] text-white px-10 flex items-center justify-center relative text-xs">
          <p className="truncate font-medium tracking-wide">
            {announcementText}
          </p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Sticky 3-Zone Top Navigation */}
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] transition-shadow duration-200 ${
          scrolled ? 'shadow-[0_4px_20px_rgba(23,23,23,0.05)]' : ''
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-8">
          {/* Zone 1: Single-line brand wordmark + mobile menu trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden h-10 w-10 -ml-2 inline-flex items-center justify-center rounded-lg text-[#171717] hover:bg-[#F8F8F7] cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to="/"
              className="font-display text-lg font-bold tracking-[0.14em] text-[#171717] whitespace-nowrap shrink-0"
            >
              KOVA
            </Link>
          </div>

          {/* Zone 2: 5 concise single-line text links */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#737373]"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#171717] transition-colors ${
                  isActive ? 'text-[#171717] font-semibold' : ''
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#171717] transition-colors ${
                  isActive ? 'text-[#171717] font-semibold' : ''
                }`
              }
            >
              Shop
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                aria-expanded={categoriesOpen}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 hover:text-[#171717] transition-colors cursor-pointer py-2"
              >
                Categories
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {categoriesOpen && (
                <div className="absolute left-0 top-full pt-1 w-72 z-50">
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xl p-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.id}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8F8F7] transition-colors"
                      >
                        <SafeImage
                          src={cat.image}
                          alt={cat.name}
                          className="h-10 w-12 rounded-lg object-cover bg-[#F8F8F7] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#171717] truncate">
                            {cat.name}
                          </p>
                          <p className="text-xs text-[#737373] truncate">
                            {cat.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <div className="mt-1 pt-1 border-t border-[#E5E5E5]">
                      <Link
                        to="/categories"
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#2563EB] hover:bg-[#F8F8F7] rounded-lg"
                      >
                        View All Categories
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#171717] transition-colors ${
                  isActive ? 'text-[#171717] font-semibold' : ''
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-[#171717] transition-colors ${
                  isActive ? 'text-[#171717] font-semibold' : ''
                }`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Zone 3: Search, Account, Wishlist, and Bag */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Toggle product search"
              className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-[#171717] hover:bg-[#F8F8F7] transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              to="/account/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative h-10 w-10 hidden sm:inline-flex items-center justify-center rounded-lg text-[#171717] hover:bg-[#F8F8F7] transition-colors"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-[#171717] text-white text-[10px] font-semibold inline-flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to={accountTarget}
              aria-label={currentUser ? `Account (${currentUser.name})` : 'Sign in to account'}
              className="h-10 px-2.5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-[#171717] hover:bg-[#F8F8F7] transition-colors whitespace-nowrap shrink-0"
            >
              <User className="h-4 w-4" />
              <span className="hidden md:inline">
                {currentUser
                  ? currentUser.role === 'admin'
                    ? 'Admin'
                    : currentUser.role === 'supplier'
                    ? 'Supplier'
                    : currentUser.name.split(' ')[0]
                  : 'Sign In'}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={`Open shopping bag (${totalBagCount} items)`}
              className="h-10 px-3.5 inline-flex items-center gap-2 rounded-xl bg-[#171717] text-white text-xs font-semibold hover:bg-[#2E2E2E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="tabular-nums bg-white/15 px-1.5 py-0.5 rounded-md">
                {totalBagCount}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Search Bar with Instant Product Suggestions */}
        {searchOpen && (
          <div className="border-t border-[#E5E5E5] bg-white px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <Search className="h-4 w-4 text-[#737373] absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lamps, speakers, stoneware, desk tools..."
                  aria-label="Search products"
                  className="w-full h-11 pl-10 pr-24 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] text-sm focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 h-8 px-3.5 rounded-lg bg-[#171717] text-white text-xs font-semibold hover:bg-[#2E2E2E] cursor-pointer"
                >
                  Search
                </button>
              </form>

              {searchSuggestions.length > 0 && (
                <ul className="mt-3 divide-y divide-[#E5E5E5] border border-[#E5E5E5] rounded-xl bg-white overflow-hidden">
                  {searchSuggestions.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/products/${p.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#F8F8F7] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SafeImage
                            src={p.images[0]}
                            alt={p.name}
                            className="h-10 w-12 rounded-lg object-cover shrink-0 bg-[#F8F8F7]"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#171717] truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-[#737373]">{p.categoryName}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-[#171717]">
                          {formatCurrency(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Storefront Footer */}
      <footer className="bg-[#F8F8F7] border-t border-[#E5E5E5] mt-20">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-4">
              <Link
                to="/"
                className="font-display text-lg font-bold tracking-[0.14em] text-[#171717]"
              >
                KOVA ATELIER
              </Link>
              <p className="text-sm text-[#737373] leading-relaxed max-w-sm">
                Architectural home objects, precision audio, and everyday studio instruments designed in Copenhagen and fulfilled directly by our partner workshops.
              </p>
              <form onSubmit={handleNewsletter} className="pt-2 flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email for seasonal releases"
                  aria-label="Newsletter email address"
                  className="flex-1 h-10 px-3.5 rounded-[10px] bg-white border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-[10px] bg-[#171717] text-white text-xs font-semibold hover:bg-[#2E2E2E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
                Collection
              </h3>
              <ul className="space-y-2.5 text-sm text-[#737373]">
                <li><Link to="/shop" className="hover:text-[#171717]">All Objects</Link></li>
                <li><Link to="/categories" className="hover:text-[#171717]">Categories</Link></li>
                <li><Link to="/shop?category=lighting" className="hover:text-[#171717]">Lighting</Link></li>
                <li><Link to="/shop?category=audio" className="hover:text-[#171717]">Studio Audio</Link></li>
                <li><Link to="/shop?category=living" className="hover:text-[#171717]">Living & Ritual</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
                Support & Policies
              </h3>
              <ul className="space-y-2.5 text-sm text-[#737373]">
                <li><Link to="/track-order" className="hover:text-[#171717]">Track Your Order</Link></li>
                <li><Link to="/contact" className="hover:text-[#171717]">Contact Concierge</Link></li>
                <li><Link to="/about" className="hover:text-[#171717]">Our Workshops</Link></li>
                <li><Link to="/policies" className="hover:text-[#171717]">Shipping & 30-Day Returns</Link></li>
                <li><Link to="/policies?tab=privacy" className="hover:text-[#171717]">Privacy & Terms</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
                Platform Portals
              </h3>
              <ul className="space-y-2.5 text-sm text-[#737373]">
                <li><Link to="/account/profile" className="hover:text-[#171717]">Customer Account</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-[#2563EB] font-medium text-[#171717]">Admin Operations Console</Link></li>
                <li><Link to="/supplier/dashboard" className="hover:text-[#2563EB] font-medium text-[#171717]">Supplier Fulfillment Portal</Link></li>
                <li><Link to="/login" className="hover:text-[#171717]">Sign In / Switch Role</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
            <p>© {new Date().getFullYear()} KOVA Atelier. Direct-to-consumer objects.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-[#171717] font-medium">
                <ShieldCheck className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
                256-Bit Encrypted Checkout
              </span>
              <span>·</span>
              <span>Razorpay · UPI · Cards · Cash on Delivery</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Drawer */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        side="left"
        title="KOVA Menu"
      >
        <nav className="flex flex-col gap-1">
          {[
            { label: 'Home', to: '/' },
            { label: 'Shop All', to: '/shop' },
            { label: 'Categories', to: '/categories' },
            { label: 'Track Order', to: '/track-order' },
            { label: 'Wishlist', to: '/account/wishlist' },
            { label: 'About', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'Policies', to: '/policies' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-3 rounded-xl text-sm font-medium text-[#171717] hover:bg-[#F8F8F7]"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-3 border-t border-[#E5E5E5]" />
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#737373] mb-1">
            Portals
          </p>
          <Link
            to="/account/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#171717] hover:bg-[#F8F8F7]"
          >
            Customer Account
          </Link>
          <Link
            to="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#2563EB] hover:bg-[#F8F8F7]"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/supplier/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#2563EB] hover:bg-[#F8F8F7]"
          >
            Supplier Portal
          </Link>
        </nav>
      </Drawer>

      <MiniCartDrawer />
    </div>
  );
}
