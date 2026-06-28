/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ShieldCheck, Gem, GraduationCap, CheckCircle } from 'lucide-react';

interface MembershipPathProps {
  onSelectMembership: (membershipName: string) => void;
}

export default function MembershipPath({ onSelectMembership }: MembershipPathProps) {
  const tiers = [
    {
      name: "VIP Silver",
      price: 15000,
      period: "per year",
      icon: <Star className="h-6 w-6 text-gray-600" />,
      tagline: "Essential Styling Priorities",
      features: [
        "4 Comprehensive Keratin/Therapy hair sessions",
        "Preferred Booking slots with 24-hr priority buffer",
        "10% off on all additional custom dermal treatments",
        "Invitations to seasonal styling Masterclasses",
        "Custom beauty profile catalog tracked by Shubha"
      ]
    },
    {
      name: "Elite Gold",
      price: 35000,
      period: "per year",
      icon: <ShieldCheck className="h-6 w-6 text-[#DDB93B]" />,
      tagline: "The Bestselling Premium Circle",
      features: [
        "Monthly deep hair hygiene or hydra-pore therapies",
        "Unlimited custom precision haircuts & signature blow-dries",
        "Priority 05:00 AM booking access for wedding preparation",
        "Free pre-event trial and color testing session",
        "15% off on high-end luxury products and customized serums",
        "Reserved VIP chair access at our Yelahanka building"
      ]
    },
    {
      name: "Royal Platinum",
      price: 75000,
      period: "per year",
      icon: <Gem className="h-6 w-6 text-cyan-400" />,
      tagline: "The Sovereign Club Tier",
      features: [
        "Unlimited custom wash, scalp massage, and blowout sequences",
        "4 Gold-Foil Cellular facials or biological skin hydration treatments",
        "Direct Hotline sequence to Shubha and senior stylist allocations",
        "Unrestricted access to our luxury dressing trials lounge",
        "Complimentary family makeover pass (2 sessions per year)",
        "Signature custom scents prepared individually for your skin structure"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 animate-fade-in text-left" id="membership-path-view">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.4em] text-[#DDB93B] uppercase font-bold block">MEMBERSHIP PRIVILEGES</span>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#0F5232] tracking-widest font-semibold uppercase">The VIP Club Lounge</h1>
        <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light max-w-2xl mx-auto leading-relaxed">
          Incorporate healthy, high-end styling rituals. Gain guaranteed priority allocations, custom styling cabinets, and exclusive discounts at Body and Beauty Studio.
        </p>
        <div className="h-[2px] w-12 bg-[#DDB93B] mx-auto mt-4" />
      </div>

      {/* The Tiers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tiers.map((t, idx) => {
          const isGold = t.name === "Elite Gold";
          return (
            <div 
              key={idx} 
              className={`p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all group ${
                isGold 
                  ? 'bg-[#0F5232] border-2 border-[#DDB93B] gold-glow rounded shadow-xl' 
                  : 'bg-white border border-[#DDB93B]/20 hover:border-[#DDB93B]/50 rounded hover:shadow-lg'
              }`}
            >
              {isGold && (
                <div className="absolute top-0 right-0 bg-[#DDB93B] text-black text-[8px] uppercase tracking-widest font-black px-4 py-1">
                  Highly Appointed
                </div>
              )}

              <div className="space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-black/60 border border-white/15 h-12 w-12 flex items-center justify-center">
                    {t.icon}
                  </div>
                  <div>
                    <h3 className={`font-serif-luxury text-xl font-bold tracking-wide ${isGold ? 'text-white' : ''}`}>
                      {t.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono italic">
                      {t.tagline}
                    </p>
                  </div>
                </div>

                <div className="py-4 border-y border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">ANNUAL SELECTION</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-serif-luxury text-3xl text-[#DDB93B] font-bold">
                      ₹{t.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-500">/{t.period}</span>
                  </div>
                </div>

                {/* Features checklist */}
                <ul className="space-y-3.5 text-xs text-gray-500 font-light pt-2">
                  {t.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${isGold ? 'text-[#DDB93B]' : 'text-emerald-500'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-white/5 mt-8">
                <button
                  onClick={() => onSelectMembership(t.name)}
                  className={`w-full py-3 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer text-center ${
                    isGold 
                      ? 'bg-[#DDB93B] text-black hover:bg-white' 
                      : 'bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black border border-[#DDB93B]/25'
                  }`}
                  id={`membership-acquire-btn-${idx}`}
                >
                  Apply For {t.name} Entry
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
