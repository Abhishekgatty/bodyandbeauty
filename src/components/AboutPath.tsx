/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Shield, Sparkles, Coffee } from 'lucide-react';

export default function AboutPath() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-24 animate-fade-in">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs text-[#DDB93B] uppercase tracking-[0.3em] font-semibold block">About Our Salon</span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#0F5232] font-medium">Understated Elegance & Legacy</h1>
        <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light leading-relaxed">
          Body and Beauty Studio represents the pinnacle of premium wellness, cosmetology, and bridal design located in Bengaluru.
        </p>
      </div>

      {/* Brand Story block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#DDB93B] font-mono font-bold block">The Narrative</span>
          <h3 className="font-serif text-3xl text-[#0F5232] font-medium">Bespoke Hospitality since Inception</h3>
          <p className="text-sm text-[#1F2937] font-light leading-relaxed">
            Founded in Bengaluru with a core paradigm to integrate high-frequency dermatological-safe practices with artistic hairdressing, **Body and Beauty Studio** has blossomed into an exclusive sanctuary for corporate leaders, consultants, and brides who reject the generic.
          </p>
          <p className="text-sm text-[#1F2937]/80 font-light leading-relaxed">
            Our premises is meticulously customized to prioritize safety, sterile autoclave procedures for nail art, and a relaxing cafe-quality hospitality feel that invites you to detoxify the mind while celebrating style.
          </p>
        </div>
        <div className="p-1 sm:p-2 bg-gradient-to-tr from-[#DDB93B]/50 to-transparent">
          <img 
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop" 
            alt="Elite Styling Zone" 
            className="w-full h-80 object-cover opacity-80"
          />
        </div>
      </div>

      {/* Mission & Vision grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-[#DDB93B]/20 p-10 relative rounded shadow-sm">
          <span className="text-3xl font-serif text-[#DDB93B]/35 absolute right-6 top-6">★</span>
          <h4 className="font-serif text-2xl text-[#0F5232] font-medium mb-3">Our Dedicated Mission statement</h4>
          <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light leading-relaxed">
            To deliver premium, safe, and highly personalized beauty experiences. We blend elite cosmetology tech with authentic hospitality to guarantee every guest feels unique, prioritized, and pristine.
          </p>
        </div>
        <div className="bg-white border border-[#DDB93B]/20 p-10 relative rounded shadow-sm">
          <span className="text-3xl font-serif text-[#DDB93B]/35 absolute right-6 top-6">★</span>
          <h4 className="font-serif text-2xl text-[#0F5232] font-medium mb-3">Our Vision of the Future</h4>
          <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light leading-relaxed">
            To remain the most trusted premium salon brand in Yelahanka and wider Bengaluru. We inspire sustainable aesthetics by collaborating with global brands that respect skin biology and hair biology.
          </p>
        </div>
      </div>

      {/* Founder Section on Shubha */}
      <div className="bg-[#0F5232]/10 border border-[#DDB93B]/25 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="text-center space-y-4">
          <div className="h-44 w-44 rounded-full border-2 border-[#DDB93B] overflow-hidden mx-auto bg-[#141514] flex items-center justify-center">
            <span className="text-5xl">👑</span>
          </div>
          <div>
            <h4 className="font-serif text-xl text-[#0F5232] font-bold">Shubha</h4>
            <p className="text-[10px] text-[#DDB93B] uppercase tracking-widest font-mono mt-0.5">Principal Founder & Master Stylist</p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#DDB93B]">The Founder's Message</span>
          <p className="text-sm text-[#1F2937] font-light leading-relaxed">
            "At Body and Beauty Studio, we treat hairdressing, nail sculpture, and skin therapy as forms of artistic translation. True beauty isn't painted on; it is unleashed. My curated workspace ensures that only safe, elite-grade products are used, wrapped in a peaceful, luxury hospitality environment that feels like home."
          </p>
          <div className="flex gap-4 pt-2">
            <div className="text-xs text-gray-500 border-r border-[#DDB93B]/35 pr-4">
              <span className="text-lg font-serif font-black text-[#0F5232] block">15+</span> Years Industry Craft
            </div>
            <div className="text-xs text-gray-500 border-r border-[#DDB93B]/35 pr-4">
              <span className="text-lg font-serif font-black text-[#0F5232] block">500+</span> Bridal Makeovers Completed
            </div>
            <div className="text-xs text-gray-500">
              <span className="text-lg font-serif font-black text-[#0F5232] block">Certified</span> by London Hair Academy
            </div>
          </div>
        </div>
      </div>

      {/* Salon Zones Highlights */}
      <div className="space-y-12">
        <div className="text-center">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Premium Zoning</span>
          <h3 className="font-serif text-3xl text-[#0F5232] font-medium mt-1">Studio Premise Highlights</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Dedicated Bridal Lounge', icon: Heart, desc: 'A secluded private chamber designed with professional theater vanity mirrors, custom gown hanging rails, and espresso bar access.' },
            { title: 'Facial Treatment Rooms', icon: Shield, desc: 'Clinically sterile facial environments equipped with advanced hydra peels, micro-mist steamers, and cellular recovery instruments.' },
            { title: 'Elite Nail Bar', icon: Sparkles, desc: 'Spacious high-comfort workstations featuring autoclave dry-heat sterilizer drawers for every file and gemstone drill accessory.' },
            { title: 'Gourmet Refreshment Lounge', icon: Coffee, desc: 'Indulge in freshly brewed standard filter coffees, green teas, or organic mineral infusions while our stylists execute color transformations.' }
          ].map((item, id) => (
            <div key={id} className="bg-white border border-[#DDB93B]/20 p-6 hover:border-[#DDB93B] transition-colors rounded">
              <item.icon className="h-6 w-6 text-[#DDB93B] mb-4" />
              <h5 className="font-serif text-sm font-semibold tracking-wide text-[#0F5232] mb-2">{item.title}</h5>
              <p className="text-xs text-gray-500 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
