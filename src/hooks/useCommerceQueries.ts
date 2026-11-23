import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import { orderService } from '../services/order.service';
import { productService } from '../services/product.service';
import { supplierService } from '../services/supplier.service';
import { useAppDataStore } from '../store/useAppDataStore';
import type { ProductFilterOptions } from '../utils/commerceRules';

export function useProductsQuery(filters: ProductFilterOptions = {}) {
  const products = useAppDataStore((s) => s.products);
  return useQuery({
    queryKey: ['products', filters, products.length, products.map((p) => `${p.id}:${p.stock}:${p.price}:${p.status}`).join(',')],
    queryFn: () => productService.list(filters),
    staleTime: 0,
  });
}

export function useProductDetailQuery(slug: string | undefined) {
  const products = useAppDataStore((s) => s.products);
  return useQuery({
    queryKey: ['product', slug, products],
    queryFn: () => (slug ? productService.getBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
    staleTime: 0,
  });
}

export function useCategoriesQuery() {
  const categories = useAppDataStore((s) => s.categories);
  const products = useAppDataStore((s) => s.products);
  return useQuery({
    queryKey: ['categories', categories.length, products.length],
    queryFn: () => categoryService.list(),
    staleTime: 0,
  });
}

export function useOrderLookupQuery(orderId: string | null) {
  const orders = useAppDataStore((s) => s.orders);
  return useQuery({
    queryKey: ['order', orderId, orders],
    queryFn: () => (orderId ? orderService.getById(orderId) : Promise.resolve(null)),
    enabled: Boolean(orderId && orderId.trim().length > 0),
    staleTime: 0,
  });
}

export function useSuppliersQuery() {
  const suppliers = useAppDataStore((s) => s.suppliers);
  return useQuery({
    queryKey: ['suppliers', suppliers],
    queryFn: () => supplierService.list(),
    staleTime: 0,
  });
}
