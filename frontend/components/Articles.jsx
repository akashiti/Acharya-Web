'use client';

import { useEffect, useRef } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

const articles = [
  {
    title: 'The Art of Letting Go: Finding Freedom in Surrender',
    excerpt: 'Discover how the ancient practice of surrender can liberate you from the chains of attachment and lead you to profound inner peace.',
    category: 'Spiritual Wisdom',
    readTime: '5 min',
    image: null,
  },
  {
    title: 'Morning Rituals: 7 Practices to Start Your Day with Purpose',
    excerpt: 'Transform your mornings with these time-tested spiritual practices that set the tone for a mindful and productive day.',
    category: 'Daily Practice',
    readTime: '7 min',
    image: null,
  },
  {
    title: 'Understanding Karma: Beyond Cause and Effect',
    excerpt: 'A deeper look into the nuances of karma, its role in spiritual evolution, and how to align your actions with your highest purpose.',
    category: 'Philosophy',
    readTime: '8 min',
    image: null,
  },
  {
    title: 'The Power of Silence: Why Modern Seekers Need Stillness',
    excerpt: 'In a world of constant noise, learn why silence is not just rest but a powerful gateway to self-discovery and healing.',
    category: 'Meditation',
    readTime: '6 min',
    image: null,
  },
];

export default function Articles() {
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
    <section id="articles" ref={sectionRef} className="py-24 lg:py-32 bg-ivory relative overflow-hidden scroll-mt-16">
      <div className="section-wrapper relative z-10">
        <div className="text-center mb-16 reveal">
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">Insights</p>
          <h2 className="section-title">Articles & Teachings</h2>
          <div className="gold-divider mt-6 mb-6" />
          <p className="section-subtitle">
            Wisdom-filled articles to inspire reflection and deepen your understanding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 stagger-children">
          {articles.map((article, i) => (
            <article
              key={i}
              className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-br from-plum/80 via-purple/60 to-plum/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-plum/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-gold/90 text-plum text-xs font-bold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                {/* Hover zoom effect */}
                <div className="absolute inset-0 bg-plum/0 group-hover:bg-plum/10 transition-all duration-500" />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-earth/40 text-xs mb-3">
                  <Clock size={12} />
                  <span>{article.readTime} read</span>
                </div>

                <h3 className="font-heading text-lg font-bold text-plum mb-3 group-hover:text-purple transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-sm text-earth/60 leading-relaxed mb-4">
                  {article.excerpt}
                </p>

                <p className="text-sm font-body font-semibold text-gold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read Article
                  <ArrowRight size={14} />
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12 reveal">
          <a href="#" className="btn-outline">
            View All Articles
          </a>
        </div>
      </div>
    </section>
  );
}
