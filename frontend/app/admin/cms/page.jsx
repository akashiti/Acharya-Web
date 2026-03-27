'use client';

import { useState, useEffect } from 'react';
import {
  getBanners, createBanner, updateBanner, deleteBanner,
  getSiteContent, setSiteContent,
} from '@/lib/firestore';
import { FileEdit, Plus, Edit2, Trash2, X, Image, Type, Save } from 'lucide-react';

export default function AdminCMS() {
  const [banners, setBanners]             = useState([]);
  const [contents, setContents]           = useState({});
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState('banners');
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image: '', link: '', position: 0, active: true });
  const [editingSection, setEditingSection] = useState(null);
  const [sectionContent, setSectionContent] = useState('');
  const [saving, setSaving]               = useState(false);

  const sectionKeys = ['hero','about','programs','wellness','testimonials','gallery','contact'];

  const fetchData = async () => {
    try {
      const [bans, ...secs] = await Promise.all([
        getBanners({ activeOnly: false }),
        ...sectionKeys.map(k => getSiteContent(k)),
      ]);
      setBanners(bans);
      const map = {};
      sectionKeys.forEach((k, i) => { if (secs[i]) map[k] = secs[i].content ? JSON.parse(secs[i].content) : secs[i]; });
      setContents(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Banner handlers
  const openNewBanner = () => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', image: '', link: '', position: 0, active: true }); setShowBannerModal(true); };
  const openEditBanner = (b) => { setEditingBanner(b); setBannerForm({ title: b.title, subtitle: b.subtitle || '', image: b.image || '', link: b.link || '', position: b.position || 0, active: b.active }); setShowBannerModal(true); };

  const submitBanner = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBanner) await updateBanner(editingBanner.id, bannerForm);
      else               await createBanner(bannerForm);
      setShowBannerModal(false);
      fetchData();
    } catch (err) { alert(err.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await deleteBanner(id);
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  // Content handlers
  const openSection = (key) => {
    setEditingSection(key);
    setSectionContent(JSON.stringify(contents[key] || {}, null, 2));
  };

  const saveSection = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(sectionContent);
      await setSiteContent(editingSection, JSON.stringify(parsed));
      setContents(prev => ({ ...prev, [editingSection]: parsed }));
      setEditingSection(null);
    } catch (err) {
      if (err instanceof SyntaxError) alert('Invalid JSON format');
      else alert('Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileEdit size={24} className="text-purple-400" />
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ key: 'banners', icon: Image, label: 'Banners' }, { key: 'content', icon: Type, label: 'Site Content' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? 'bg-purple-600 text-white' : 'bg-[#1a1a35] text-gray-400 hover:text-white border border-white/5'}`}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'banners' && (
        <>
          <div className="flex justify-end">
            <button onClick={openNewBanner} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus size={16} /> Add Banner
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[#1a1a35] rounded-2xl animate-pulse" />)
            : banners.length === 0 ? <p className="text-gray-500 col-span-full text-center py-12">No banners yet</p>
            : banners.map(b => (
              <div key={b.id} className="bg-[#1a1a35] rounded-2xl border border-white/5 p-5 group">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{b.title}</h3>
                    {b.subtitle && <p className="text-gray-400 text-sm mt-1">{b.subtitle}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${b.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'}`}>{b.active ? 'Active' : 'Inactive'}</span>
                      <span className="text-xs text-gray-600">Pos: {b.position}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditBanner(b)} className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg"><Edit2 size={14}/></button>
                    <button onClick={() => handleDeleteBanner(b.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'content' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionKeys.map(key => (
            <button key={key} onClick={() => openSection(key)}
              className="bg-[#1a1a35] rounded-2xl border border-white/5 p-5 text-left hover:border-purple-500/30 transition-all group">
              <h3 className="text-white font-semibold capitalize mb-1">{key}</h3>
              <p className="text-gray-500 text-sm">{contents[key] ? `${Object.keys(contents[key]).length} fields configured` : 'Not configured'}</p>
              <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2 block">Click to edit →</span>
            </button>
          ))}
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a35] rounded-2xl border border-white/10 w-full max-w-md">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
              <button onClick={() => setShowBannerModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={submitBanner} className="p-6 space-y-4">
              {[{label:'Title',key:'title',required:true},{label:'Subtitle',key:'subtitle'},{label:'Image URL',key:'image'},{label:'Link',key:'link'}].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
                  <input required={f.required} value={bannerForm[f.key]} onChange={e => setBannerForm({...bannerForm, [f.key]: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50"/>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Position</label>
                  <input type="number" value={bannerForm.position} onChange={e => setBannerForm({...bannerForm, position: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50"/>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={bannerForm.active} onChange={e => setBannerForm({...bannerForm, active: e.target.checked})} className="accent-purple-500"/> Active
                  </label>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-colors">
                {saving ? 'Saving...' : editingBanner ? 'Update' : 'Create'} Banner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Section Editor Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a35] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white capitalize">{editingSection} Section Content</h2>
              <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-gray-500 text-sm mb-3">Edit the JSON content for this section. This data will be used by the homepage components.</p>
              <textarea rows={15} value={sectionContent} onChange={e => setSectionContent(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-white/10 rounded-xl text-green-300 text-sm font-mono focus:outline-none focus:border-purple-500/50 resize-none" spellCheck={false}/>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button onClick={() => setEditingSection(null)} className="px-4 py-2.5 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={saveSection} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50">
                <Save size={16}/>{saving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
