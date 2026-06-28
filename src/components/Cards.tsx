/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Clock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Service, Membership, Testimonial } from '../types';

// ==================== FEATURE CARD ====================
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-[#F9FBF9]/90 backdrop-blur-sm border border-[#DDB93B]/20 p-8 hover:border-[#DDB93B]/60 transition-all duration-500 group relative overflow-hidden">
      {/* Decorative Gold Glow accent on hover */}
      <div className="absolute top-0 right-0 h-16 w-16 bg-[#DDB93B]/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
      
      <div className="mb-5 inline-block p-3.5 bg-gray-100 text-[#DDB93B] border border-[#DDB93B]/35 group-hover:bg-[#DDB93B] group-hover:text-[#0F5232] group-hover:border-[#DDB93B] transition-all duration-300">
        {icon}
      </div>
      <h3 className="font-serif text-xl text-gray-900 tracking-wide font-medium mb-3 group-hover:text-[#DDB93B] transition-colors">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ==================== SERVICE CARD ====================
interface ServiceCardProps {
  key?: React.Key;
  service: Service;
  onBookClick: (svcId: string, svcName: string) => void;
}

export function ServiceCard({ service, onBookClick }: ServiceCardProps) {
  return (
    <div className="bg-[#F9FBF9]/90 backdrop-blur-sm border border-[#DDB93B]/20 p-6 hover:border-[#DDB93B]/60 transition-all duration-300 flex flex-col justify-between group h-full">
      <div>
        <div className="flex justify-between items-start gap-3 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-[#DDB93B] bg-[#DDB93B]/15 px-2.5 py-1 font-medium border border-[#DDB93B]/25">
            {service.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="h-3.5 w-3.5 text-[#DDB93B]" />
            <span>{service.duration}</span>
          </div>
        </div>
        
        <h4 className="font-serif text-lg text-gray-900 font-medium tracking-wide mt-3 group-hover:text-[#DDB93B] transition-colors">
          {service.name}
        </h4>
        
        <p className="text-xs text-gray-600 font-light mt-2 line-clamp-3 leading-relaxed">
          {service.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#DDB93B]/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Price</span>
          <span className="text-xl font-serif text-[#DDB93B] font-bold">
            ₹{service.price.toLocaleString('en-IN')}
          </span>
        </div>
        
        <button
          onClick={() => onBookClick(service.id, service.name)}
          className="py-2 px-4 bg-transparent text-[#DDB93B] hover:bg-[#DDB93B] hover:text-[#0F5232] text-xs font-semibold uppercase tracking-widest border border-[#DDB93B] transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
        >
          Reserve <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ==================== TESTIMONIAL CARD ====================
interface TestimonialCardProps {
  key?: React.Key;
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-[#F9FBF9]/90 border border-[#DDB93B]/20 p-8 backdrop-blur-sm hover:border-[#DDB93B]/60 transition-all duration-300 flex flex-col justify-between h-full relative">
      <div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[#DDB93B] text-[#DDB93B]" />
          ))}
        </div>
        
        {/* Quote Block */}
        <p className="text-sm text-gray-700 italic font-light leading-relaxed mb-6">
          "{testimonial.comment}"
        </p>
      </div>

      <div className="pt-4 border-t border-[#DDB93B]/15 flex justify-between items-center bg-transparent">
        <div>
          <h5 className="font-serif text-sm font-semibold tracking-wide text-[#DDB93B]">
            {testimonial.name}
          </h5>
          <p className="text-[11px] text-gray-600 uppercase tracking-wider mt-0.5">
            {testimonial.role}
          </p>
        </div>
        <span className="text-[10px] text-gray-600 uppercase font-mono tracking-widest">
          {testimonial.date}
        </span>
      </div>
    </div>
  );
}

// ==================== MEMBERSHIP CARD ====================
interface MembershipCardProps {
  key?: React.Key;
  membership: Membership;
  onApplyClick: (title: string) => void;
}

export function MembershipCard({ membership, onApplyClick }: MembershipCardProps) {
  return (
    <div className={`bg-[#F9FBF9]/90 backdrop-blur-sm border-2 p-8 flex flex-col justify-between h-full relative group transition-all duration-500 ${
      membership.popular 
        ? 'border-[#DDB93B] shadow-[0_15px_40px_rgba(212,175,55,0.15)] scale-102 z-10' 
        : 'border-[#DDB93B]/20 hover:border-[#DDB93B]/60'
    }`}>
      
      {/* Popular Badge */}
      {membership.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#DDB93B] text-[#0F5232] text-[9px] uppercase tracking-[0.3em] font-black py-1 px-5 shadow-lg border border-white">
          Most Prominent Selection
        </span>
      )}

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="h-4.5 w-4.5 text-[#DDB93B]" />
          <h3 className="font-serif text-2xl tracking-wide font-normal text-gray-900">
            {membership.title}
          </h3>
        </div>
        
        <div className="my-6">
          <span className="text-3xl font-serif font-bold text-[#DDB93B]">₹{membership.price.toLocaleString('en-IN')}</span>
          <span className="text-xs text-gray-600 font-light ml-2">/ {membership.billing}</span>
        </div>

        {/* Benefits divider */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#DDB93B] mb-4">Included Royal Benefits</p>
        
        <ul className="space-y-3 mb-8">
          {membership.benefits.map((benefit: string, i: number) => (
            <li key={i} className="flex gap-2.5 items-start text-xs text-gray-700 font-light leading-snug">
              <Check className="h-4 w-4 text-[#DDB93B] shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onApplyClick(membership.title)}
        id={`auth-membership-btn-${membership.title.toLowerCase().replace(/\s+/g, '-')}`}
        className={`w-full py-3 text-xs uppercase tracking-widest font-black transition-all duration-300 border cursor-pointer ${
          membership.popular
            ? 'bg-[#DDB93B] text-[#0F5232] border-white hover:bg-transparent hover:text-gray-900'
            : 'bg-transparent text-[#DDB93B] border-[#DDB93B] hover:bg-[#DDB93B] hover:text-[#0F5232]'
        }`}
      >
        Acquire Club Membership
      </button>

    </div>
  );
}
