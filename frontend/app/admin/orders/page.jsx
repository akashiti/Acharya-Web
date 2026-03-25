'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Filter, Eye } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-300',
  CONFIRMED: 'bg-blue-500/20 text-blue-300',
  SHIPPED: 'bg-indigo-500/20 text-indigo-300',
  DELIVERED: 'bg-emerald-500/20 text-emerald-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
};

const paymentColors = {
  UNPAID: 'bg-red-500/20 text-red-300',
  PAID: 'bg-emerald-500/20 text-emerald-300',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/orders/admin/all', { params: { status: statusFilter || undefined } })
      .then(res => setOrders(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#1a1a35] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50">
            <option value="">All Statuses</option>
            {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-gray-500 font-medium">Order ID</th>
                <th className="text-left p-4 text-gray-500 font-medium">Customer</th>
                <th className="text-left p-4 text-gray-500 font-medium">Total</th>
                <th className="text-left p-4 text-gray-500 font-medium">Payment</th>
                <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                <th className="text-left p-4 text-gray-500 font-medium">Date</th>
                <th className="text-right p-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={7} className="p-4"><div className="h-6 bg-white/5 rounded animate-pulse" /></td>
                </tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-gray-300 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="p-4">
                    <p className="text-white">{order.user?.name || '—'}</p>
                    <p className="text-gray-500 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="p-4 text-white font-medium">₹{order.total?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentColors[order.paymentStatus] || 'bg-gray-500/20 text-gray-300'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-purple-400 hover:bg-purple-500/10 rounded-lg text-xs font-medium transition-colors">
                      <Eye size={14} /> View
                    </Link>
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
