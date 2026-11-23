import { useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { SafeImage } from '../../components/ui/SafeImage';
import { BRAND_IMAGES } from '../../data/seedData';
import { useCategoriesQuery, useProductsQuery } from '../../hooks/useCommerceQueries';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';

export function HomePage() {
  const { data: categories = [] } = useCategoriesQuery();
  const { data: products = [] } = useProductsQuery();
  const allReviews = useAppDataStore((s) => s.reviews);
  const reviews = allReviews.filter((r) => r.status === 'approved');
  const pushToast = useToastStore((s) => s.pushToast);

  const [newArrivalOffset, setNewArrivalOffset] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival);
  const visibleNewArrivals =
    newArrivals.length > 0
      ? newArrivals.slice(newArrivalOffset, newArrivalOffset + 3).length === 3
        ? newArrivals.slice(newArrivalOffset, newArrivalOffset + 3)
        : newArrivals.slice(0, 3)
      : products.slice(0, 3);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) {
      pushToast({ title: 'Enter a valid email address', variant: 'error' });
      return;
    }
    pushToast({
      title: 'Welcome to KOVA Dispatch',
      description: 'Apply code KOVA15 at checkout for 15% off your first studio order.',
      variant: 'success',
    });
    setNewsletterEmail('');
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              Autumn / Winter Studio Release
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#171717] leading-[1.12] [text-wrap:balance]">
              Architectural objects built for quiet focus.
            </h1>
            <p className="mt-4 text-base text-[#737373] leading-relaxed max-w-md">
              Precision-milled aluminum lighting, tactile acoustic speakers, and Kyoto stoneware — shipped directly from our partner workshops.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/shop">
                <Button variant="primary" size="lg">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="lg">
                  Explore Collection
                </Button>
              </Link>
            </div>
            <div className="mt-10 pt-6 border-t border-[#E5E5E5] grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-semibold text-[#171717] tabular-nums">48 Hours</p>
                <p className="text-[#737373] mt-0.5">Workshop Dispatch</p>
              </div>
              <div>
                <p className="font-semibold text-[#171717] tabular-nums">30 Days</p>
                <p className="text-[#737373] mt-0.5">Studio Trial</p>
              </div>
              <div>
                <p className="font-semibold text-[#171717] tabular-nums">3 Years</p>
                <p className="text-[#737373] mt-0.5">Hardware Warranty</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[540px] bg-[#EFEFED]">
            <SafeImage
              src={BRAND_IMAGES.hero}
              alt="Sunlit architectural desk workspace featuring KOVA lamp, wireless speaker, and ceramic pour-over"
              className="w-full h-full lg:absolute lg:inset-0 object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Featured Categories */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              Featured Categories
            </h2>
            <p className="mt-1.5 text-sm text-[#737373]">
              Curated disciplines across lighting, acoustics, daily ritual, and carry.
            </p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171717] hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
          >
            All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group block bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,23,23,0.06)]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#EFEFED]">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#171717] truncate group-hover:text-[#2563EB] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5 tabular-nums">
                    {cat.productCount} {cat.productCount === 1 ? 'object' : 'objects'}
                  </p>
                </div>
                <span className="h-8 w-8 rounded-full border border-[#E5E5E5] bg-white inline-flex items-center justify-center text-[#171717] group-hover:bg-[#171717] group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Best Sellers */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#E5E5E5]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              Best Sellers
            </h2>
            <p className="mt-1.5 text-sm text-[#737373]">
              Our most-requested studio pieces with verified workshop stock.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171717] hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
          >
            Shop Full Catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Seasonal Promotional Banner */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="relative rounded-2xl overflow-hidden border border-[#E5E5E5] bg-[#171717] text-white min-h-[380px] flex items-center">
          <SafeImage
            src={BRAND_IMAGES.promo}
            alt="Seasonal morning ritual stoneware carafe and brewer on limestone counter"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
          <div className="relative z-10 p-8 sm:p-14 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
              Limited Studio Offer · Code KOVA15
            </p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight [text-wrap:balance]">
              15% off orders over $100 across the Living & Ritual line.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
              Every stoneware carafe and temperature-controlled kettle is inspected at our Kyoto kiln before direct insured dispatch.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop?category=living">
                <Button variant="accent" size="lg">
                  Explore Living & Ritual
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Carousel */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#E5E5E5]">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              New Arrivals
            </h2>
            <p className="mt-1.5 text-sm text-[#737373]">
              Freshly milled and fired editions from our November production batch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous new arrivals"
              onClick={() => setNewArrivalOffset((o) => Math.max(0, o - 1))}
              disabled={newArrivalOffset === 0}
              className="h-10 w-10 rounded-full border border-[#E5E5E5] bg-white inline-flex items-center justify-center text-[#171717] hover:bg-[#F8F8F7] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next new arrivals"
              onClick={() =>
                setNewArrivalOffset((o) =>
                  o + 3 < newArrivals.length ? o + 1 : 0
                )
              }
              className="h-10 w-10 rounded-full border border-[#E5E5E5] bg-white inline-flex items-center justify-center text-[#171717] hover:bg-[#F8F8F7] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleNewArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="bg-[#F8F8F7] border-y border-[#E5E5E5] py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              Direct from workshop to desk
            </h2>
            <p className="mt-2 text-sm text-[#737373]">
              We partner directly with four specialized manufacturing ateliers to eliminate retail markups without compromising tolerances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Machined & Fired Craft',
                body: '6061 aluminum, solid brass, and high-fire Kyoto stoneware tested to 3-year tolerances.',
              },
              {
                icon: Truck,
                title: 'Insured Direct Shipping',
                body: 'Complimentary standard shipping on orders over $150 with live tracking from supplier dispatch.',
              },
              {
                icon: ShieldCheck,
                title: 'Verified Payments & COD',
                body: 'Supports encrypted card/UPI settlement as well as Cash on Delivery across serviceable postal zones.',
              },
              {
                icon: RefreshCw,
                title: '30-Day Studio Returns',
                body: 'Simple self-serve return requests from your customer account with prompt inspection and refund.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] flex items-center justify-center text-[#171717] mb-4">
                  <item.icon className="h-5 w-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-[#171717]">{item.title}</h3>
                <p className="mt-1.5 text-sm text-[#737373] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Customer Testimonials & Newsletter */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            Verified Studio Reviews
          </h2>
          <p className="mt-1.5 text-sm text-[#737373]">
            Feedback from architects, industrial designers, and home studios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {reviews.slice(0, 3).map((rev) => (
            <blockquote
              key={rev.id}
              className="bg-white border border-[#E5E5E5] rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#171717]" aria-label={`${rev.rating} out of 5 stars`}>
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-[#171717]">{rev.title}</p>
                <p className="mt-2 text-sm text-[#737373] leading-relaxed">“{rev.comment}”</p>
              </div>
              <footer className="mt-5 pt-4 border-t border-[#E5E5E5] text-xs">
                <p className="font-semibold text-[#171717]">{rev.authorName}</p>
                <p className="text-[#737373] mt-0.5">
                  {rev.authorRole ? `${rev.authorRole} · ` : ''}
                  {rev.productName}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Receive early access to small-batch drops
            </h2>
            <p className="mt-1.5 text-sm text-[#737373]">
              Monthly notes from our Copenhagen and Kyoto workshops, plus 15% off your first purchase.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@studio.com"
              aria-label="Email for newsletter"
              className="h-11 px-4 rounded-xl bg-white border border-[#E5E5E5] text-sm sm:w-72 focus:outline-none focus:border-[#2563EB]"
            />
            <Button type="submit" variant="primary" size="lg">
              Join Dispatch
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
