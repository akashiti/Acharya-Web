'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllOrders, updateOrder } from '@/lib/firestore';
import { Filter, Eye } from 'lucide-react';

const statusColors  = { PENDING: 'bg-yellow-500/20 text-yellow-300', CONFIRMED: 'bg-blue-500/20 text-blue-300', SHIPPED: 'bg-indigo-500/20 text-indigo-300', DELIVERED: 'bg-emerald-500/20 text-emerald-300', CANCELLED: 'bg-red-500/20 text-red-300' };
const paymentColors = { UNPAID: 'bg-red-500/20 text-red-300', PAID: 'bg-emerald-500/20 text-emerald-300' };

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

export default function AdminOrders() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected]         = useState(null);
  const [updating, setUpdating]         = useState(false);

  const fetchOrders = () => {
    getAllOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(fetchOrders, []);

  const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await updateOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status: newStatus }));
    } catch { alert('Failed to update status'); }
    finally { setUpdating(false); }
  };

  // Order detail view
  if (selected) {
    const order = selected;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="px-3 py-1.5 text-gray-400 hover:text-white bg-white/5 rounded-xl text-sm transition-colors">← Back</button>
          <h1 className="text-xl font-bold text-white">Order #{order.id.slice(0, 8)}</h1>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300'}`}>{order.status}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a35] rounded-2xl p-5 border border-white/5">
            <h3 className="text-white font-semibold mb-3">Customer</h3>
            <p className="text-gray-300">{order.shippingName}</p>
            <p className="text-gray-500 text-sm">{order.shippingEmail}</p>
            {order.shippingPhone && <p className="text-gray-500 text-sm">{order.shippingPhone}</p>}
          </div>
          <div className="bg-[#1a1a35] rounded-2xl p-5 border border-white/5">
            <h3 className="text-white font-semibold mb-3">Shipping</h3>
            <p className="text-gray-300 text-sm">{order.shippingAddress}</p>
            <p className="text-gray-500 text-sm">{[order.shippingCity, order.shippingState, order.shippingZip].filter(Boolean).join(', ')}</p>
          </div>
        </div>

        <div className="bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5"><h3 className="text-white font-semibold">Items</h3></div>
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between p-4 border-b border-white/5 text-sm">
              <div><p className="text-white">{item.title}</p><p className="text-gray-500">Qty: {item.quantity}</p></div>
              <p className="text-white font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div className="p-5 space-y-1 text-sm">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-400"><span>Tax (18%)</span><span>₹{order.tax?.toLocaleString()}</span></div>
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10 mt-2"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
          </div>
        </div>

        <div className="bg-[#1a1a35] rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-3">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'].map(s => (
              <button key={s} disabled={order.status === s || updating}
                onClick={() => handleStatusUpdate(order.id, s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${order.status === s ? statusColors[s] : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#1a1a35] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50">
            <option value="">All Statuses</option>
            {['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Order ID','Customer','Total','Payment','Status','Date','Action'].map((h, i) => (
                  <th key={h} className={`p-4 text-gray-500 font-medium ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5"><td colSpan={7} className="p-4"><div className="h-6 bg-white/5 rounded animate-pulse"/></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-gray-300 font-mono text-xs">#{order.id.slice(0,8)}</td>
                  <td className="p-4">
                    <p className="text-white">{order.shippingName || '—'}</p>
                    <p className="text-gray-500 text-xs">{order.shippingEmail}</p>
                  </td>
                  <td className="p-4 text-white font-medium">₹{order.total?.toLocaleString()}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentColors[order.paymentStatus] || 'bg-gray-500/20 text-gray-300'}`}>{order.paymentStatus}</span></td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300'}`}>{order.status}</span></td>
                  <td className="p-4 text-gray-500">{toDate(order.createdAt)?.toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelected(order)} className="inline-flex items-center gap-1 px-3 py-1.5 text-purple-400 hover:bg-purple-500/10 rounded-lg text-xs font-medium transition-colors">
                      <Eye size={14}/> View
                    </button>
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
