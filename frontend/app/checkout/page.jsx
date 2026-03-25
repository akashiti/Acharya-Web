'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Lock, CreditCard, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState('shipping'); // shipping | payment | success
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [form, setForm] = useState({
    shippingName: user?.name || '',
    shippingEmail: user?.email || '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    notes: '',
  });

  const tax = Math.round(cartTotal * 0.18 * 100) / 100;
  const total = Math.round((cartTotal + tax) * 100) / 100;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create order
      const orderRes = await api.post('/orders', form);
      const order = orderRes.data.data;
      setOrderId(order.id);

      // Create payment (dev mode)
      const payRes = await api.post('/payments/create', { orderId: order.id });

      // Verify payment (dev mode auto-verifies)
      await api.post('/payments/verify', {
        orderId: order.id,
        razorpay_order_id: payRes.data.data?.id,
        razorpay_payment_id: 'dev_pay_' + Date.now(),
        razorpay_signature: 'dev_sig',
      });

      await clearCart();
      setStep('success');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (items.length === 0 && step !== 'success') {
    router.push('/cart');
    return null;
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-plum mb-3">Order Placed!</h2>
          <p className="text-earth/50 mb-2">Thank you for your purchase. Your order has been confirmed.</p>
          {orderId && <p className="text-sm text-earth/30 font-mono mb-8">Order ID: #{orderId.slice(0, 8)}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.push('/dashboard')} className="btn-primary">View My Orders</button>
            <button onClick={() => router.push('/shop')} className="btn-outline">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-8 lg:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-plum mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCreateOrder} className="bg-white rounded-2xl border border-sand/30 p-6 space-y-5">
              <div className="flex items-center gap-2 text-lg font-heading font-semibold text-plum mb-2">
                <Lock size={18} className="text-gold" />
                Shipping Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-earth/60 mb-1">Full Name</label>
                  <input required value={form.shippingName} onChange={e => setForm({...form, shippingName: e.target.value})}
                    className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20" />
                </div>
                <div>
                  <label className="block text-sm text-earth/60 mb-1">Email</label>
                  <input required type="email" value={form.shippingEmail} onChange={e => setForm({...form, shippingEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-earth/60 mb-1">Phone</label>
                <input required value={form.shippingPhone} onChange={e => setForm({...form, shippingPhone: e.target.value})}
                  className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20" placeholder="+91" />
              </div>

              <div>
                <label className="block text-sm text-earth/60 mb-1">Address</label>
                <textarea required rows={2} value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})}
                  className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-earth/60 mb-1">City</label>
                  <input required value={form.shippingCity} onChange={e => setForm({...form, shippingCity: e.target.value})}
                    className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20" />
                </div>
                <div>
                  <label className="block text-sm text-earth/60 mb-1">State</label>
                  <input required value={form.shippingState} onChange={e => setForm({...form, shippingState: e.target.value})}
                    className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20" />
                </div>
                <div>
                  <label className="block text-sm text-earth/60 mb-1">PIN Code</label>
                  <input required value={form.shippingZip} onChange={e => setForm({...form, shippingZip: e.target.value})}
                    className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-earth/60 mb-1">Notes (Optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-sand/50 rounded-2xl text-plum text-sm focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 resize-none" placeholder="Any special instructions..." />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-plum text-ivory rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-purple transition-all disabled:opacity-50">
                <CreditCard size={18} />
                {loading ? 'Processing...' : `Place Order — ₹${total.toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-sand/30 p-6 sticky top-24">
              <h3 className="text-lg font-heading font-bold text-plum mb-4">Order Summary</h3>
              <div className="space-y-3 border-b border-sand/20 pb-4 mb-4">
                {items.map(item => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-earth/60 truncate max-w-[180px]">{product.title} × {item.quantity}</span>
                      <span className="text-plum font-medium">₹{((product.salePrice || product.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 text-sm border-b border-sand/20 pb-4 mb-4">
                <div className="flex justify-between text-earth/50"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-earth/50"><span>Tax (18% GST)</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between text-earth/50"><span>Shipping</span><span className="text-emerald-600">Free</span></div>
              </div>
              <div className="flex justify-between text-plum font-bold text-lg">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
