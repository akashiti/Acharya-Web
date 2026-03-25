import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, Youtube, Facebook } from 'lucide-react';

const footerLinks = {
  'Quick Links': [
    { label: 'Home', href: '/' },
    { label: 'About', href: '#about' },
    { label: 'Programs', href: '#programs' },
    { label: 'Articles', href: '#articles' },
    { label: 'Gallery', href: '#gallery' },
  ],
  'Programs': [
    { label: 'Spiritual Discourses', href: '#programs' },
    { label: 'Meditation Mastery', href: '#programs' },
    { label: 'Self-Mastery Course', href: '#programs' },
    { label: 'Wellness Retreats', href: '#retreat' },
    { label: 'Healing Circles', href: '#programs' },
  ],
  'Support': [
    { label: 'Contact Us', href: '#contact' },
    { label: 'FAQ', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Facebook, href: '#', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-plum text-ivory/70 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-1 w-full" style={{ background: 'var(--gradient-gold)' }} />

      <div className="section-wrapper py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6 group">
              <Image
                src="/images/logo.png"
                alt="Acharya Aashish Ways"
                width={160}
                height={45}
                className="h-10 w-auto object-contain brightness-110 group-hover:brightness-125 transition-all duration-300"
              />
            </Link>

            <p className="text-sm text-ivory/50 leading-relaxed mb-6 max-w-xs">
              Illuminating the path of inner transformation through timeless
              wisdom, compassionate guidance, and transformative experiences.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <a href="mailto:info@acharyaaashishways.com" className="flex items-center gap-3 text-sm hover:text-gold transition-colors">
                <Mail size={14} className="text-gold/60" />
                info@acharyaaashishways.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-3 text-sm hover:text-gold transition-colors">
                <Phone size={14} className="text-gold/60" />
                +91 98765 43210
              </a>
              <p className="flex items-center gap-3 text-sm">
                <MapPin size={14} className="text-gold/60 shrink-0" />
                India
              </p>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-ivory/5 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-ivory text-sm mb-6 tracking-wider uppercase">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-gold hover:pl-1 transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-ivory/10 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ivory/30">
            © {new Date().getFullYear()} Acharya Aashish Ways. All rights reserved.
          </p>
          <p className="text-xs text-ivory/20">
            Designed with 🪷 for spiritual seekers
          </p>
        </div>
      </div>
    </footer>
  );
}
