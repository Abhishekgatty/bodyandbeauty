import React, { useState } from 'react';
import { ImageIcon, X, Edit } from 'lucide-react';
import { BeforeAfterItem } from '../../types';
import { uploadImageToStorage, updateBeforeAfterItem, removeBeforeAfterItem } from '../../supabaseClient';

interface TransformationsTabProps {
  beforeAfterItems: BeforeAfterItem[];
  setBeforeAfterItems?: (items: BeforeAfterItem[]) => void;
  onRefreshData: () => Promise<void>;
}

export default function TransformationsTab({
  beforeAfterItems,
  setBeforeAfterItems,
  onRefreshData
}: TransformationsTabProps) {
  // Local Form states
  const [newBaTitle, setNewBaTitle] = useState('');
  const [newBaDesc, setNewBaDesc] = useState('');
  const [newBaBeforeUrl, setNewBaBeforeUrl] = useState('');
  const [newBaAfterUrl, setNewBaAfterUrl] = useState('');
  const [editingBaId, setEditingBaId] = useState<string | null>(null);

  // Local file drag states
  const [baDragActiveBefore, setBaDragActiveBefore] = useState(false);
  const [baDragActiveAfter, setBaDragActiveAfter] = useState(false);
  const [isSavingBA, setIsSavingBA] = useState(false);

  // File change handlers
  const handleBaFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'before') {
          setNewBaBeforeUrl(base64);
        } else {
          setNewBaAfterUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: 'before' | 'after') => {
    e.preventDefault();
    if (type === 'before') setBaDragActiveBefore(true);
    else setBaDragActiveAfter(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, type: 'before' | 'after') => {
    e.preventDefault();
    if (type === 'before') setBaDragActiveBefore(false);
    else setBaDragActiveAfter(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'before' | 'after') => {
    e.preventDefault();
    if (type === 'before') setBaDragActiveBefore(false);
    else setBaDragActiveAfter(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'before') {
          setNewBaBeforeUrl(base64);
        } else {
          setNewBaAfterUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBeforeAfterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaBeforeUrl || !newBaAfterUrl || !newBaTitle) return;

    try {
      setIsSavingBA(true);
      
      // Only upload if it's a newly uploaded base64 image
      const uploadPromises = [
        newBaBeforeUrl.startsWith('data:') && !newBaBeforeUrl.startsWith('data:image/svg+xml') 
          ? uploadImageToStorage(newBaBeforeUrl) 
          : Promise.resolve(newBaBeforeUrl),
        newBaAfterUrl.startsWith('data:') && !newBaAfterUrl.startsWith('data:image/svg+xml') 
          ? uploadImageToStorage(newBaAfterUrl) 
          : Promise.resolve(newBaAfterUrl)
      ];

      const [finalBeforeUrl, finalAfterUrl] = await Promise.all(uploadPromises);

      const targetId = editingBaId || ('ba-' + Date.now());
      const newItem: BeforeAfterItem = {
        id: targetId,
        before_url: finalBeforeUrl,
        after_url: finalAfterUrl,
        title: newBaTitle,
        description: newBaDesc || 'Spectacular real-life client transformation work.',
        created_at: new Date().toISOString()
      };

      if (setBeforeAfterItems) {
        if (editingBaId) {
          setBeforeAfterItems(beforeAfterItems.map(b => b.id === editingBaId ? newItem : b));
        } else {
          setBeforeAfterItems([newItem, ...beforeAfterItems]);
        }
      }
      await updateBeforeAfterItem(newItem);

      setEditingBaId(null);
      setNewBaBeforeUrl('');
      setNewBaAfterUrl('');
      setNewBaTitle('');
      setNewBaDesc('');
      await onRefreshData();
    } catch (err) {
      console.error('Failed to save before-after item:', err);
    } finally {
      setIsSavingBA(false);
    }
  };

  const handleStartEdit = (item: BeforeAfterItem) => {
    setEditingBaId(item.id);
    setNewBaTitle(item.title);
    setNewBaDesc(item.description || '');
    setNewBaBeforeUrl(item.before_url);
    setNewBaAfterUrl(item.after_url);

    // Scroll to form nicely
    const element = document.getElementById('admin-transformations-tab');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingBaId(null);
    setNewBaBeforeUrl('');
    setNewBaAfterUrl('');
    setNewBaTitle('');
    setNewBaDesc('');
  };

  const handleDeleteBeforeAfterItem = async (id: string) => {
    if (confirm('Delete this client before & after transformation reference from files forever?')) {
      if (setBeforeAfterItems) {
        setBeforeAfterItems(beforeAfterItems.filter(b => b.id !== id));
      }
      await removeBeforeAfterItem(id);
      await onRefreshData();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left" id="admin-transformations-tab">
      
      {/* Add/Edit Transformation component */}
      <div className="bg-[#050805] border border-white/5 p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h3 className="font-serif-luxury text-lg text-white font-bold uppercase">
              {editingBaId ? 'Edit Client Transformation' : 'Publish Client Transformation'}
            </h3>
            <p className="text-xs text-gray-400 font-light">
              {editingBaId ? 'Modify before and after picture files and metadata info.' : 'Add side-by-side before and after pictures to showcase spectacular makeovers on the home page.'}
            </p>
          </div>
          {editingBaId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-black border border-gray-700 hover:border-white text-white text-[9px] uppercase font-bold tracking-widest cursor-pointer transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleAddBeforeAfterItem} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Transformation Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Royal HD Bridal Makeover"
              value={newBaTitle}
              onChange={(e) => setNewBaTitle(e.target.value)}
              className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full"
            />
          </div>

          {/* Before Image Box */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold block mb-1">
                Before Image *
              </label>
              
              {/* Dropzone container */}
              <div 
                onDragOver={(e) => handleDragOver(e, 'before')}
                onDragLeave={(e) => handleDragLeave(e, 'before')}
                onDrop={(e) => handleDrop(e, 'before')}
                onClick={() => document.getElementById('before-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center h-48 ${
                  baDragActiveBefore 
                    ? 'border-[#DDB93B] bg-[#DDB93B]/5' 
                    : 'border-gray-700 bg-black hover:border-[#DDB93B]/60'
                }`}
                id="before-image-dropzone"
              >
                <input 
                  type="file" 
                  id="before-file-input"
                  accept="image/*"
                  onChange={(e) => handleBaFileChange(e, 'before')}
                  className="hidden"
                />

                {newBaBeforeUrl ? (
                  <>
                    <img 
                      src={newBaBeforeUrl} 
                      alt="Before Preview" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewBaBeforeUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-600 rounded-full text-white transition-colors cursor-pointer"
                      title="Remove Image"
                      id="btn-remove-before-preview"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 pointer-events-none flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <p className="text-[11px] text-gray-300">
                      <span className="font-bold text-[#DDB93B]">Click to browse</span> or drag & drop Before image
                    </p>
                    <p className="text-[9px] text-gray-500 font-mono">Supports PNG, JPG, WebP</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold block">
                Or Paste Before Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newBaBeforeUrl.startsWith('data:') ? '' : newBaBeforeUrl}
                onChange={(e) => setNewBaBeforeUrl(e.target.value)}
                className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full text-[11px]"
              />
            </div>
          </div>

          {/* After Image Box */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold block mb-1">
                After Image *
              </label>
              
              {/* Dropzone container */}
              <div 
                onDragOver={(e) => handleDragOver(e, 'after')}
                onDragLeave={(e) => handleDragLeave(e, 'after')}
                onDrop={(e) => handleDrop(e, 'after')}
                onClick={() => document.getElementById('after-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center h-48 ${
                  baDragActiveAfter 
                    ? 'border-[#DDB93B] bg-[#DDB93B]/5' 
                    : 'border-gray-700 bg-black hover:border-[#DDB93B]/60'
                }`}
                id="after-image-dropzone"
              >
                <input 
                  type="file" 
                  id="after-file-input"
                  accept="image/*"
                  onChange={(e) => handleBaFileChange(e, 'after')}
                  className="hidden"
                />

                {newBaAfterUrl ? (
                  <>
                    <img 
                      src={newBaAfterUrl} 
                      alt="After Preview" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewBaAfterUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-600 rounded-full text-white transition-colors cursor-pointer"
                      title="Remove Image"
                      id="btn-remove-after-preview"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 pointer-events-none flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <p className="text-[11px] text-gray-300">
                      <span className="font-bold text-[#DDB93B]">Click to browse</span> or drag & drop After image
                    </p>
                    <p className="text-[9px] text-gray-500 font-mono">Supports PNG, JPG, WebP</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold block">
                Or Paste After Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newBaAfterUrl.startsWith('data:') ? '' : newBaAfterUrl}
                onChange={(e) => setNewBaAfterUrl(e.target.value)}
                className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Description / Styling Details *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe lashes brand, contouring code, hair serums or treatment steps used..."
              value={newBaDesc}
              onChange={(e) => setNewBaDesc(e.target.value)}
              className="bg-black border border-gray-700 p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full resize-none font-sans"
            />
          </div>

          <div className="pt-2 sm:col-span-2 flex justify-end gap-2">
            {editingBaId && (
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
              disabled={isSavingBA}
              className={`py-2.5 px-6 border text-[10px] uppercase font-bold tracking-widest transition-all ${
                isSavingBA
                  ? 'bg-gray-800 text-gray-400 border-gray-700 cursor-not-allowed animate-pulse'
                  : 'bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black border-[#DDB93B]/25 cursor-pointer'
              }`}
            >
              {isSavingBA 
                ? 'Uploading & Saving...' 
                : editingBaId 
                  ? 'Save Changes' 
                  : 'Publish Transformation'}
            </button>
          </div>
        </form>
      </div>

      {/* Current transformations listing */}
      <div className="space-y-4">
        <h3 className="font-serif-luxury text-sm text-[#DDB93B] tracking-widest uppercase font-bold">Client Transformations in file</h3>
        
        {beforeAfterItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
            {beforeAfterItems.map((item) => (
              <div key={item.id} className="bg-[#050805] border border-white/5 overflow-hidden flex flex-col justify-between hover:border-gray-800 transition-all text-left">
                
                {/* Side by side preview */}
                <div className="grid grid-cols-2 gap-0.5 bg-border/20 h-40 overflow-hidden relative">
                  <div className="relative h-full overflow-hidden">
                    <img src={item.before_url} alt="Before" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 bg-black/80 text-[8px] text-white px-1.5 py-0.5 uppercase">Before</div>
                  </div>
                  <div className="relative h-full overflow-hidden">
                    <img src={item.after_url} alt="After" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-[#DDB93B] text-[8px] text-black px-1.5 py-0.5 uppercase font-bold">After</div>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-white font-bold leading-normal text-sm font-serif-luxury line-clamp-1">{item.title}</h4>
                    <p className="text-gray-400 text-[11px] font-light leading-relaxed line-clamp-2">{item.description}</p>
                    <p className="text-[9px] text-gray-500 font-mono pt-1">Ref: {item.id}</p>
                  </div>
                  
                  <div className="pt-3 flex justify-end gap-1.5 border-t border-white/5 mt-2">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 px-3 bg-amber-950/20 text-amber-500 border border-amber-900/40 hover:bg-amber-900 hover:text-white transition-colors uppercase text-[9px] font-bold tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBeforeAfterItem(item.id)}
                      className="p-1 px-3 bg-red-950/20 text-red-500 border border-red-900/40 hover:bg-red-900 hover:text-white transition-colors uppercase text-[9px] font-bold tracking-wider cursor-pointer"
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
            No transformations logged yet.
          </div>
        )}
      </div>

    </div>
  );
}
