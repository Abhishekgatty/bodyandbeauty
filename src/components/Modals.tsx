/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GalleryItem, BlogPost } from '../types';

interface LightboxModalProps {
  image: GalleryItem | null;
  onClose: () => void;
  onBookStylist: () => void;
}

export function LightboxModal({ image, onClose, onBookStylist }: LightboxModalProps) {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      id="lightbox-frame-overlay"
    >
      <div 
        className="max-w-3xl w-full bg-[#121212] border border-[#DDB93B]/50 rounded-none overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/85 hover:bg-[#0F5232] hover:text-white text-[#DDB93B] transition-colors border border-[#DDB93B]/30 cursor-pointer text-xs"
          id="lightbox-close-btn"
        >
          ✕
        </button>
        
        <img 
          src={image.url} 
          alt={image.title}
          className="w-full h-80 sm:h-[450px] object-cover"
        />
        
        <div className="p-6 space-y-2 border-t border-[#DDB93B]/20 bg-black/95 text-left">
          <span className="text-[10px] text-[#DDB93B] uppercase tracking-widest font-black block">
            Category: {image.category}
          </span>
          <h3 className="font-serif-luxury text-2xl text-white font-medium tracking-wide">
            {image.title}
          </h3>
          <p className="text-xs text-gray-300 font-light leading-relaxed">
            {image.description}
          </p>
          
          <div className="pt-4 flex justify-between items-center bg-transparent gap-4 flex-wrap">
            <span className="text-[9px] text-gray-400 uppercase font-mono tracking-widest">
              Live Portfolio Reference: {image.id}
            </span>
            <button
              onClick={onBookStylist}
              className="py-1.5 px-4 bg-[#0F5232] text-white text-[10px] uppercase font-bold tracking-widest border border-[#DDB93B]/25 hover:bg-[#DDB93B] hover:text-black transition-colors cursor-pointer"
            >
              Book Stylist Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BlogModalProps {
  blog: BlogPost | null;
  onClose: () => void;
  onReserveConsultation: () => void;
}

export function BlogModal({ blog, onClose, onReserveConsultation }: BlogModalProps) {
  if (!blog) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      id="blog-expanded-modal"
    >
      <div 
        className="max-w-2xl w-full bg-[#121212] border border-[#DDB93B]/30 my-8 relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-[#0F5232] hover:text-white text-[#DDB93B] border border-white/5 transition-colors z-10 cursor-pointer"
          id="blog-close-btn"
        >
          ✕
        </button>
        <div className="h-60 relative">
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#121212] p-6">
            <span className="text-[9px] uppercase tracking-widest font-black bg-black text-[#DDB93B] px-2.5 py-1">
              {blog.category}
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-3xl text-white mt-3 font-semibold tracking-wide">
              {blog.title}
            </h3>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4 max-h-[50vh] overflow-y-auto text-sm text-gray-300 leading-relaxed font-light scrollbar-thin">
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-mono pb-2 border-b border-white/5">
            <span>Published on: {blog.date}</span>
            <span>By: Shubha & Team</span>
          </div>
          <p className="whitespace-pre-line">
            {blog.content}
          </p>
          
          <div className="bg-[#0F5232]/10 p-4 border border-[#0F5232]/20 rounded-none text-xs text-center space-y-2 mt-8">
            <span className="text-[#DDB93B] font-semibold block uppercase tracking-widest">Free Consultation</span>
            <p className="text-white/95">Want customized color testing or skincare mapping? Book an appointment directly with Shubha in Yelahanka Satellite Town.</p>
            <button
              onClick={onReserveConsultation}
              className="py-1 px-4 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black hover:border-white border border-[#DDB93B]/25 text-[10px] uppercase font-bold tracking-widest transition-all mt-2 cursor-pointer"
            >
              Reserve Consultation
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-black/40 border-t border-white/5 text-center">
          <button
            onClick={onClose}
            className="py-1.5 px-6 border border-gray-800 hover:border-white text-gray-400 hover:text-white uppercase tracking-widest text-[10px] font-black cursor-pointer"
          >
            Return to Aesthetic Chronicles
          </button>
        </div>
      </div>
    </div>
  );
}

interface MembershipModalProps {
  membershipTitle: string | null;
  onClose: () => void;
  onReserveSession: () => void;
}

export function MembershipModal({ membershipTitle, onClose, onReserveSession }: MembershipModalProps) {
  if (!membershipTitle) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      id="enrolled-membership-overlay"
    >
      <div 
        className="max-w-md w-full bg-[#0F5232] border-2 border-[#DDB93B] p-8 text-center relative overflow-hidden rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4 text-center">🏆</div>
        <h3 className="font-serif-luxury text-2xl text-white font-medium text-center">Club Invitation Selected</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-[#DDB93B] block mt-1 font-bold text-center">
          {membershipTitle}
        </span>

        <p className="text-xs sm:text-sm text-white/90 font-light mt-4 leading-relaxed text-center">
          Wonderful selection! Your application to enroll inside the <span className="text-white font-semibold">{membershipTitle} Club</span> has been initiated. 
        </p>

        {/* Instructions card */}
        <div className="mt-6 p-4 bg-black/30 border border-[#DDB93B]/25 text-left text-xs space-y-3">
          <p className="font-bold text-white uppercase tracking-wider text-center border-b border-[#DDB93B]/10 pb-2 text-[#DDB93B]">Next Steps to claim membership:</p>
          <p className="text-white/95">1. Click <span className="text-white font-bold">"Reserve Session Now"</span> below to schedule your visit.</p>
          <p className="text-white/95">2. Type "<span className="text-white italic">Acquiring {membershipTitle} membership</span>" in the Appointment Notes section.</p>
          <p className="text-white/95">3. When you check in at our studio counter, your exclusive premium loyalty tags will be generated by Shubha.</p>
        </div>

        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="py-2.5 px-4 border border-white/20 text-white/80 hover:text-white hover:border-white text-[10px] uppercase font-bold tracking-widest cursor-pointer"
          >
            Close Invitation
          </button>
          <button
            onClick={onReserveSession}
            className="py-2.5 px-6 bg-[#DDB93B] text-[#0F5232] hover:bg-white hover:text-[#0F5232] border border-transparent text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
          >
            Reserve Session Now
          </button>
        </div>
      </div>
    </div>
  );
}
