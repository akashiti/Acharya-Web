'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, loading, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4" style={{background:'var(--gradient-hero)'}}>
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/10 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background:'var(--gradient-hero)'}}>
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-ivory/20 mb-6" />
          <h2 className="text-2xl font-heading font-bold text-ivory mb-2">Your cart is empty</h2>
          <p className="text-ivory/50 mb-8">Browse our sacred collection and add items to your cart</p>
          <Link href="/shop" className="btn-gold">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const tax = Math.round(cartTotal * 0.18 * 100) / 100;
  const total = Math.round((cartTotal + tax) * 100) / 100;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{background:'var(--gradient-hero)'}}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 text-ivory/50 hover:text-gold rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-heading font-bold text-ivory">Shopping Cart</h1>
          <span className="text-ivory/40 text-sm">({items.length} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const product = item.product;
              if (!product) return null;
              const price = product.salePrice || product.price;
              return (
                <div key={item.id} className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-5 flex gap-4 group">
                  <div className="w-20 h-20 rounded-xl bg-sand/10 flex-shrink-0 overflow-hidden">
                    {(() => { try { const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images; return imgs?.[0] ? <img src={imgs[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl text-earth/10">🪷</div>; } catch { return <div className="w-full h-full flex items-center justify-center text-2xl text-earth/10">🪷</div>; } })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${product.slug}`} className="text-ivory font-semibold hover:text-gold transition-colors line-clamp-1">{product.title}</Link>
                    <p className="text-ivory/40 text-sm mt-0.5">{product.category?.name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/20 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 text-ivory hover:bg-white/10"><Minus size={14} /></button>
                        <span className="px-3 text-sm text-ivory font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 text-ivory hover:bg-white/10"><Plus size={14} /></button>
                      </div>
                      <span className="text-gold font-bold">₹{(price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="p-2 text-earth/20 hover:text-red-500 self-start opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-6 sticky top-24">
              <h3 className="text-lg font-heading font-bold text-ivory mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm border-b border-white/10 pb-4 mb-4">
                <div className="flex justify-between text-ivory/50"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-ivory/50"><span>Tax (GST 18%)</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between text-ivory/50"><span>Shipping</span><span className="text-emerald-400">Free</span></div>
              </div>
              <div className="flex justify-between text-ivory font-bold text-lg mb-6">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
              {user ? (
                <Link href="/checkout" className="w-full btn-primary flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
              ) : (
                <Link href="/login" className="w-full btn-primary flex items-center justify-center gap-2">
                  Login to Checkout <ArrowRight size={16} />
                </Link>
              )}
              <Link href="/shop" className="block text-center text-earth/50 text-sm mt-3 hover:text-plum transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
