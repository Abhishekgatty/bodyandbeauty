/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Check, Sparkles, Heart, Clock, Star } from 'lucide-react';

interface BridalPathProps {
  onBookBridal: (packageName: string, packagePrice: number) => void;
}

export default function BridalPath({ onBookBridal }: BridalPathProps) {
  const bridalPackages = [
    {
      name: "The Royal South Indian Bride",
      price: 18000,
      tag: "Best Seller",
      period: "Early slots (05:00 AM) included",
      specs: [
        "Traditional Silk Saree Draping with perfect pin geometry",
        "HD/Dewy moisture-proof bridal makeup mapping skin texture",
        "Classic hairstyle with heavy fresh Jasmine flower wrapping",
        "Jewelry alignment and authentic gold-plated temple sets setting",
        "Full pre-wedding makeup trial with Shubha (valued at ₹5,000)"
      ]
    },
    {
      name: "The Velvet Rajkumari Elegance",
      price: 22000,
      tag: "Ultra Luxury",
      period: "Two-turn draping & touchups",
      specs: [
        "Premium Airbrush long-lasting velvet skin finish",
        "Gold-plated heavy Lehenga draping with double-dupatta pin",
        "Romantic messy bun structure with premium hair accessories",
        "Rich smokey eyeshadow with hand-joined individual lashes",
        "Complimentary cellular gold facial 48 hours before marriage"
      ]
    },
    {
      name: "The Modern Indo-Western Glow",
      price: 15000,
      tag: "Minimalist Grace",
      period: "Trial included",
      specs: [
        "Semi-matte lightweight glass skin dermo-foundation art",
        "Contemporary high-fashion open-wave hair styling",
        "Designer gown / saree alignment",
        "Nude berry tones, metallic touch highlight strokes",
        "Includes bridesmaids styling advice consult"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 animate-fade-in text-left" id="bridal-path-view">
      
      {/* 1. Page Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.4em] text-[#DDB93B] uppercase font-bold block">ROYAL BRIDAL SANCTUARY</span>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#0F5232] tracking-widest font-semibold uppercase">The Bridal Heritage</h1>
        <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light max-w-2xl mx-auto leading-relaxed">
          Step into a bespoke journey of grace. Handcrafted wedding makeup configurations, gold-standard silk draping, and early morning custom alignments curated by Shubha.
        </p>
        <div className="h-[2px] w-12 bg-[#DDB93B] mx-auto mt-4" />
      </div>

      {/* 2. Brand Hero Image Section */}
      <div className="relative h-80 sm:h-[450px] overflow-hidden border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=1200" 
          alt="Luxury Bride Artwork" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 space-y-2 max-w-xl text-left">
          <span className="text-[10px] tracking-widest uppercase text-[#DDB93B] font-black block">EXQUISITE BRIDAL ATELIER</span>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl text-white font-semibold">Bridal Trials & Saree Geometry</h2>
          <p className="text-xs text-white/80 leading-relaxed font-light">
            We understand the weight of your special day. Our team coordinates early 05:00 AM wedding hair configurations, traditional jewelry pin setups, and flawless long-wear skin dermo-protection so you shine from dawn to twilight dinner sequences.
          </p>
        </div>
      </div>

      {/* 3. The Packages Section */}
      <div className="space-y-8">
        <div className="text-center sm:text-left">
          <h3 className="font-serif-luxury text-2xl text-gray-900 tracking-wider font-semibold uppercase">Signature Bridal Packages</h3>
          <p className="text-xs text-[#1F2937]/80 font-light">Inclusive of pre-session schedules and custom consultations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bridalPackages.map((pkg, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-[#DDB93B]/20 hover:border-[#DDB93B]/50 p-6 sm:p-8 flex flex-col justify-between transition-all relative overflow-hidden group rounded hover:shadow-lg"
            >
              <div className="space-y-6">
                {/* Package headers */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/40 px-2.5 py-1 border border-emerald-500/10 inline-block mb-2">
                      {pkg.tag}
                    </span>
                    <h4 className="font-serif-luxury text-lg text-[#0F5232] font-bold leading-tight group-hover:text-[#DDB93B] transition-colors">
                      {pkg.name}
                    </h4>
                  </div>
                </div>

                <div className="border-t border-white/5 py-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#DDB93B] block mb-1">Total Luxury Investment</span>
                  <span className="font-serif-luxury text-2xl text-[#0F5232] font-bold">
                    ₹{pkg.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#1F2937]/80 font-mono block mt-1">({pkg.period})</span>
                </div>

                {/* Checklist */}
                <ul className="space-y-3 pt-2 text-xs text-[#1F2937]/80 font-light">
                  {pkg.specs.map((item, specIdx) => (
                    <li key={specIdx} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-[#DDB93B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Booking CTAs */}
              <div className="pt-8 border-t border-white/5 mt-8">
                <button
                  onClick={() => onBookBridal(pkg.name, pkg.price)}
                  className="w-full py-3 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black hover:border-transparent text-[10px] uppercase font-black tracking-widest border border-[#DDB93B]/25 transition-all text-center cursor-pointer"
                >
                  Acquire Wedding Plan
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 4. Bridal Draping Mini-Knowledge-Share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0F5232] border border-[#DDB93B]/30 p-8 sm:p-12 items-center rounded">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#DDB93B] font-bold block">EXPERTISE DETAILS</span>
          <h3 className="font-serif-luxury text-2xl text-white font-semibold">Bridal Pleating & Draping Precision</h3>
          <p className="text-xs text-white/85 leading-relaxed font-light">
            Saree draping is not just pinning cloth; it is the study of pleat symmetry and wearer ergonomics. Led by Shubha, we calculate the exact pleat thickness of rich Kanjeevarams and hand-woven silks based on your shoulder height and walking style. 
          </p>
          <ul className="space-y-2 text-xs font-mono text-[#DDB93B]">
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-[#DDB93B]" />
              <span>Perfect anti-slip dual Dupatta pinning</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-[#DDB93B]" />
              <span>Waist belt weight distribution math</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-[#DDB93B]" />
              <span>Silk conservation alignment (zero canvas tearing)</span>
            </li>
          </ul>
        </div>
        <div className="h-64 sm:h-80 overflow-hidden border border-[#DDB93B]/20 relative">
          <img 
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800" 
            alt="Pleating geometry demonstration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>
      </div>

    </div>
  );
}
