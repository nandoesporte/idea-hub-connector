import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import HeroSales from '@/components/landing/HeroSales';
import ServicesSection from '@/components/landing/ServicesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import PortfolioShowcase from '@/components/landing/PortfolioShowcase';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import WhatsAppFloat from '@/components/landing/WhatsAppFloat';

const Index = () => {
  return (
    <MainLayout fullWidth>
      <HeroSales />
      <ServicesSection />
      <HowItWorks />
      <PortfolioShowcase />
      <TestimonialsSection />
      <CTASection />
      <WhatsAppFloat />
    </MainLayout>
  );
};

export default Index;
