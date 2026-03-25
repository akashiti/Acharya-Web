'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', sortOrder: 0 });

  const fetch = () => {
    api.get('/categories')
      .then(res => setCategories(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', image: '', sortOrder: 0 }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', image: c.image || '', sortOrder: c.sortOrder }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-[#1a1a35] rounded-2xl border border-white/5 animate-pulse" />
        )) : categories.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-12">No categories yet. Create one to get started.</p>
        ) : categories.map(c => (
          <div key={c.id} className="bg-[#1a1a35] rounded-2xl border border-white/5 p-5 group hover:border-purple-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{c.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{c._count?.products || 0} products</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            {c.description && <p className="text-gray-400 text-sm line-clamp-2">{c.description}</p>}
            <div className="mt-3 text-xs text-gray-600">Sort: {c.sortOrder}</div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a35] rounded-2xl border border-white/10 w-full max-w-md">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50" />
              </div>
              <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors">
                {editing ? 'Update' : 'Create'} Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
