/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, Scissors, Clock, ArrowRight, Edit3, Save, X } from 'lucide-react';
import { Service } from '../types';

interface ServicesPathProps {
  services: Service[];
  onSelectService: (service: Service) => void;
  isAdmin?: boolean;
  onUpdateService?: (updatedService: Service) => Promise<void>;
}

export default function ServicesPath({ services, onSelectService, isAdmin, onUpdateService }: ServicesPathProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing modal states
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDuration, setEditDuration] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('Makeup');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const categories = ['All', 'Bridal', 'Makeup', 'Hair', 'Skin', 'Nails', 'Mens'];

  const filteredServices = services.filter(svc => {
    const matchesCategory = activeCategory === 'All' || svc.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = svc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          svc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenEdit = (svc: Service, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details or selection
    setEditingService(svc);
    setEditName(svc.name);
    setEditPrice(svc.price);
    setEditDuration(svc.duration);
    setEditDescription(svc.description);
    setEditCategory(svc.category);
    setSaveError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !onUpdateService) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const updated: Service = {
        ...editingService,
        name: editName,
        price: Number(editPrice),
        duration: editDuration,
        description: editDescription,
        category: editCategory,
      };

      await onUpdateService(updated);
      setEditingService(null);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update custom service.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20" id="services-path-view">
      
      {/* Page Header */}
      <div className="text-center space-y-4 mb-16">
        <h1 className="font-serif text-5xl text-primary">Our Service Catalog</h1>
        <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Unlock tailor-made aesthetic treatments styled by Lead Specialist Shubha. From scientific biological dermo-care to ultra HD custom makeup finishes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border p-6 flex flex-col md:flex-row gap-6 justify-between items-center rounded-2xl shadow-sm mb-12">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-background text-text hover:bg-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-border px-4 py-3 rounded-lg text-sm text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute right-3 top-3 h-5 w-5 text-text-secondary" />
        </div>
      </div>

      {/* Services List Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((svc) => (
            <div 
              key={svc.id} 
              className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-xs font-medium text-secondary uppercase tracking-wider">
                  {svc.category}
                </span>
                
                <h3 className="font-serif text-2xl text-primary leading-tight">
                  {svc.name}
                </h3>
                
                <p className="text-text-secondary text-sm leading-relaxed">
                  {svc.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="h-4 w-4" />
                  <span>{svc.duration}</span>
                </div>
              </div>

              <div className="pt-8 flex justify-between items-center">
                <span className="font-serif text-2xl text-primary">
                  ₹{svc.price.toLocaleString('en-IN')}
                </span>

                <div className="flex gap-2">
                  {isAdmin && (
                    <button
                      onClick={(e) => handleOpenEdit(svc, e)}
                      className="p-2 border border-border rounded-lg text-text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => onSelectService(svc)}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium text-sm"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-section-bg rounded-2xl">
          <p className="text-text-secondary">No services match your query.</p>
        </div>
      )}

      {/* Footnote on customized services */}
      <div className="p-6 bg-black border border-[#DDB93B]/15 text-center text-xs text-gray-600 space-y-2">
        <span className="text-[#DDB93B] uppercase tracking-wide font-semibold block">Need Something Custom?</span>
        <p className="max-w-2xl mx-auto leading-relaxed">
          If you require bespoke packages, personalized chemical therapy, or on-location wedding styling, do not hesitate to schedule a free consult and detail your requirements inside the <strong>Appointment Notes</strong> panel.
        </p>
      </div>

      {/* Inline Elegant Modal for Admin Service Editing */}
      {editingService && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0b0f0b] border border-[#DDB93B]/40 p-6 sm:p-8 relative rounded-none shadow-[0_0_80px_rgba(212,175,55,0.15)] my-8">
            <div className="absolute top-2 left-2 bottom-2 right-2 border border-[#DDB93B]/5 pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <div className="text-left">
                <span className="text-[8px] tracking-[0.3em] text-[#DDB93B] uppercase font-bold block">admin console</span>
                <h4 className="font-serif-luxury text-lg text-white font-semibold uppercase tracking-wider">Edit Salon Service</h4>
              </div>
              <button 
                onClick={() => setEditingService(null)}
                className="p-1 border border-white/10 hover:border-[#DDB93B] text-gray-400 hover:text-[#DDB93B] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-left text-xs font-sans">
              {saveError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400">
                  {saveError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[#DDB93B] font-bold block">Service Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#DDB93B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#DDB93B] font-bold block">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#DDB93B] h-[33px] cursor-pointer"
                  >
                    <option value="Makeup">Makeup</option>
                    <option value="Hair">Hair</option>
                    <option value="Skin">Skin</option>
                    <option value="Nails">Nails</option>
                    <option value="Mens">Mens</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#DDB93B] font-bold block">Investment Fee (INR)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#DDB93B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[#DDB93B] font-bold block">Duration Buffer</label>
                <input
                  type="text"
                  required
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-full bg-black border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#DDB93B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[#DDB93B] font-bold block">Description</label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-[#DDB93B] resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-5 py-2 border border-white/10 hover:border-white/30 text-gray-300 text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0F5232] hover:bg-[#DDB93B] hover:text-black text-white text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
