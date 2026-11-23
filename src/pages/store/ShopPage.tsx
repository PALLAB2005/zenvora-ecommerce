import { useEffect, useState } from 'react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';
import { EmptyState, Pagination, Skeleton } from '../../components/ui/DataUI';
import { Drawer } from '../../components/ui/Drawer';
import { Select } from '../../components/ui/FormControls';
import { useCategoriesQuery, useProductsQuery } from '../../hooks/useCommerceQueries';
import type { ProductFilterOptions } from '../../utils/commerceRules';

const PAGE_SIZE = 8;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const initialQ = searchParams.get('q') || '';

  const [categoryId, setCategoryId] = useState(initialCat);
  const [search, setSearch] = useState(initialQ);
  const [maxPrice, setMaxPrice] = useState(400);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<NonNullable<ProductFilterOptions['sortBy']>>('featured');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setCategoryId(searchParams.get('category') || 'all');
    setSearch(searchParams.get('q') || '');
    setPage(1);
  }, [searchParams]);

  const { data: categories = [] } = useCategoriesQuery();
  const { data: products = [], isLoading } = useProductsQuery({
    categoryId,
    search,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
  });

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearAllFilters = () => {
    setCategoryId('all');
    setSearch('');
    setMaxPrice(400);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('featured');
    setPage(1);
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#171717] mb-3">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setCategoryId('all');
              setPage(1);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              categoryId === 'all'
                ? 'bg-[#171717] text-white font-semibold'
                : 'text-[#737373] hover:bg-[#F8F8F7] hover:text-[#171717]'
            }`}
          >
            <span>All Objects</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoryId(c.id);
                setPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                categoryId === c.id
                  ? 'bg-[#171717] text-white font-semibold'
                  : 'text-[#737373] hover:bg-[#F8F8F7] hover:text-[#171717]'
              }`}
            >
              <span className="truncate">{c.name}</span>
              <span className="text-xs tabular-nums opacity-75">{c.productCount}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-5 border-t border-[#E5E5E5]">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="price-range" className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
            Max Price
          </label>
          <span className="text-xs font-semibold tabular-nums text-[#2563EB]">
            Up to ${maxPrice}
          </span>
        </div>
        <input
          id="price-range"
          type="range"
          min={50}
          max={400}
          step={10}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setPage(1);
          }}
          className="w-full accent-[#2563EB] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#737373] tabular-nums mt-1">
          <span>$50</span>
          <span>$400</span>
        </div>
      </div>

      <div className="pt-5 border-t border-[#E5E5E5]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#171717] mb-3">
          Minimum Rating
        </h3>
        <div className="space-y-1.5">
          {[0, 4.5, 4.8].map((r) => (
            <label key={r} className="flex items-center gap-2.5 text-sm text-[#171717] cursor-pointer">
              <input
                type="radio"
                name="minRating"
                checked={minRating === r}
                onChange={() => {
                  setMinRating(r);
                  setPage(1);
                }}
                className="accent-[#2563EB]"
              />
              <span>{r === 0 ? 'All Ratings' : `${r}+ Stars`}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-5 border-t border-[#E5E5E5]">
        <label className="flex items-center gap-2.5 text-sm font-medium text-[#171717] cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded accent-[#2563EB]"
          />
          <span>In stock & ready to ship</span>
        </label>
      </div>

      <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
            Studio Catalog
          </h1>
          <p className="mt-1.5 text-sm text-[#737373]">
            Showing <span className="font-semibold text-[#171717] tabular-nums">{products.length}</span> architectural objects
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-4 w-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter catalog..."
              aria-label="Filter catalog by keyword"
              className="w-full h-10 pl-9 pr-8 rounded-[10px] bg-white border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#2563EB]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="w-44">
            <Select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as NonNullable<ProductFilterOptions['sortBy']>)}
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </Select>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl p-6">
            <FilterPanel />
          </div>
        </aside>

        <div className="lg:col-span-9">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={<Filter className="h-8 w-8" />}
              title="No objects match your filters"
              description="Try widening your price range or clearing category filters to view the full collection."
              actionLabel="Reset All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <Drawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Objects"
        side="left"
      >
        <FilterPanel />
      </Drawer>
    </div>
  );
}
