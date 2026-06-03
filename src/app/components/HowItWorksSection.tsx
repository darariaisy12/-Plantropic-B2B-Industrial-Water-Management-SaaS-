'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const steps = [
  {
    num: '01',
    icon: 'UserCircleIcon',
    title: 'Login / Register',
    desc: 'Buat akun perusahaan dan verifikasi identitas bisnis Anda dalam 5 menit.',
  },
  {
    num: '02',
    icon: 'BuildingOffice2Icon',
    title: 'Input Data Perusahaan',
    desc: 'Masukkan data operasional: energi, air, bahan bakar, limbah, dan data sosial.',
  },
  {
    num: '03',
    icon: 'CpuChipIcon',
    title: 'Hitung ESG & Karbon',
    desc: 'Sistem AI secara otomatis menghitung skor ESG dan emisi karbon berdasarkan metodologi global.',
  },
  {
    num: '04',
    icon: 'PresentationChartBarIcon',
    title: 'Dashboard Analytics',
    desc: 'Dashboard interaktif muncul dengan visualisasi lengkap tren, benchmark, dan rekomendasi.',
  },
  {
    num: '05',
    icon: 'DocumentArrowDownIcon',
    title: 'Generate ESG Report',
    desc: 'Buat laporan keberlanjutan siap audit dalam format GRI, CDP, atau POJK dengan satu klik.',
  },
  {
    num: '06',
    icon: 'SparklesIcon',
    title: 'Sustainability Action',
    desc: 'Jalankan program keberlanjutan berbasis rekomendasi AI dan ukur dampaknya secara real-time.',
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.step-item').forEach((el, i) => {
              setTimeout(() => el.classList.add('animate-fade-in-up'), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 px-6 bg-background dot-pattern relative overflow-hidden"
    >
      <div className="blob-secondary absolute w-80 h-80 bottom-0 left-0 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            How It Works
          </span>
          <h2 className="text-section-heading font-extrabold text-foreground mb-4">
            Mulai ESG Journey Anda dalam{' '}
            <span className="gradient-text-primary">6 Langkah Mudah</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Dari data mentah hingga laporan ESG siap publish — semua dalam satu platform terintegrasi.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="step-item relative glass-card rounded-2xl p-7 card-hover-lift"
            >
              {/* Connector line (horizontal on desktop) */}
              {idx < steps.length - 1 && idx % 3 !== 2 && (
                <div className="hidden lg:block absolute top-8 -right-3 w-6 z-10">
                  <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 to-transparent" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-extrabold text-primary/20 font-display leading-none">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon name={step.icon as any} size={20} className="text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-foreground text-base mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full hover:bg-accent transition-all duration-300 hover:scale-105 eco-glow text-sm"
          >
            Mulai Sekarang — Gratis 14 Hari
            <Icon name="ArrowRightIcon" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}