/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Phone, MapPin, Zap, MessageSquare } from 'lucide-react';

export default function FloatingWidgets() {
  const [showLocText, setShowLocText] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
      {/* Location overlay panel */}
      {showLocText && (
        <div className="bg-white border border-[#DDB93B] p-4 text-xs max-w-xs text-left animate-fade-in shadow-2xl space-y-2 text-[#1F2937] rounded">
          <p className="font-serif-luxury font-bold text-[#DDB93B] uppercase tracking-wider">STUDIO LOCATION:</p>
          <p className="leading-relaxed">
            Body and Beauty Studio, 1st Floor, Near Ganesha Temple Crossing, Sector B, Yelahanka Satellite Town, Bengaluru, Karnataka 560064.
          </p>
          <div className="h-[1px] bg-white/10 w-full" />
          <p className="text-[10px] text-[#1F2937]/70 font-mono">Open Daily: 09:30 AM - 08:30 PM</p>
        </div>
      )}

      {/* Location MapPin dynamic widget */}
      <button
        onClick={() => setShowLocText(!showLocText)}
        className="w-12 h-12 bg-white border border-[#DDB93B]/30 text-gray-900 flex items-center justify-center hover:border-[#DDB93B] transition-all cursor-pointer group rounded shadow-sm"
        title="View Salon Address Guide"
        id="widget-address-btn"
      >
        <MapPin className="h-5 w-5 group-hover:scale-110 transition-transform text-[#DDB93B]" />
      </button>

      {/* Floating Call Hotline */}
      <a
        href="tel:+919876543210"
        className="w-12 h-12 bg-[#0F5232] text-white flex items-center justify-center hover:bg-[#DDB93B] hover:text-black transition-all cursor-pointer group border border-[#DDB93B]/30"
        title="Call Luxury Hotline"
        id="widget-call-btn"
      >
        <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </a>

      {/* Floating WhatsApp chat */}
      <a
        href="https://wa.me/919876543210?text=Hello%20Body%20and%20Beauty%20Studio!%20I%20would%20like%20to%20inquire%20about%20bridal/styling%20service%20availability."
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all cursor-pointer group border border-emerald-400/25 relative"
        title="Chat on WhatsApp"
        id="widget-whatsapp-btn"
      >
        <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DDB93B] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DDB93B]"></span>
        </span>
      </a>
    </div>
  );
}
