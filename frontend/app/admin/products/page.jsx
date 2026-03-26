'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, X, ImageIcon, Tag } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: '', salePrice: '', stock: '',
    categoryId: '', featured: false, published: false,
    imageUrl: '', // single image URL field
  });

  // ── Auto discount % ───────────────────────────────────────────
  const discount = useMemo(() => {
    const p = parseFloat(form.price);
    const s = parseFloat(form.salePrice);
    if (p > 0 && s > 0 && s < p) return Math.round((1 - s / p) * 100);
    return null;
  }, [form.price, form.salePrice]);

  const salePriceWarning = useMemo(() => {
    const p = parseFloat(form.price);
    const s = parseFloat(form.salePrice);
    return form.salePrice && p > 0 && s >= p;
  }, [form.price, form.salePrice]);

  const fetchProducts = () => {
    api.get('/products/admin', { params: { search } })
      .then(res => setProducts(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search]);
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data)).catch(console.error);
  }, []);

  const openNew = () => {
    setEditing(null);
    setImgError(false);
    setForm({ title: '', description: '', price: '', salePrice: '', stock: '', categoryId: '', featured: false, published: false, imageUrl: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setImgError(false);
    let firstImg = '';
    try {
      const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
      firstImg = imgs[0] || '';
    } catch {}
    setForm({
      title: p.title, description: p.description, price: p.price, salePrice: p.salePrice || '',
      stock: p.stock, categoryId: p.categoryId || '', featured: p.featured, published: p.published,
      imageUrl: firstImg,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (salePriceWarning) {
      alert('Sale price must be less than the original price.');
      return;
    }
    try {
      const images = form.imageUrl.trim() ? [form.imageUrl.trim()] : [];
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: parseInt(form.stock) || 0,
        categoryId: form.categoryId || null,
        featured: form.featured,
        published: form.published,
        images,
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      alert('Failed to delete');
    }
  };

  const togglePublish = async (p) => {
    await api.put(`/products/${p.id}`, { published: !p.published });
    fetchProducts();
  };

  // Helper: get first image from product
  const getFirstImage = (p) => {
    try {
      const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      return imgs?.[0] || null;
    } catch { return null; }
  };

  // Helper: discount % for a product
  const getDiscount = (p) => {
    if (p.salePrice && p.price > 0 && p.salePrice < p.price) {
      return Math.round((1 - p.salePrice / p.price) * 100);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#1a1a35] border border-white/5 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-gray-500 font-medium">Product</th>
                <th className="text-left p-4 text-gray-500 font-medium">Category</th>
                <th className="text-left p-4 text-gray-500 font-medium">Price</th>
                <th className="text-left p-4 text-gray-500 font-medium">Stock</th>
                <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                <th className="text-right p-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="p-4"><div className="h-6 bg-white/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No products found</td></tr>
              ) : products.map(p => {
                const img = getFirstImage(p);
                const disc = getDiscount(p);
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {img
                            ? <img src={img} alt={p.title} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                            : null}
                          <span className={`text-gray-600 text-sm ${img ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>📦</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{p.title}</p>
                          {p.featured && <span className="text-xs text-yellow-400 flex items-center gap-1"><Star size={10} /> Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{p.category?.name || '—'}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        {p.salePrice ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">₹{p.salePrice.toLocaleString()}</span>
                              <span className="text-gray-500 line-through text-xs">₹{p.price.toLocaleString()}</span>
                            </div>
                            {disc && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full w-fit">
                                <Tag size={10} /> {disc}% OFF
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-white font-medium">₹{p.price.toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4"><span className={`${p.stock > 0 ? 'text-gray-300' : 'text-red-400'}`}>{p.stock}</span></td>
                    <td className="p-4">
                      <button onClick={() => togglePublish(p)} className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${p.published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'}`}>
                        {p.published ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Draft</>}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a35] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Title */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>

              {/* Price + Sale Price with live discount badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                  <input required type="number" step="0.01" min="0" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Sale Price (₹)
                    {discount !== null && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Tag size={9} /> {discount}% OFF
                      </span>
                    )}
                  </label>
                  <input type="number" step="0.01" min="0" value={form.salePrice}
                    onChange={e => setForm({...form, salePrice: e.target.value})}
                    placeholder="Optional"
                    className={`w-full px-4 py-2.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 ${
                      salePriceWarning ? 'border-red-500/60' : 'border-white/10'
                    }`} />
                  {salePriceWarning && (
                    <p className="text-red-400 text-xs mt-1">⚠ Sale price must be less than original price</p>
                  )}
                </div>
              </div>

              {/* Effective price summary */}
              {(form.price || form.salePrice) && !salePriceWarning && (
                <div className="bg-white/[0.04] rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                  <span className="text-gray-400">Customer pays</span>
                  <span className="text-white font-semibold">
                    ₹{(parseFloat(form.salePrice || form.price) || 0).toLocaleString()}
                    {discount !== null && (
                      <span className="text-gray-500 line-through ml-2 font-normal text-xs">
                        ₹{parseFloat(form.price).toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Stock + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a35] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50">
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Image URL + Live Preview */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => { setForm({...form, imageUrl: e.target.value}); setImgError(false); }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-gray-600"
                />
                {/* Live preview */}
                <div className={`mt-3 rounded-xl overflow-hidden border border-white/10 transition-all ${form.imageUrl && !imgError ? 'h-40' : 'h-0 border-0'}`}>
                  {form.imageUrl && !imgError && (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
                {imgError && form.imageUrl && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <ImageIcon size={12} /> Could not load image — check the URL
                  </p>
                )}
              </div>

              {/* Featured + Published */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded accent-purple-500" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="rounded accent-purple-500" />
                  Published
                </label>
              </div>

              <button type="submit" disabled={salePriceWarning}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors">
                {editing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
