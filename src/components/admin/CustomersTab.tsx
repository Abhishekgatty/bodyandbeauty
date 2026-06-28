import React from 'react';
import { Appointment } from '../../types';

interface CustomersTabProps {
  appointments: Appointment[];
}

export default function CustomersTab({ appointments }: CustomersTabProps) {
  // Aggregate unique phones
  const uniquePhones = Array.from(new Set(appointments.map(a => a.phone)));

  return (
    <div className="space-y-6 animate-fade-in" id="admin-customers-tab">
      <div className="border-b border-gray-200 pb-4 text-left">
        <h3 className="font-serif-luxury text-xl text-[#0F5232] font-bold tracking-wide uppercase">Styling Customer Profiles</h3>
        <p className="text-xs text-gray-400">Aggregating unique customers currently active in Yelahanka files.</p>
      </div>

      <div className="space-y-4">
        {uniquePhones.length > 0 ? (
          uniquePhones.map((phoneNum, idx) => {
            const clientBookings = appointments.filter(a => a.phone === phoneNum);
            const nameFromProfile = clientBookings[0]?.name || 'Unknown Client';
            const emailFromProfile = clientBookings[0]?.email || 'No email coordinates';
            const genderFromProfile = clientBookings[0]?.gender || 'Unspecified';

            return (
              <div 
                key={idx} 
                className="bg-[#050805] border border-white/5 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs hover:border-[#DDB93B]/20 transition-colors text-left"
              >
                <div className="space-y-1">
                  <h4 className="font-serif-luxury text-base text-white font-bold">{nameFromProfile}</h4>
                  <p className="text-gray-400">📞 Contact Phone: {phoneNum} | Gender: {genderFromProfile}</p>
                  <p className="text-[10px] text-gray-500 font-mono">📨 {emailFromProfile}</p>
                </div>
                <div className="text-right sm:text-right shrink-0">
                  <span className="text-[10px] bg-black border border-white/15 px-3 py-1 text-gray-400 font-mono">
                    Sessions Counter: {clientBookings.length}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-[#070a07] border border-white/5 text-xs text-gray-500 font-mono">
            No customer profiles logged in file systems yet.
          </div>
        )}
      </div>
    </div>
  );
}
