import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import type { Product } from '../../types/commerce';
import { calculateDiscountPercent, formatCurrency } from '../../utils/commerceRules';
import { SafeImage } from '../ui/SafeImage';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const pushToast = useToastStore((s) => s.pushToast);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product.id));

  const discount = calculateDiscountPercent(product.price, product.originalPrice);
  const defaultVariant = product.variants[0];
  const outOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      colorName: defaultVariant?.colorName ?? 'Standard',
      size: defaultVariant?.size ?? 'Standard',
      sku: defaultVariant?.sku ?? product.sku,
      quantity: 1,
      maxStock: product.stock,
    });
    pushToast({
      title: 'Added to bag',
      description: `${product.name} (${defaultVariant?.colorName ?? 'Standard'})`,
      variant: 'success',
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    pushToast({
      title: added ? 'Saved to wishlist' : 'Removed from wishlist',
      description: product.name,
      variant: 'default',
    });
  };

  return (
    <article className="group flex flex-col bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(23,23,23,0.06)]">
      <div className="relative aspect-[4/3] bg-[#F8F8F7] overflow-hidden">
        <Link
          to={`/products/${product.slug}`}
          className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            fallbackTitle={product.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]',
              product.images[1] && 'group-hover:opacity-0'
            )}
          />
          {product.images[1] && (
            <SafeImage
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              fallbackTitle={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={cn(
            'absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 border border-[#E5E5E5] inline-flex items-center justify-center transition-colors cursor-pointer shadow-xs',
            isWishlisted ? 'text-[#DC2626]' : 'text-[#737373] hover:text-[#171717]'
          )}
        >
          <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
        </button>

        {product.isNewArrival && !outOfStock && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold tracking-wide text-[#171717] bg-white/95 border border-[#E5E5E5] px-2.5 py-1 rounded-md">
            New Arrival
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold text-[#B91C1C] bg-white/95 border border-[#FECACA] px-2.5 py-1 rounded-md">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-[#737373]">
          <span className="truncate">{product.categoryName}</span>
          <span className="inline-flex items-center gap-1 tabular-nums shrink-0 text-[#171717] font-medium">
            <Star className="h-3.5 w-3.5 fill-[#171717] text-[#171717]" aria-hidden="true" />
            {product.rating.toFixed(1)}
            <span className="text-[#737373] font-normal">({product.reviewCount})</span>
          </span>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="mt-2 text-base font-semibold text-[#171717] hover:text-[#2563EB] transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-xs text-[#737373] line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-4 space-y-3 border-t border-[#E5E5E5]/70">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-base font-semibold text-[#171717]">
              {formatCurrency(product.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-xs text-[#737373] line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
                <span className="text-xs font-semibold text-[#2563EB]">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.name} to bag`}
            className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#171717] text-white text-xs font-semibold hover:bg-[#2E2E2E] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {outOfStock ? 'Sold Out' : 'Quick Add'}
          </button>
        </div>
      </div>
    </article>
  );
}
