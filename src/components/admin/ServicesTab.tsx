import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Service } from '../../types';

interface ServicesTabProps {
  services: Service[];
  onAddService: (newSvc: Service) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export default function ServicesTab({
  services,
  onAddService,
  onDeleteService
}: ServicesTabProps) {
  // Form states managed locally inside the component
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcCategory, setNewSvcCategory] = useState('Makeup');
  const [newSvcPrice, setNewSvcPrice] = useState('1000');
  const [newSvcDuration, setNewSvcDuration] = useState('60 mins');
  const [newSvcDescription, setNewSvcDescription] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName || !newSvcPrice) return;
    
    setIsSubmitting(true);
    try {
      const targetId = editingServiceId || ('srv-' + Date.now());
      const newSvc: Service = {
        id: targetId,
        name: newSvcName,
        category: newSvcCategory,
        price: parseInt(newSvcPrice) || 1000,
        duration: newSvcDuration,
        description: newSvcDescription || 'Luxury personalized skin care, meticulously customized styling and therapy.'
      };

      await onAddService(newSvc);
      
      // Reset form on success
      setEditingServiceId(null);
      setNewSvcName('');
      setNewSvcCategory('Makeup');
      setNewSvcPrice('1000');
      setNewSvcDuration('60 mins');
      setNewSvcDescription('');
    } catch (err) {
      console.error('Error saving service in form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (svc: Service) => {
    setEditingServiceId(svc.id);
    setNewSvcName(svc.name);
    setNewSvcCategory(svc.category);
    setNewSvcPrice(svc.price.toString());
    setNewSvcDuration(svc.duration);
    setNewSvcDescription(svc.description);

    // Scroll to form nicely
    const element = document.getElementById('admin-services-tab');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
    setNewSvcName('');
    setNewSvcCategory('Makeup');
    setNewSvcPrice('1000');
    setNewSvcDuration('60 mins');
    setNewSvcDescription('');
  };

  return (
    <div className="space-y-8 animate-fade-in" id="admin-services-tab">
      
      {/* Add/Edit Service form */}
      <div className="bg-[#050805] border border-white/5 p-6 sm:p-8 space-y-6 text-left">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h3 className="font-serif-luxury text-lg text-white font-bold uppercase">
              {editingServiceId ? 'Edit Treatment Procedure' : 'Add New Treatment Procedure'}
            </h3>
            <p className="text-xs text-gray-400">
              {editingServiceId ? 'Modify details of an existing catalog offering.' : 'Populate custom styling items into the main booking selector immediately.'}
            </p>
          </div>
          {editingServiceId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-black border border-gray-700 hover:border-white text-white text-[9px] uppercase font-bold tracking-widest cursor-pointer transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Service Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lavender Spa Conditioning"
              value={newSvcName}
              onChange={(e) => setNewSvcName(e.target.value)}
              className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Category Type *</label>
            <select
              value={newSvcCategory}
              onChange={(e) => setNewSvcCategory(e.target.value)}
              className="bg-black border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-[#DDB93B] w-full h-[33px] cursor-pointer"
            >
              <option value="Bridal">Bridal</option>
              <option value="Makeup">Makeup</option>
              <option value="Hair">Hair</option>
              <option value="Skin">Skin</option>
              <option value="Nails">Nails</option>
              <option value="Mens">Mens</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Investment Fee (INR) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 1500"
              value={newSvcPrice}
              onChange={(e) => setNewSvcPrice(e.target.value)}
              className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Duration Buffer *</label>
            <input
              type="text"
              required
              placeholder="e.g. 75 mins"
              value={newSvcDuration}
              onChange={(e) => setNewSvcDuration(e.target.value)}
              className="bg-black border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Treatment description *</label>
            <textarea
              rows={3}
              required
              placeholder="Summarize the botanical oils, active chemical products, airbrush parameters details..."
              value={newSvcDescription}
              onChange={(e) => setNewSvcDescription(e.target.value)}
              className="bg-black border border-gray-700 p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] w-full resize-none font-sans"
            />
          </div>

          <div className="pt-2 sm:col-span-2 flex justify-end gap-2">
            {editingServiceId && (
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
              disabled={isSubmitting}
              className={`py-2.5 px-6 border text-[10px] uppercase font-bold tracking-widest transition-all ${
                isSubmitting 
                  ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed animate-pulse' 
                  : 'bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black border-[#DDB93B]/25 cursor-pointer'
              }`}
            >
              {isSubmitting 
                ? 'Saving...' 
                : editingServiceId 
                  ? 'Save Changes' 
                  : 'Publish Procedure'}
            </button>
          </div>
        </form>
      </div>

      {/* Current treatments grid list */}
      <div className="space-y-4 text-left">
        <h3 className="font-serif-luxury text-sm text-[#DDB93B] tracking-widest uppercase font-bold">Procedure catalog in file</h3>
        
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {services.map((svc) => (
              <div key={svc.id} className="bg-[#050805] border border-white/5 p-5 flex justify-between gap-4 items-start relative hover:border-gray-800 transition-all">
                <div className="space-y-1 text-left">
                  <span className="text-[8px] tracking-widest text-[#DDB93B] uppercase font-bold">{svc.category}</span>
                  <h4 className="text-white text-base font-serif-luxury font-bold leading-snug">{svc.name}</h4>
                  <p className="text-gray-400 max-w-md text-xs font-light line-clamp-2 leading-relaxed">{svc.description}</p>
                  <p className="text-[10px] font-mono text-gray-400 pt-1">🕒 Time: {svc.duration} | Price: ₹{svc.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleStartEdit(svc)}
                    className="p-2 bg-amber-950/20 text-amber-500 border border-amber-900/30 hover:bg-amber-900 hover:text-white cursor-pointer hover:border-transparent transition-colors"
                    title="Edit Service Details"
                  >
                    <Edit className="h-4 w-4" opacity={0.8} />
                  </button>
                  <button
                    onClick={() => onDeleteService(svc.id)}
                    className="p-2 bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-950 hover:text-white cursor-pointer hover:border-transparent transition-colors"
                    title="Remove from files"
                  >
                    <Trash2 className="h-4 w-4" opacity={0.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#070a07] border border-white/5 text-xs text-gray-500 font-mono">
            No catalog services configured.
          </div>
        )}
      </div>

    </div>
  );
}
