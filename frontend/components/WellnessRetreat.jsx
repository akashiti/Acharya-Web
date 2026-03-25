'use client';

import { useEffect, useRef, useState } from 'react';
import { Leaf, Sun, Moon, Mountain, Waves, Calendar } from 'lucide-react';

const retreats = [
  {
    id: '1day',
    label: '1 Day',
    icon: Sun,
    title: 'Inner Stillness Day',
    subtitle: 'A mindful pause for the busy soul',
    description: 'A one-day intensive focused on breathing techniques, guided meditation, and self-reflection. Perfect for beginners seeking a taste of spiritual exploration.',
    highlights: ['Morning Meditation', 'Pranayama Workshop', 'Guided Self-Reflection', 'Evening Satsang'],
    price: '₹1,499',
    spots: 8,
  },
  {
    id: '2day',
    label: '2 Days',
    icon: Moon,
    title: 'Weekend of Awakening',
    subtitle: 'Reconnect with your inner light',
    description: 'A weekend immersion combining meditation, discourse sessions, and nature walks. Ideal for those ready to deepen their practice and find clarity.',
    highlights: ['Silent Morning Walks', 'Deep Meditation Sessions', 'Discourse by Acharya', 'Sound Healing'],
    price: '₹3,999',
    spots: 5,
  },
  {
    id: '3day',
    label: '3 Days',
    icon: Leaf,
    title: 'Transformation Retreat',
    subtitle: 'Shed the old, embrace the new',
    description: 'Three days of intensive practice including yoga, meditation, discourse, and self-inquiry. A powerful reset for body, mind, and spirit.',
    highlights: ['Yoga & Asana Practice', 'Emotional Release Workshop', 'Silent Contemplation', 'Fire Ceremony'],
    price: '₹6,999',
    spots: 3,
  },
  {
    id: '5day',
    label: '5 Days',
    icon: Mountain,
    title: 'Mountain of Silence',
    subtitle: 'Profound depths of inner peace',
    description: 'Five days in a serene ashram setting. Includes extended silent periods, advanced meditation techniques, and personal guidance from Acharya Aashish.',
    highlights: ['Extended Silent Periods', 'Advanced Pranayama', 'One-on-One Guidance', 'Nature Immersion'],
    price: '₹12,999',
    spots: 2,
  },
  {
    id: '7day',
    label: '7 Days',
    icon: Waves,
    title: 'River of Consciousness',
    subtitle: 'Complete spiritual immersion',
    description: 'A full week of deep spiritual immersion. This transformative experience includes all practices, personal mentorship, and a complete lifestyle reset.',
    highlights: ['Full Lifestyle Reset', 'Personal Mentorship', 'Advanced Techniques', 'Graduation Ceremony'],
    price: '₹19,999',
    spots: 1,
  },
  {
    id: 'monthly',
    label: 'Monthly',
    icon: Calendar,
    title: 'Ongoing Journey',
    subtitle: 'Sustained spiritual growth',
    description: 'Monthly gatherings for sustained spiritual growth. Includes weekly online sessions, monthly in-person satsang, and ongoing community support.',
    highlights: ['Weekly Online Sessions', 'Monthly In-Person Satsang', 'Community Support', 'Progress Tracking'],
    price: '₹2,999/mo',
    spots: 15,
  },
];

export default function WellnessRetreat() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal');
    els?.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const retreat = retreats[active];
  const Icon = retreat.icon;

  return (
    <section id="retreat" ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden scroll-mt-16"
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* BG decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full bg-purple/15 blur-3xl" />
        <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="section-wrapper relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-gold/80 font-body text-sm tracking-[0.3em] uppercase mb-4">Retreats</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-ivory mb-4">
            Wellness Retreats
          </h2>
          <div className="gold-divider mt-6 mb-6" />
          <p className="text-base sm:text-lg text-ivory/60 max-w-2xl mx-auto">
            Immerse yourself in transformative experiences designed to reconnect
            you with your deepest self.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 reveal">
          {retreats.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all duration-300 ${
                i === active
                  ? 'bg-gold text-plum shadow-glow'
                  : 'bg-ivory/10 text-ivory/70 hover:bg-ivory/20 hover:text-ivory'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="reveal max-w-4xl mx-auto">
          <div className="glass-card bg-ivory/5 border-ivory/10 p-8 sm:p-10 lg:p-12 relative overflow-hidden">
            {/* Floating "Limited Spots" badge */}
            {retreat.spots <= 5 && (
              <div className="absolute top-4 right-4 bg-gold/90 text-plum text-xs font-bold px-4 py-1.5 rounded-full animate-pulse-soft">
                🔥 Only {retreat.spots} Spots Left
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-10">
              {/* Left */}
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gold/15 flex items-center justify-center mb-6">
                  <Icon size={30} className="text-gold" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-heading font-bold text-ivory mb-2">
                  {retreat.title}
                </h3>
                <p className="text-gold/80 text-sm font-body mb-6">{retreat.subtitle}</p>
                <p className="text-ivory/60 leading-relaxed mb-8">{retreat.description}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-heading font-bold text-gold">{retreat.price}</span>
                  <span className="text-ivory/40 text-sm">per person</span>
                </div>
                <a
                  href="#contact"
                  className="btn-gold"
                >
                  Book This Retreat
                </a>
              </div>

              {/* Right - Highlights */}
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-body font-semibold text-gold/80 tracking-wider uppercase mb-6">
                  What's Included
                </h4>
                <ul className="space-y-4">
                  {retreat.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-4 text-ivory/80">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                        <span className="text-gold text-sm">✦</span>
                      </div>
                      <span className="font-body text-sm">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
