import { useState, useEffect } from 'react';
import {
  Check,
  Heart,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { EmptyState, Tabs } from '../../components/ui/DataUI';
import { Input } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { useProductDetailQuery, useProductsQuery } from '../../hooks/useCommerceQueries';
import { shippingService } from '../../services/shipping.service';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { calculateDiscountPercent, formatCurrency, formatDate } from '../../utils/commerceRules';

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product } = useProductDetailQuery(slug);
  const { data: allProducts = [] } = useProductsQuery();

  const allReviews = useAppDataStore((s) => s.reviews);
  const reviews = allReviews.filter(
    (r) => r.productId === product?.id && r.status === 'approved'
  );
  const addReview = useAppDataStore((s) => s.addReview);
  const currentUser = useAppDataStore((s) => s.currentUser);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) =>
    product ? s.productIds.includes(product.id) : false
  );
  const pushToast = useToastStore((s) => s.pushToast);

  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('94107');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [pincodeValid, setPincodeValid] = useState(true);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    setActiveImage(0);
    setSelectedVariantIdx(0);
    setQuantity(1);
    setPincodeResult(null);
  }, [slug]);

  if (!product) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Product not found"
          description="This object may have been archived or moved."
          actionLabel="Return to Catalog"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  const activeVariant = product.variants[selectedVariantIdx] ?? product.variants[0];
  const discount = calculateDiscountPercent(product.price, product.originalPrice);
  const outOfStock = product.stock <= 0;
  const related = allProducts
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const handleAddToCart = (openDrawer = true) => {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        price: product.price,
        originalPrice: product.originalPrice,
        colorName: activeVariant?.colorName ?? 'Standard',
        size: activeVariant?.size ?? 'Standard',
        sku: activeVariant?.sku ?? product.sku,
        quantity,
        maxStock: product.stock,
      },
      openDrawer
    );
    if (openDrawer) {
      pushToast({
        title: 'Added to shopping bag',
        description: `${quantity} × ${product.name}`,
        variant: 'success',
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    navigate('/checkout');
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await shippingService.checkPincode(pincode);
    setPincodeValid(res.valid);
    setPincodeResult(res.message);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      pushToast({ title: 'Please fill out your review title and comment', variant: 'error' });
      return;
    }
    addReview({
      id: `rev-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      authorName: currentUser?.name || 'Verified Studio Buyer',
      rating: reviewRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      status: 'approved',
      createdAt: new Date().toISOString(),
    });
    setReviewTitle('');
    setReviewComment('');
    pushToast({ title: 'Thank you — your review is now live', variant: 'success' });
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-xs text-[#737373] mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-[#171717]">Home</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.categoryId}`} className="hover:text-[#171717]">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-[#171717] font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            className="relative aspect-[4/3] bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl overflow-hidden cursor-zoom-in"
          >
            <SafeImage
              src={product.images[activeImage] || product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                zoomed ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border transition-all cursor-pointer bg-[#F8F8F7] ${
                    activeImage === idx
                      ? 'border-[#171717] ring-2 ring-[#171717]/15'
                      : 'border-[#E5E5E5] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sticky Purchase Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#737373]">
              <span>{product.categoryName} · SKU {activeVariant?.sku ?? product.sku}</span>
              <span className="inline-flex items-center gap-1 text-[#171717] font-semibold tabular-nums">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-[#737373] leading-relaxed">
              {product.shortDescription}
            </p>

            <div className="mt-5 flex items-baseline gap-3 tabular-nums">
              <span className="text-2xl font-bold text-[#171717]">
                {formatCurrency(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-base text-[#737373] line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">Finish & Edition</span>
                <span className="text-[#737373]">
                  {activeVariant?.colorName} · {activeVariant?.size}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant, idx) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedVariantIdx === idx
                        ? 'border-[#171717] bg-[#F8F8F7] text-[#171717] font-semibold'
                        : 'border-[#E5E5E5] bg-white text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                    {variant.colorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#171717]">Quantity</span>
              <span className={`font-medium tabular-nums ${outOfStock ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {outOfStock ? 'Currently out of stock' : `${product.stock} units in workshop stock`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border border-[#E5E5E5] rounded-[10px] h-11">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="h-11 w-10 inline-flex items-center justify-center text-[#171717] hover:bg-[#F8F8F7] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))}
                  aria-label="Increase quantity"
                  className="h-11 w-10 inline-flex items-center justify-center text-[#171717] hover:bg-[#F8F8F7] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={outOfStock}
                onClick={() => handleAddToCart(true)}
                className="flex-1"
              >
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <button
                type="button"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={() => {
                  const added = toggleWishlist(product.id);
                  pushToast({
                    title: added ? 'Saved to wishlist' : 'Removed from wishlist',
                    variant: 'default',
                  });
                }}
                className={`h-12 w-12 rounded-[12px] border border-[#E5E5E5] inline-flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  isWishlisted ? 'text-[#DC2626] bg-[#FEF2F2]' : 'text-[#171717] hover:bg-[#F8F8F7]'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Button
              variant="accent"
              size="lg"
              disabled={outOfStock}
              onClick={handleBuyNow}
              className="w-full"
            >
              Buy Now
            </Button>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="pt-4 border-t border-[#E5E5E5]">
            <form onSubmit={handleCheckPincode} className="space-y-2">
              <label htmlFor="pincode-check" className="flex items-center gap-1.5 text-xs font-semibold text-[#171717]">
                <MapPin className="h-3.5 w-3.5 text-[#737373]" />
                Check Delivery & COD Availability
              </label>
              <div className="flex gap-2">
                <Input
                  id="pincode-check"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter postal / pincode"
                />
                <Button type="submit" variant="outline" size="md">
                  Check
                </Button>
              </div>
              {pincodeResult && (
                <p className={`text-xs flex items-center gap-1.5 ${pincodeValid ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {pincodeValid && <Check className="h-3.5 w-3.5 shrink-0" />}
                  {pincodeResult}
                </p>
              )}
            </form>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5E5E5] text-[11px] text-[#737373]">
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-[#171717] shrink-0" />
              <span>Free over $150</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-[#171717] shrink-0" />
              <span>30-day returns</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#171717] shrink-0" />
              <span>3-yr warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16 pt-12 border-t border-[#E5E5E5]">
        <Tabs
          activeId={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'description', label: 'Overview & Craft' },
            { id: 'specs', label: 'Specifications' },
            { id: 'shipping', label: 'Shipping & Returns' },
            { id: 'reviews', label: `Customer Reviews (${reviews.length})` },
          ]}
        />

        <div className="mt-8 bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4">
              <h2 className="text-xl font-bold text-[#171717]">Designed for Longevity</h2>
              <p className="text-sm sm:text-base text-[#525252] leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl divide-y divide-[#E5E5E5]">
              {product.specifications.map((spec) => (
                <div key={spec.label} className="py-3 flex justify-between gap-4 text-sm">
                  <span className="text-[#737373]">{spec.label}</span>
                  <span className="font-medium text-[#171717] text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-3 text-sm text-[#525252] leading-relaxed">
              <p>
                <strong className="text-[#171717]">Workshop Dispatch:</strong> Orders are verified and packed within 24–48 business hours directly at our partner atelier with custom foam-free recycled pulp protection.
              </p>
              <p>
                <strong className="text-[#171717]">Returns & Warranty:</strong> Enjoy a 30-day studio trial. Unused or defective objects can be returned from your Account Orders panel with prepaid courier pickup.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-[#737373]">No customer reviews yet. Be the first to share your studio experience.</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="bg-white border border-[#E5E5E5] rounded-xl p-5">
                      <div className="flex items-center justify-between text-xs text-[#737373]">
                        <span className="font-semibold text-[#171717]">{r.authorName}</span>
                        <span>{formatDate(r.createdAt)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-[#171717]">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#171717]">{r.title}</p>
                      <p className="mt-1 text-sm text-[#737373]">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitReview} className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4 h-fit">
                <h3 className="text-base font-semibold text-[#171717]">Write a Review</h3>
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        aria-label={`Rate ${n} stars`}
                        className={`h-8 w-8 rounded-lg border text-xs font-semibold cursor-pointer ${
                          reviewRating >= n
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#737373] border-[#E5E5E5]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="rev-title" className="block text-xs font-medium text-[#171717] mb-1">Title</label>
                  <Input
                    id="rev-title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your impression"
                  />
                </div>
                <div>
                  <label htmlFor="rev-comment" className="block text-xs font-medium text-[#171717] mb-1">Review</label>
                  <textarea
                    id="rev-comment"
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share build quality, finish, or daily studio use..."
                    className="w-full p-3 rounded-[10px] border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  Submit Review
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#E5E5E5]">
          <h2 className="text-2xl font-bold text-[#171717] mb-6">Complementary Objects</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
