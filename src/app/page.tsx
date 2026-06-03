import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import AboutEsgSection from './components/AboutEsgSection';
import ProductSection from './components/ProductSection';
import HowItWorksSection from './components/HowItWorksSection';
import UserFlowSection from './components/UserFlowSection';
import PricingSection from './components/PricingSection';
import BlogSection from './components/BlogSection';
import TestimonialSection from './components/TestimonialSection';
import ContactSection from './components/ContactSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <AboutEsgSection />
        <ProductSection />
        <HowItWorksSection />
        <UserFlowSection />
        <PricingSection />
        <TestimonialSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
