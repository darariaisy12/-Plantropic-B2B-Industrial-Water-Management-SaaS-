'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const statsData = [
  { value: '92%', label: 'Akurasi Data ESG' },
  { value: '3x', label: 'Lebih Cepat' },
  { value: '60%', label: 'Hemat Biaya' },
];

const dashboardBars = [
  { label: 'Energi', pct: 72, color: 'bg-primary' },
  { label: 'Air', pct: 45, color: 'bg-secondary' },
  { label: 'Karbon', pct: 58, color: 'bg-primary/70' },
  { label: 'Limbah', pct: 33, color: 'bg-secondary/70' },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animEls = heroRef?.current?.querySelectorAll('.hero-animate');
    animEls?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden dot-pattern"
    >
      {/* Atmospheric blobs */}
      <div className="blob-primary absolute w-[600px] h-[600px] -top-32 -right-32 opacity-60 pointer-events-none" />
      <div className="blob-secondary absolute w-[400px] h-[400px] bottom-0 -left-20 opacity-40 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content — 6 cols */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-primary pulse-green" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                ESG Technology Platform
              </span>
            </div>

            <h1 className="hero-animate text-hero-xl font-extrabold text-foreground leading-[1.08]">
              Smart ESG &{' '}
              <span className="gradient-text-primary">Carbon Management</span>{' '}
              Platform for Sustainable Companies
            </h1>

            <p className="hero-animate text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg font-medium">
              Plantropic membantu perusahaan menghitung jejak karbon, menyusun
              data ESG, dan mengelola program keberlanjutan secara lebih cepat,
              murah, dan terdokumentasi.
            </p>

            <div className="hero-animate flex flex-wrap gap-4 mt-2">
              <Link
                href="#product"
                className="bg-primary text-primary-foreground font-bold px-7 py-3.5 rounded-full hover:bg-accent transition-all duration-300 hover:scale-105 eco-glow flex items-center gap-2 text-sm"
              >
                Try Demo
                <Icon name="PlayIcon" size={16} variant="solid" />
              </Link>
              <Link
                href="#pricing"
                className="border-2 border-primary text-primary font-bold px-7 py-3.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Stats Row */}
            <div className="hero-animate flex flex-wrap gap-6 mt-4 pt-4 border-t border-border">
              {statsData?.map((stat) => (
                <div key={stat?.label} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-extrabold text-primary">{stat?.value}</span>
                  <span className="text-xs text-muted-foreground font-semibold">{stat?.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Mockup — 6 cols */}
          <div className="lg:col-span-6 relative">
            {/* Main dashboard card */}
            <div className="hero-animate relative z-10 glass-card rounded-2xl p-6 eco-glow-strong float-animation">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground text-sm">ESG Dashboard</h3>
                  <p className="text-xs text-muted-foreground">PT. Nusantara Energi — Q1 2026</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-primary">Live</span>
                </div>
              </div>

              {/* ESG Score Ring */}
              <div className="flex items-center gap-6 mb-5">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--muted)" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke="var(--primary)" strokeWidth="8"
                      strokeDasharray="201" strokeDashoffset="50"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold text-primary leading-none">78</span>
                    <span className="text-[9px] font-bold text-muted-foreground">ESG Score</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    { label: 'Environmental', score: 82, color: 'bg-primary' },
                    { label: 'Social', score: 74, color: 'bg-secondary' },
                    { label: 'Governance', score: 79, color: 'bg-primary/70' },
                  ]?.map((item) => (
                    <div key={item?.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-24 font-semibold">{item?.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item?.color} rounded-full`}
                          style={{ width: `${item?.score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-foreground w-6 text-right">{item?.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="dashboard-card p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Emisi Karbon (tCO₂e)
                </p>
                <div className="flex items-end gap-2 h-16">
                  {dashboardBars?.map((bar) => (
                    <div key={bar?.label} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className={`w-full ${bar?.color} rounded-t-md transition-all duration-700`}
                        style={{ height: `${bar?.pct}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground font-semibold">{bar?.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating mini cards */}
            <div className="absolute -top-6 -left-6 z-20 dashboard-card px-4 py-3 float-animation-delayed hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="ArrowTrendingDownIcon" size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground">Karbon Turun</p>
                  <p className="text-[9px] text-primary font-bold">-18% bulan ini</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 z-20 dashboard-card px-4 py-3 float-animation-slow hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Icon name="DocumentCheckIcon" size={16} className="text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground">Report Ready</p>
                  <p className="text-[9px] text-secondary font-bold">GRI Standards ✓</p>
                </div>
              </div>
            </div>

            {/* Decorative blobs behind dashboard */}
            <div className="absolute inset-0 -z-10">
              <div className="blob-primary absolute w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}