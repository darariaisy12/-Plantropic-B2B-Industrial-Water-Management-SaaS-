'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const testimonials = [
  {
    quote:
      'Plantropic mengubah cara kami mengelola data ESG. Yang dulu butuh 3 bulan untuk menyusun laporan, sekarang selesai dalam 2 hari. Sangat merekomendasikan untuk perusahaan yang ingin serius di ESG.',
    name: 'Budi Santoso',
    role: 'Head of Sustainability',
    company: 'PT. Nusantara Energi Tbk.',
    initial: 'BS',
    rating: 5,
    metric: '75% lebih cepat',
  },
  {
    quote:
      'Sebelum Plantropic, tim kami menghabiskan Rp 2M per kuartal untuk konsultan ESG. Sekarang kami bayar jauh lebih sedikit dan hasilnya lebih akurat karena berbasis data real-time.',
    name: 'Siti Rahayu',
    role: 'CFO',
    company: 'PT. Mitra Hijau Indonesia',
    initial: 'SR',
    rating: 5,
    metric: 'Hemat Rp 6M/tahun',
  },
  {
    quote:
      'Dashboard ESG Plantropic sangat intuitif. Tim kami yang tidak berlatar belakang teknis pun bisa menggunakannya dengan mudah. AI recommendations-nya benar-benar membantu kami prioritas aksi.',
    name: 'Arief Wibowo',
    role: 'ESG Manager',
    company: 'PT. Garuda Pangan Lestari',
    initial: 'AW',
    rating: 5,
    metric: 'ESG Score +24 poin',
  },
];

export default function TestimonialSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.testi-card').forEach((el, i) => {
              setTimeout(() => el.classList.add('animate-fade-in-up'), i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-20 px-6 bg-background dot-pattern relative overflow-hidden"
    >
      <div className="blob-primary absolute w-80 h-80 bottom-0 right-0 opacity-25 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Testimonials
          </span>
          <h2 className="text-section-heading font-extrabold text-foreground mb-4">
            Dipercaya{' '}
            <span className="gradient-text-primary">Perusahaan Terkemuka</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Lebih dari 200 perusahaan Indonesia telah menggunakan Plantropic untuk perjalanan ESG mereka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials?.map((testi) => (
            <div
              key={testi?.name}
              className="testi-card glass-card rounded-2xl p-7 card-hover-lift flex flex-col justify-between gap-6"
            >
              {/* Stars + metric */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: testi?.rating })?.map((_, i) => (
                    <Icon key={i} name="StarIcon" size={14} variant="solid" className="text-secondary" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {testi?.metric}
                </span>
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground leading-relaxed font-medium flex-1">
                &ldquo;{testi?.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">{testi?.initial}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{testi?.name}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{testi?.role}</p>
                  <p className="text-[10px] text-primary font-bold">{testi?.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 glass-card rounded-2xl p-6 flex flex-wrap justify-center gap-10">
          {[
            { value: '200+', label: 'Perusahaan' },
            { value: '50K+', label: 'Laporan Dihasilkan' },
            { value: '4.9/5', label: 'Rating Pengguna' },
            { value: '98%', label: 'Customer Retention' },
          ]?.map((stat) => (
            <div key={stat?.label} className="text-center">
              <p className="text-2xl font-extrabold text-primary">{stat?.value}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{stat?.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}