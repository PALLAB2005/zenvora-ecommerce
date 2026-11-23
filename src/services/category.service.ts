import { useAppDataStore } from '../store/useAppDataStore';
import type { Category } from '../types/commerce';

export const categoryService = {
  async list(): Promise<(Category & { productCount: number })[]> {
    const { categories, products } = useAppDataStore.getState();
    return categories.map((cat) => ({
      ...cat,
      productCount: products.filter(
        (p) => p.categoryId === cat.id && p.status === 'active'
      ).length,
    }));
  },

  async create(category: Category): Promise<Category> {
    useAppDataStore.getState().addCategory(category);
    return category;
  },

  async remove(id: string): Promise<void> {
    useAppDataStore.getState().deleteCategory(id);
  },
};
