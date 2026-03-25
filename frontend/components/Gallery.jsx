'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const galleryItems = [
  { title: 'Morning Meditation', category: 'Retreat', aspect: 'tall' },
  { title: 'Satsang Gathering', category: 'Event', aspect: 'wide' },
  { title: 'Nature Walk', category: 'Retreat', aspect: 'square' },
  { title: 'Fire Ceremony', category: 'Ritual', aspect: 'square' },
  { title: 'Yoga Session', category: 'Practice', aspect: 'tall' },
  { title: 'Discourse Hall', category: 'Event', aspect: 'wide' },
  { title: 'Book Launch', category: 'Event', aspect: 'square' },
  { title: 'Healing Circle', category: 'Practice', aspect: 'square' },
];

const gradients = [
  'from-plum via-purple to-plum/80',
  'from-earth via-earth/70 to-plum/60',
  'from-purple/80 via-plum to-earth/70',
  'from-gold/40 via-sand to-earth/30',
  'from-plum/70 via-purple/50 to-gold/30',
  'from-earth/60 via-plum/50 to-purple/40',
  'from-purple via-earth/60 to-plum/70',
  'from-plum/80 via-gold/20 to-purple/60',
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
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

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  return (
    <section id="gallery" ref={sectionRef} className="py-24 lg:py-32 bg-sand/20 relative overflow-hidden">
      <div className="section-wrapper relative z-10">
        <div className="text-center mb-16 reveal">
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">Gallery</p>
          <h2 className="section-title">Moments of Grace</h2>
          <div className="gold-divider mt-6 mb-6" />
          <p className="section-subtitle">
            Glimpses from retreats, gatherings, and sacred moments with Acharya Aashish.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 stagger-children">
          {galleryItems.map((item, i) => (
            <div
              key={i}
              onClick={() => setLightbox(i)}
              className={`break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group relative bg-gradient-to-br ${gradients[i]} shadow-soft hover:shadow-card transition-all duration-500`}
            >
              <div className={`${
                item.aspect === 'tall' ? 'h-72 sm:h-80' :
                item.aspect === 'wide' ? 'h-44 sm:h-52' :
                'h-52 sm:h-60'
              } flex items-center justify-center relative`}>
                <div className="text-center px-4">
                  <p className="text-ivory/70 font-heading text-lg font-bold">{item.title}</p>
                  <p className="text-ivory/40 text-xs mt-1">{item.category}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-plum/0 group-hover:bg-plum/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 rounded-full border-2 border-ivory/50 flex items-center justify-center">
                    <span className="text-ivory text-lg">+</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-plum/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-ivory/70 hover:text-ivory transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className={`max-w-2xl w-full aspect-[4/3] rounded-3xl bg-gradient-to-br ${gradients[lightbox]} flex items-center justify-center animate-fade-in`}
          >
            <div className="text-center px-8">
              <p className="text-ivory font-heading text-2xl font-bold mb-2">
                {galleryItems[lightbox].title}
              </p>
              <p className="text-ivory/50 text-sm">{galleryItems[lightbox].category}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
