'use client';

import { useEffect, useRef } from 'react';
import { Heart, BookOpen, Sparkles } from 'lucide-react';

export default function AboutSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.15 }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    els?.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 lg:py-32 bg-ivory relative overflow-hidden scroll-mt-16">
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sand/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="section-wrapper relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">About</p>
          <h2 className="section-title">Meet Acharya Aashish</h2>
          <div className="gold-divider mt-6 mb-6" />
          <p className="section-subtitle">
            A visionary spiritual guide dedicated to illuminating the path of inner transformation
            through timeless wisdom and compassionate teachings.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image placeholder */}
          <div className="reveal-left">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-plum via-purple to-plum/80 flex items-center justify-center relative">
                {/* Placeholder content */}
                <div className="text-center px-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
                      <path
                        d="M40 8 C40 8, 58 24, 58 40 C58 56, 40 68, 40 68 C40 68, 22 56, 22 40 C22 24, 40 8, 40 8Z"
                        fill="rgba(201,169,110,0.3)"
                        stroke="rgba(201,169,110,0.7)"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p className="text-ivory/60 text-sm font-body">
                    Acharya Aashish Portrait
                  </p>
                </div>
                {/* Decorative corner */}
                <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-gold/30 rounded-tr-2xl" />
                <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-gold/30 rounded-bl-2xl" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 glass-card px-6 py-4 shadow-card">
                <p className="text-2xl font-heading font-bold text-plum">15+</p>
                <p className="text-xs text-earth/60">Years of Teaching</p>
              </div>
            </div>
          </div>

          {/* Right - Text */}
          <div className="reveal-right">
            <h3 className="text-2xl lg:text-3xl font-heading font-bold text-plum mb-6 leading-tight">
              Guiding souls towards their highest potential through
              <span className="text-gold"> ancient wisdom</span>
            </h3>

            <p className="text-earth/70 mb-6 leading-relaxed">
              With over 15 years of dedicated practice and teaching, Acharya Aashish has
              touched the lives of thousands through profound discourses, transformative
              retreats, and personalized spiritual guidance. His unique approach blends
              Vedic wisdom with practical life application.
            </p>

            <p className="text-earth/70 mb-10 leading-relaxed">
              From intimate meditation sessions to large-scale conventions, his teachings
              emphasize self-awareness, emotional mastery, and the discovery of one's true
              purpose. Every interaction is an invitation to awaken to a life of deeper
              meaning and joy.
            </p>

            {/* Feature cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Heart,
                  title: 'Compassionate Guidance',
                  desc: 'Personalized teachings tailored to your spiritual journey',
                },
                {
                  icon: BookOpen,
                  title: 'Ancient Wisdom',
                  desc: 'Rooted in Vedic traditions with modern-day relevance',
                },
                {
                  icon: Sparkles,
                  title: 'Transformative Retreats',
                  desc: 'Immersive experiences for deep inner transformation',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-4 rounded-2xl hover:bg-sand/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-plum/10 flex items-center justify-center shrink-0 group-hover:bg-plum/15 transition-colors">
                    <Icon size={22} className="text-purple" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-plum mb-1">{title}</h4>
                    <p className="text-sm text-earth/60">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="#programs" className="btn-primary mt-10 inline-flex">
              Explore Our Programs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
