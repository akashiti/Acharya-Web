'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, getAllProducts, getAllUsers } from '@/lib/firestore';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function buildMonthlyRevenue(orders) {
  const map = {};
  orders.forEach(o => {
    if (o.paymentStatus !== 'PAID') return;
    const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    map[key] = (map[key] || 0) + (o.total || 0);
  });
  return Object.entries(map).slice(-6).map(([month, revenue]) => ({ month, revenue }));
}

const statusColors = {
  PENDING:   'bg-yellow-500/20 text-yellow-300',
  CONFIRMED: 'bg-blue-500/20 text-blue-300',
  SHIPPED:   'bg-indigo-500/20 text-indigo-300',
  DELIVERED: 'bg-emerald-500/20 text-emerald-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
};

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllOrders(), getAllProducts(), getAllUsers()])
      .then(([orders, products, users]) => {
        const paidOrders   = orders.filter(o => o.paymentStatus === 'PAID');
        const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
        const orderStats   = {
          pending:   orders.filter(o => o.status === 'PENDING').length,
          confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
          delivered: orders.filter(o => o.status === 'DELIVERED').length,
        };
        setData({
          totalRevenue,
          totalOrders:   orders.length,
          totalUsers:    users.length,
          totalProducts: products.length,
          orderStats,
          monthlyRevenue: buildMonthlyRevenue(orders),
          recentOrders: orders.slice(0, 10),
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
        <div className="h-80 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!data) return <p className="text-red-400">Failed to load dashboard data</p>;

  const stats = [
    { label: 'Total Revenue',  value: `₹${data.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-green-600',  change: null },
    { label: 'Total Orders',   value: data.totalOrders,   icon: ShoppingCart, color: 'from-blue-500 to-indigo-600',    change: null },
    { label: 'Total Users',    value: data.totalUsers,    icon: Users,        color: 'from-purple-500 to-pink-500',    change: null },
    { label: 'Total Products', value: data.totalProducts, icon: Package,      color: 'from-orange-500 to-amber-500',   change: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#1a1a35] rounded-2xl p-5 border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
              {stat.change && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <ArrowUpRight size={14} />{stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending',   count: data.orderStats?.pending   || 0, color: 'text-yellow-400' },
          { label: 'Confirmed', count: data.orderStats?.confirmed || 0, color: 'text-blue-400'   },
          { label: 'Delivered', count: data.orderStats?.delivered || 0, color: 'text-emerald-400'},
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a35] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-gray-400 text-sm">{s.label} Orders</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {data.monthlyRevenue?.length > 0 && (
        <div className="bg-[#1a1a35] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="revenue" fill="url(#purpleGradient)" radius={[6,6,0,0]} />
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Order','Customer','Items','Total','Status','Date'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders?.length ? data.recentOrders.map(order => {
                const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                return (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-gray-300 font-mono text-xs">#{order.id.slice(0,8)}</td>
                    <td className="p-4 text-white">{order.shippingName || '—'}</td>
                    <td className="p-4 text-gray-400">{order.items?.length || 0}</td>
                    <td className="p-4 text-white font-medium">₹{order.total?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-300'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{d.toLocaleDateString()}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
