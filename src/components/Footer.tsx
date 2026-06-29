/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, Mail, Clock, MapPin, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { UserProfile } from '../types';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenDiagnostics?: () => void;
  dbStatusMsg?: { type: 'success' | 'warn' | 'error'; message: string } | null;
  currentUser?: UserProfile | null;
}

export default function Footer({ onNavigate, onOpenDiagnostics, dbStatusMsg }: FooterProps) {
  return (
    // Footer Background: Charcoal Black #1F2937
    <footer className="bg-[#1F2937] border-t border-[#D8A24A33] pt-16 pb-8" id="footer-section">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Salon Branding & Motto */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2">
            {/* Logo size h-36 (144px) */}
            <Logo 
              variant="horizontal" 
              size="custom" 
              customSizeClass="h-36" 
              className="origin-left" 
            />
          </div>
          {/* Text: White #FFFFFF */}
          <p className="text-xs text-[#FFFFFF] font-light leading-relaxed">
            Bengaluru's premier address for bespoke luxury bridal art, state-of-the-art biological skincare, couture haircuts, and exclusive VIP club memberships. Directed by Shubha.
          </p>
        </div>

        {/* Categories / Shortcuts */}
        <div className="space-y-4 text-left">
          {/* Headings: Green #176B59 */}
          <h4 className="font-serif text-sm text-[#176B59] tracking-[0.2em] font-semibold uppercase">
            EXPERIENCES
          </h4>
          {/* Links: White #FFFFFF, Hover: Gold */}
          <ul className="space-y-2 text-xs font-light text-[#FFFFFF]">
            <li>
              <button onClick={() => onNavigate('services')} className="hover:text-[#D8A24A] hover:underline transition-all cursor-pointer">
                Premium Hair Therapeutics
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('bridal')} className="hover:text-[#D8A24A] hover:underline transition-all cursor-pointer">
                Royal Wedding HD Makeup
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('services')} className="hover:text-[#D8A24A] hover:underline transition-all cursor-pointer">
                Biological Gold Facials
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('membership')} className="hover:text-[#D8A24A] hover:underline transition-all cursor-pointer">
                VIP Elite Club Lounge
              </button>
            </li>
          </ul>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 text-left">
          <h4 className="font-serif text-sm text-[#176B59] tracking-[0.2em] font-semibold uppercase">
            SALON CYCLE
          </h4>
          <ul className="space-y-3.5 text-xs font-light text-[#FFFFFF]">
            <li className="flex items-center gap-2">
              {/* Icons in Gold #D8A24A */}
              <Clock className="h-4 w-4 text-[#D8A24A] shrink-0" />
              <span>Monday - Sunday: 09:30 AM - 08:30 PM</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#D8A24A] shrink-0 mt-0.5" />
              <span>Bridal Appointments start at 05:00 AM on request for wedding alignments.</span>
            </li>
          </ul>
        </div>

        {/* Directions Guideline */}
        <div className="space-y-4 text-left">
          <h4 className="font-serif text-sm text-[#176B59] tracking-[0.2em] font-semibold uppercase">
            STUDIO LOUNGE
          </h4>
          <ul className="space-y-3 text-xs font-light text-[#FFFFFF]">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#D8A24A] shrink-0 mt-1" />
              <span className="leading-relaxed">
                Roopashree Building, 1st Floor, Near Ganesha Temple Crossing, Sector B, Yelahanka Satellite Town, Bengaluru, Karnataka 560064
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#D8A24A]" />
              <a href="tel:+919876543210" className="hover:text-[#D8A24A] transition-all text-[#FFFFFF]">
                +91 98765 43210
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#D8A24A]" />
              <a href="mailto:shubha@roopashreesalon.com" className="hover:text-[#D8A24A] transition-all text-[#FFFFFF]">
                shubha@roopashreesalon.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar – Divider: semi-transparent gold, text: white */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[#D8A24A33] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#FFFFFF] font-mono">
        <div>
          © {new Date().getFullYear()} Roopashree Luxury Bridal Salon & Club Yelahanka. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Database status – matches new colors */}
          {/* <button 
            onClick={onOpenDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F2937]/50 border border-[#D8A24A33] hover:border-[#D8A24A] transition-all text-[9px] uppercase font-bold tracking-wider cursor-pointer text-[#FFFFFF] hover:text-[#D8A24A]"
            title="Check database sync status"
            id="footer-supabase-diagnostic-trigger"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${
              !dbStatusMsg 
                ? 'bg-gray-400 animate-pulse' 
                : dbStatusMsg.type === 'success' 
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                : dbStatusMsg.type === 'warn' 
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
                : 'bg-red-500 shadow-[0_0_8px_#f87171]'
            }`} />
            <span>Database: {!dbStatusMsg ? 'Offline Mode' : dbStatusMsg.type === 'success' ? 'Cloud Sync Live' : 'Action Required'}</span>
          </button> */}

          {/* <button 
            onClick={() => onNavigate('admin')} 
            className="hover:text-[#D8A24A] tracking-wider transition-all uppercase font-bold cursor-pointer text-[#FFFFFF]"
          >
            🔒 Administrative console
          </button> */}
        </div>
      </div>
    </footer>
  );
}