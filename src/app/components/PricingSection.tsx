'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const plans = [
  {
    name: 'Starter',
    price: 'Rp5.000.000',
    period: '/tahun',
    desc: 'Untuk UKM dan perusahaan yang baru memulai perjalanan ESG.',
    popular: false,
    features: [
      'ESG Calculator dasar',
      'Dashboard analytics (read-only)',
      'Laporan ESG 1x/bulan',
      'Data monitoring: 3 kategori',
      'Support via email',
      'Up to 3 pengguna',
    ],
    cta: 'Mulai Gratis 14 Hari',
    ctaStyle: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  },
  {
    name: 'Professional',
    price: 'Rp15.000.000-25.000.000',
    period: '/tahun',
    desc: 'Untuk perusahaan menengah yang serius mengelola ESG secara komprehensif.',
    popular: true,
    features: [
      'ESG Calculator lengkap (GRI, SASB, TCFD)',
      'Dashboard analytics real-time',
      'Laporan ESG unlimited',
      'Data monitoring: semua kategori',
      'AI Recommendations',
      'Carbon Footprint Tracking',
      'CSR Impact Tracking',
      'Up to 15 pengguna',
      'Priority support',
    ],
    cta: 'Pilih Professional',
    ctaStyle: 'bg-white text-primary hover:bg-white/90',
  },
  {
    name: 'Enterprise',
    price: 'Rp50.000.000-150.000.000',
    period: '/tahun',
    desc: 'Untuk korporasi besar, BUMN, dan perusahaan publik dengan kebutuhan khusus.',
    popular: false,
    features: [
      'Semua fitur Professional',
      'Custom ESG framework',
      'Dedicated account manager',
      'On-premise deployment',
      'Integrasi ERP & IoT',
      'Audit support & consulting',
      'SLA 99.9% uptime',
      'Unlimited pengguna',
      'Training & onboarding',
    ],
    cta: 'Hubungi Sales',
    ctaStyle: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  },
];

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.price-card').forEach((el, i) => {
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
      id="pricing"
      ref={sectionRef}
      className="py-20 px-6 bg-background dot-pattern relative overflow-hidden"
    >
      <div className="blob-primary absolute w-96 h-96 top-0 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Pricing
          </span>
          <h2 className="text-section-heading font-extrabold text-foreground mb-4">
            Harga Transparan,{' '}
            <span className="gradient-text-primary">Nilai Nyata</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Mulai gratis selama 14 hari. Tidak ada biaya tersembunyi, tidak perlu kartu kredit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans?.map((plan) => (
            <div
              key={plan?.name}
              className={`price-card relative rounded-2xl overflow-hidden ${
                plan?.popular
                  ? 'pricing-highlight text-white eco-glow-strong scale-105 md:scale-105' :'glass-card'
              }`}
            >
              {plan?.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="p-7">
                <h3
                  className={`font-bold text-lg mb-1 ${
                    plan?.popular ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {plan?.name}
                </h3>
                <p
                  className={`text-xs leading-relaxed mb-5 ${
                    plan?.popular ? 'text-white/70' : 'text-muted-foreground'
                  }`}
                >
                  {plan?.desc}
                </p>

                <div className="flex items-end gap-1 mb-6">
                  <span
                    className={`text-3xl font-extrabold ${
                      plan?.popular ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {plan?.price}
                  </span>
                  {plan?.period && (
                    <span
                      className={`text-sm font-medium mb-1 ${
                        plan?.popular ? 'text-white/60' : 'text-muted-foreground'
                      }`}
                    >
                      {plan?.period}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3 mb-7">
                  {plan?.features?.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <Icon
                        name="CheckCircleIcon"
                        size={16}
                        variant="solid"
                        className={plan?.popular ? 'text-white/80 mt-0.5 shrink-0' : 'text-primary mt-0.5 shrink-0'}
                      />
                      <span
                        className={`text-sm font-medium ${
                          plan?.popular ? 'text-white/90' : 'text-foreground'
                        }`}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 ${plan?.ctaStyle}`}
                >
                  {plan?.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 font-medium">
          Semua harga belum termasuk PPN 11%. Pembayaran tahunan hemat 20%.
        </p>
      </div>
    </section>
  );
}