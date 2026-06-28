/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Check, Send } from 'lucide-react';

export default function ContactPath() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userMsg) return;
    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setUserName('');
      setUserEmail('');
      setUserMsg('');
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 animate-fade-in text-left" id="contact-path-view">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.4em] text-[#DDB93B] uppercase font-bold block">SALON MAP & COORDINATES</span>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#0F5232] tracking-widest font-semibold uppercase">Studio Directions</h1>
        <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light max-w-2xl mx-auto leading-relaxed">
          Step into our serene, fully air-conditioned styling cabin in Bengaluru. Contact other clerical members or chat online for quick solutions.
        </p>
        <div className="h-[2px] w-12 bg-[#DDB93B] mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* 1. Contact Info Cards */}
        <div className="space-y-8">
          
          <div className="bg-white border border-[#DDB93B]/20 p-6 sm:p-8 space-y-4 rounded shadow-sm">
            <h3 className="font-serif-luxury text-xl text-[#0F5232] tracking-wide font-semibold uppercase">The Sovereign Address</h3>
            <div className="h-[1px] bg-white/10 w-full" />
            
            <div className="space-y-4 text-xs text-[#1F2937]/85 font-light leading-relaxed">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#DDB93B] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#0F5232] text-sm block font-serif-luxury">Body and Beauty Studio</strong>
                  Body and Beauty Studio, 1st Floor, Near Ganesha Temple Crossing, Sector B, Yelahanka Satellite Town, Bengaluru, Karnataka 560064.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#DDB93B]" />
                <p>📞 <strong className="text-[#0F5232]">Hotline:</strong> <a href="tel:+919876543210" className="hover:text-[#0F5232] transition-colors">+91 98765 43210</a></p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#DDB93B]" />
                <p>📨 <strong className="text-[#0F5232]">Professional Ledger:</strong> <a href="mailto:shubha@bodyandbeautystudio.com" className="hover:text-[#0F5232] transition-colors">shubha@bodyandbeautystudio.com</a></p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DDB93B]/20 p-6 sm:p-8 space-y-4 rounded shadow-sm">
            <h3 className="font-serif-luxury text-xl text-[#DDB93B] tracking-wide font-semibold uppercase">Operations Cycle</h3>
            <div className="h-[1px] bg-white/10 w-full" />
            
            <div className="space-y-4 text-xs font-light text-[#1F2937]/85">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[#0F5232]">Open Daily Continuous Slot</p>
                  <p>Monday - Sunday: 09:30 AM - 08:30 PM</p>
                  <p className="text-[10px] text-[#1F2937]/85 font-mono italic">Note: Bridal teams activate at 05:00 AM on request.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick interactive maps locator */}
          <div className="p-6 bg-[#0F5232]/10 border border-[#DDB93B]/35 space-y-3">
            <span className="text-[#DDB93B] text-[10px] font-mono uppercase tracking-widest block font-bold">💡 Driving landmarks:</span>
            <p className="text-xs text-[#1F2937] font-light leading-relaxed">
              We are situated right next to the landmark Ganesha Temple Junction. If you hit the Yelahanka Satellite Town bus stand, drive 2 minutes north towards Sector B crossing. Ample secure front parking is reserved for luxury customer sedans and family cars.
            </p>
          </div>

        </div>

        {/* 2. Customer message form */}
        <div className="bg-white border border-[#DDB93B]/20 p-6 sm:p-8 space-y-6 rounded shadow-sm">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-serif-luxury text-xl text-[#0F5232] tracking-widest font-semibold uppercase">The Inquiry Counter</h3>
            <p className="text-xs text-[#1F2937]/85 font-light mt-1">Inquire about wedding slots, custom keratin brands, or product compatibility.</p>
          </div>

          {msgSent ? (
            <div className="p-8 bg-[#031508] border border-[#DDB93B]/45 text-center space-y-4 animate-fade-in text-[#0F5232]">
              <p className="text-4xl text-center">📨</p>
              <h4 className="font-serif-luxury text-base text-[#DDB93B] font-semibold">Message Dispatched!</h4>
              <p className="text-xs text-[#1F2937]/85 leading-relaxed font-light">We have cached your inquiry on this device. Our front clerk of Sector B will call you with details shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-[#1F2937]/85 uppercase tracking-widest font-bold">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#0F5232] focus:outline-none focus:border-[#DDB93B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#1F2937]/85 uppercase tracking-widest font-bold">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#0F5232] focus:outline-none focus:border-[#DDB93B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#1F2937]/85 uppercase tracking-widest font-bold">Message Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ask about pricing trials, customized balayage formulas, or group packages..."
                  value={userMsg}
                  onChange={(e) => setUserMsg(e.target.value)}
                  className="w-full bg-black border border-gray-200 p-4 text-xs text-[#0F5232] focus:outline-none focus:border-[#DDB93B] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F5232] hover:bg-[#DDB93B] hover:text-black border border-[#DDB93B]/25 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer text-center flex items-center justify-center gap-2 text-[#0F5232]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Inquiry message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
