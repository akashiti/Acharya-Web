'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  ShieldCheck, User, KeyRound, CheckCircle2, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [role, setRole]               = useState('user');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  // ── Forgot-password state ──────────────────────────────
  const [showForgot, setShowForgot]       = useState(false);
  const [resetEmail, setResetEmail]       = useState('');
  const [resetSent, setResetSent]         = useState(false);
  const [resetLoading, setResetLoading]   = useState(false);
  const [resetError, setResetError]       = useState('');

  const { login, resetPassword } = useAuth();
  const router = useRouter();

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (role === 'admin') {
        if (loggedInUser.role !== 'ADMIN') {
          setError('Access denied. You do not have admin privileges.');
          setLoading(false);
          return;
        }
        router.push('/admin');
      } else {
        if (loggedInUser.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message?.includes('invalid-credential') || err.message?.includes('wrong-password')
        ? 'Invalid email or password. Please try again.'
        : err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password submit ─────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setResetError('No account found with that email address.');
      } else if (err.code === 'auth/invalid-email') {
        setResetError('Please enter a valid email address.');
      } else {
        setResetError('Something went wrong. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setResetEmail('');
    setResetSent(false);
    setResetError('');
  };

  const isAdmin = role === 'admin';

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-purple/15 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-gold/8 blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-md mx-auto px-4 py-16">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/images/logo.png"
              alt="Acharya Aashish Ways"
              width={220}
              height={62}
              className="mx-auto h-14 w-auto object-contain brightness-110"
              priority
            />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ivory mb-2">
            Welcome Back
          </h1>
          <p className="text-ivory/50 font-body text-sm">
            Choose your login type to continue
          </p>
        </div>

        {/* ── Role Selector Tabs ── */}
        <div className="flex rounded-2xl overflow-hidden border border-ivory/10 mb-6 bg-ivory/5">
          <button
            type="button"
            id="tab-user"
            onClick={() => handleRoleSwitch('user')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold font-body transition-all duration-300
              ${!isAdmin
                ? 'bg-gold text-[#1a0a00] shadow-lg'
                : 'text-ivory/50 hover:text-ivory/80'
              }`}
          >
            <User size={16} />
            User Login
          </button>
          <button
            type="button"
            id="tab-admin"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold font-body transition-all duration-300
              ${isAdmin
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-ivory/50 hover:text-ivory/80'
              }`}
          >
            <ShieldCheck size={16} />
            Admin Login
          </button>
        </div>

        {/* Role badge */}
        <div className={`flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl text-xs font-body border transition-all duration-300
          ${isAdmin
            ? 'bg-purple-600/10 border-purple-500/20 text-purple-300'
            : 'bg-gold/10 border-gold/20 text-gold'
          }`}
        >
          {isAdmin
            ? <><ShieldCheck size={14} /> Signing in as <strong>Admin</strong> — restricted access</>
            : <><User size={14} /> Signing in as <strong>User</strong> — personal account</>
          }
        </div>

        {/* Login Card */}
        <div className="glass-card bg-ivory/5 border-ivory/10 p-8 sm:p-10 shadow-elevated">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
              <input
                id="login-email"
                type="email"
                placeholder={isAdmin ? 'Admin email address' : 'Email address'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ivory/5 border border-ivory/10 rounded-xl pl-12 pr-4 py-3.5 text-ivory placeholder:text-ivory/30 font-body text-sm outline-none focus:border-gold/50 focus:bg-ivory/8 transition-all duration-300"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ivory/5 border border-ivory/10 rounded-xl pl-12 pr-12 py-3.5 text-ivory placeholder:text-ivory/30 font-body text-sm outline-none focus:border-gold/50 focus:bg-ivory/8 transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot Password link — only for user tab */}
            {!isAdmin && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={() => { setShowForgot(true); setResetEmail(email); }}
                  className="text-xs text-gold/70 hover:text-gold font-body transition-colors underline-offset-2 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 !py-4 rounded-xl text-base font-semibold font-body transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                ${isAdmin
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30'
                  : 'btn-gold'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
                  {isAdmin ? 'Sign In as Admin' : 'Sign In'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider — only for user tab */}
          {!isAdmin && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-ivory/10" />
                <span className="text-ivory/25 text-xs font-body">or</span>
                <div className="flex-1 h-px bg-ivory/10" />
              </div>
              <p className="text-center text-ivory/50 text-sm font-body">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-gold hover:text-gold-light font-semibold transition-colors"
                >
                  Create one
                </Link>
              </p>
            </>
          )}

          {/* Admin help text */}
          {isAdmin && (
            <p className="mt-6 text-center text-ivory/30 text-xs font-body">
              🔒 Admin access is restricted. Contact your system administrator if you need access.
            </p>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-ivory/30 hover:text-ivory/60 text-xs font-body transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Forgot Password Modal
      ════════════════════════════════════════════════════════════ */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeForgot}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm glass-card bg-[#1a0a00]/95 border-ivory/10 p-8 shadow-elevated animate-fade-in">
            {/* Close */}
            <button
              type="button"
              onClick={closeForgot}
              className="absolute top-4 right-4 text-ivory/30 hover:text-ivory/70 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {!resetSent ? (
              <>
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
                    <KeyRound size={22} className="text-gold" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-ivory">Forgot Password?</h2>
                  <p className="text-ivory/45 text-sm font-body mt-1">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                {resetError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-body">
                    {resetError}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="Your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-ivory/5 border border-ivory/10 rounded-xl pl-11 pr-4 py-3 text-ivory placeholder:text-ivory/30 font-body text-sm outline-none focus:border-gold/50 transition-all duration-300"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    id="reset-submit"
                    type="submit"
                    disabled={resetLoading}
                    className="w-full btn-gold !py-3.5 text-sm gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <KeyRound size={16} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-ivory/30 text-xs font-body mt-4">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={closeForgot}
                    className="text-gold hover:text-gold-light transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </>
            ) : (
              /* Success state */
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 size={28} className="text-green-400" />
                </div>
                <h2 className="text-xl font-heading font-bold text-ivory mb-2">Email Sent!</h2>
                <p className="text-ivory/50 text-sm font-body mb-1">
                  We sent a password reset link to:
                </p>
                <p className="text-gold font-semibold text-sm font-body mb-5 break-all">
                  {resetEmail}
                </p>
                <p className="text-ivory/35 text-xs font-body mb-6">
                  Check your inbox (and spam folder). The link expires in 1 hour.
                </p>
                <button
                  type="button"
                  onClick={closeForgot}
                  className="btn-gold !py-3 text-sm w-full"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
