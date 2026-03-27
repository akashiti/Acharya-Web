'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, PenLine, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserJournals, getOrdersByUser } from '@/lib/firestore';

export default function DashboardPage() {
  const { user }           = useAuth();
  const [journalCount, setJournalCount] = useState(0);
  const [orderCount, setOrderCount]     = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    getUserJournals(user.uid).then(j => setJournalCount(j.length)).catch(() => {});
    getOrdersByUser(user.uid).then(o => setOrderCount(o.length)).catch(() => {});
  }, [user?.uid]);

  const quickStats = [
    { icon: PenLine, label: 'Journal', value: journalCount.toString(), desc: 'Entries written', color: 'bg-gold/10', iconColor: 'text-gold', href: '/dashboard/journal' },
    { icon: BookOpen, label: 'My Courses', value: '0', desc: 'Enrolled courses', color: 'bg-purple/10', iconColor: 'text-purple', href: '#', soon: true },
    { icon: ShoppingBag, label: 'Orders', value: orderCount.toString(), desc: 'Past orders', color: 'bg-earth/10', iconColor: 'text-earth', href: '/dashboard/orders' },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-plum to-purple flex items-center justify-center">
            <span className="text-ivory font-heading font-bold text-lg">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-plum">Namaste, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-earth/50 text-sm font-body">Welcome to your spiritual wellness dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {quickStats.map(({ icon: Icon, label, value, desc, color, iconColor, href, soon }) => (
          <Link key={label} href={soon ? '#' : href} onClick={e => soon && e.preventDefault()}
            className={`glass-card bg-white/80 p-6 shadow-soft transition-all duration-300 group ${soon ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-card hover:-translate-y-1'}`}>
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon size={22} className={iconColor} />
            </div>
            <p className="text-3xl font-heading font-bold text-plum mb-1">{value}</p>
            <p className="text-sm font-body font-semibold text-plum/80">{label}</p>
            <p className="text-xs text-earth/40 mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Link href="/dashboard/journal/new" className="glass-card bg-white/60 p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenLine size={24} className="text-gold" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-plum text-lg">Write in Journal</h3>
              <p className="text-earth/40 text-sm">Record your thoughts and reflections</p>
            </div>
          </div>
        </Link>

        <Link href="/#programs" className="glass-card bg-white/60 p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={24} className="text-purple" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-plum text-lg">Explore Programs</h3>
              <p className="text-earth/40 text-sm">Discover courses and retreats</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
