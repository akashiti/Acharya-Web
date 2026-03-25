'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { ShoppingBag, ArrowLeft, Package, ChevronRight } from 'lucide-react';

const statusColors = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const paymentColors = {
  PAID:   'bg-emerald-100 text-emerald-700',
  UNPAID: 'bg-red-100 text-red-600',
};

export default function UserOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/orders/my')
      .then(res => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 p-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-sand/20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag size={56} className="text-earth/10 mb-5" />
        <h2 className="text-2xl font-heading font-bold text-plum mb-2">No orders yet</h2>
        <p className="text-earth/40 text-sm mb-8">Once you place your first order it will appear here.</p>
        <Link href="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    );
  }

  /* ── Order Detail Panel ─────────────────────────── */
  if (selected) {
    const order = selected;
    const tax = order.tax || 0;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="p-2 text-earth/50 hover:text-plum rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-heading font-bold text-plum">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-xs text-earth/40">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-sand/20 text-earth'}`}>
            {order.status}
          </span>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-sand/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-sand/20 flex items-center gap-2">
            <Package size={16} className="text-plum/50" />
            <span className="font-semibold text-plum text-sm">Items ({order.orderItems?.length})</span>
          </div>
          <div className="divide-y divide-sand/10">
            {order.orderItems?.map(item => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-plum font-medium text-sm">{item.title}</p>
                  <p className="text-earth/40 text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="text-plum font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-sand/20 space-y-1 text-sm">
            <div className="flex justify-between text-earth/50"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-earth/50"><span>Tax (GST 18%)</span><span>₹{tax.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-plum text-base pt-2 border-t border-sand/10 mt-2">
              <span>Total</span><span>₹{order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-sand/30 p-5">
            <h3 className="font-semibold text-plum text-sm mb-3">Shipping Address</h3>
            <div className="text-sm text-earth/60 space-y-0.5">
              <p className="font-medium text-earth/80">{order.shippingName}</p>
              {order.shippingPhone && <p>{order.shippingPhone}</p>}
              <p>{order.shippingAddress}</p>
              <p>{[order.shippingCity, order.shippingState, order.shippingZip].filter(Boolean).join(', ')}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-sand/30 p-5">
            <h3 className="font-semibold text-plum text-sm mb-3">Payment</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentColors[order.paymentStatus] || 'bg-sand/10 text-earth'}`}>
              {order.paymentStatus}
            </span>
            {order.paymentId && <p className="text-xs text-earth/30 font-mono mt-2">Ref: {order.paymentId}</p>}
          </div>
        </div>
      </div>
    );
  }

  /* ── Orders List ────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag size={22} className="text-plum/50" />
        <h1 className="text-2xl font-heading font-bold text-plum">My Orders</h1>
        <span className="ml-auto text-xs text-earth/40">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <button
            key={order.id}
            onClick={() => setSelected(order)}
            className="w-full text-left bg-white rounded-2xl border border-sand/30 p-5 hover:shadow-soft hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-plum font-semibold text-sm font-mono">#{order.id.slice(0, 8)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[order.status] || 'bg-sand/10 text-earth'}`}>
                    {order.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${paymentColors[order.paymentStatus] || 'bg-sand/10 text-earth'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <p className="text-earth/40 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-earth/50 text-xs mt-1">{order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-plum font-bold text-lg">₹{order.total?.toLocaleString()}</span>
                <ChevronRight size={18} className="text-earth/20 group-hover:text-plum/30 transition-colors" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
