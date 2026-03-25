'use client';

import { useEffect, useRef } from 'react';
import { BookOpen, Mic, Users, Flame, Star, Heart } from 'lucide-react';

const programs = [
  {
    icon: BookOpen,
    title: 'Spiritual Discourses',
    desc: 'Deep explorations into Vedic philosophy, Bhagavad Gita, and Upanishadic wisdom for modern seekers.',
    tag: 'Popular',
    color: 'from-purple/20 to-plum/10',
  },
  {
    icon: Flame,
    title: 'Meditation Mastery',
    desc: 'Advanced meditation techniques including Vipassana, Trataka, and Yoga Nidra for inner transformation.',
    tag: null,
    color: 'from-gold/15 to-sand/20',
  },
  {
    icon: Mic,
    title: 'Live Satsang Sessions',
    desc: 'Interactive Q&A sessions with Acharya Aashish. Get personalized guidance for your spiritual journey.',
    tag: 'Live',
    color: 'from-earth/10 to-sand/15',
  },
  {
    icon: Users,
    title: 'Group Healing Circles',
    desc: 'Collective healing experiences using sound therapy, breathwork, and guided visualization.',
    tag: null,
    color: 'from-purple/15 to-gold/10',
  },
  {
    icon: Star,
    title: 'Self-Mastery Course',
    desc: 'A structured 8-week program covering emotional intelligence, habit transformation, and purpose discovery.',
    tag: 'New',
    color: 'from-gold/20 to-plum/10',
  },
  {
    icon: Heart,
    title: 'Relationship Harmony',
    desc: 'Learn the art of conscious relationships through communication, empathy, and spiritual partnership.',
    tag: null,
    color: 'from-earth/10 to-purple/10',
  },
];

export default function Programs() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal, .stagger-children');
    els?.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="programs" ref={sectionRef} className="py-24 lg:py-32 bg-ivory relative overflow-hidden scroll-mt-16">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple/5 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="section-wrapper relative z-10">
        <div className="text-center mb-16 reveal">
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">Programs</p>
          <h2 className="section-title">Transformative Programs</h2>
          <div className="gold-divider mt-6 mb-6" />
          <p className="section-subtitle">
            Carefully curated programs to guide you at every stage of your spiritual evolution.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {programs.map(({ icon: Icon, title, desc, tag, color }) => (
            <div
              key={title}
              className="group relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />

              <div className="relative z-10">
                {tag && (
                  <span className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-full ${
                    tag === 'Popular' ? 'bg-gold/20 text-gold-dark' :
                    tag === 'Live' ? 'bg-red-100 text-red-600' :
                    'bg-purple/10 text-purple'
                  }`}>
                    {tag}
                  </span>
                )}

                <div className="w-14 h-14 rounded-2xl bg-plum/8 flex items-center justify-center mb-6 group-hover:bg-plum/15 transition-colors duration-300">
                  <Icon size={26} className="text-purple group-hover:text-plum transition-colors duration-300" />
                </div>

                <h3 className="font-heading text-xl font-bold text-plum mb-3 group-hover:text-plum transition-colors">
                  {title}
                </h3>

                <p className="text-sm text-earth/60 leading-relaxed mb-6">{desc}</p>

                <p className="text-sm font-body font-semibold text-gold group-hover:text-gold-dark transition-colors flex items-center gap-2">
                  Learn More
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 reveal">
          <a href="#contact" className="btn-primary">
            View All Programs
          </a>
        </div>
      </div>
    </section>
  );
}
