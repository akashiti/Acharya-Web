'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bangalore',
    review: 'The 7-day retreat with Acharya Aashish completely transformed my perspective on life. I found a peace within myself that I never knew existed. His teachings are profound yet practical.',
    rating: 5,
  },
  {
    name: 'Rajesh Gupta',
    role: 'Business Owner, Mumbai',
    review: 'After attending the Self-Mastery course, I was able to manage my stress and relationships much better. Acharya ji has a unique gift of making ancient wisdom accessible and applicable.',
    rating: 5,
  },
  {
    name: 'Ananya Desai',
    role: 'Doctor, Pune',
    review: 'The meditation techniques I learned have become an integral part of my daily routine. I recommend Acharya Aashish\'s programs to anyone seeking genuine spiritual growth.',
    rating: 5,
  },
  {
    name: 'Vikram Singh',
    role: 'Teacher, Delhi',
    review: 'What sets Acharya Aashish apart is his authenticity and compassion. Every discourse feels like a personal conversation with the divine. Truly life-changing.',
    rating: 5,
  },
  {
    name: 'Meera Patel',
    role: 'Homemaker, Ahmedabad',
    review: 'The Relationship Harmony program helped my family communicate better and understand each other on a deeper level. We are forever grateful to Acharya ji.',
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => navigate(1), 5000);
    return () => clearInterval(timer);
  }, [current]);

  const navigate = (dir) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
      setIsTransitioning(false);
    }, 300);
  };

  const t = testimonials[current];

  return (
    <section id="testimonials" ref={sectionRef} className="py-24 lg:py-32 bg-sand/30 relative overflow-hidden scroll-mt-16">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple/3 rounded-full blur-3xl" />

      <div className="section-wrapper relative z-10">
        <div className="text-center mb-16 reveal">
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">Testimonials</p>
          <h2 className="section-title">Words of Transformation</h2>
          <div className="gold-divider mt-6 mb-6" />
          <p className="section-subtitle">
            Hear from those whose lives have been touched by Acharya Aashish's teachings.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-3xl mx-auto reveal">
          <div className={`glass-card bg-white/80 p-8 sm:p-12 text-center transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            <Quote size={40} className="text-gold/30 mx-auto mb-6" />

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={18} className="fill-gold text-gold" />
              ))}
            </div>

            <p className="text-lg sm:text-xl text-plum/80 leading-relaxed font-body mb-8 italic">
              "{t.review}"
            </p>

            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-plum to-purple mx-auto mb-4 flex items-center justify-center">
              <span className="text-ivory font-heading font-bold text-lg">
                {t.name.charAt(0)}
              </span>
            </div>

            <h4 className="font-heading font-bold text-plum text-lg">{t.name}</h4>
            <p className="text-sm text-earth/50">{t.role}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border-2 border-plum/15 flex items-center justify-center text-plum/50 hover:border-plum hover:text-plum hover:bg-plum/5 transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIsTransitioning(true); setTimeout(() => { setCurrent(i); setIsTransitioning(false); }, 300); }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-gold' : 'w-2 bg-plum/20 hover:bg-plum/40'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 rounded-full border-2 border-plum/15 flex items-center justify-center text-plum/50 hover:border-plum hover:text-plum hover:bg-plum/5 transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
