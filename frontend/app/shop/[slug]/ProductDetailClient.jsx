'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getCategoryById } from '@/lib/firestore';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, ShoppingBag, Minus, Plus, Star, Package, Truck } from 'lucide-react';

export default function ProductDetailClient() {
  const { slug }   = useParams();
  const router     = useRouter();
  const [product, setProduct]           = useState(null);
  const [category, setCategory]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity]         = useState(1);
  const [adding, setAdding]             = useState(false);
  const { addToCart }                   = useCart();

  useEffect(() => {
    getProductBySlug(slug)
      .then(async (prod) => {
        if (!prod) { router.push('/shop'); return; }
        setProduct(prod);
        if (prod.categoryId) {
          getCategoryById(prod.categoryId)
            .then(setCategory)
            .catch(() => {});
        }
      })
      .catch(() => router.push('/shop'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleAdd = async () => {
    setAdding(true);
    try { await addToCart(product.id, quantity); } catch {}
    setTimeout(() => setAdding(false), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-[400px] bg-sand/20 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-sand/20 rounded w-3/4" />
            <div className="h-6 bg-sand/20 rounded w-1/2" />
            <div className="h-24 bg-sand/20 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = Array.isArray(product.images)
    ? product.images
    : (() => { try { return JSON.parse(product.images); } catch { return []; } })();

  return (
    <div className="min-h-screen bg-ivory py-8 lg:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-earth/50 hover:text-plum text-sm transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-earth/20">/</span>
          <Link href="/shop" className="text-earth/50 hover:text-plum text-sm transition-colors">Shop</Link>
          <span className="text-earth/20">/</span>
          <span className="text-plum text-sm font-medium">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="relative h-[400px] bg-white rounded-3xl overflow-hidden border border-sand/30 mb-4">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl text-earth/10">🪷</div>
              )}
              {product.salePrice && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full">
                  {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-gold' : 'border-sand/30'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {category && <p className="text-gold font-semibold text-sm tracking-wider uppercase">{category.name}</p>}
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-plum">{product.title}</h1>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-plum">₹{(product.salePrice || product.price).toLocaleString()}</span>
              {product.salePrice && <span className="text-xl text-earth/30 line-through">₹{product.price.toLocaleString()}</span>}
            </div>

            {/* Description */}
            <p className="text-earth/60 leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="flex gap-6 py-4 border-y border-sand/30">
              <div className="flex items-center gap-2 text-sm text-earth/50">
                <Package size={16} className="text-gold" />
                <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-earth/50">
                <Truck size={16} className="text-gold" />
                <span>Free shipping</span>
              </div>
              {product.featured && (
                <div className="flex items-center gap-1 text-sm text-gold font-medium">
                  <Star size={14} fill="currentColor" /> Featured
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-sand/50 rounded-2xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-plum hover:bg-sand/20 transition-colors"><Minus size={16} /></button>
                <span className="px-5 text-plum font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 text-plum hover:bg-sand/20 transition-colors"><Plus size={16} /></button>
              </div>
              <button onClick={handleAdd} disabled={adding || product.stock === 0}
                className={`flex-1 py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  product.stock === 0
                    ? 'bg-sand/30 text-earth/30 cursor-not-allowed'
                    : adding
                      ? 'bg-emerald-500 text-white'
                      : 'bg-plum text-ivory hover:bg-purple hover:shadow-xl'
                }`}>
                <ShoppingBag size={18} />
                {product.stock === 0 ? 'Out of Stock' : adding ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
