/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Image as ImageIcon, SlidersHorizontal, CheckCircle, Search, Edit3, Save, X } from 'lucide-react';
import { GalleryItem } from '../types';

interface GalleryPathProps {
  galleryItems: GalleryItem[];
  onSelectImage: (item: GalleryItem) => void;
  isAdmin?: boolean;
  onUpdateGalleryItem?: (updatedItem: GalleryItem) => Promise<void>;
}

export default function GalleryPath({ galleryItems, onSelectImage, isAdmin, onUpdateGalleryItem }: GalleryPathProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Editing states
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<'bridal' | 'makeup' | 'hair' | 'skin' | 'nails' | 'mens'>('bridal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const categories = ['all', 'bridal', 'makeup', 'hair', 'skin', 'nails', 'mens'];

  const filteredItems = galleryItems.filter(item => {
    return activeCategory === 'all' || item.category === activeCategory;
  });

  const handleOpenEdit = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering full image zoom overlay
    setEditingItem(item);
    setEditTitle(item.title);
    setEditUrl(item.url);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setSaveError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !onUpdateGalleryItem) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const updated: GalleryItem = {
        ...editingItem,
        title: editTitle,
        url: editUrl,
        description: editDescription,
        category: editCategory,
      };

      await onUpdateGalleryItem(updated);
      setEditingItem(null);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update gallery portrait.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in text-left" id="gallery-path-view">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.4em] text-[#DDB93B] uppercase font-bold block">STUDIO PORTFOLIO</span>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#0F5232] tracking-widest font-semibold uppercase">The Art Gallery</h1>
        <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light max-w-2xl mx-auto leading-relaxed">
          Chronology of actual transformations styled in our chairs. Tap on any portrait to look at individual stylist notes, camera angles, and categories.
        </p>
        <div className="h-[2px] w-12 bg-[#DDB93B] mx-auto mt-4" />
      </div>

      {/* Categories Filter list */}
      <div className="flex flex-wrap gap-2.5 justify-center border-y border-white/5 py-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer border ${
              activeCategory === cat
                ? 'bg-[#DDB93B] border-transparent text-black'
                : 'text-gray-500 bg-transparent border-gray-200 hover:border-gray-500 hover:text-[#0F5232]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Photo grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelectImage(item)}
              className="bg-white border border-[#DDB93B]/20 overflow-hidden hover:border-[#DDB93B]/60 hover:shadow-lg cursor-pointer group transition-all rounded"
            >
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6 text-left">
                  <span className="text-[9px] uppercase tracking-widest text-[#DDB93B] font-black bg-black/60 px-2 py-1 align-top self-start">
                    {item.category}
                  </span>
                  
                  <div className="space-y-1.5 align-bottom">
                    <h3 className="font-serif-luxury text-lg text-white font-medium tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-white/80 font-light line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-mono font-bold block pt-1">
                      🔍 Tap To zoom & query stylist
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-white border-t border-[#DDB93B]/15">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-gray-700 font-semibold">{item.title}</span>
                  <span className="text-[8px] font-mono text-gray-500 uppercase pt-0.5">{item.id}</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => handleOpenEdit(item, e)}
                    className="py-1.5 px-3 bg-black border border-[#DDB93B]/50 text-[#DDB93B] hover:bg-[#DDB93B] hover:text-black hover:border-transparent text-[9px] uppercase font-bold tracking-widest transition-colors cursor-pointer inline-flex items-center gap-1 z-10"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white border border-[#DDB93B]/20 rounded">
          <p className="text-xs text-gray-500 font-mono">No actual photos exist in the category ledger.</p>
        </div>
      )}

      {/* Admin Elegant Modal for Portrait & Image Editing */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-[#DDB93B]/30 p-6 sm:p-8 relative rounded shadow-[0_0_80px_rgba(212,175,55,0.08)] my-8">
            <div className="absolute top-2 left-2 bottom-2 right-2 border border-[#DDB93B]/5 pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              <div className="text-left">
                <span className="text-[8px] tracking-[0.3em] text-[#DDB93B] uppercase font-bold block">admin console</span>
                <h4 className="font-serif-luxury text-lg text-[#0F5232] font-semibold uppercase tracking-wider">Edit Portrait & Image</h4>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-1 border border-gray-200 hover:border-[#DDB93B] text-gray-500 hover:text-[#DDB93B] cursor-pointer"
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
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block">Portrait Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-[#DDB93B]/35 px-3 py-2 text-[#1F2937] focus:outline-none focus:border-[#DDB93B] rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block">Image URL (Hosted Link)</label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full bg-white border border-[#DDB93B]/35 px-3 py-2 text-[#1F2937] focus:outline-none focus:border-[#DDB93B] rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full bg-white border border-[#DDB93B]/35 px-3 py-2 text-[#1F2937] focus:outline-none focus:border-[#DDB93B] h-[33px] cursor-pointer rounded-none"
                >
                  <option value="bridal">bridal</option>
                  <option value="makeup">makeup</option>
                  <option value="hair">hair</option>
                  <option value="skin">skin</option>
                  <option value="nails">nails</option>
                  <option value="mens">mens</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold block">Stylist Notes / Description</label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-white border border-[#DDB93B]/35 p-3 text-[#1F2937] focus:outline-none focus:border-[#DDB93B] resize-none rounded-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2 border border-gray-200 hover:border-[#DDB93B] text-gray-500 hover:text-[#DDB93B] text-[10px] uppercase font-bold tracking-widest cursor-pointer"
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
