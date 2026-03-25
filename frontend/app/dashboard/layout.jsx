'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  PenLine,
  BookOpen,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Journal', href: '/dashboard/journal', icon: PenLine },
  { label: 'Courses', href: '/dashboard/courses', icon: BookOpen, soon: true },
  { label: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:'var(--gradient-hero)'}}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-gold animate-spin mx-auto mb-4" />
          <p className="text-ivory/40 font-body text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen pt-16" style={{background:'var(--gradient-hero)'}}>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-30 w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-ivory hover:text-gold transition-colors"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#1a0d2e]/90 backdrop-blur-xl border-r border-white/5 z-20 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center flex-shrink-0">
                <span className="text-plum font-heading font-bold text-sm">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-body font-semibold text-ivory text-sm truncate">
                  {user.name}
                </p>
                <p className="text-ivory/30 text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map(({ label, href, icon: Icon, soon }) => (
              <Link
                key={label}
                href={soon ? '#' : href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium transition-all duration-200 group ${
                  isActive(href)
                    ? 'bg-gold/20 text-gold border border-gold/20'
                    : soon
                    ? 'text-ivory/20 cursor-not-allowed'
                    : 'text-ivory/60 hover:bg-white/5 hover:text-ivory'
                }`}
                onClick={(e) => soon && e.preventDefault()}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {soon && (
                  <span className="text-[10px] bg-white/5 text-ivory/30 px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
                {isActive(href) && <ChevronRight size={16} className="opacity-50" />}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium text-ivory/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-[calc(100vh-4rem)]">
        <div className="p-6 sm:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
