import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Arc Browser Split Pattern */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Left: Logo + tagline */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2.5">
              <AppLogo
                src="/assets/images/WhatsApp_Image_2026-05-21_at_07.14.10-1779374119124.jpeg"
                size={32}
                className="rounded-lg overflow-hidden"
              />
              <span className="font-bold text-lg tracking-tight text-foreground">Plantropic</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform ESG & Carbon Management cerdas untuk perusahaan berkelanjutan.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Icon name="GlobeAltIcon" size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Icon name="BuildingOfficeIcon" size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Icon name="CameraIcon" size={16} />
              </a>
            </div>
          </div>

          {/* Right: Links */}
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">Platform</span>
              <Link href="#product" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Product</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Pricing</Link>
              <Link href="#blog" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Blog</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">Company</span>
              <Link href="#about-esg" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">About Us</Link>
              <Link href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Contact</Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Careers</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">Legal</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Terms & Conditions</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Cookie Policy</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 Plantropic. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Making sustainability measurable.
          </p>
        </div>
      </div>
    </footer>
  );
}