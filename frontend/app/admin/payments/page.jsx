'use client';

import { useState, useEffect } from 'react';
import { getAllOrders } from '@/lib/firestore';
import { CreditCard } from 'lucide-react';

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getAllOrders()
      .then(orders => setPayments(orders.filter(o => o.paymentStatus === 'PAID')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard size={24} className="text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <span className="ml-auto text-sm text-gray-500">{payments.length} paid</span>
      </div>

      <div className="bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-gray-500 font-medium">Order ID</th>
                <th className="text-left p-4 text-gray-500 font-medium">Payment ID</th>
                <th className="text-left p-4 text-gray-500 font-medium">Customer</th>
                <th className="text-left p-4 text-gray-500 font-medium">Amount</th>
                <th className="text-left p-4 text-gray-500 font-medium">Method</th>
                <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                <th className="text-left p-4 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={7} className="p-4"><div className="h-6 bg-white/5 rounded animate-pulse" /></td>
                </tr>
              )) : payments.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No payments recorded yet</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-gray-300 font-mono text-xs">#{p.id.slice(0, 8)}</td>
                  <td className="p-4 text-gray-400 font-mono text-xs">{p.paymentId || '—'}</td>
                  <td className="p-4">
                    <p className="text-white">{p.shippingName || '—'}</p>
                    <p className="text-gray-500 text-xs">{p.shippingEmail || ''}</p>
                  </td>
                  <td className="p-4 text-white font-medium">₹{p.total?.toLocaleString()}</td>
                  <td className="p-4 text-gray-400 capitalize">{p.paymentMethod || '—'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{toDate(p.createdAt)?.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
