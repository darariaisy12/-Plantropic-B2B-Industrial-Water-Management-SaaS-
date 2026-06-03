'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about-esg' },
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('John Doe');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const name = localStorage.getItem('userName') || 'John Doe';
      setIsLoggedIn(loggedIn);
      setUserName(name);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-border py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="#home" className="flex items-center gap-2.5 group" onClick={handleNavClick}>
            <AppLogo
              src="/images/logo.png"
              size={36}
              className="rounded-lg overflow-hidden"
            />
            <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              Plantropic
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks?.map((link) => (
              <Link
                key={link?.label}
                href={link?.href}
                className="nav-link-underline text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300 pb-0.5"
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* CTA — Guest vs Logged In */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-full transition-all duration-200 hover:bg-green-50 border border-transparent hover:border-green-200"
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)' }}
                  >
                    {getInitials(userName)}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#1a2e1b' }}>
                    {userName}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ color: '#6b7280' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.96)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(57,123,64,0.15)',
                      boxShadow: '0 8px 32px rgba(57,123,64,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(57,123,64,0.1)' }}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)' }}
                        >
                          {getInitials(userName)}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#1a2e1b' }}>{userName}</p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>Plantropic Member</p>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard link */}
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-green-50"
                      style={{ color: '#374151' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#397b40' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50 border-t"
                      style={{ color: '#dc2626', borderColor: 'rgba(57,123,64,0.1)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-primary hover:text-accent transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="#pricing"
                  className="bg-primary text-primary-foreground text-sm font-bold px-5 py-2.5 rounded-full hover:bg-accent transition-all duration-300 hover:scale-105 eco-glow"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            suppressHydrationWarning
          >
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col pt-24 px-8 pb-8"
          onClick={(e) => e?.target === e?.currentTarget && setMenuOpen(false)}
        >
          <nav className="flex flex-col gap-6">
            {navLinks?.map((link) => (
              <Link
                key={link?.label}
                href={link?.href}
                onClick={handleNavClick}
                className="text-2xl font-bold text-foreground hover:text-primary transition-colors border-b border-border pb-4"
              >
                {link?.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                {/* Mobile user info */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(57,123,64,0.06)', border: '1px solid rgba(57,123,64,0.15)' }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #397b40 0%, #2d6233 100%)' }}
                  >
                    {getInitials(userName)}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1a2e1b' }}>{userName}</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Plantropic Member</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-center font-bold py-4 text-sm rounded-full transition-colors"
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleNavClick}
                  className="text-center font-semibold py-4 text-sm border rounded-full transition-colors"
                  style={{ color: '#397b40', borderColor: 'rgba(57,123,64,0.3)' }}
                >
                  Sign In
                </Link>
                <Link
                  href="#pricing"
                  onClick={handleNavClick}
                  className="bg-primary text-primary-foreground text-center font-bold py-4 rounded-full hover:bg-accent transition-colors"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}