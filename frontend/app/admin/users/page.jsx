'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Users, Search, Shield, ShieldOff } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    api.get('/admin/users', { params: { search: search || undefined } })
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users size={24} className="text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Users</h1>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#1a1a35] border border-white/5 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50" />
      </div>

      <div className="bg-[#1a1a35] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-gray-500 font-medium">User</th>
                <th className="text-left p-4 text-gray-500 font-medium">Email</th>
                <th className="text-left p-4 text-gray-500 font-medium">Role</th>
                <th className="text-left p-4 text-gray-500 font-medium">Joined</th>
                <th className="text-right p-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={5} className="p-4"><div className="h-6 bg-white/5 rounded animate-pulse" /></td>
                </tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{u.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-white font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => toggleRole(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        u.role === 'ADMIN'
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-purple-400 hover:bg-purple-500/10'
                      }`}
                    >
                      {u.role === 'ADMIN' ? <><ShieldOff size={14} /> Demote</> : <><Shield size={14} /> Promote</>}
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
