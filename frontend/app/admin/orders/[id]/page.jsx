'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';

const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const res = await api.put(`/orders/admin/${id}/status`, { status });
      setOrder(res.data.data);
    } catch (err) {
      alert('Failed to update status');
    }
    setUpdating(false);
  };

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-[#1a1a35] rounded-2xl animate-pulse" />)}</div>;
  }

  if (!order) return <p className="text-red-400">Order not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Package size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold">Items ({order.orderItems?.length})</h2>
          </div>
          <div className="divide-y divide-white/5">
            {order.orderItems?.map(item => (
              <div key={item.id} className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 text-xl">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.title}</p>
                  <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                </div>
                <p className="text-white font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-gray-400"><span>Tax (GST 18%)</span><span>₹{order.tax?.toLocaleString()}</span></div>
            <div className="flex justify-between text-lg text-white font-bold pt-2 border-t border-white/5"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-[#1a1a35] rounded-2xl border border-white/5 p-5">
            <h3 className="text-white font-semibold mb-3">Update Status</h3>
            <select
              value={order.status}
              onChange={e => updateStatus(e.target.value)}
              disabled={updating}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="mt-3 flex items-center gap-2">
              <CreditCard size={14} className="text-gray-500" />
              <span className={`text-sm font-medium ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-red-400'}`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentId && <p className="text-xs text-gray-600 mt-1 font-mono">ID: {order.paymentId}</p>}
          </div>

          {/* Customer */}
          <div className="bg-[#1a1a35] rounded-2xl border border-white/5 p-5">
            <h3 className="text-white font-semibold mb-3">Customer</h3>
            <p className="text-gray-300">{order.user?.name}</p>
            <p className="text-gray-500 text-sm">{order.user?.email}</p>
          </div>

          {/* Shipping */}
          <div className="bg-[#1a1a35] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-purple-400" />
              <h3 className="text-white font-semibold">Shipping</h3>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>{order.shippingName}</p>
              {order.shippingPhone && <p>{order.shippingPhone}</p>}
              <p>{order.shippingAddress}</p>
              <p>{[order.shippingCity, order.shippingState, order.shippingZip].filter(Boolean).join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
