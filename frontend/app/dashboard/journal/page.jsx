'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, PenLine, Trash2, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserJournals, deleteJournal } from '@/lib/firestore';

const moodEmojis = {
  peaceful: '🕊️', grateful: '🙏', joyful: '😊', reflective: '🪷',
  anxious: '😰', hopeful: '🌅', calm: '🧘', inspired: '✨', sad: '😢', energetic: '⚡',
};

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

export default function JournalListPage() {
  const { user }                          = useAuth();
  const [journals, setJournals]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [deleting, setDeleting]           = useState(null);

  const fetchJournals = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await getUserJournals(user.uid);
      setJournals(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.uid]);

  useEffect(() => { fetchJournals(); }, [fetchJournals]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      setDeleting(id);
      await deleteJournal(id);
      setJournals(prev => prev.filter(j => j.id !== id));
    } catch { alert('Failed to delete entry'); }
    finally { setDeleting(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-plum/30 mx-auto mb-3" />
          <p className="text-earth/40 text-sm">Loading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-plum">My Journal</h1>
          <p className="text-earth/40 text-sm mt-1">{journals.length} {journals.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <Link href="/dashboard/journal/new" className="btn-gold text-sm gap-2 !px-5 !py-2.5">
          <Plus size={16} /> New Entry
        </Link>
      </div>

      {/* Empty State */}
      {journals.length === 0 && (
        <div className="glass-card bg-white/60 p-12 text-center shadow-soft">
          <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <PenLine size={32} className="text-gold" />
          </div>
          <h2 className="text-xl font-heading font-bold text-plum mb-3">Your journal awaits</h2>
          <p className="text-earth/50 font-body max-w-sm mx-auto mb-8">
            Begin documenting your spiritual journey. Each entry is a step towards deeper self-awareness and inner peace.
          </p>
          <Link href="/dashboard/journal/new" className="btn-gold">Write Your First Entry</Link>
        </div>
      )}

      {/* Journal List */}
      {journals.length > 0 && (
        <div className="space-y-4">
          {journals.map(journal => (
            <div key={journal.id} className="glass-card bg-white/80 p-5 sm:p-6 shadow-soft hover:shadow-card transition-all duration-300 group">
              <div className="flex items-start justify-between gap-4">
                <Link href={`/dashboard/journal/detail?id=${journal.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {journal.mood && moodEmojis[journal.mood] && (
                      <span className="text-lg" title={journal.mood}>{moodEmojis[journal.mood]}</span>
                    )}
                    <h3 className="font-heading font-bold text-plum text-lg truncate group-hover:text-purple transition-colors">
                      {journal.title || 'Untitled Entry'}
                    </h3>
                  </div>
                  <p className="text-earth/50 text-sm line-clamp-2 mb-3">{journal.content}</p>
                  <div className="flex items-center gap-4 text-xs text-earth/30">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {toDate(journal.createdAt)?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {journal.mood && <span className="px-2 py-0.5 bg-sand/30 rounded-full capitalize">{journal.mood}</span>}
                  </div>
                </Link>

                <button onClick={() => handleDelete(journal.id)} disabled={deleting === journal.id}
                  className="p-2 rounded-lg text-earth/20 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0" title="Delete">
                  {deleting === journal.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
