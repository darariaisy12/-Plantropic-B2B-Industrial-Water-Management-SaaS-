'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const flowSteps = [
  { icon: 'GlobeAltIcon', label: 'Buka Website', color: 'bg-primary/10', iconColor: 'text-primary' },
  { icon: 'CreditCardIcon', label: 'Pilih Paket', color: 'bg-secondary/10', iconColor: 'text-secondary' },
  { icon: 'UserPlusIcon', label: 'Registrasi Akun', color: 'bg-primary/10', iconColor: 'text-primary' },
  { icon: 'BanknotesIcon', label: 'Pembayaran', color: 'bg-secondary/10', iconColor: 'text-secondary' },
  { icon: 'CheckBadgeIcon', label: 'Verifikasi', color: 'bg-primary/10', iconColor: 'text-primary' },
  { icon: 'StarIcon', label: 'Akun Premium Aktif', color: 'bg-secondary/10', iconColor: 'text-secondary' },
  { icon: 'RectangleGroupIcon', label: 'Akses Dashboard', color: 'bg-primary/10', iconColor: 'text-primary' },
  { icon: 'PencilSquareIcon', label: 'Input Data', color: 'bg-secondary/10', iconColor: 'text-secondary' },
  { icon: 'ChartPieIcon', label: 'ESG Score & Report', color: 'bg-primary/10', iconColor: 'text-primary' },
  { icon: 'ArrowDownTrayIcon', label: 'Download Laporan', color: 'bg-secondary/10', iconColor: 'text-secondary' },
];

export default function UserFlowSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.flow-step').forEach((el, i) => {
              setTimeout(() => el.classList.add('animate-fade-in-up'), i * 60);
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
      id="user-flow"
      ref={sectionRef}
      className="py-20 px-6 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            User Journey
          </span>
          <h2 className="text-section-heading font-extrabold text-foreground mb-4">
            Dari Kunjungan Pertama hingga{' '}
            <span className="gradient-text-primary">Laporan ESG Siap</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Alur yang sederhana, transparan, dan efisien — designed for corporate teams.
          </p>
        </div>

        {/* Flow Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative">
          {flowSteps.map((step, idx) => (
            <div
              key={step.label}
              className="flow-step relative flex flex-col items-center gap-3 text-center"
            >
              {/* Connector line */}
              {idx < flowSteps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(50%+22px)] w-[calc(100%-44px)] h-0.5 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 z-0" />
              )}

              <div
                className={`relative z-10 w-11 h-11 rounded-full ${step.color} flex items-center justify-center border-2 border-white shadow-sm`}
              >
                <Icon name={step.icon as any} size={18} className={step.iconColor} />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">{step.label}</span>
              <span className="text-[10px] font-bold text-muted-foreground">{String(idx + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>

        {/* Mobile: vertical flow */}
        <div className="md:hidden mt-4 flex flex-col gap-0">
          {flowSteps.map((step, idx) => (
            <div key={`m-${step.label}`} className="flex items-start gap-4 py-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center border-2 border-white shadow-sm shrink-0`}
                >
                  <Icon name={step.icon as any} size={16} className={step.iconColor} />
                </div>
                {idx < flowSteps.length - 1 && (
                  <div className="w-0.5 h-6 bg-border mt-1" />
                )}
              </div>
              <div className="pt-2">
                <span className="text-sm font-semibold text-foreground">{step.label}</span>
                <span className="block text-[10px] text-muted-foreground font-bold">Step {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}