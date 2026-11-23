import { useState } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataUI';
import { ConfirmDialog, Dialog } from '../../components/ui/Dialog';
import { Input, Label, Select, Textarea } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { BRAND_IMAGES } from '../../data/seedData';
import { useAppDataStore } from '../../store/useAppDataStore';
import { useToastStore } from '../../store/useToastStore';
import type { Product } from '../../types/commerce';
import { calculateSupplierMargin, formatCurrency } from '../../utils/commerceRules';

export function AdminProductsPage() {
  const products = useAppDataStore((s) => s.products);
  const suppliers = useAppDataStore((s) => s.suppliers);
  const deleteProduct = useAppDataStore((s) => s.deleteProduct);
  const pushToast = useToastStore((s) => s.pushToast);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return `${p.name} ${p.sku} ${p.categoryName}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Products</h1>
          <p className="mt-1 text-sm text-[#737373]">Manage catalog pricing, SKUs, supplier cost, and stock.</p>
        </div>
        <Link to="/admin/products/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="h-4 w-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or SKU..."
            className="pl-9"
          />
        </div>
        <div className="w-40">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'draft')}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching products"
          description="Try clearing your search or create a new catalog object."
        />
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Margin</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-sm">
                {filtered.map((p) => {
                  const sup = suppliers.find((s) => s.id === p.supplierId);
                  const margin = calculateSupplierMargin(p.price, p.costPrice);
                  return (
                    <tr key={p.id} className="hover:bg-[#F8F8F7]/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <SafeImage src={p.images[0]} alt={p.name} className="h-10 w-12 rounded-lg object-cover bg-[#F8F8F7] shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#171717] truncate max-w-[200px]">{p.name}</p>
                            <p className="text-xs text-[#737373]">{p.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#737373]">{p.sku}</td>
                      <td className="py-3 px-4 text-xs text-[#737373]">{sup?.name || p.supplierId}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-[#737373]">{formatCurrency(p.costPrice)}</td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold">{formatCurrency(p.price)}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-xs text-[#16A34A] font-semibold">
                        {margin.marginPercent}%
                      </td>
                      <td className={`py-3 px-4 text-right tabular-nums font-semibold ${p.stock <= 10 ? 'text-[#DC2626]' : 'text-[#171717]'}`}>
                        {p.stock}
                      </td>
                      <td className="py-3 px-4"><StatusLabel status={p.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            aria-label={`Edit ${p.name}`}
                            className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-[#737373] hover:text-[#171717] hover:bg-[#F8F8F7]"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            aria-label={`Delete ${p.name}`}
                            className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        message={`Remove "${deleteTarget?.name}" from the KOVA catalog? This cannot be undone.`}
        confirmLabel="Delete Product"
        onConfirm={() => {
          if (deleteTarget) {
            deleteProduct(deleteTarget.id);
            pushToast({ title: `Deleted ${deleteTarget.name}`, variant: 'default' });
          }
        }}
      />
    </div>
  );
}

const IMAGE_PRESETS = [
  { label: 'Arc Lamp Studio', url: BRAND_IMAGES.arcLamp },
  { label: 'Monolith Speaker', url: BRAND_IMAGES.monolithSpeaker },
  { label: 'Pour-Over Kettle', url: BRAND_IMAGES.ceramicKettle },
  { label: 'Cordless Lantern', url: BRAND_IMAGES.ambientLantern },
  { label: 'Desk Organizer', url: BRAND_IMAGES.deskOrganizer },
  { label: 'Desk Clock', url: BRAND_IMAGES.deskClock },
  { label: 'Field Pack', url: BRAND_IMAGES.fieldPack },
  { label: 'Stoneware Carafe', url: BRAND_IMAGES.stonewareCarafe },
];

export function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const categories = useAppDataStore((s) => s.categories);
  const suppliers = useAppDataStore((s) => s.suppliers);
  const existing = useAppDataStore((s) => (id ? s.products.find((p) => p.id === id) : undefined));
  const addProduct = useAppDataStore((s) => s.addProduct);
  const updateProduct = useAppDataStore((s) => s.updateProduct);
  const pushToast = useToastStore((s) => s.pushToast);

  const [name, setName] = useState(existing?.name ?? '');
  const [sku, setSku] = useState(existing?.sku ?? `KV-NEW-${Math.floor(100 + Math.random() * 899)}`);
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? 'lighting');
  const [supplierId, setSupplierId] = useState(existing?.supplierId ?? suppliers[0]?.id ?? 'sup-nordic');
  const [price, setPrice] = useState(String(existing?.price ?? 180));
  const [originalPrice, setOriginalPrice] = useState(String(existing?.originalPrice ?? 210));
  const [costPrice, setCostPrice] = useState(String(existing?.costPrice ?? 78));
  const [stock, setStock] = useState(String(existing?.stock ?? 20));
  const [status, setStatus] = useState<'active' | 'draft'>(existing?.status ?? 'active');
  const [shortDescription, setShortDescription] = useState(existing?.shortDescription ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [images, setImages] = useState<string[]>(existing?.images ?? [BRAND_IMAGES.arcLamp]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [variantColor, setVariantColor] = useState(existing?.variants[0]?.colorName ?? 'Matte Charcoal');
  const [variantHex, setVariantHex] = useState(existing?.variants[0]?.colorHex ?? '#262626');
  const [variantSize, setVariantSize] = useState(existing?.variants[0]?.size ?? 'Standard');

  const margin = calculateSupplierMargin(Number(price) || 0, Number(costPrice) || 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || Number(price) <= 0) {
      pushToast({ title: 'Enter a valid product title, SKU, and selling price', variant: 'error' });
      return;
    }
    const categoryObj = categories.find((c) => c.id === categoryId);
    const slug =
      existing?.slug ??
      `${name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const payload: Product = {
      id: existing?.id ?? `prod-${Date.now()}`,
      slug,
      name: name.trim(),
      brand: 'KOVA Atelier',
      categoryId,
      categoryName: categoryObj?.name ?? categoryId,
      sku: sku.trim().toUpperCase(),
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      costPrice: Number(costPrice) || 0,
      stock: Math.max(0, Number(stock) || 0),
      rating: existing?.rating ?? 5.0,
      reviewCount: existing?.reviewCount ?? 0,
      images: images.length > 0 ? images : [BRAND_IMAGES.arcLamp],
      shortDescription: shortDescription.trim() || 'Precision-crafted studio object.',
      description: description.trim() || shortDescription.trim() || 'Architectural edition.',
      specifications: existing?.specifications ?? [
        { label: 'SKU', value: sku.trim().toUpperCase() },
        { label: 'Finish', value: variantColor },
      ],
      variants: [
        {
          id: existing?.variants[0]?.id ?? `var-${Date.now()}`,
          colorName: variantColor,
          colorHex: variantHex,
          size: variantSize,
          sku: `${sku.trim().toUpperCase()}-01`,
          stock: Math.max(0, Number(stock) || 0),
        },
      ],
      supplierId,
      status,
      isBestSeller: existing?.isBestSeller ?? false,
      isNewArrival: existing?.isNewArrival ?? true,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      updateProduct(existing.id, payload);
      pushToast({ title: `Updated ${payload.name}`, variant: 'success' });
    } else {
      addProduct(payload);
      pushToast({ title: `Created ${payload.name}`, variant: 'success' });
    }
    navigate('/admin/products');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">
            {existing ? `Edit: ${existing.name}` : 'Add New Product'}
          </h1>
          <p className="mt-1 text-sm text-[#737373]">Configure storefront details, pricing margin, and supplier routing.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#171717]">General Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="p-name">Product Title</Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vesper Brass Task Lamp" />
            </div>
            <div>
              <Label htmlFor="p-sku">SKU</Label>
              <Input id="p-sku" value={sku} onChange={(e) => setSku(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div>
            <Label htmlFor="p-short">Short Summary</Label>
            <Input id="p-short" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="One-line value proposition for product cards" />
          </div>
          <div>
            <Label htmlFor="p-desc">Full Description</Label>
            <Textarea id="p-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Materials, dimensions, and craft story..." />
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#171717]">Pricing, Margin & Supplier</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="p-cost">Supplier Cost ($)</Label>
              <Input id="p-cost" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p-price">Selling Price ($)</Label>
              <Input id="p-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p-orig">Compare At ($)</Label>
              <Input id="p-orig" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p-stock">Workshop Stock</Label>
              <Input id="p-stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-[#737373] tabular-nums">
            Gross Profit: <strong className="text-[#16A34A]">{formatCurrency(margin.profit)}</strong> ({margin.marginPercent}% margin)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <Label htmlFor="p-cat">Category</Label>
              <Select id="p-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="p-sup">Fulfillment Supplier</Label>
              <Select id="p-sup" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="p-status">Publish Status</Label>
              <Select id="p-status" value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'draft')}>
                <option value="active">Active (Visible on Storefront)</option>
                <option value="draft">Draft (Internal Only)</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-[#171717]">Media Gallery & Primary Variant</h2>
          <div className="flex flex-wrap gap-2">
            {IMAGE_PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  if (!images.includes(preset.url)) setImages([...images, preset.url]);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-xs hover:bg-[#F8F8F7] cursor-pointer"
              >
                + {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="Or paste custom image path..."
            />
            <Button
              variant="outline"
              onClick={() => {
                if (customImageUrl.trim()) {
                  setImages([...images, customImageUrl.trim()]);
                  setCustomImageUrl('');
                }
              }}
            >
              Add Image
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {images.map((img, i) => (
              <div key={`${img}-${i}`} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E5E5E5] bg-[#F8F8F7]">
                <SafeImage src={img} alt={`Product media ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E5E5E5]">
            <div>
              <Label htmlFor="v-col">Variant Finish Name</Label>
              <Input id="v-col" value={variantColor} onChange={(e) => setVariantColor(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="v-hex">Swatch Hex</Label>
              <Input id="v-hex" value={variantHex} onChange={(e) => setVariantHex(e.target.value)} className="font-mono" />
            </div>
            <div>
              <Label htmlFor="v-size">Size / Spec</Label>
              <Input id="v-size" value={variantSize} onChange={(e) => setVariantSize(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
          <Button type="submit" variant="primary" size="lg">
            {existing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminCategoriesPage() {
  const categories = useAppDataStore((s) => s.categories);
  const products = useAppDataStore((s) => s.products);
  const addCategory = useAppDataStore((s) => s.addCategory);
  const deleteCategory = useAppDataStore((s) => s.deleteCategory);
  const pushToast = useToastStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    addCategory({
      id: slug,
      name: name.trim(),
      slug,
      description: description.trim() || 'Curated D2C studio collection.',
      image: BRAND_IMAGES.arcLamp,
    });
    setOpen(false);
    setName('');
    setDescription('');
    pushToast({ title: 'Category added', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Categories</h1>
          <p className="mt-1 text-sm text-[#737373]">Organize storefront collections.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <div key={c.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex items-center gap-4">
              <SafeImage src={c.image} alt={c.name} className="h-16 w-20 rounded-xl object-cover bg-[#F8F8F7] shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-[#171717]">{c.name}</h2>
                <p className="text-xs text-[#737373] truncate">{c.description}</p>
                <p className="text-xs font-medium text-[#2563EB] mt-1 tabular-nums">{count} products</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(c.id);
                  pushToast({ title: `Removed ${c.name}`, variant: 'default' });
                }}
                aria-label={`Delete category ${c.name}`}
                className="p-2 text-[#737373] hover:text-[#DC2626] cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create Category">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Category Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ceramics" />
          </div>
          <div>
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea id="cat-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export function AdminInventoryPage() {
  const products = useAppDataStore((s) => s.products);
  const adjustStock = useAppDataStore((s) => s.adjustStock);
  const pushToast = useToastStore((s) => s.pushToast);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Inventory Control</h1>
        <p className="mt-1 text-sm text-[#737373]">Monitor workshop stock levels and issue immediate adjustments.</p>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F8F8F7] text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                <th className="py-3 px-4">Object</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Available</th>
                <th className="py-3 px-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-sm">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-4 font-medium text-[#171717]">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#737373]">{p.sku}</td>
                  <td className={`py-3 px-4 text-right font-bold tabular-nums ${p.stock <= 10 ? 'text-[#DC2626]' : 'text-[#171717]'}`}>
                    {p.stock}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          adjustStock(p.id, p.stock + 10);
                          pushToast({ title: `Added +10 units to ${p.name}`, variant: 'success' });
                        }}
                      >
                        +10 Restock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustStock(p.id, Math.max(0, p.stock - 1))}
                      >
                        -1
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
