'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Pencil, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateJournal } from '@/lib/firestore';

const moodOptions = [
  { value: 'peaceful',   emoji: '🕊️', label: 'Peaceful' },
  { value: 'grateful',   emoji: '🙏', label: 'Grateful' },
  { value: 'joyful',     emoji: '😊', label: 'Joyful' },
  { value: 'reflective', emoji: '🪷', label: 'Reflective' },
  { value: 'anxious',    emoji: '😰', label: 'Anxious' },
  { value: 'hopeful',    emoji: '🌅', label: 'Hopeful' },
  { value: 'calm',       emoji: '🧘', label: 'Calm' },
  { value: 'inspired',   emoji: '✨', label: 'Inspired' },
  { value: 'sad',        emoji: '😢', label: 'Sad' },
  { value: 'energetic',  emoji: '⚡', label: 'Energetic' },
];

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

export default function JournalDetailClient() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const router       = useRouter();
  const [journal, setJournal]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({ title: '', content: '', mood: '' });

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'journals', id))
      .then(snap => {
        if (!snap.exists()) { router.push('/dashboard/journal'); return; }
        const data = { id: snap.id, ...snap.data() };
        setJournal(data);
        setForm({ title: data.title || '', content: data.content || '', mood: data.mood || '' });
      })
      .catch(() => router.push('/dashboard/journal'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async () => {
    if (!form.content.trim()) { setError('Content cannot be empty.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateJournal(id, { title: form.title || 'Untitled Entry', content: form.content, mood: form.mood || null });
      setJournal(prev => ({ ...prev, ...form }));
      setEditing(false);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-plum/30" />
      </div>
    );
  }

  if (!journal) return null;

  const moodEmoji = moodOptions.find(m => m.value === (editing ? form.mood : journal.mood))?.emoji;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/journal" className="p-2 text-earth/40 hover:text-plum rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-earth/30 text-xs mb-0.5">
            {toDate(journal.createdAt)?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-2xl font-heading font-bold text-plum truncate">
            {moodEmoji && <span className="mr-2">{moodEmoji}</span>}
            {editing ? form.title || 'Untitled Entry' : journal.title || 'Untitled Entry'}
          </h1>
        </div>
        <button
          onClick={() => editing ? setEditing(false) : setEditing(true)}
          className={`p-2 rounded-xl transition-colors ${editing ? 'text-red-400 hover:bg-red-50' : 'text-earth/40 hover:text-plum hover:bg-plum/5'}`}
          title={editing ? 'Cancel edit' : 'Edit entry'}
        >
          {editing ? <X size={20} /> : <Pencil size={20} />}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {editing ? (
          <>
            {/* Edit Title */}
            <div className="glass-card bg-white/80 p-6 shadow-soft">
              <label className="block text-sm font-medium text-earth/60 mb-2">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Untitled Entry"
                className="w-full text-xl font-heading text-plum placeholder:text-earth/20 bg-transparent border-none outline-none"
              />
            </div>

            {/* Edit Mood */}
            <div className="glass-card bg-white/80 p-6 shadow-soft">
              <label className="block text-sm font-medium text-earth/60 mb-3">Mood</label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map(m => (
                  <button key={m.value} type="button"
                    onClick={() => setForm(f => ({ ...f, mood: f.mood === m.value ? '' : m.value }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                      form.mood === m.value ? 'bg-plum text-ivory shadow-md' : 'bg-sand/20 text-earth/60 hover:bg-sand/40'
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit Content */}
            <div className="glass-card bg-white/80 p-6 shadow-soft">
              <label className="block text-sm font-medium text-earth/60 mb-2">Content</label>
              <textarea
                rows={14}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="w-full font-body text-earth/80 text-base leading-relaxed bg-transparent border-none outline-none resize-none"
              />
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving || !form.content.trim()} className="btn-gold gap-2 disabled:opacity-50">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </>
        ) : (
          /* Read-only view */
          <div className="glass-card bg-white/80 p-6 sm:p-8 shadow-soft">
            {journal.mood && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand/20 text-earth/60 text-sm font-body mb-6">
                {moodEmoji} <span className="capitalize">{journal.mood}</span>
              </span>
            )}
            <div className="prose prose-earth max-w-none font-body text-earth/70 leading-relaxed whitespace-pre-wrap">
              {journal.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
