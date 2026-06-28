import React, { useState } from 'react';
import { Calendar, Trash2, Sparkles } from 'lucide-react';
import { Appointment } from '../../types';
import { removeAppointment, saveAppointment, fetchPaymentTransactions, updatePaymentTransactionStatus } from '../../supabaseClient';
import { parsePaymentFromNotes, verifyPaymentInNotes } from '../../utils/paymentUtils';

const availableTimes = [
  '05:00 AM', '07:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

interface AppointmentsTabProps {
  appointments: Appointment[];
  setAppointments: (apts: Appointment[]) => void;
  highlightedAptId: string | null;
  setHighlightedAptId: (id: string | null) => void;
  onApprove: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onRescheduleSubmit: (e: React.FormEvent, id: string) => Promise<void>;
  reschedulingId: string | null;
  setReschedulingId: (id: string | null) => void;
  rescheduleDate: string;
  setRescheduleDate: (d: string) => void;
  rescheduleTime: string;
  setRescheduleTime: (t: string) => void;
  bookingSlots: string[];
  onRefreshData: () => Promise<void>;
}

export default function AppointmentsTab({
  appointments,
  setAppointments,
  highlightedAptId,
  setHighlightedAptId,
  onApprove,
  onCancel,
  onRescheduleSubmit,
  reschedulingId,
  setReschedulingId,
  rescheduleDate,
  setRescheduleDate,
  rescheduleTime,
  setRescheduleTime,
  bookingSlots,
  onRefreshData
}: AppointmentsTabProps) {
  
  const [verifyingPaymentAptId, setVerifyingPaymentAptId] = useState<string | null>(null);

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('Delete this appointment record forever?')) {
      setAppointments(appointments.filter(a => a.id !== id));
      await removeAppointment(id);
      await onRefreshData();
    }
  };

  const handleVerifyPayment = async (apt: Appointment) => {
    const { paymentAmount, paymentTxnId } = parsePaymentFromNotes(apt.notes);
    
    // Promote payment status to PAID in notes
    const verifiedNotes = verifyPaymentInNotes(apt.notes);
    const updatedApt: Appointment = {
      ...apt,
      notes: verifiedNotes,
      // Auto approve appointment if pending
      status: apt.status === 'pending' ? 'approved' : apt.status
    };
    
    await saveAppointment(updatedApt);
    
    // Update local state instantly for premium responsiveness
    const updatedAptsList = appointments.map(a => a.id === apt.id ? updatedApt : a);
    setAppointments(updatedAptsList);

    // Also locate and promote corresponding PaymentTransaction in ledger
    try {
      const { data: payList } = await fetchPaymentTransactions();
      const foundPay = payList.find(p => p.appointmentId === apt.id || p.txnId === paymentTxnId);
      if (foundPay) {
        await updatePaymentTransactionStatus(foundPay.id, 'verified', new Date().toISOString());
      }
    } catch (err) {
      console.warn('Error syncing corresponding payment transaction status:', err);
    }

    setVerifyingPaymentAptId(null);
    await onRefreshData();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin-appointments-tab">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h3 className="font-serif-luxury text-xl text-[#0F5232] font-bold tracking-wide uppercase">Client Bookings ledger</h3>
        <span className="text-[10px] bg-black px-3 py-1 border border-white/15 text-gray-400 font-mono">
          Count: {appointments.length} entries
        </span>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const { paymentStatus, paymentMethod, paymentAmount, paymentTxnId, cleanNotes } = parsePaymentFromNotes(apt.notes);
            return (
              <div 
                key={apt.id} 
                id={`apt-card-${apt.id}`}
                className={`border p-6 relative space-y-4 text-xs transition-all duration-700 ${
                  highlightedAptId === apt.id 
                    ? 'border-[#DDB93B] bg-amber-950/20 shadow-[0_0_25px_rgba(212,175,55,0.2)] ring-2 ring-[#DDB93B]/40' 
                    : apt.status === 'pending' 
                      ? 'border-amber-500/25 bg-[#050805]' 
                      : apt.status === 'approved' 
                        ? 'border-emerald-500/20 bg-[#050805]' 
                        : apt.status === 'cancelled' 
                          ? 'border-red-900/30 bg-[#050805]' 
                          : 'border-[#DDB93B]/35 bg-[#050805]'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  
                  {/* Customer coordinates */}
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif-luxury text-base text-white font-bold">{apt.name}</span>
                      {highlightedAptId === apt.id && (
                        <span className="text-[8px] bg-[#DDB93B] text-black font-extrabold px-2 py-0.5 animate-pulse flex items-center gap-1 uppercase tracking-widest">
                          <Sparkles className="h-2.5 w-2.5 animate-spin" /> NEWLY ARRIVED
                        </span>
                      )}
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-black border border-white/15 text-gray-400">
                        {apt.id}
                      </span>
                      <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 ${
                        apt.status === 'pending' ? 'bg-amber-950 text-amber-400' :
                        apt.status === 'approved' ? 'bg-emerald-950 text-emerald-400' :
                        apt.status === 'cancelled' ? 'bg-red-950 text-red-400' :
                        'bg-[#DDB93B]/20 text-[#DDB93B]'
                      }`}>
                        {apt.status}
                      </span>

                      {/* Payment Status Badge */}
                      {paymentStatus === 'paid' ? (
                        <span className="text-[8px] uppercase tracking-widest font-black px-2 py-0.5 bg-emerald-950 text-[#DDB93B] border border-[#DDB93B]/40">
                          💳 PAID: ₹{paymentAmount.toLocaleString('en-IN')} ({paymentMethod.toUpperCase()})
                        </span>
                      ) : paymentStatus === 'pending' ? (
                        <span className="text-[8px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse">
                          ⌛ UNVERIFIED: ₹{paymentAmount.toLocaleString('en-IN')} ({paymentMethod.toUpperCase()})
                        </span>
                      ) : (
                        <span className="text-[8px] uppercase tracking-widest font-black px-2 py-0.5 bg-red-950/20 text-red-400 border border-red-900/30">
                          💵 PAY AT COUNTER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-normal">📞 Contact: {apt.phone} | Gender: {apt.gender} {apt.email && `| 📨 ${apt.email}`}</p>
                  </div>

                  {/* Operational Triggers */}
                  {apt.status === 'pending' && (
                    <div className="flex gap-2 self-stretch sm:self-auto justify-end flex-wrap">
                      <button
                        onClick={() => onApprove(apt.id)}
                        className="px-3 py-1.5 bg-emerald-900 text-white hover:bg-emerald-800 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setReschedulingId(apt.id);
                          setRescheduleDate(apt.preferredDate);
                          setRescheduleTime(apt.preferredTime);
                        }}
                        className="px-3 py-1.5 border border-[#DDB93B]/40 text-[#DDB93B] hover:bg-[#DDB93B] hover:text-black text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => onCancel(apt.id)}
                        className="px-3 py-1.5 bg-red-950/25 border border-red-900/40 text-red-400 hover:bg-red-900 hover:text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {apt.status !== 'pending' && (
                    <button
                      onClick={() => handleDeleteAppointment(apt.id)}
                      className="p-2 border border-red-900/30 text-red-400 hover:bg-red-950 hover:text-white cursor-pointer self-start sm:self-auto ml-auto transition-colors"
                      title="Delete receipt record"
                    >
                      <Trash2 className="h-4 w-4" opacity={0.6} />
                    </button>
                  )}

                </div>

                {/* Booking details card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black border border-white/5 p-4 font-sans leading-relaxed text-gray-300 text-left">
                  <p>💇‍♀️ <strong className="text-[#DDB93B]">Aura Desired Care:</strong> {apt.serviceName}</p>
                  <p>📅 <strong className="text-[#DDB93B]">Timing Coordinates:</strong> {apt.preferredDate} at {apt.preferredTime}</p>
                  <p>⭐ <strong className="text-[#DDB93B]">Stylist Preferred:</strong> {apt.stylistPreference}</p>
                  <p>⏱ <strong className="text-[#DDB93B]">Requested:</strong> {new Date(apt.createdAt).toLocaleString()}</p>
                </div>

                {/* Transaction receipt summary */}
                {paymentStatus === 'paid' && (
                  <div className="bg-emerald-950/20 border border-[#DDB93B]/20 p-4 font-mono text-[11px] leading-relaxed text-gray-300 space-y-1 text-left rounded-sm">
                    <p className="text-[#DDB93B] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <span>💎</span> Aura Secured Transaction clearance Receipt
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[10px] text-gray-400 pt-1 border-t border-white/5">
                      <p>Settlement Amount: <span className="text-white font-bold">₹{paymentAmount.toLocaleString('en-IN')}</span></p>
                      <p>Gateway Mode: <span className="text-white uppercase font-semibold">{paymentMethod === 'upi' ? 'UPI Transfer (GPay/PhonePe)' : 'Secure Card Gateway'}</span></p>
                      <p>Transaction Clearance ID: <span className="text-white underline">{paymentTxnId}</span></p>
                      <p>Security Audit: <span className="text-emerald-400 font-bold uppercase">Settle & Cleared</span></p>
                    </div>
                  </div>
                )}

                {paymentStatus === 'pending' && (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-4 font-mono text-[11px] leading-relaxed text-gray-300 space-y-3 text-left rounded-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/10 pb-2">
                      <p className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <span className="animate-pulse">⌛</span> ONLINE PAYMENT PENDING ADMIN VERIFICATION
                      </p>
                      <span className="text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 border border-amber-500/20 rounded font-bold uppercase">
                        Action Required
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[10px] text-gray-400">
                      <p>Claimed Paid Amount: <span className="text-white font-bold">₹{paymentAmount.toLocaleString('en-IN')}</span></p>
                      <p>Claimed Gateway Mode: <span className="text-white uppercase font-semibold">{paymentMethod === 'upi' ? 'UPI Transfer (GPay/PhonePe)' : 'Secure Card Gateway'}</span></p>
                      <p>UTR / Ref Reference ID: <span className="text-amber-400 font-bold select-all underline">{paymentTxnId}</span></p>
                      <p>Payment Verification: <span className="text-amber-500 font-bold animate-pulse uppercase">Awaiting Bank Ledger Cross-Match</span></p>
                    </div>
                    <div className="pt-2">
                      {verifyingPaymentAptId === apt.id ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-amber-950 p-2.5 border border-amber-500/30 rounded">
                          <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                            ⚠️ Confirm Receipt of ₹{paymentAmount.toLocaleString('en-IN')}?
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(apt)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[9px] cursor-pointer rounded"
                            >
                              Yes, Approve Receipt
                            </button>
                            <button
                              type="button"
                              onClick={() => setVerifyingPaymentAptId(null)}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-gray-200 font-bold uppercase tracking-wider text-[9px] cursor-pointer rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setVerifyingPaymentAptId(apt.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#DDB93B] hover:bg-[#c4a132] text-black font-bold uppercase tracking-widest text-[10px] cursor-pointer rounded flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                          <span>✅</span>
                          <span>Verify & Approve Payment Clearance</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {cleanNotes && (
                  <p className="p-3 bg-[#0a0c0a] border-l-2 border-[#DDB93B] font-mono text-[11px] leading-relaxed text-gray-400 text-left">
                    📝 <strong>Instructions:</strong> {cleanNotes}
                  </p>
                )}

                {/* Rescheduling Form inline toggled */}
                {reschedulingId === apt.id && (
                  <form 
                    onSubmit={(e) => onRescheduleSubmit(e, apt.id)} 
                    className="bg-[#0f1511] border border-[#DDB93B]/45 p-4 space-y-4 animate-fade-in text-left"
                  >
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#DDB93B] block font-mono">Reschedule timing console</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-gray-400 tracking-wider font-mono">New date</label>
                        <input
                          type="date"
                          required
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="bg-black border border-gray-700 text-xs px-3 py-1.5 text-white focus:outline-none w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-gray-400 tracking-wider font-mono">New timing slot</label>
                        <select
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="bg-black border border-gray-700 text-xs px-3 py-1.5 text-white focus:outline-none w-full h-[33px] cursor-pointer"
                        >
                          {(bookingSlots.length > 0 ? bookingSlots : availableTimes).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setReschedulingId(null)}
                        className="px-4 py-1.5 border border-white/5 hover:border-white/15 text-gray-400 text-[10px] uppercase font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#0F5232] hover:bg-[#DDB93B] hover:text-black text-white text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                      >
                        Apply New Schedule
                      </button>
                    </div>
                  </form>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#070a07] border border-white/5 text-xs text-gray-500 font-mono">
          No physical booking entries logged in active files yet.
        </div>
      )}
    </div>
  );
}
