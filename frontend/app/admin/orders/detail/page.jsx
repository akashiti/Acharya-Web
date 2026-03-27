'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrderById, updateOrder } from '@/lib/firestore';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';

const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusColors  = { PENDING: 'bg-yellow-500/20 text-yellow-300', CONFIRMED: 'bg-blue-500/20 text-blue-300', SHIPPED: 'bg-indigo-500/20 text-indigo-300', DELIVERED: 'bg-emerald-500/20 text-emerald-300', CANCELLED: 'bg-red-500/20 text-red-300' };

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const id     = searchParams.get('id');
  const router = useRouter();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrderById(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (order.status === newStatus) return;
    setUpdating(true);
    try {
      await updateOrder(id, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch {
      alert('Failed to update status');
    }
    setUpdating(false);
  };

  if (!id) return <p className="text-red-400">No order ID provided</p>;

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-[#1a1a35] rounded-2xl animate-pulse" />)}</div>;
  }

  if (!order) return <p className="text-red-400">Order not found</p>;

  const orderDate = toDate(order.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-gray-500 text-sm">{orderDate?.toLocaleString()}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300'}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Package size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold">Items ({order.items?.length || 0})</h2>
          </div>
          <div className="divide-y divide-white/5">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-5 flex items-center gap-4">
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
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <button key={s} disabled={order.status === s || updating}
                  onClick={() => handleStatusUpdate(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${order.status === s ? statusColors[s] : 'bg-white/5 text-gray-400 hover:bg-white/10'} disabled:opacity-40`}>
                  {s}
                </button>
              ))}
            </div>
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
            <p className="text-gray-300">{order.shippingName || '—'}</p>
            <p className="text-gray-500 text-sm">{order.shippingEmail || ''}</p>
            {order.shippingPhone && <p className="text-gray-500 text-sm">{order.shippingPhone}</p>}
          </div>

          {/* Shipping */}
          <div className="bg-[#1a1a35] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-purple-400" />
              <h3 className="text-white font-semibold">Shipping</h3>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>{order.shippingAddress}</p>
              <p>{[order.shippingCity, order.shippingState, order.shippingZip].filter(Boolean).join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
