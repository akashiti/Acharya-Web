'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { page, limit: 12, category: category || undefined, search: search || undefined, sort } })
      .then(res => {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, category, search, sort]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data)).catch(console.error);
  }, []);

  const handleAddToCart = async (productId) => {
    setAdding(productId);
    try {
      await addToCart(productId, 1);
    } catch {}
    setTimeout(() => setAdding(null), 800);
  };

  return (
    <div className="min-h-screen" style={{background:'var(--gradient-hero)'}}>
      {/* Hero Banner */}
      <div className="text-ivory pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-body">Acharya Aashish Ways</p>
          <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-4">Sacred Shop</h1>
          <div className="gold-divider mb-6" />
          <p className="text-ivory/60 text-lg max-w-2xl mx-auto">Discover curated products for your spiritual journey and holistic wellness</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/40" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-2xl text-ivory text-sm placeholder:text-ivory/30 focus:outline-none focus:border-gold/50 transition-all" />
          </div>
          {/* Category */}
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-3 bg-white/10 border border-white/15 rounded-2xl text-ivory text-sm focus:outline-none focus:border-gold/50">
            <option value="" className="text-plum">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id} className="text-plum">{c.name}</option>)}
          </select>
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/15 rounded-2xl text-ivory text-sm focus:outline-none focus:border-gold/50">
            <option value="newest" className="text-plum">Newest</option>
            <option value="price_asc" className="text-plum">Price: Low → High</option>
            <option value="price_desc" className="text-plum">Price: High → Low</option>
            <option value="title" className="text-plum">A → Z</option>
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-sand/30 animate-pulse">
                <div className="h-56 bg-sand/20" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-sand/20 rounded w-3/4" />
                  <div className="h-4 bg-sand/20 rounded w-1/2" />
                  <div className="h-10 bg-sand/20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-ivory/20 mb-4" />
            <p className="text-ivory/50 text-lg">No products found</p>
            <p className="text-ivory/30 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const images = (() => { try { return typeof product.images === 'string' ? JSON.parse(product.images) : product.images; } catch { return []; } })();
              return (
                <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-sand/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <Link href={`/shop/${product.slug}`}>
                    <div className="relative h-56 bg-sand/10 overflow-hidden">
                      {images[0] ? (
                        <img src={images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl text-earth/10">🪷</div>
                      )}
                      {product.salePrice && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-3 right-3 p-1.5 bg-gold/90 rounded-full">
                          <Star size={12} className="text-plum" fill="currentColor" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <p className="text-xs text-gold font-medium mb-1">{product.category?.name}</p>
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="text-plum font-semibold text-lg mb-2 line-clamp-1 hover:text-purple transition-colors">{product.title}</h3>
                    </Link>
                    <p className="text-earth/50 text-sm line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-plum font-bold text-xl">₹{(product.salePrice || product.price).toLocaleString()}</span>
                        {product.salePrice && <span className="text-earth/30 line-through text-sm ml-2">₹{product.price.toLocaleString()}</span>}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={adding === product.id || product.stock === 0}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          product.stock === 0
                            ? 'bg-sand/20 text-earth/30 cursor-not-allowed'
                            : adding === product.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-plum text-ivory hover:bg-purple hover:shadow-lg'
                        }`}
                      >
                        {product.stock === 0 ? 'Out of Stock' : adding === product.id ? '✓ Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-xl border border-sand/30 text-plum hover:bg-sand/20 disabled:opacity-30 transition-colors">
              <ChevronLeft size={18} />
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                  page === i + 1 ? 'bg-plum text-ivory' : 'border border-sand/30 text-plum hover:bg-sand/20'
                }`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="p-2 rounded-xl border border-sand/30 text-plum hover:bg-sand/20 disabled:opacity-30 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
