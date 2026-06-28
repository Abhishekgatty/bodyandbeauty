import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface SlotsTabProps {
  bookingSlots: string[];
  onUpdateBookingSlots?: (slots: string[]) => Promise<any>;
  onRefreshData: () => Promise<void>;
}

export default function SlotsTab({
  bookingSlots,
  onUpdateBookingSlots,
  onRefreshData
}: SlotsTabProps) {
  
  const handleRestoreDefaults = async () => {
    if (confirm('Restore the default luxury salon timing coordinates? This will replace your customized list.')) {
      if (onUpdateBookingSlots) {
        try {
          await onUpdateBookingSlots([
            '05:00 AM', '07:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
            '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
            '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
          ]);
          await onRefreshData();
          alert('Default timing slots restored successfully!');
        } catch (err: any) {
          console.error('Failed to restore default slots:', err);
          alert(
            `Error: ${err.message || 'Could not restore default slots.'}\n\n` +
            `If you recently configured Supabase, please click "Run Diagnostic Suite" at the top of the Admin Dashboard ` +
            `to copy and execute the SQL setup script to create the 'booking_slots' table.`
          );
        }
      }
    }
  };

  const handleAddSlotFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('new_slot') as HTMLInputElement;
    let val = input.value.trim().toUpperCase();
    if (!val) return;
    
    // Simple validation: regex for HH:MM AM/PM (space before AM/PM optional in pattern, but normalized below)
    const regex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!regex.test(val)) {
      alert('Please enter slot in the format "HH:MM AM/PM" (e.g., 09:30 AM or 02:45 PM).');
      return;
    }

    // Force spacing normalization (e.g. "10:30AM" -> "10:30 AM")
    val = val.replace(/\s*(AM|PM)$/i, ' $1');

    if (bookingSlots.includes(val)) {
      alert('This timing slot already exists!');
      return;
    }

    const updated = [...bookingSlots, val].sort((a, b) => {
      const getMinutes = (tStr: string) => {
        const parts = tStr.split(/\s+/);
        const time = parts[0];
        const period = parts[1] || 'AM';
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
      };
      return getMinutes(a) - getMinutes(b);
    });

    if (onUpdateBookingSlots) {
      try {
        await onUpdateBookingSlots(updated);
        await onRefreshData();
        input.value = '';
        alert(`Timing slot ${val} added successfully!`);
      } catch (err: any) {
        console.error('Failed to update timing slots:', err);
        alert(
          `Error: ${err.message || 'Could not update timing slots.'}\n\n` +
          `If you recently configured Supabase, please click "Run Diagnostic Suite" at the top of the Admin Dashboard ` +
          `to copy and execute the SQL setup script to create the 'booking_slots' table.`
        );
      }
    }
  };

  const handleDeleteSlot = async (slot: string) => {
    if (confirm(`Remove timing slot ${slot}? Existing appointments won't be affected, but clients won't be able to book new reservations at this hour.`)) {
      const updated = bookingSlots.filter(s => s !== slot);
      if (onUpdateBookingSlots) {
        try {
          await onUpdateBookingSlots(updated);
          await onRefreshData();
          alert(`Timing slot ${slot} deleted successfully.`);
        } catch (err: any) {
          console.error('Failed to delete timing slot:', err);
          alert(
            `Error: ${err.message || 'Could not delete timing slot.'}\n\n` +
            `If you recently configured Supabase, please click "Run Diagnostic Suite" at the top of the Admin Dashboard ` +
            `to copy and execute the SQL setup script to create the 'booking_slots' table.`
          );
        }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left" id="admin-slots-tab">
      <div className="border border-[#DDB93B]/20 bg-[#070a07] p-6 relative">
        <div className="absolute top-1 left-1 bottom-1 right-1 border border-[#DDB93B]/5 pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4 mb-6">
          <div>
            <span className="text-[8px] tracking-[0.3em] text-[#DDB93B] uppercase font-bold block">capacity limits</span>
            <h3 className="font-serif-luxury text-xl text-white font-medium">Bespoke timing slots console</h3>
            <p className="text-[10px] text-gray-400 mt-1">Configure individual timing hours available for client bookings at the Body and Beauty Studio workspace.</p>
          </div>
          <button
            onClick={handleRestoreDefaults}
            className="px-4 py-2 bg-black border border-[#DDB93B]/35 text-[#DDB93B] hover:bg-[#DDB93B] hover:text-black text-[9px] uppercase font-black tracking-widest cursor-pointer transition-all"
          >
            Restore defaults
          </button>
        </div>

        {/* Timing input addition board */}
        <div className="bg-black/40 border border-white/5 p-4 mb-6 text-left">
          <h4 className="text-[10px] uppercase font-black text-white tracking-widest mb-3 font-mono">Add Custom timing coordinate</h4>
          <form 
            onSubmit={handleAddSlotFormSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md"
          >
            <input
              name="new_slot"
              type="text"
              placeholder="e.g., 10:30 AM"
              required
              className="bg-black border border-gray-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DDB93B] flex-1 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F5232] hover:bg-[#DDB93B] hover:text-black text-white text-[10px] uppercase font-bold tracking-widest cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Slot</span>
            </button>
          </form>
          <p className="text-[9px] text-gray-500 font-mono mt-1">Note: Enter 12-hour clock timing. For example: 08:30 AM or 05:45 PM.</p>
        </div>

        {/* List of active slots */}
        <h4 className="text-[10px] uppercase font-black text-[#DDB93B] tracking-widest mb-4 font-mono">Active Timing Coordinates ({bookingSlots.length})</h4>
        {bookingSlots.length === 0 ? (
          <div className="p-10 border border-dashed border-gray-850 text-center font-mono text-xs text-gray-500">
            No active timing slots configured. Please add one above or restore defaults.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {bookingSlots.map((slot) => (
              <div 
                key={slot}
                className="p-3 bg-black border border-gray-800 flex justify-between items-center group hover:border-[#DDB93B]/50 transition-colors"
              >
                <span className="font-mono text-xs text-white tracking-wider">{slot}</span>
                <button
                  onClick={() => handleDeleteSlot(slot)}
                  className="text-gray-500 hover:text-red-500 p-1 group-hover:opacity-100 opacity-50 transition-all cursor-pointer"
                  title="Delete slot coordinate"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
