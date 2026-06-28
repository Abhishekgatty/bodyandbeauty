import React, { useState } from 'react';
import { ImageIcon, X, Edit } from 'lucide-react';
import { GalleryItem } from '../../types';
import { uploadImageToStorage, updateGalleryItem, removeGalleryItem } from '../../supabaseClient';

interface GalleryTabProps {
  galleryItems: GalleryItem[];
  setGalleryItems: (items: GalleryItem[]) => void;
  onRefreshData: () => Promise<void>;
}

export default function GalleryTab({
  galleryItems,
  setGalleryItems,
  onRefreshData
}: GalleryTabProps) {
  // Local Form states
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgTitle, setNewImgTitle] = useState('');
  const [newImgCategory, setNewImgCategory] = useState<'makeup' | 'hair' | 'nails' | 'skin' | 'mens' | 'bridal'>('makeup');
  const [newImgDesc, setNewImgDesc] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Local file drag states
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);

  // File change handler
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGalleryDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGalleryDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGalleryDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl || !newImgTitle) return;

    try {
      setIsSavingGallery(true);
      // Upload to Supabase Storage bucket if configured (falls back to base64 seamlessly)
      let finalUrl = newImgUrl;
      if (newImgUrl.startsWith('data:') && !newImgUrl.startsWith('data:image/svg+xml')) {
        finalUrl = await uploadImageToStorage(newImgUrl);
      }

      const targetId = editingItemId || ('gal-' + Date.now());
      const newItem: GalleryItem = {
        id: targetId,
        url: finalUrl,
        category: newImgCategory,
        title: newImgTitle,
        description: newImgDesc || 'Bespoke custom styling session result.'
      };

      if (editingItemId) {
        setGalleryItems(galleryItems.map(g => g.id === editingItemId ? newItem : g));
      } else {
        setGalleryItems([newItem, ...galleryItems]);
      }
      await updateGalleryItem(newItem);
      
      setEditingItemId(null);
      setNewImgUrl('');
      setNewImgTitle('');
      setNewImgDesc('');
      await onRefreshData();
    } catch (err) {
      console.error('Failed to save gallery item:', err);
    } finally {
      setIsSavingGallery(false);
    }
  };

  const handleStartEdit = (item: GalleryItem) => {
    setEditingItemId(item.id);
    setNewImgUrl(item.url);
    setNewImgTitle(item.title);
    setNewImgCategory(item.category);
    setNewImgDesc(item.description || '');

    // Scroll to form nicely
    const element = document.getElementById('admin-gallery-tab');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewImgUrl('');
    setNewImgTitle('');
    setNewImgCategory('makeup');
    setNewImgDesc('');
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (confirm('Delete this from public gallery?')) {
      setGalleryItems(galleryItems.filter(g => g.id !== id));
      await removeGalleryItem(id);
      await onRefreshData();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="admin-gallery-tab">
      
      {/* Add Gallery component */}
      <div className="bg-[#050805] border border-white/5 p-6 sm:p-8 space-y-6 text-left">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h3 className="font-serif-luxury text-lg text-white font-bold uppercase">
              {editingItemId ? 'Edit Style Portrait' : 'Add New Style Portrait'}
            </h3>
            <p className="text-xs text-gray-400">
              {editingItemId ? 'Modify details of this gallery reference photo.' : 'Inject actual bridal session portfolio references directly into the primary art gallery.'}
            </p>
          </div>
          {editingItemId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-black border border-gray-700 hover:border-white text-white text-[9px] uppercase font-bold tracking-widest cursor-pointer transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleAddGalleryItem} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold block">Portrait Image *</label>
            
            {/* Dropzone container */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('gallery-file-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center h-48 ${
                galleryDragActive 
                  ? 'border-[#DDB93B] bg-[#DDB93B]/5' 
                  : 'border-gray-700 bg-black hover:border-[#DDB93B]/60'
              }`}
              id="gallery-image-dropzone"
            >
              <input 
                type="file" 
                id="gallery-file-input"
                accept="image/*"
                onChange={handleGalleryFileChange}
                className="hidden"
              />

              {newImgUrl ? (
                <>
                  <img 
                    src={newImgUrl} 
                    alt="Style Preview" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewImgUrl('');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-600 rounded-full text-white transition-colors cursor-pointer"
                    title="Remove Image"
                    id="btn-remove-gallery-preview"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="space-y-2 pointer-events-none flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-[12px] text-gray-300">
                    <span className="font-bold text-[#DDB93B]">Click to browse</span> or drag & drop Portrait image
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">Supports PNG, JPG, WebP</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold block">Or Paste Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newImgUrl.startsWith('data:') ? '' : newImgUrl}
                onChange={(e) => setNewImgUrl(e.target.value)}
                className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Portfolio Portrait Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pastel Rose Bridal Glow"
              value={newImgTitle}
              onChange={(e) => setNewImgTitle(e.target.value)}
              className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Image Category *</label>
            <select
              value={newImgCategory}
              onChange={(e) => setNewImgCategory(e.target.value as any)}
              className="bg-black border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-[#DDB93B] w-full h-[33px] cursor-pointer"
            >
              <option value="bridal">bridal</option>
              <option value="makeup">makeup</option>
              <option value="hair">hair</option>
              <option value="skin">skin</option>
              <option value="nails">nails</option>
              <option value="mens">mens</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Styling Notes / Camera angles used *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe eyelashes brand, lipstick shade code, background lighting parameters..."
              value={newImgDesc}
              onChange={(e) => setNewImgDesc(e.target.value)}
              className="bg-black border border-gray-700 p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full resize-none font-sans"
            />
          </div>

          <div className="pt-2 sm:col-span-2 flex justify-end gap-2">
            {editingItemId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="py-2.5 px-6 border text-[10px] uppercase font-bold tracking-widest bg-black border-gray-700 text-gray-300 hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                Discard
              </button>
            )}
            <button
              type="submit"
              disabled={isSavingGallery}
              className={`py-2.5 px-6 border text-[10px] uppercase font-bold tracking-widest transition-all ${
                isSavingGallery
                  ? 'bg-gray-800 text-gray-400 border-gray-700 cursor-not-allowed animate-pulse'
                  : 'bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black border-[#DDB93B]/25 cursor-pointer'
              }`}
            >
              {isSavingGallery 
                ? 'Uploading & Saving...' 
                : editingItemId 
                  ? 'Save Changes' 
                  : 'Publish Portrait'}
            </button>
          </div>
        </form>
      </div>

      {/* Current Gallery items listing */}
      <div className="space-y-4 text-left">
        <h3 className="font-serif-luxury text-sm text-[#DDB93B] tracking-widest uppercase font-bold">Gallery Portraits in file</h3>
        
        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs font-sans">
            {galleryItems.map((item) => (
              <div key={item.id} className="bg-[#050805] border border-white/5 overflow-hidden flex flex-col justify-between hover:border-gray-800 transition-all text-left">
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-widest text-[#DDB93B] font-bold block">{item.category}</span>
                    <h4 className="text-white font-bold leading-normal text-xs font-serif-luxury line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono italic">Ref: {item.id}</p>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-1.5 border-t border-white/5 mt-2">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 px-2.5 bg-amber-950/20 text-amber-500 border border-amber-900/40 hover:bg-amber-900 hover:text-white transition-colors uppercase text-[9px] font-bold tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="p-1 px-2.5 bg-red-950/20 text-red-500 border border-red-900/40 hover:bg-red-900 hover:text-white transition-colors uppercase text-[9px] font-bold tracking-wider cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#070a07] border border-white/5 text-xs text-gray-500 font-mono">
            No gallery items published yet.
          </div>
        )}
      </div>

    </div>
  );
}
