'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createJournal } from '@/lib/firestore';

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

export default function NewJournalPage() {
  const { user }     = useAuth();
  const router       = useRouter();
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setError('Please write something before saving.'); return; }
    if (!user?.uid)       { router.push('/login'); return; }
    setSaving(true);
    setError('');
    try {
      await createJournal(user.uid, { title: title.trim() || 'Untitled Entry', content: content.trim(), mood: mood || null });
      router.push('/dashboard/journal');
    } catch {
      setError('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/journal" className="p-2 text-earth/40 hover:text-plum rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-plum">New Journal Entry</h1>
          <p className="text-earth/40 text-sm mt-0.5">Record your thoughts and reflections</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="glass-card bg-white/80 p-6 shadow-soft">
          <label className="block text-sm font-medium text-earth/60 mb-2">Title <span className="text-earth/30">(optional)</span></label>
          <input
            type="text"
            placeholder="Give your entry a title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
            className="w-full text-xl font-heading text-plum placeholder:text-earth/20 bg-transparent border-none outline-none"
          />
        </div>

        {/* Mood */}
        <div className="glass-card bg-white/80 p-6 shadow-soft">
          <label className="block text-sm font-medium text-earth/60 mb-3">How are you feeling?</label>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? '' : m.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body transition-all ${
                  mood === m.value
                    ? 'bg-plum text-ivory shadow-md'
                    : 'bg-sand/20 text-earth/60 hover:bg-sand/40'
                }`}
              >
                <span>{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="glass-card bg-white/80 p-6 shadow-soft">
          <label className="block text-sm font-medium text-earth/60 mb-2">Your thoughts <span className="text-red-400">*</span></label>
          <textarea
            rows={14}
            placeholder="What's on your mind today? Let your thoughts flow freely..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="w-full font-body text-earth/80 text-base leading-relaxed placeholder:text-earth/20 bg-transparent border-none outline-none resize-none"
          />
          <p className="text-xs text-earth/20 mt-2 text-right">{content.length} characters</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard/journal" className="btn-outline text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="btn-gold gap-2 !px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Entry</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
