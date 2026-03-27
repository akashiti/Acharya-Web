'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Acharya', href: '/#about' },
  { label: 'Programs', href: '/#programs' },
  { label: 'Wellness Retreat', href: '/#retreat' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Articles', href: '/#articles' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Shop', href: '/shop' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'py-2 bg-plum/95 backdrop-blur-xl shadow-elevated'
          : 'py-4 bg-transparent'
          }`}
      >
        <div className="section-wrapper flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/ChatGPT Image Mar 25, 2026, 02_08_28 AM-Photoroom (1).png"
              alt="Acharya Aashish Ways"
              width={200}
              height={80}
              className="h-20 w-auto object-contain brightness-110 group-hover:brightness-125 transition-all duration-300"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm text-ivory/80 hover:text-gold font-body font-medium transition-colors duration-300 rounded-lg hover:bg-ivory/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-ivory/80 hover:text-gold transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-plum text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                {/* Admin Panel link — only for admins, hidden when already in admin */}
                {user.role === 'ADMIN' && !isAdminRoute && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-300 hover:text-white bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg transition-all duration-200"
                  >
                    <LayoutDashboard size={14} />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-ivory/80 hover:text-ivory font-body font-medium transition-colors duration-300 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-plum font-heading font-bold text-xs">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  My Account
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-ivory/50 hover:text-ivory font-body font-medium transition-colors duration-300 flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm text-ivory/80 hover:text-ivory font-body font-medium transition-colors duration-300"
                >
                  Login
                </Link>
                <Link href="#retreat" className="btn-gold text-xs !px-6 !py-2.5">
                  Join Retreat
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            className="lg:hidden p-2 text-ivory hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-plum/98 backdrop-blur-2xl transition-all duration-500 lg:hidden ${mobileOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-2">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-xl text-ivory/80 hover:text-gold font-heading font-medium py-3 px-6 transition-all duration-300 hover:tracking-wider"
              style={{
                transitionDelay: mobileOpen ? `${i * 60}ms` : '0ms',
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              {link.label}
            </Link>
          ))}

          <div
            className="mt-8 flex flex-col gap-4 items-center"
            style={{
              transitionDelay: mobileOpen ? `${navLinks.length * 60}ms` : '0ms',
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.3s ease-out',
            }}
          >
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="text-ivory/80 hover:text-gold text-lg font-body flex items-center gap-2">
              <ShoppingBag size={18} /> Cart {cartCount > 0 && <span className="ml-1 px-2 py-0.5 bg-gold text-plum text-xs font-bold rounded-full">{cartCount}</span>}
            </Link>
            {user ? (
              <>
                {/* Admin Panel link — only for admins, hidden when already in admin */}
                {user.role === 'ADMIN' && !isAdminRoute && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-purple-300 bg-purple-600/20 border border-purple-500/30 text-lg font-body font-semibold"
                  >
                    <LayoutDashboard size={18} />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-gold text-lg font-body font-semibold flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                    <span className="text-plum font-heading font-bold text-xs">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  My Account
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-ivory/50 hover:text-ivory text-base font-body flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-ivory/70 hover:text-ivory text-lg font-body"
                >
                  Login
                </Link>
                <Link
                  href="#retreat"
                  onClick={() => setMobileOpen(false)}
                  className="btn-gold"
                >
                  Join Retreat
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
