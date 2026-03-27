'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (el) {
      el.classList.add('visible');
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        {/* Animated orbs */}
        <div className="absolute top-16 right-10 w-64 h-64 rounded-full bg-purple/20 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-16 left-10 w-80 h-80 rounded-full bg-gold/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple/5 blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,248,240,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,248,240,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content — compact to fit screen */}
      <div ref={heroRef} className="reveal text-center px-4 w-full max-w-3xl mx-auto">
        {/* Brand Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-transparent">
            <Image
              src="/images/ChatGPT Image Mar 25, 2026, 01_53_23 AM-Photoroom (1).png"
              alt="Acharya Aashish Ways — Nothing to Consciousness"
              width={500}
              height={200}
              className="mx-auto w-[260px] sm:w-[360px] lg:w-[460px] h-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        <div className="gold-divider mb-6" />

        <p className="text-base sm:text-lg lg:text-xl text-ivory/70 font-light leading-relaxed max-w-xl mx-auto mb-8">
          Embark on a transformative journey of spiritual awakening,
          inner peace, and self-mastery through ancient wisdom and modern guidance.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <a href="#programs" className="btn-gold text-sm !px-9 !py-3.5">
            Explore Programs
          </a>
          <a
            href="#about"
            className="btn-outline border-ivory/25 text-ivory hover:bg-ivory/10 hover:border-ivory/50 hover:text-ivory text-sm !px-9 !py-3.5"
          >
            Meet Acharya
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto border-t border-ivory/10 pt-8">
          {[
            { value: '10K+', label: 'Lives Transformed' },
            { value: '50+', label: 'Retreats Held' },
            { value: '15+', label: 'Years Teaching' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-heading font-bold text-gold">
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-xs text-ivory/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
