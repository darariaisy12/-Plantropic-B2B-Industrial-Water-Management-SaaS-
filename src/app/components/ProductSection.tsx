'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

// BENTO GRID AUDIT:
// Array has 7 cards: [ESG Calculator, Dashboard Analytics, ESG Report Generator, Data Monitoring, Recommendation System, Carbon Footprint, CSR Impact]
// Grid: 3 cols desktop
// Row 1: [col-1: ESG Calculator cs-1] [col-2: Dashboard Analytics cs-2]
// Row 2: [col-1: ESG Report cs-1] [col-2: Data Monitoring cs-1] [col-3: Recommendation cs-1]
// Row 3: [col-1: Carbon cs-2] [col-3: CSR Impact cs-1]
// Placed 7/7 ✓

const features = [
  {
    id: 'esg-calc',
    icon: 'CalculatorIcon',
    title: 'ESG Calculator',
    desc: 'Hitung skor ESG perusahaan secara otomatis berdasarkan data operasional yang Anda input. Metodologi sesuai GRI, SASB, dan TCFD.',
    tag: 'Core',
    span: 'lg:col-span-1',
    accent: false,
  },
  {
    id: 'dashboard',
    icon: 'PresentationChartLineIcon',
    title: 'Dashboard Analytics',
    desc: 'Visualisasi data ESG secara real-time dalam dashboard interaktif. Pantau tren, bandingkan target, dan identifikasi area perbaikan dengan mudah.',
    tag: 'Featured',
    span: 'lg:col-span-2',
    accent: true,
  },
  {
    id: 'report-gen',
    icon: 'DocumentArrowDownIcon',
    title: 'ESG Report Generator',
    desc: 'Generate laporan keberlanjutan siap audit dalam hitungan menit, bukan bulan. Mendukung format GRI, CDP, dan POJK.',
    tag: 'Popular',
    span: 'lg:col-span-1',
    accent: false,
  },
  {
    id: 'data-mon',
    icon: 'SignalIcon',
    title: 'Data Monitoring',
    desc: 'Pantau konsumsi energi, air, bahan bakar, dan limbah secara real-time. Integrasi dengan IoT sensor dan sistem ERP.',
    tag: 'Real-time',
    span: 'lg:col-span-1',
    accent: false,
  },
  {
    id: 'recommendation',
    icon: 'LightBulbIcon',
    title: 'AI Recommendations',
    desc: 'Sistem rekomendasi berbasis AI yang memberikan saran aksi konkret untuk meningkatkan skor ESG perusahaan Anda.',
    tag: 'AI-Powered',
    span: 'lg:col-span-1',
    accent: false,
  },
  {
    id: 'carbon',
    icon: 'CloudIcon',
    title: 'Carbon Footprint Tracking',
    desc: 'Lacak emisi Scope 1, 2, dan 3 secara komprehensif. Visualisasi jejak karbon dan progress menuju target net-zero Anda.',
    tag: 'Climate',
    span: 'lg:col-span-2',
    accent: false,
  },
  {
    id: 'csr',
    icon: 'HeartIcon',
    title: 'CSR Impact Tracking',
    desc: 'Ukur dampak nyata program CSR dengan metrik kuantitatif. Buat laporan dampak sosial yang meyakinkan untuk stakeholder.',
    tag: 'Social',
    span: 'lg:col-span-1',
    accent: false,
  },
];

export default function ProductSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.feat-card').forEach((el, i) => {
              setTimeout(() => el.classList.add('animate-fade-in-up'), i * 80);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="product"
      ref={sectionRef}
      className="py-20 px-6 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Platform Features
          </span>
          <h2 className="text-section-heading font-extrabold text-foreground mb-4">
            Semua yang Anda Butuhkan untuk{' '}
            <span className="gradient-text-primary">ESG Excellence</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Satu platform terintegrasi menggantikan puluhan alat terpisah dan konsultan mahal.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => (
            <div
              key={feat.id}
              className={`feat-card ${feat.span} ${
                feat.accent
                  ? 'pricing-highlight text-white rounded-2xl p-7 card-hover-lift cursor-pointer'
                  : 'glass-card rounded-2xl p-7 card-hover-lift cursor-pointer hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    feat.accent
                      ? 'bg-white/20' :'bg-primary/10'
                  }`}
                >
                  <Icon
                    name={feat.icon as any}
                    size={22}
                    className={feat.accent ? 'text-white' : 'text-primary'}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    feat.accent
                      ? 'bg-white/20 text-white' :'bg-primary/10 text-primary'
                  }`}
                >
                  {feat.tag}
                </span>
              </div>
              <h3
                className={`font-bold text-base mb-2 ${
                  feat.accent ? 'text-white' : 'text-foreground'
                }`}
              >
                {feat.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  feat.accent ? 'text-white/80' : 'text-muted-foreground'
                }`}
              >
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}