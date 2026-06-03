'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { costComparison } from './costComparison';
import { esgPillars } from './esgPillars';

const whyPoints = [
  { icon: 'BuildingLibraryIcon', text: 'Kepatuhan Regulasi OJK (POJK 51)' },
  { icon: 'TrophyIcon', text: 'Meningkatkan Skor ESG Perusahaan' },
  { icon: 'GlobeAltIcon', text: 'Otomasi Pelaporan Berkelanjutan' },
  { icon: 'ChartBarSquareIcon', text: 'Efisiensi Biaya Operasional' },
];

export default function AboutEsgSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.about-animate').forEach((el, i) => {
              setTimeout(() => el.classList.add('animate-fade-in-up'), i * 120);
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
      id="about-esg"
      ref={sectionRef}
      className="py-20 px-6 bg-background dot-pattern relative overflow-hidden"
    >
      <div className="blob-primary absolute w-96 h-96 top-0 right-0 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: ESG Pillars */}
          <div className="flex flex-col gap-6">
            <div className="about-animate">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                About ESG
              </span>
              <h2 className="text-section-heading font-extrabold text-foreground mb-4">
                Apa Itu{' '}
                <span className="gradient-text-primary">ESG</span> dan Mengapa
                Penting?
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                ESG (Environmental, Social, Governance) adalah kerangka kerja untuk mengukur
                keberlanjutan. PlanTropic mempermudah perusahaan melakukan transisi ini 
                dengan biaya yang jauh lebih terjangkau.
              </p>
            </div>

            <div className="about-animate flex flex-col gap-4">
              {esgPillars.map((pillar) => (
                <div key={pillar.letter} className="flex items-start gap-4 p-4 glass-card rounded-xl">
                  <div className={`w-10 h-10 rounded-lg ${pillar.bg} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-extrabold text-sm">{pillar.letter}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-1">{pillar.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Efficiency Comparison & Why ESG */}
          <div className="flex flex-col gap-6">
            {/* Why ESG Points */}
            <div className="about-animate glass-card rounded-2xl p-8 eco-glow">
              <h3 className="font-bold text-foreground text-lg mb-6">
                Keunggulan PlanTropic
              </h3>
              <div className="flex flex-col gap-4">
                {whyPoints.map((pt) => (
                  <div key={pt.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon name={pt.icon as any} size={18} className="text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{pt.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Efficiency Chart (GANTI DARI CHART LAMA) */}
            <div className="about-animate glass-card-dark rounded-2xl p-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
                Perbandingan Biaya Implementasi (Estimasi)
              </p>
              <div className="space-y-4">
                {costComparison.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span>{item.label}</span>
                      <span>{item.value === 85 ? 'Rp 500jt+' : 'Rp 25jt'}</span>
                    </div>
                    <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000 ease-out`} 
                        style={{ width: `${item.value}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                *Efisiensi biaya operasional mencapai 80-90% dibandingkan konsultan konvensional.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}

