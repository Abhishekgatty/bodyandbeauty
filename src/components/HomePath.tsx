/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Calendar, BookOpen, Star, Scissors, Heart, ArrowRight, EyeOff } from 'lucide-react';
import { GalleryItem, BlogPost, BeforeAfterItem } from '../types';
import Logo from './Logo';
// @ts-ignore
import pavilionBg from '../assets/images/roopashree_bridal_bg_1782398433329.jpg';

interface HomePathProps {
  onNavigate: (page: string) => void;
  galleryItems: GalleryItem[];
  beforeAfterItems?: BeforeAfterItem[];
  blogPosts: BlogPost[];
  onSelectBlog: (blog: BlogPost) => void;
}

export default function HomePath({ onNavigate, galleryItems, beforeAfterItems = [], blogPosts, onSelectBlog }: HomePathProps) {
  const [showTransformations, setShowTransformations] = useState(false);
  const featuredGallery = galleryItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-text" id="home-path-view">
      
      {/* 1. LUXURY HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={pavilionBg} 
            alt="Luxury Salon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/60" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-primary tracking-tight font-medium">
            Enhance Your Beauty, <br /> Embrace Yourself
          </h1>
          <p className="text-lg text-text font-light max-w-2xl mx-auto leading-relaxed">
            Experience premium beauty & wellness services designed to bring out the best in you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => onNavigate('appointment')}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer font-medium"
            >
              Book Appointment
            </button>
            <button
              onClick={() => onNavigate('services')}
              className="px-8 py-3 bg-white text-secondary border border-secondary rounded-lg hover:bg-secondary hover:text-white transition-all cursor-pointer font-medium"
            >
              Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-4xl text-primary">Our Services</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">Pamper yourself with our wide range of beauty & wellness services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Hair Therapeutics', desc: 'Dermatological bond reconstruction, precision shear cuts.', icon: Scissors },
            { title: 'Royal Bridal Glam', desc: 'Ultra-high definition makeup, premium bridal styling.', icon: Heart },
            { title: 'VIP Lounge Club', desc: 'Yearly membership benefits, priority queues, custom loyalty.', icon: Star }
          ].map((service, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all group">
              <service.icon className="h-10 w-10 text-primary mb-6" />
              <h3 className="font-serif text-xl text-primary mb-3">{service.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">{service.desc}</p>
              <button 
                onClick={() => onNavigate(index === 1 ? 'bridal' : 'services')} 
                className="text-primary font-medium hover:text-secondary transition-colors"
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BLOG / CTA SECTION (Alternate background) */}
      <section className="py-20 bg-section-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-4xl text-primary">Skin Science Chronicles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((blog) => (
              <div key={blog.id} className="bg-white p-6 rounded-2xl shadow-sm border border-border flex gap-6 hover:shadow-lg transition-all">
                <img src={blog.image} alt={blog.title} className="w-32 h-32 rounded-lg object-cover" />
                <div className="flex flex-col justify-center space-y-2">
                  <h3 className="font-serif text-lg text-primary">{blog.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">{blog.excerpt}</p>
                  <button onClick={() => onSelectBlog(blog)} className="text-primary text-sm font-medium hover:text-secondary self-start">Read More</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GALLERY SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto" id="before-after-gallery-section">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-4xl text-primary">Before & After Gallery</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">Witness the spectacular real-life client transformations crafted by our luxury beauty experts.</p>
        </div>
        
        {!showTransformations ? (
          /* High-Fidelity Lookbook Cover Card */
          <div className="max-w-2xl mx-auto">
            <div 
              onClick={() => setShowTransformations(true)}
              id="transformation-lookbook-card"
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 p-8 sm:p-12 text-center space-y-6 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-secondary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-3xl text-primary font-medium">Aura Transformation Lookbook</h3>
                <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
                  Explore our authentic real-life client portfolios. Tap to view detailed side-by-side skin, hair, and makeup transformations.
                </p>
              </div>
              <div className="pt-2">
                <button 
                  id="btn-reveal-transformations"
                  className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/95 transition-all font-medium text-sm inline-flex items-center gap-2 group-hover:translate-y-[-2px]"
                >
                  Explore Transformations <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Live Transformations List with a Collapse Button */
          <div className="space-y-12">
            {beforeAfterItems.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {beforeAfterItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col justify-between group transition-all hover:shadow-md duration-300">
                    
                    {/* Side-by-side Image Panel */}
                    <div className="grid grid-cols-2 gap-0.5 bg-border relative h-72 sm:h-80 overflow-hidden">
                      
                      {/* Before Picture */}
                      <div className="relative h-full overflow-hidden">
                        <img 
                          src={item.before_url} 
                          alt="Before Transformation" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-black/75 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded shadow uppercase">
                          Before
                        </div>
                      </div>

                      {/* After Picture */}
                      <div className="relative h-full overflow-hidden">
                        <img 
                          src={item.after_url} 
                          alt="After Transformation" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 bg-secondary text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded shadow uppercase">
                          After
                        </div>
                      </div>

                    </div>

                    {/* Info Text panel */}
                    <div className="p-6 space-y-2 text-left">
                      <h3 className="font-serif text-xl text-primary font-medium">{item.title}</h3>
                      <p className="text-text-secondary text-sm font-light leading-relaxed">
                        {item.description}
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <span>Published: {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-border rounded-2xl text-text-secondary text-sm font-light">
                No transformations added yet. Check back soon!
              </div>
            )}

            {/* Collapse Lookbook Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setShowTransformations(false);
                  document.getElementById('before-after-gallery-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2.5 border border-border text-text-secondary hover:text-primary hover:border-primary/30 rounded-lg text-xs font-medium tracking-wider uppercase inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <EyeOff className="h-4 w-4" /> Collapse Gallery
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. TESTIMONIALS SECTION (Alternate Background) */}
      <section className="py-20 bg-section-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-4xl text-primary">Client Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Priya S.', text: 'Amazing service! My skin feels rejuvenated.' },
              { name: 'Ananya R.', text: 'Best bridal makeover in Yelahanka.' },
              { name: 'Megha K.', text: 'Extremely professional and luxurious.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center text-center space-y-4">
                <p className="text-text-secondary italic leading-relaxed">"{testimonial.text}"</p>
                <p className="font-serif text-primary font-bold">{testimonial.name}</p>
                <div className="flex gap-1 text-secondary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className="py-20 px-6">
        <div className="bg-primary text-white rounded-2xl p-16 text-center space-y-6">
          <h2 className="font-serif text-4xl">Ready to Transform Yourself?</h2>
          <p className="text-white/80 max-w-lg mx-auto">Book your appointment today & let us take care of you.</p>
          <button 
            onClick={() => onNavigate('appointment')}
            className="px-8 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all font-medium"
          >
            Book Appointment
          </button>
        </div>
      </section>

    </div>
  );
}
