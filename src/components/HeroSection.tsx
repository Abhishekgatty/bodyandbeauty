/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Compass, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onBookClick: () => void;
  onExploreClick: () => void;
}

export default function HeroSection({ onBookClick, onExploreClick }: HeroSectionProps) {
  return (
    <div className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0F5232]">
      
      {/* Immersive Dark Salon Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=100&w=1600&auto=format&fit=crop" 
          alt="Premium Salon Ambience"
          className="w-full h-full object-cover opacity-25 scale-105 filter blur-[0.5px] transition-transform duration-[10s] ease-out hover:scale-100"
        />
        {/* Artistic Gold Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxMiwgMTc1LCA1NSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-60"></div>
        {/* Luxury Emerald & Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071f14] via-[#0F5232]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f14]/80 via-transparent to-[#071f14]/80" />
        <div className="absolute inset-0 bg-radial-at-c from-[#DDB93B]/10 via-transparent to-transparent opacity-80" />
      </div>

      {/* Hero Core Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-16">
        
        {/* Animated Accent Sparkle */}
        <div className="inline-flex items-center gap-2 px-6 py-2 mb-6 border border-[#DDB93B]/40 bg-[#0F5232]/80 backdrop-blur-md rounded-full animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.15)]">
          <Sparkles className="h-4 w-4 text-[#DDB93B]" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-[#DDB93B]">
            Bengaluru's Elite Beauty Destination
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-[0.03em] leading-[1.1] mb-6">
          Elevate Your <br className="hidden sm:inline" />
          <span className="italic text-[#DDB93B] pr-2">Beauty Experience</span>
        </h1>

        {/* Hero Divider */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#DDB93B]/50" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-[#DDB93B] font-semibold">
            Hair • Skin • Nails • Makeup
          </span>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#DDB93B]/50" />
        </div>

        {/* Subtext */}
        <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-10">
          Discover the intersection of art and science in our premium Bengaluru sanctuary. Tailored grooming, skincare, and bridal expertise for the modern individual.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onBookClick}
            id="hero-cta-book"
            className="w-full sm:w-auto py-3.5 px-10 bg-[#DDB93B] text-[#0F5232] text-xs uppercase tracking-[0.2em] font-bold border border-white hover:bg-transparent hover:text-white hover:border-[#DDB93B] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer"
          >
            <span className="flex items-center gap-2 justify-center">
              <Calendar className="h-4 w-4" /> Book Appointment
            </span>
          </button>
          <button
            onClick={onExploreClick}
            id="hero-cta-services"
            className="w-full sm:w-auto py-3.5 px-10 bg-[#0F5232]/60 text-white text-xs uppercase tracking-[0.2em] font-bold border border-[#DDB93B] hover:bg-white hover:text-[#0F5232] transition-all duration-300 backdrop-blur-sm cursor-pointer"
          >
            <span className="flex items-center gap-2 justify-center">
              <Compass className="h-4 w-4" /> Explore Services
            </span>
          </button>
        </div>

        {/* Elite Signage */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-[#DDB93B]/25 max-w-4xl mx-auto text-left">
          {[
            { label: 'Dermatologist Approved', sub: 'O3+ & Clinical care' },
            { label: 'Expert Specialists', sub: 'Bengaluru\'s elite stylists' },
            { label: 'Gold Standard Hygiene', sub: 'Class 100 sterilization' },
            { label: 'Couture Consultations', sub: 'Bespoke customization' }
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <ShieldCheck className="h-5 w-5 text-[#DDB93B] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-serif text-white uppercase tracking-wider">{item.label}</p>
                <p className="text-[10px] text-gray-300 font-light mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
