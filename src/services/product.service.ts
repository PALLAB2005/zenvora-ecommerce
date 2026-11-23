import { useAppDataStore } from '../store/useAppDataStore';
import { filterAndSortProducts, type ProductFilterOptions } from '../utils/commerceRules';
import type { Product } from '../types/commerce';

export const productService = {
  async list(filters: ProductFilterOptions = {}): Promise<Product[]> {
    const products = useAppDataStore.getState().products;
    return filterAndSortProducts(products, filters);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const products = useAppDataStore.getState().products;
    return products.find((p) => p.slug === slug) ?? null;
  },

  async getById(id: string): Promise<Product | null> {
    const products = useAppDataStore.getState().products;
    return products.find((p) => p.id === id) ?? null;
  },

  async create(product: Product): Promise<Product> {
    useAppDataStore.getState().addProduct(product);
    return product;
  },

  async update(id: string, data: Partial<Product>): Promise<void> {
    useAppDataStore.getState().updateProduct(id, data);
  },

  async remove(id: string): Promise<void> {
    useAppDataStore.getState().deleteProduct(id);
  },
};
