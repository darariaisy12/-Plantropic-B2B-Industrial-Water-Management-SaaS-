'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const contactInfo = [
  {
    icon: 'EnvelopeIcon',
    label: 'Email',
    value: 'weare@plantropic.id',
    href: 'mailto:weare@plantropic.id',
  },
  {
    icon: 'PhoneIcon',
    label: 'Phone',
    value: '+62 877 731 934 90',
    href: 'tel:+6287773193490',
  },
  {
    icon: 'MapPinIcon',
    label: 'Address',
    value: 'Gedung Sudirman Park, Jl. K.H. Mas Mansyur No.35, Jakarta Pusat 10220',
    href: '#',
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit handler — connect to backend API here
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  return (
    <section
      id="contact"
      className="py-20 px-6 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Contact Us
          </span>
          <h2 className="text-section-heading font-extrabold text-foreground mb-4">
            Mulai Perjalanan ESG{' '}
            <span className="gradient-text-primary">Perusahaan Anda</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Tim kami siap membantu Anda memahami bagaimana Plantropic dapat mempercepat implementasi ESG.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="glass-card rounded-2xl p-8">
            <h3 className="font-bold text-foreground text-lg mb-6">Kirim Pesan</h3>

            {submitted && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                <Icon name="CheckCircleIcon" size={20} className="text-primary" variant="solid" />
                <p className="text-sm font-semibold text-primary">Pesan berhasil dikirim! Kami akan menghubungi Anda segera.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Budi Santoso"
                    className="input-focus-ring px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="budi@perusahaan.com"
                    className="input-focus-ring px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Nama Perusahaan
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="PT. Perusahaan Anda"
                  className="input-focus-ring px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Pesan *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Ceritakan kebutuhan ESG perusahaan Anda..."
                  className="input-focus-ring px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-primary-foreground font-bold py-4 rounded-full hover:bg-accent transition-all duration-300 hover:scale-[1.02] eco-glow flex items-center justify-center gap-2 text-sm"
              >
                Kirim Pesan
                <Icon name="PaperAirplaneIcon" size={16} />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6 justify-between">
            <div className="flex flex-col gap-5">
              {contactInfo.map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  className="glass-card rounded-xl p-5 flex items-start gap-4 card-hover-lift group"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-300">
                    <Icon
                      name={info.icon as any}
                      size={20}
                      className="text-primary group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {info.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Media */}
            <div className="glass-card rounded-xl p-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Ikuti Kami
              </p>
              <div className="flex gap-3">
                {[
                  { icon: 'GlobeAltIcon', label: 'Website', href: '#' },
                  { icon: 'ChatBubbleLeftRightIcon', label: 'WhatsApp', href: '#' },
                  { icon: 'BuildingOfficeIcon', label: 'LinkedIn', href: '#' },
                  { icon: 'CameraIcon', label: 'Instagram', href: '#' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-11 h-11 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <Icon name={social.icon as any} size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="pricing-highlight rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">Coba Gratis 14 Hari</h4>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Tidak perlu kartu kredit. Setup dalam 5 menit.
              </p>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Mulai Sekarang
                <Icon name="ArrowRightIcon" size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}