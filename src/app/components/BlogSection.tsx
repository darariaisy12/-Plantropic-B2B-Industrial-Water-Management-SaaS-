'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const articles = [
  {
    tag: 'Regulasi ESG',
    title: 'Peluncuran ESG Reporting untuk Perusahaan Tercatat',
    excerpt:
      'Bursa Efek Indonesia (BEI) meluncurkan ESG Reporting melalui sistem SPE-IDXnet untuk mendorong penerapan aspek keberlanjutan dan transparansi data ESG di pasar modal.',
    author: 'Sekretariat Perusahaan',
    role: 'Bursa Efek Indonesia',
    date: '22 Jan 2025',
    readTime: '4 min read',
    img: "https://www.idx.co.id/media/h0hkvvuz/20250123.jpg",
    alt: 'Modern glass office building with green plants and sustainability certification plaques on bright sunny day',
    featured: true,
    link: 'https://www.idx.co.id/id/berita/berita/dda8be44-3ad9-ef11-b137-0050569d3b40' 
  },
  {
    tag: 'Data Emisi',
    title: 'Memahami Pentingnya Data Emisi dalam Konteks Bisnis',
    excerpt:
      'Pelaporan data emisi (Scope 1, 2, dan 3) bukan sekadar kewajiban administratif, melainkan basis pengambilan keputusan strategis untuk mencapai target iklim perusahaan.',
    author: 'Tim Editorial',
    role: 'Jejakin Climate Tech',
    date: '12 Feb 2025',
    readTime: '5 min read',
    img: "https://blog.qooling.com/wp-content/uploads/2024/01/Environmental-Compliance-Monitoring_-The-Role-of-a-QHSE-Platform-in-ESG-Management.jpg",
    alt: 'Wind turbines in green field with clear blue sky, renewable energy landscape',
    featured: false,
    link: 'https://www.jejakin.com/id/blog/emission-data-in-business-context'
  },
  {
    tag: 'ESG ROI',
    title: 'Cara Mengukur, Memaksimalkan, dan Membuktikan Return on Investment (ROI) Inisiatif ESG',
    excerpt:
      'Langkah taktis memfokuskan isu material dan menyelaraskan pelaporan dengan standar investor untuk membuktikan bahwa inisiatif keberlanjutan dapat menurunkan cost of capital.',
    author: 'Tim Konsultan',
    role: 'Elite Asia',
    date: '28 Jan 2025',
    readTime: '7 min read',
    img: "https://www.eliteasia.co/wp-content/uploads/2025/09/How-to-Measure-Maximise-and-Prove-the-ROI-of-ESG-Initiatives-1.jpg",
    alt: 'Financial data charts on computer screen in bright modern office with daylight',
    featured: false,
    link: 'https://www.eliteasia.co/wp-content/uploads/2025/09/How-to-Measure-Maximise-and-Prove-the-ROI-of-ESG-Initiatives-1.jpg'
  }
];

export default function BlogSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.blog-card').forEach((el, i) => {
              setTimeout(() => el.classList.add('animate-fade-in-up'), i * 100);
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
      id="blog"
      ref={sectionRef}
      className="py-20 px-6 bg-white">
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-14">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              Blog
            </span>
            <h2 className="text-section-heading font-extrabold text-foreground">
              Insights ESG &{' '}
              <span className="gradient-text-primary">Sustainability</span>
            </h2>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors shrink-0">
            
            Lihat Semua Artikel
            <Icon name="ArrowRightIcon" size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured article */}
          <a 
            href={articles?.[0]?.link}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-card block lg:col-span-2 glass-card rounded-2xl overflow-hidden card-hover-lift cursor-pointer group">
            <div className="relative h-56 overflow-hidden">
              <AppImage
                src={articles?.[0]?.img}
                alt={articles?.[0]?.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 66vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                {articles?.[0]?.tag}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-foreground text-lg mb-2 leading-tight group-hover:text-primary transition-colors">
                {articles?.[0]?.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{articles?.[0]?.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="UserCircleIcon" size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{articles?.[0]?.author}</p>
                    <p className="text-[10px] text-muted-foreground">{articles?.[0]?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
                  <span>{articles?.[0]?.date}</span>
                  <span>·</span>
                  <span>{articles?.[0]?.readTime}</span>
                </div>
              </div>
            </div>
          </a>

          {/* Side articles */}
          <div className="flex flex-col gap-5">
            {articles?.slice(1)?.map((article) =>
            <a
              key={article?.title}
              href={article?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="blog-card glass-card rounded-2xl overflow-hidden card-hover-lift cursor-pointer group flex gap-4 p-4">
              
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <AppImage
                  src={article?.img}
                  alt={article?.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="96px" />
                
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {article?.tag}
                    </span>
                    <h3 className="font-bold text-foreground text-sm mt-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {article?.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold mt-2">
                    <span>{article?.date}</span>
                    <span>·</span>
                    <span>{article?.readTime}</span>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
