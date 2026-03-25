'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, User, Mail, Phone, MessageSquare } from 'lucide-react';

export default function ContactForm() {
  const sectionRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal');
    els?.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend API in Phase 3+
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const inputClass =
    'w-full bg-transparent border-b-2 border-plum/15 focus:border-gold px-1 py-3 text-plum placeholder:text-earth/30 font-body text-sm outline-none transition-colors duration-300';

  return (
    <section id="contact" ref={sectionRef} className="py-24 lg:py-32 bg-ivory relative overflow-hidden scroll-mt-16">
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      <div className="section-wrapper relative z-10">
        <div className="text-center mb-16 reveal">
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">Contact</p>
          <h2 className="section-title">Begin Your Journey</h2>
          <div className="gold-divider mt-6 mb-6" />
          <p className="section-subtitle">
            Reach out to learn more about our programs, retreats, or to connect with Acharya Aashish.
          </p>
        </div>

        <div className="max-w-2xl mx-auto reveal">
          <div className="glass-card bg-white/60 p-8 sm:p-12 shadow-card">
            {submitted ? (
              <div className="text-center py-12 animate-fade-up">
                <div className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🙏</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-plum mb-3">Namaste!</h3>
                <p className="text-earth/60">
                  Thank you for reaching out. We'll be in touch with you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative">
                  <User size={16} className="absolute left-0 top-4 text-earth/30" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`${inputClass} pl-7`}
                    required
                  />
                </div>

                <div className="relative">
                  <Mail size={16} className="absolute left-0 top-4 text-earth/30" />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${inputClass} pl-7`}
                    required
                  />
                </div>

                <div className="relative">
                  <Phone size={16} className="absolute left-0 top-4 text-earth/30" />
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`${inputClass} pl-7`}
                  />
                </div>

                <div className="relative">
                  <MessageSquare size={16} className="absolute left-0 top-4 text-earth/30" />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${inputClass} pl-7 resize-none`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full gap-2 !py-4"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
