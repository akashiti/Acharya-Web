'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Password strength checks
  const pwChecks = {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const pwStrength = Object.values(pwChecks).filter(Boolean).length;
  const pwStrColor =
    pwStrength <= 1 ? 'bg-red-400' : pwStrength === 2 ? 'bg-yellow-400' : 'bg-green-400';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!pwChecks.length) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.push('/login?registered=true');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-ivory/5 border border-ivory/10 rounded-xl py-3.5 text-ivory placeholder:text-ivory/30 font-body text-sm outline-none focus:border-gold/50 focus:bg-ivory/8 transition-all duration-300';

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="absolute top-1/3 left-10 w-72 h-72 rounded-full bg-purple/15 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gold/8 blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-md mx-auto px-4 py-20">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/images/logo.png"
              alt="Acharya Aashish Ways"
              width={220}
              height={62}
              className="mx-auto h-14 w-auto object-contain brightness-110"
              priority
            />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-ivory mb-3">
            Begin Your Journey
          </h1>
          <p className="text-ivory/50 font-body text-sm">
            Create your spiritual wellness account
          </p>
        </div>

        {/* Signup Card */}
        <div className="glass-card bg-ivory/5 border-ivory/10 p-8 sm:p-10 shadow-elevated">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
              <input
                id="signup-name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass} pl-12 pr-4`}
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
              <input
                id="signup-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-12 pr-4`}
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pl-12 pr-12`}
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

              {/* Password Strength */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < pwStrength ? pwStrColor : 'bg-ivory/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {[
                      { check: pwChecks.length, label: '6+ characters' },
                      { check: pwChecks.upper, label: 'Uppercase' },
                      { check: pwChecks.number, label: 'Number' },
                    ].map(({ check, label }) => (
                      <span
                        key={label}
                        className={`flex items-center gap-1 text-xs ${
                          check ? 'text-green-400' : 'text-ivory/25'
                        }`}
                      >
                        {check ? <Check size={12} /> : <X size={12} />}
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClass} pl-12 pr-4 ${
                  confirmPassword &&
                  (confirmPassword === password
                    ? 'border-green-500/30'
                    : 'border-red-500/30')
                }`}
                required
              />
              {confirmPassword && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  {confirmPassword === password ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <X size={18} className="text-red-400" />
                  )}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-gold !py-4 text-base gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-ivory/10" />
            <span className="text-ivory/25 text-xs font-body">or</span>
            <div className="flex-1 h-px bg-ivory/10" />
          </div>

          {/* Login Link */}
          <p className="text-center text-ivory/50 text-sm font-body">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-gold hover:text-gold-light font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-ivory/30 hover:text-ivory/60 text-xs font-body transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
