'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const problems = [
  {
    icon: 'CircleStackIcon',
    title: 'Data Operasional Tersebar',
    desc: 'Data dari berbagai divisi tersebar di spreadsheet berbeda, sulit diolah dan divalidasi secara konsisten.',
    color: 'text-primary',
    bg: 'bg-primary/8',
  },
  {
    icon: 'CurrencyDollarIcon',
    title: 'Biaya ESG Tinggi',
    desc: 'Implementasi ESG konvensional membutuhkan konsultan mahal dan proses yang panjang hingga berbulan-bulan.',
    color: 'text-secondary',
    bg: 'bg-secondary/8',
  },
  {
    icon: 'DocumentTextIcon',
    title: 'Laporan Keberlanjutan Mahal',
    desc: 'Penyusunan sustainability report membutuhkan biaya besar dan tenaga ahli yang tidak semua perusahaan miliki.',
    color: 'text-primary',
    bg: 'bg-primary/8',
  },
  {
    icon: 'ClipboardDocumentListIcon',
    title: 'Pencatatan Masih Manual',
    desc: 'Data listrik, air, bahan bakar, dan limbah masih dicatat manual — rentan error dan tidak real-time.',
    color: 'text-secondary',
    bg: 'bg-secondary/8',
  },
  {
    icon: 'ChartBarIcon',
    title: 'Dampak CSR Sulit Diukur',
    desc: 'Program CSR berjalan tanpa metrik yang jelas, sehingga sulit membuktikan dampak nyata kepada stakeholder.',
    color: 'text-primary',
    bg: 'bg-primary/8',
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.problem-card');
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('animate-fade-in-up');
              }, i * 100);
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
      id="problems"
      ref={sectionRef}
      className="py-20 px-6 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Pain Points
          </span>
          <h2 className="text-section-heading font-extrabold text-foreground mb-4">
            Tantangan ESG yang{' '}
            <span className="gradient-text-primary">Dihadapi Perusahaan</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Banyak perusahaan ingin memulai perjalanan ESG, namun terhambat oleh kompleksitas dan biaya yang tinggi.
          </p>
        </div>

        {/* Cards Grid — 5 cards: 3 top + 2 bottom centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.slice(0, 3).map((problem) => (
            <div
              key={problem.title}
              className="problem-card glass-card rounded-2xl p-7 card-hover-lift"
            >
              <div className={`w-12 h-12 rounded-xl ${problem.bg} flex items-center justify-center mb-5`}>
                <Icon name={problem.icon as any} size={22} className={problem.color} />
              </div>
              <h3 className="font-bold text-foreground text-base mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 lg:w-2/3 lg:mx-auto">
          {problems.slice(3).map((problem) => (
            <div
              key={problem.title}
              className="problem-card glass-card rounded-2xl p-7 card-hover-lift"
            >
              <div className={`w-12 h-12 rounded-xl ${problem.bg} flex items-center justify-center mb-5`}>
                <Icon name={problem.icon as any} size={22} className={problem.color} />
              </div>
              <h3 className="font-bold text-foreground text-base mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}