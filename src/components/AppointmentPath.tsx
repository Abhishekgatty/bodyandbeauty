/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Mail, Clock, ShieldAlert, Sparkles, CheckSquare, Edit2, Save, X, AlertCircle, Check, RotateCcw, History, Award, TrendingUp, Heart, Scissors, FileText, CheckCircle, UserCheck, CreditCard, Smartphone } from 'lucide-react';
import { Appointment, Service, UserProfile, PaymentTransaction } from '../types';
import AuthPage from './AuthPage';
import { calculateBilling, injectPaymentIntoNotes, parsePaymentFromNotes, injectPendingPaymentIntoNotes } from '../utils/paymentUtils';
import { savePaymentTransaction } from '../supabaseClient';

interface AppointmentPathProps {
  services: Service[];
  preSelectedServiceId?: string | null;
  onAddNewAppointment: (newApt: Appointment) => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  bookingSlots?: string[];
  appointments?: Appointment[];
  onRescheduleAppointment?: (id: string, newDate: string, newTime: string) => Promise<void>;
}

const availableTimes = [
  '05:00 AM', '07:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

export default function AppointmentPath({ 
  services, 
  preSelectedServiceId, 
  onAddNewAppointment, 
  currentUser, 
  onAuthSuccess, 
  bookingSlots,
  appointments = [],
  onRescheduleAppointment
}: AppointmentPathProps) {
  const activeTimes = bookingSlots && bookingSlots.length > 0 ? bookingSlots : availableTimes;

  // Local form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('female');
  const [serviceId, setServiceId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('09:00 AM');
  const [stylistPreference, setStylistPreference] = useState('Shubha');
  const [notes, setNotes] = useState('');

  // Checkout & Payment states
  const [checkoutApt, setCheckoutApt] = useState<Appointment | null>(null);
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [isTestMode, setIsTestMode] = useState(true);
  
  // UPI states
  const [upiUtr, setUpiUtr] = useState('');
  const [upiError, setUpiError] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);

  // Card states
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');

  // Processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Rescheduling state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState<string | null>(null);
  const [cabinetTab, setCabinetTab] = useState<'profile' | 'upcoming' | 'past'>('profile');

  // Filter appointments belonging to this customer
  const clientApts = appointments.filter(apt => {
    if (!currentUser) return false;
    const phoneMatch = apt.phone && apt.phone === currentUser.phone;
    const emailMatch = apt.email && currentUser.email && apt.email.toLowerCase() === currentUser.email.toLowerCase();
    return phoneMatch || emailMatch;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingApts = clientApts.filter(apt => {
    return apt.preferredDate >= todayStr && apt.status !== 'cancelled';
  });

  const previousApts = clientApts.filter(apt => {
    return apt.preferredDate < todayStr || apt.status === 'cancelled';
  });

  // Calculate statistics
  const totalVisits = clientApts.filter(apt => apt.status !== 'cancelled').length;
  
  // Most requested service
  const serviceCounts = clientApts.reduce((acc, apt) => {
    acc[apt.serviceName] = (acc[apt.serviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let preferredService = 'None recorded';
  let maxCount = 0;
  Object.entries(serviceCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      preferredService = name;
    }
  });

  // Most requested stylist
  const stylistCounts = clientApts.reduce((acc, apt) => {
    if (apt.stylistPreference) {
      acc[apt.stylistPreference] = (acc[apt.stylistPreference] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  let preferredStylist = 'Any expert';
  let maxStylistCount = 0;
  Object.entries(stylistCounts).forEach(([name, count]) => {
    if (count > maxStylistCount) {
      maxStylistCount = count;
      preferredStylist = name;
    }
  });

  // Estimate total investment based on matches with current services catalog
  const totalInvestment = clientApts
    .filter(apt => apt.status === 'approved' || apt.preferredDate < todayStr)
    .reduce((sum, apt) => {
      const match = services.find(s => s.id === apt.serviceId || s.name === apt.serviceName);
      return sum + (match ? Number(match.price) : 1500); // Default to a standard 1500 if not found
    }, 0);

  // Find the single absolute last/previous appointment (the most recent past appointment)
  const lastCompletedAppointment = [...previousApts]
    .filter(apt => apt.status !== 'cancelled')
    .sort((a, b) => b.preferredDate.localeCompare(a.preferredDate))[0] || null;

  // Sync preferred time when activeTimes changes
  useEffect(() => {
    if (activeTimes.length > 0 && !activeTimes.includes(preferredTime)) {
      setPreferredTime(activeTimes[0]);
    }
  }, [activeTimes]);

  // Receipt feedback
  const [createdReceipt, setCreatedReceipt] = useState<Appointment | null>(null);

  // Sync profile details if logged in
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setGender(currentUser.gender || 'female');
    }
  }, [currentUser]);

  // Sync pre-selected service if user came from standard catalog click
  useEffect(() => {
    if (preSelectedServiceId) {
      setServiceId(preSelectedServiceId);
    } else if (services.length > 0 && !serviceId) {
      setServiceId(services[0].id);
    }
  }, [preSelectedServiceId, services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const matchedService = services.find(s => s.id === serviceId);
    const serviceName = matchedService ? matchedService.name : 'Custom Hair/Makeup Consultation';

    // Build receipt
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const uniqueId = `BBS-${randomDigits}`;

    const newApt: Appointment = {
      id: uniqueId,
      name,
      phone,
      email,
      gender,
      serviceId,
      serviceName,
      preferredDate,
      preferredTime,
      stylistPreference,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setCheckoutApt(newApt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeReservation = (finalApt: Appointment) => {
    // Check if there is an online payment transaction embedded in notes
    const { paymentStatus, paymentMethod, paymentAmount, paymentTxnId } = parsePaymentFromNotes(finalApt.notes);
    
    // Ensure all transactions (UPI, Card, and Counter/Pay Later) are logged securely in the database
    let finalAmount = paymentAmount;
    let finalMethod = paymentMethod;
    let finalTxnId = paymentTxnId;
    let finalStatus = paymentStatus;

    if (paymentStatus === 'unpaid' && paymentMethod === 'counter') {
      // Calculate full billing amount for the Pay Later path
      const matchedSvc = services.find(s => s.id === finalApt.serviceId);
      const basePrice = matchedSvc ? matchedSvc.price : 1500;
      const { total } = calculateBilling(basePrice);
      finalAmount = total;
      finalMethod = 'counter';
      finalTxnId = 'COUNTER-SALON-' + Math.floor(100000 + Math.random() * 900000);
      finalStatus = 'pending'; // Stays pending until salon staff verifies cash/card at the counter
    }

    const paymentTx: PaymentTransaction = {
      id: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
      appointmentId: finalApt.id,
      customerName: finalApt.name,
      customerPhone: finalApt.phone,
      customerEmail: finalApt.email || '',
      serviceName: finalApt.serviceName,
      amount: finalAmount,
      paymentMethod: finalMethod as any,
      txnId: finalTxnId || 'TXN-GEN-' + Math.floor(100000 + Math.random() * 900000),
      status: finalStatus === 'paid' ? 'verified' : 'pending',
      createdAt: new Date().toISOString()
    };

    savePaymentTransaction(paymentTx).catch(err => {
      console.warn('Failed to persist payment transaction record:', err);
    });

    onAddNewAppointment(finalApt);
    setCreatedReceipt(finalApt);
    setCheckoutApt(null);

    // Send WhatsApp notification to admin
    const isPaid = finalApt.notes?.includes('[PAID');
    const isPendingVerification = finalApt.notes?.includes('[PENDING_VERIFICATION');
    const paymentMsg = isPaid 
      ? "ONLINE PRE-PAID (VERIFIED)" 
      : isPendingVerification 
        ? "ONLINE PAYMENT PENDING ADMIN VERIFICATION" 
        : "PAY AT COUNTER";
    const message = `New Appointment Booking (${paymentMsg}):\nName: ${finalApt.name}\nService: ${finalApt.serviceName}\nDate: ${finalApt.preferredDate}\nTime: ${finalApt.preferredTime}\nNotes: ${finalApt.notes}`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    try {
      window.open(whatsappUrl, '_blank');
    } catch (e) {
      console.warn("WhatsApp popup blocked:", e);
    }

    // reset fields
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setGender(currentUser.gender || 'female');
    } else {
      setName('');
      setPhone('');
      setEmail('');
    }
    setNotes('');

    // Clear checkout fields
    setUpiUtr('');
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardError('');
    setUpiError('');
  };

  const handleRescheduleSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!onRescheduleAppointment || !rescheduleDate || !rescheduleTime) return;

    setIsSubmittingReschedule(true);
    try {
      await onRescheduleAppointment(id, rescheduleDate, rescheduleTime);
      setRescheduleSuccessMsg("Your reservation has been successfully rescheduled!");
      setTimeout(() => {
        setRescheduleSuccessMsg(null);
        setReschedulingId(null);
      }, 2500);
    } catch (err) {
      console.error("Reschedule failed:", err);
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-fade-in text-left">
        <div className="text-center space-y-3">
          <span className="text-[10px] tracking-[0.4em] text-accent uppercase font-bold block">Security Priority Gate</span>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl text-primary tracking-widest font-semibold uppercase">Authentication Required</h2>
          <p className="text-xs text-[#1F2937]/85 font-light max-w-lg mx-auto leading-relaxed">
            To ensure accurate schedules and high-quality premium treatments for our VIP client roster, we require all guests to register or sign in before scheduling their first visit.
          </p>
          <div className="h-[2px] w-12 bg-accent mx-auto mt-2" />
        </div>
        <AuthPage 
          onAuthSuccess={onAuthSuccess} 
          redirectReason="Authenticate or create your Royal account to immediately unlock the scheduled booking cabinet."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 animate-fade-in text-left" id="appointment-path-view">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-[10px] tracking-[0.4em] text-accent uppercase font-bold block">AURA APPOINTMENT RESERVE</span>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl text-primary tracking-widest font-semibold uppercase">Schedule Aura Visit</h1>
        <p className="text-xs sm:text-sm text-[#1F2937]/80 font-light max-w-2xl mx-auto leading-relaxed">
          Unlock your custom styling desk. Your submitted booking is instantly registered to your account.
        </p>
        <div className="h-[2px] w-12 bg-accent mx-auto mt-4" />
      </div>

      {createdReceipt ? (
        // 1. RECEIPT CONSOLE OVERLAY
        <div className="bg-primary border-2 border-accent p-8 text-center space-y-6 animate-fade-in relative overflow-hidden rounded" id="booking-receipt-box">
          <div className="absolute top-0 right-0 bg-[#DDB93B] text-black text-[9px] uppercase tracking-widest font-black px-4 py-1">
            Confirmed Ledger
          </div>
          <div className="text-large text-5xl">✨</div>
          
          <div className="space-y-1">
            <h3 className="font-serif-luxury text-2xl text-white font-bold">Appointment Scheduled!</h3>
            <p className="text-[11px] font-mono text-white/80">Receipt Sequence: <span className="text-[#DDB93B] text-sm font-bold">{createdReceipt.id}</span></p>
          </div>

          <div className="max-w-md mx-auto border-y border-[#DDB93B]/35 py-6 text-left space-y-3.5 text-xs text-white/90 font-light leading-relaxed">
            <p>👨‍💼 <strong className="text-[#DDB93B]">Client:</strong> {createdReceipt.name} (Gender: {createdReceipt.gender})</p>
            <p>📞 <strong className="text-[#DDB93B]">Contact Mobile:</strong> {createdReceipt.phone}</p>
            <p>💇‍♀️ <strong className="text-[#DDB93B]">Selected Care:</strong> {createdReceipt.serviceName}</p>
            <p>📅 <strong className="text-[#DDB93B]">Scheduled Day:</strong> {createdReceipt.preferredDate} at {createdReceipt.preferredTime}</p>
            <p>⭐ <strong className="text-[#DDB93B]">Stylist Preferred:</strong> {createdReceipt.stylistPreference}</p>
            {createdReceipt.notes && (
              <p className="p-3 bg-[#0d3b24] border border-[#DDB93B]/30 font-mono text-[11px] text-white/90 leading-normal">
                📝 <strong>Notes:</strong> {createdReceipt.notes}
              </p>
            )}
          </div>

          <p className="text-xs text-white/90 max-w-lg mx-auto leading-relaxed">
            💡 <strong>Next Actions:</strong> We have logged this request inside our active Yelahanka queue. Shubha or our head clerk will call/text you within 2 hours to confirm your chair timing!
          </p>

          <button
            onClick={() => setCreatedReceipt(null)}
            className="py-2.5 px-6 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black border border-[#DDB93B]/25 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Create Another Reservation
          </button>
        </div>
      ) : checkoutApt ? (
        // 1.5 SECURE LUXURY CHECKOUT GATEWAY
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="aura-luxury-checkout">
          
          {/* LEFT PANEL: BILLING CLEARANCE SUMMARY (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0a0f0d] border border-[#DDB93B]/30 p-6 sm:p-8 text-white space-y-6 relative overflow-hidden rounded">
            <div className="absolute top-0 right-0 bg-[#DDB93B] text-black text-[8px] uppercase tracking-widest font-black px-4 py-1">
              Billing Ledger
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[9px] uppercase tracking-widest font-mono text-[#DDB93B] font-bold block">
                secured reservation settlement
              </span>
              <h3 className="font-serif-luxury text-xl font-bold tracking-wider text-white">Clearance Summary</h3>
            </div>

            {/* Client and booking details */}
            <div className="space-y-2 border-b border-white/5 pb-4 text-xs font-light text-gray-300 text-left">
              <p>👤 <strong className="text-white">Customer:</strong> {checkoutApt.name}</p>
              <p>📞 <strong className="text-white">Contact:</strong> {checkoutApt.phone}</p>
              <p>💇‍♀️ <strong className="text-white">Selected Care:</strong> {checkoutApt.serviceName}</p>
              <p>📅 <strong className="text-white">Schedule:</strong> {checkoutApt.preferredDate} at {checkoutApt.preferredTime}</p>
              <p>⭐ <strong className="text-white">Expert Stylist:</strong> {checkoutApt.stylistPreference}</p>
            </div>

            {/* Itemized Billing Breakdown */}
            {(() => {
              const matchedSvc = services.find(s => s.id === checkoutApt.serviceId);
              const basePrice = matchedSvc ? matchedSvc.price : 1500;
              const { cgst, sgst, total, depositAmount } = calculateBilling(basePrice);
              const activeAmount = isTestMode ? 1 : (paymentOption === 'deposit' ? depositAmount : total);

              return (
                <div className="space-y-4">
                  {/* Sandbox Test Override Panel */}
                  <div className="bg-[#121c17] border border-[#DDB93B]/40 p-4 rounded text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        ⚙️ Sandbox Testing Override
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isTestMode} 
                          onChange={(e) => setIsTestMode(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-8 h-4.5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-600 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#DDB93B]"></div>
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-300 leading-relaxed">
                      {isTestMode 
                        ? "Test Mode Active: All checkout payment options are overridden to ₹1 for hassle-free live UPI and card gateway testing." 
                        : "Test Mode Inactive: Standard booking ledger rates apply."}
                    </p>
                  </div>

                  {/* Detailed pricing */}
                  <div className="space-y-2 text-xs font-mono text-gray-400">
                    <div className="flex justify-between">
                      <span>Service Rate:</span>
                      <span className="text-white">₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-sans font-bold">
                      <span className="text-[#DDB93B]">Grand Total:</span>
                      <span className="text-[#DDB93B]">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    
                    {isTestMode && (
                      <div className="border-t border-dashed border-[#DDB93B]/20 pt-2 flex justify-between text-xs font-bold text-emerald-400">
                        <span>Test Override Active:</span>
                        <span>₹1.00</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Mode Choice Segment */}
                  <div className="space-y-3 pt-2 text-left">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400 block font-bold">
                      choose payment weight
                    </span>
                    
                    {/* Option 1: Deposit (20%) */}
                    <button
                      onClick={() => {
                        setPaymentOption('deposit');
                        if (paymentMethod === 'counter') setPaymentMethod('upi');
                      }}
                      className={`w-full p-4 border text-left transition-all relative ${
                        paymentOption === 'deposit'
                          ? 'border-[#DDB93B] bg-[#0F5232]/20 text-white'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">Secure Seat Deposit (20%)</span>
                        <span className="text-xs font-mono font-bold text-[#DDB93B]">
                          {isTestMode ? "₹1.00 (Test)" : `₹${depositAmount.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <p className="text-[10px] font-light text-gray-300 leading-normal">
                        Pay {isTestMode ? "₹1.00" : `₹${depositAmount.toLocaleString('en-IN')}`} now to confirm reservation. The remaining is settled post-care at the salon counter.
                      </p>
                      {paymentOption === 'deposit' && (
                        <div className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#DDB93B] rounded-full animate-pulse" />
                      )}
                    </button>

                    {/* Option 2: Full Clearance */}
                    <button
                      onClick={() => {
                        setPaymentOption('full');
                        if (paymentMethod === 'counter') setPaymentMethod('upi');
                      }}
                      className={`w-full p-4 border text-left transition-all relative ${
                        paymentOption === 'full'
                          ? 'border-[#DDB93B] bg-[#0F5232]/20 text-white'
                          : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">Complete Advance clearance (100%)</span>
                        <span className="text-xs font-mono font-bold text-[#DDB93B]">
                          {isTestMode ? "₹1.00 (Test)" : `₹${total.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <p className="text-[10px] font-light text-gray-300 leading-normal">
                        Clear all credits now for a seamless VIP bypass at the checkout counter upon arrival.
                      </p>
                      {paymentOption === 'full' && (
                        <div className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#DDB93B] rounded-full animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Back button */}
            <div className="pt-4 border-t border-white/5 text-left">
              <button
                onClick={() => setCheckoutApt(null)}
                className="text-gray-400 hover:text-white text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
              >
                ← Edit Coordinates
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: PAYMENT INTERFACE TERMINAL (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#DDB93B]/20 p-6 sm:p-8 rounded shadow-sm flex flex-col justify-between min-h-[500px]">
            {isProcessingPayment ? (
              /* GATEWAY TERMINAL LOADING SCREEN */
              <div className="my-auto text-center space-y-6 py-12 animate-fade-in" id="gateway-processing-terminal">
                <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-[#0F5232]/10 border-t-[#DDB93B] rounded-full animate-spin" />
                  <span className="text-xl">🔒</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif-luxury text-lg text-gray-900 font-bold tracking-wider">Aura Security clearance</h4>
                  <p className="text-xs text-gray-500 font-mono tracking-wide animate-pulse">
                    {processingStep || "Connecting to secure bank servers..."}
                  </p>
                </div>
                <div className="max-w-xs mx-auto bg-gray-50 p-4 border border-gray-100 rounded text-center text-[10px] text-gray-400 font-mono">
                  Transacting via 256-bit secure SSL transport socket layers. Please do not close or reload this session.
                </div>
              </div>
            ) : (
              /* PAYMENT METHOD DISPLAY PANEL */
              <div className="space-y-6 text-left">
                
                {/* Method selector tabs */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400 block font-bold">
                    choose settlement channel
                  </span>
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                        paymentMethod === 'upi'
                          ? 'bg-[#0F5232] text-white'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Instant UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                        paymentMethod === 'card'
                          ? 'bg-[#0F5232] text-white'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Cards (Stripe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('counter')}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                        paymentMethod === 'counter'
                          ? 'bg-[#0F5232] text-white'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Pay Later
                    </button>
                  </div>
                </div>

                {/* 1. INSTANT UPI SYSTEM PANEL */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 animate-fade-in" id="payment-upi-pane">
                    {(() => {
                      const matchedSvc = services.find(s => s.id === checkoutApt.serviceId);
                      const basePrice = matchedSvc ? matchedSvc.price : 1500;
                      const { total, depositAmount } = calculateBilling(basePrice);
                      const activeAmount = isTestMode ? 1 : (paymentOption === 'deposit' ? depositAmount : total);
                      
                      // Construct standard Indian UPI deep-link URL scheme
                      const upiUrl = `upi://pay?pa=abhishekgatty0-1@okaxis&pn=Abhishek%20Gatty&am=${activeAmount}&cu=INR&tn=Booking%2520${checkoutApt.id}`;
                      const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          {/* Beautiful Replica of Google Pay Scanner */}
                          <div className="md:col-span-6 flex flex-col items-center">
                            <div className="bg-[#f0f4f9] border border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center w-full max-w-[310px] mx-auto shadow-md">
                              {/* Header Avatar and Name */}
                              <div className="flex items-center gap-2.5 self-start pl-2 mb-3">
                                <div className="w-9 h-9 rounded-full bg-[#005fb2] flex items-center justify-center text-white text-base font-bold font-sans">
                                  A
                                </div>
                                <span className="text-sm font-semibold text-slate-800 font-sans tracking-tight">
                                  Abhishek Gatty
                                </span>
                              </div>

                              {/* White QR Code container card */}
                              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center relative w-full">
                                <div className="relative">
                                  <img 
                                    src={qrSrc} 
                                    alt="Abhishek Gatty UPI QR Code" 
                                    className="h-[180px] w-[180px] object-contain select-none"
                                    referrerPolicy="no-referrer"
                                  />
                                  
                                  {/* Center Google Pay Overlay Badge */}
                                  <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-white p-0.5 rounded-full shadow-md border border-slate-100 w-8 h-8 flex items-center justify-center">
                                    <span className="text-[8px] font-sans font-black flex items-center justify-center gap-px select-none">
                                      <span className="text-[#4285F4]">G</span>
                                      <span className="text-[#EA4335]">P</span>
                                      <span className="text-[#FBBC05]">a</span>
                                      <span className="text-[#34A853]">y</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[10px] font-sans font-bold text-slate-600 tracking-wide mt-3 select-all bg-slate-50 px-3 py-1 rounded border border-slate-100 w-full text-center truncate">
                                  UPI ID: abhishekgatty0-1@okaxis
                                </div>
                              </div>

                              {/* Footer note */}
                              <p className="text-[9px] text-slate-500 font-medium tracking-wide mt-3.5 font-sans">
                                Scan to pay with any UPI app
                              </p>
                            </div>
                          </div>

                          {/* UPI Instructions */}
                          <div className="md:col-span-6 space-y-3.5 font-sans text-left">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-1 inline-block">
                              ⚡ GPAY, PHONEPE, PAYTM, BHIM
                            </span>
                            <div className="space-y-2 text-xs text-gray-600 leading-normal">
                              <p>1. Open Google Pay, PhonePe, Paytm or any banking app on your mobile.</p>
                              <p>2. Scan this QR Code or send the exact amount <strong className="text-gray-900 font-bold">₹{activeAmount.toLocaleString('en-IN')}</strong> to the VPA merchant handle below.</p>
                              
                              {/* VPA Copyable box */}
                              <div className="bg-gray-50 border border-gray-200 px-3 py-2 flex justify-between items-center font-mono text-[10px] text-gray-800 rounded mt-1.5">
                                <span className="truncate">VPA: abhishekgatty0-1@okaxis</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('abhishekgatty0-1@okaxis');
                                    setUpiCopied(true);
                                    setTimeout(() => setUpiCopied(false), 2000);
                                  }}
                                  className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold uppercase shrink-0"
                                >
                                  {upiCopied ? "Copied!" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* UTR reference verification field */}
                    <div className="border-t border-gray-100 pt-4 space-y-2.5">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] text-gray-700 uppercase font-bold tracking-widest block">
                          Paste UPI transaction Reference / UTR Number *
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          required
                          value={upiUtr}
                          onChange={(e) => {
                            setUpiUtr(e.target.value.replace(/\D/g, '').substring(0, 12));
                            setUpiError('');
                          }}
                          placeholder="Enter the 12-digit UPI reference number (e.g. 623910549214)"
                          className="w-full bg-white border border-gray-300 px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#DDB93B] text-gray-800"
                        />
                        {isTestMode && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const randomUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                                setUpiUtr(randomUtr);
                                setUpiError('');
                              }}
                              className="text-[9px] font-mono font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded cursor-pointer mt-1"
                            >
                              🧪 Auto-fill Test UTR
                            </button>
                          </div>
                        )}
                        {upiError && <p className="text-[10px] text-red-500 font-mono mt-1">{upiError}</p>}
                        <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded text-[9.5px] text-amber-900 leading-normal space-y-1 mt-1.5">
                          <p><strong>ℹ️ Why is the UTR required?</strong></p>
                          <p className="text-gray-600 font-light">
                            Because you are using a direct personal UPI VPA (<code>abhishekgatty0-1@okaxis</code>) instead of a premium commercial merchant gateway subscription (which charges transaction fees), banks cannot send automatic digital notifications back to websites.
                          </p>
                          <p className="text-gray-600 font-light">
                            Entering your 12-digit UTR from your GPay/PhonePe receipt allows the salon administrator to cross-match and verify your credit instantly in their bank ledger.
                          </p>
                        </div>
                      </div>

                      {/* Submit UPI verification */}
                      {(() => {
                        const matchedSvc = services.find(s => s.id === checkoutApt.serviceId);
                        const basePrice = matchedSvc ? matchedSvc.price : 1500;
                        const { total, depositAmount } = calculateBilling(basePrice);
                        const activeAmount = isTestMode ? 1 : (paymentOption === 'deposit' ? depositAmount : total);

                        const handleUpiSubmit = (e: React.MouseEvent) => {
                          e.preventDefault();
                          if (upiUtr.length !== 12) {
                            setUpiError("Please enter a valid 12-digit numeric UTR reference code.");
                            return;
                          }

                          setIsProcessingPayment(true);
                          setProcessingStep("Polling local UPI node clearance...");

                          setTimeout(() => {
                            setProcessingStep("Verifying transaction Reference with bank network...");
                          }, 1000);

                          setTimeout(() => {
                            setProcessingStep("Matching settlement signature with dynamic ledger...");
                          }, 1800);

                          setTimeout(() => {
                            setIsProcessingPayment(false);
                            // Prepend pending verification payment tag to notes!
                            const updatedNotes = injectPendingPaymentIntoNotes(checkoutApt.notes || '', activeAmount, 'UPI', upiUtr);
                            const finalApt: Appointment = {
                              ...checkoutApt,
                              notes: updatedNotes
                            };
                            completeReservation(finalApt);
                          }, 2800);
                        };

                        return (
                          <button
                            type="button"
                            onClick={handleUpiSubmit}
                            className="w-full py-3 bg-[#0F5232] hover:bg-[#DDB93B] text-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>🔒</span>
                            <span>Verify UPI Transaction Clearance</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 2. CARD SETTLEMENT SYSTEM PANEL */}
                {paymentMethod === 'card' && (
                  <div className="space-y-5 animate-fade-in text-left" id="payment-card-pane">
                    
                    {/* Interactive Animated Credit Card Layout */}
                    <div className="bg-gradient-to-br from-[#0B1511] to-[#122b1f] border border-[#DDB93B]/40 text-white rounded-xl p-5 sm:p-6 space-y-6 shadow-md relative overflow-hidden max-w-sm mx-auto">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-[7px] text-[#DDB93B] tracking-[0.3em] uppercase font-mono font-bold">Aura Premium Platinum</p>
                          <p className="text-[10px] font-bold text-white/95">Body & Beauty Studio</p>
                        </div>
                        <span className="text-xl italic font-black text-[#DDB93B] font-mono leading-none shrink-0 select-none">
                          {cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'RuPay'}
                        </span>
                      </div>

                      {/* Chip mock and NFC wireless wave icon */}
                      <div className="flex justify-between items-center">
                        <div className="h-7 w-9 bg-[#DDB93B]/30 border border-[#DDB93B]/50 rounded-md flex items-center justify-center relative">
                          <div className="absolute inset-x-2.5 inset-y-1.5 border border-white/20" />
                        </div>
                        <span className="text-white/40 text-[14px]">📡</span>
                      </div>

                      {/* Card number display */}
                      <p className="text-sm sm:text-base font-mono tracking-[0.2em] text-white/95 select-none text-center">
                        {cardNumber || "••••  ••••  ••••  ••••"}
                      </p>

                      <div className="flex justify-between text-left">
                        <div className="space-y-0.5">
                          <p className="text-[7px] text-white/40 uppercase tracking-widest font-mono">Card Holder</p>
                          <p className="text-[10px] font-mono text-white tracking-wider truncate max-w-[150px] uppercase">
                            {cardHolder || "AURA CUSTOMER"}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="space-y-0.5">
                            <p className="text-[7px] text-white/40 uppercase tracking-widest font-mono">Expiry</p>
                            <p className="text-[10px] font-mono text-white tracking-wider">{cardExpiry || "MM/YY"}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[7px] text-white/40 uppercase tracking-widest font-mono">CVV</p>
                            <p className="text-[10px] font-mono text-white tracking-wider">{cardCvv ? "•••" : "•••"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card input forms */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Card Holder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => {
                            setCardHolder(e.target.value.substring(0, 24));
                            setCardError('');
                          }}
                          placeholder="ENTER CARD HOLDER NAME"
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#DDB93B] text-gray-800 uppercase"
                        />
                      </div>

                      {/* Number */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').substring(0, 16);
                            const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                            setCardNumber(formatted);
                            setCardError('');
                          }}
                          placeholder="4242 4242 4242 4242"
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#DDB93B] text-gray-800"
                        />
                      </div>

                      {/* Expiry */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Expiration (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                            if (val.length >= 2) {
                              val = val.substring(0, 2) + '/' + val.substring(2);
                            }
                            setCardExpiry(val);
                            setCardError('');
                          }}
                          placeholder="MM/YY"
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#DDB93B] text-gray-800"
                        />
                      </div>

                      {/* CVV */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3));
                            setCardError('');
                          }}
                          placeholder="•••"
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#DDB93B] text-gray-800"
                        />
                      </div>
                    </div>

                    {cardError && <p className="text-[10px] text-red-500 font-mono mt-1 text-center">{cardError}</p>}

                    {/* Card authorize action button */}
                    {(() => {
                      const matchedSvc = services.find(s => s.id === checkoutApt.serviceId);
                      const basePrice = matchedSvc ? matchedSvc.price : 1500;
                      const { total, depositAmount } = calculateBilling(basePrice);
                      const activeAmount = isTestMode ? 1 : (paymentOption === 'deposit' ? depositAmount : total);

                      const handleCardSubmit = (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (!cardHolder || cardNumber.replace(/\s/g, '').length !== 16 || cardExpiry.length !== 5 || cardCvv.length !== 3) {
                          setCardError("Please provide all card details accurately to authorize settlement.");
                          return;
                        }

                        setIsProcessingPayment(true);
                        setProcessingStep("Connecting to secure Visa/Mastercard network...");

                        setTimeout(() => {
                          setProcessingStep("Encrypting payment payload tokens with Stripe APIs...");
                        }, 900);

                        setTimeout(() => {
                          setProcessingStep(`Requesting ₹${activeAmount.toLocaleString('en-IN')} charge authorization from issuing bank...`);
                        }, 1800);

                        setTimeout(() => {
                          setIsProcessingPayment(false);
                          const mockTxn = 'ST-CS-' + Math.floor(100000 + Math.random() * 900000);
                          const updatedNotes = injectPendingPaymentIntoNotes(checkoutApt.notes || '', activeAmount, 'CARD', mockTxn);
                          const finalApt: Appointment = {
                            ...checkoutApt,
                            notes: updatedNotes
                          };
                          completeReservation(finalApt);
                        }, 2800);
                      };

                      return (
                        <button
                          type="button"
                          onClick={handleCardSubmit}
                          className="w-full py-3 bg-[#0F5232] hover:bg-[#DDB93B] text-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>🔒</span>
                          <span>Authorize ₹{activeAmount.toLocaleString('en-IN')} Securely</span>
                        </button>
                      );
                    })()}
                  </div>
                )}

                {/* 3. COUNTER PAY AT SALON PANEL */}
                {paymentMethod === 'counter' && (
                  <div className="space-y-4 animate-fade-in" id="payment-counter-pane">
                    <div className="bg-amber-50 border border-amber-200 p-4 text-left space-y-2 rounded">
                      <div className="flex gap-2 text-amber-900 font-bold text-xs uppercase items-center">
                        <span>⏳</span>
                        <span>counter Pay Settlement Selected</span>
                      </div>
                      <p className="text-[11px] text-amber-800 font-light leading-relaxed">
                        You have chosen to settle payment in cash, card or UPI directly at the Body and Beauty Studio front desk upon completing your makeup or styling appointment.
                      </p>
                      <p className="text-[10px] text-amber-700/80 font-light leading-normal">
                        🚨 <strong className="font-bold">Important Notice:</strong> To ensure high-quality customer care, appointments secured with an online pre-payment enjoy absolute VIP queue priority. On-site payment slots remain pending approval and are subject to live chair traffic density.
                      </p>
                    </div>

                    {(() => {
                      const handleCounterSubmit = (e: React.MouseEvent) => {
                        e.preventDefault();
                        completeReservation(checkoutApt);
                      };

                      return (
                        <button
                          type="button"
                          onClick={handleCounterSubmit}
                          className="w-full py-3 bg-[#0F5232] hover:bg-[#DDB93B] text-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest cursor-pointer text-center"
                        >
                          Confirm Booking & Pay Later
                        </button>
                      );
                    })()}
                  </div>
                )}

              </div>
            )}

            {/* Footer security badge */}
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span>🛡️</span> <span>256-Bit SSL Encryption</span>
              </span>
              <span className="font-mono">PCI-DSS COMPLIANT</span>
            </div>

          </div>
        </div>
      ) : (
        // 2. THE BOOKING FORM
        <div className="bg-white border border-[#DDB93B]/20 p-6 sm:p-10 space-y-8 rounded shadow-sm">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-serif-luxury text-xl text-[#DDB93B] tracking-widest font-semibold uppercase">The Booking Cabinet</h3>
            <p className="text-xs text-[#0F5232] font-light mt-1">Please provide accurate contact coordinates for priority response.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="salon-booking-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Client Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Client Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    id="booking-name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] placeholder-gray-600 focus:outline-none focus:border-[#DDB93B]"
                  />
                  <User className="absolute right-3 top-3 h-4 w-4 text-[#0F5232]" />
                </div>
              </div>

              {/* Mobile Phone Input */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Mobile phone number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    id="booking-phone"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] placeholder-gray-600 focus:outline-none focus:border-[#DDB93B]"
                  />
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-[#0F5232]" />
                </div>
              </div>

              {/* Email Address Input */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block font-sans">Email address (Optional)</label>
                <div className="relative">
                  <input
                    type="email"
                    id="booking-email"
                    placeholder="name@luxurymail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] placeholder-gray-600 focus:outline-none focus:border-[#DDB93B]"
                  />
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-[#0F5232]" />
                </div>
              </div>

              {/* Gender Radio */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Gender Category *</label>
                <select
                  id="booking-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] focus:outline-none focus:border-[#DDB93B] h-[38px] cursor-pointer"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>

              {/* Service Selection dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Select Desired Aura Treatment *</label>
                <select
                  id="booking-service"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] focus:outline-none focus:border-[#DDB93B] h-[38px] cursor-pointer"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.category} — {svc.name} (₹{svc.price.toLocaleString('en-IN')})
                    </option>
                  ))}
                  <option value="custom-consultation">Other / Bespoke Custom Consultation</option>
                </select>
              </div>

              {/* Stylist Preference */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Stylist / therapist preference</label>
                <select
                  id="booking-stylist"
                  value={stylistPreference}
                  onChange={(e) => setStylistPreference(e.target.value)}
                  className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] focus:outline-none focus:border-[#DDB93B] h-[38px] cursor-pointer"
                >
                  <option value="Shubha">Shubha (Lead Makeup Artist & Dermo-Director)</option>
                  <option value="Senior Hair Expert">Senior Hair Expert (Keratin & Balayage Stylist)</option>
                  <option value="Nails & Extension Stylist">Nails & Extension Detail Specialist</option>
                  <option value="No Preference">No preference (First available clerk)</option>
                </select>
              </div>

              {/* Preferred Date picker */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Preferred Calendar Day *</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    id="booking-date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] focus:outline-none focus:border-[#DDB93B]"
                  />
                </div>
              </div>

              {/* Preferred Time selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Preferred Time Slot *</label>
                <select
                  id="booking-time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-[#DDB93B] focus:outline-none focus:border-[#DDB93B] h-[38px] cursor-pointer"
                >
                  {activeTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Custom Notes */}
            <div className="space-y-2">
              <label className="text-[10px] text-[#1F2937]/80 uppercase font-bold tracking-widest block">Bespoke instructions / Lehenga Draping Notes / Skin History</label>
              <textarea
                rows={4}
                id="booking-notes"
                placeholder="Include lehenga fabric details, hair concerns, style requirements, or club membership note if acquiring VIP tiers..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black border border-gray-200 p-4 font-sans text-xs text-[#DDB93B] placeholder-gray-600 focus:outline-none focus:border-[#DDB93B] resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-[10px] text-gray-500 font-mono">
                🛡 Confirmed RLS secure transaction.
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-3.5 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black hover:border-transparent text-[10px] uppercase font-bold tracking-widest border border-[#DDB93B]/35 transition-all text-center cursor-pointer"
              >
                Log Reservation
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 3. CLIENT RESERVATIONS HISTORY & RESCHEDULING CABINET */}
      <div className="bg-white border border-[#DDB93B]/20 p-6 sm:p-10 space-y-6 rounded shadow-sm" id="customer-cabinet-section">
        <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif-luxury text-lg text-[#0F5232] tracking-widest font-semibold uppercase flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#DDB93B]" /> Client Cabinet & Profile
            </h3>
            <p className="text-[11px] text-gray-500 font-light mt-0.5">
              Manage your personal beauty catalog, scheduled seat times, and past aesthetic treatment records.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/50 rounded">
              Cabinet ID: {currentUser.phone}
            </span>
          </div>
        </div>

        {/* Dynamic Tabs Selection */}
        <div className="flex border-b border-gray-100 gap-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setCabinetTab('profile')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              cabinetTab === 'profile'
                ? 'border-[#0F5232] text-[#0F5232]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#DDB93B]" /> My Beauty Profile
          </button>
          <button
            type="button"
            onClick={() => setCabinetTab('upcoming')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              cabinetTab === 'upcoming'
                ? 'border-[#0F5232] text-[#0F5232]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-[#DDB93B]" /> Upcoming Visits ({upcomingApts.length})
          </button>
          <button
            type="button"
            onClick={() => setCabinetTab('past')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              cabinetTab === 'past'
                ? 'border-[#0F5232] text-[#0F5232]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <History className="h-3.5 w-3.5 text-[#DDB93B]" /> Previous Appointments ({previousApts.length})
          </button>
        </div>

        {/* TAB 1: Profile and Beauty Preferences Dashboard */}
        {cabinetTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            {/* Elegant Welcome Hero */}
            <div className="bg-gradient-to-r from-[#0F5232] to-[#1a6642] text-white p-6 sm:p-8 rounded relative overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <Sparkles className="h-32 w-32" />
              </div>
              <div className="space-y-2 relative z-10">
                <span className="text-[10px] tracking-widest text-[#DDB93B] font-bold uppercase block">Royal VIP Resident</span>
                <h4 className="font-serif-luxury text-xl sm:text-2xl font-semibold tracking-wide text-white">
                  Welcome Back, {currentUser.name}!
                </h4>
                <p className="text-xs text-white/80 max-w-xl font-light leading-relaxed">
                  We are honored to accompany you on your luxury aesthetic journey. Your personalized styling preferences and historical skin/hair treatment records are privately secured under your profile.
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-gray-100 bg-gray-50/50 p-4 rounded text-left space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <CheckCircle className="h-3.5 w-3.5 text-[#0F5232]" /> Total Sessions
                </div>
                <div className="text-xl font-serif-luxury font-bold text-gray-900">{totalVisits}</div>
                <p className="text-[9px] text-gray-500">Completed or active visits</p>
              </div>

              <div className="border border-gray-100 bg-gray-50/50 p-4 rounded text-left space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <Scissors className="h-3.5 w-3.5 text-[#0F5232]" /> Preferred Care
                </div>
                <div className="text-xs font-semibold text-gray-900 truncate" title={preferredService}>
                  {preferredService}
                </div>
                <p className="text-[9px] text-gray-500">Most requested treatment</p>
              </div>

              <div className="border border-gray-100 bg-gray-50/50 p-4 rounded text-left space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <Award className="h-3.5 w-3.5 text-[#0F5232]" /> Favorite Artist
                </div>
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {preferredStylist}
                </div>
                <p className="text-[9px] text-gray-500">Primary seat priority</p>
              </div>

              <div className="border border-gray-100 bg-gray-50/50 p-4 rounded text-left space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5 text-[#0F5232]" /> Aesthetic Value
                </div>
                <div className="text-xl font-serif-luxury font-bold text-[#0F5232]">
                  ₹{totalInvestment.toLocaleString('en-IN')}
                </div>
                <p className="text-[9px] text-gray-500">Estimated lifetime spend</p>
              </div>
            </div>

            {/* Profile Information & Last Appointment Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details */}
              <div className="border border-gray-100 p-5 rounded space-y-4">
                <h5 className="text-xs uppercase tracking-widest font-bold text-[#0F5232] border-b border-gray-100 pb-2 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-[#DDB93B]" /> Registry Information
                </h5>
                <div className="space-y-3 text-xs font-light">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">Full Name:</span>
                    <strong className="font-semibold text-gray-800">{currentUser.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">Mobile Phone:</span>
                    <strong className="font-semibold text-gray-800">{currentUser.phone}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">Email Address:</span>
                    <strong className="font-semibold text-gray-800">{currentUser.email || 'None on record'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">Preferred Gender ID:</span>
                    <strong className="font-semibold text-gray-800 capitalize">{currentUser.gender || 'female'}</strong>
                  </div>
                </div>
              </div>

              {/* Last Visited Session info */}
              <div className="border border-gray-100 p-5 rounded space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h5 className="text-xs uppercase tracking-widest font-bold text-[#0F5232] border-b border-gray-100 pb-2 flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-[#DDB93B]" /> Last Appointment Summary
                  </h5>
                  {lastCompletedAppointment ? (() => {
                    const { paymentStatus, paymentMethod, paymentAmount, cleanNotes } = parsePaymentFromNotes(lastCompletedAppointment.notes);
                    return (
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {lastCompletedAppointment.id}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            lastCompletedAppointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            lastCompletedAppointment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            lastCompletedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {lastCompletedAppointment.status}
                          </span>
                          {paymentStatus === 'paid' ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Paid: ₹{paymentAmount} ({paymentMethod.toUpperCase()})
                            </span>
                          ) : paymentStatus === 'pending' ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                              ⌛ Processing: ₹{paymentAmount} ({paymentMethod.toUpperCase()})
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200">
                              Settle at Counter
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 font-serif-luxury">
                          {lastCompletedAppointment.serviceName}
                        </p>
                        <div className="text-[11px] text-gray-500 space-y-1 font-light">
                          <p>🗓 <strong>Date:</strong> {lastCompletedAppointment.preferredDate} at {lastCompletedAppointment.preferredTime}</p>
                          <p>✂️ <strong>Stylist:</strong> {lastCompletedAppointment.stylistPreference || 'Any expert'}</p>
                        </div>
                        {cleanNotes && (
                          <p className="text-[10px] italic text-gray-400 font-mono mt-1 border-l-2 border-[#DDB93B] pl-2">
                            “{cleanNotes}”
                          </p>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="text-center py-6 text-gray-400 space-y-1">
                      <p className="text-xs font-semibold">No past appointments recorded</p>
                      <p className="text-[10px] font-light max-w-[240px] mx-auto leading-normal">
                        Your previous treatments will be listed here as soon as they are completed.
                      </p>
                    </div>
                  )}
                </div>
                
                {upcomingApts.length > 0 && (
                  <div className="bg-[#0F5232]/5 border border-[#0F5232]/20 p-3 rounded text-center mt-2">
                    <p className="text-[10px] text-[#0F5232] font-semibold uppercase tracking-wider">
                      🔔 You have {upcomingApts.length} upcoming visits!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Upcoming Visits & Rescheduling */}
        {cabinetTab === 'upcoming' && (
          <div className="space-y-4 animate-fade-in">
            {upcomingApts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded space-y-3">
                <Calendar className="h-8 w-8 text-[#DDB93B]/60 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700">No upcoming visits</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    You do not have any active appointments scheduled for the future. Use the booking form above to request an aura slot!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingApts.map((apt) => {
                  const isRescheduling = reschedulingId === apt.id;
                  const { paymentStatus, paymentMethod, paymentAmount, cleanNotes } = parsePaymentFromNotes(apt.notes);

                  return (
                    <div 
                      key={apt.id} 
                      className={`border rounded p-4 sm:p-6 transition-all ${
                        isRescheduling 
                          ? 'border-[#DDB93B] bg-amber-50/20 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Appointment metadata */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono tracking-wider font-semibold text-[#DDB93B] uppercase">
                              Ref: {apt.id}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                              apt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              apt.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800' // rescheduled
                            }`}>
                              {apt.status}
                            </span>
                            <span className="text-gray-300">•</span>
                            {paymentStatus === 'paid' ? (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Paid: ₹{paymentAmount} ({paymentMethod.toUpperCase()})
                              </span>
                            ) : paymentStatus === 'pending' ? (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                                ⌛ Processing: ₹{paymentAmount} ({paymentMethod.toUpperCase()})
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200">
                                Settle at Counter
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif-luxury text-sm font-semibold text-gray-900 tracking-wide">
                            {apt.serviceName}
                          </h4>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600 font-light">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-[#0F5232]" />
                              Scheduled: <strong className="font-semibold text-gray-800">{apt.preferredDate}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#0F5232]" />
                              Slot: <strong className="font-semibold text-gray-800">{apt.preferredTime}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-[#0F5232]" />
                              Stylist: <span className="font-medium text-gray-800">{apt.stylistPreference || 'Any expert'}</span>
                            </span>
                          </div>

                          {cleanNotes && (
                            <p className="text-[10px] text-gray-500 font-mono italic bg-gray-50 p-2 rounded border border-gray-100 max-w-lg">
                              “{cleanNotes}”
                            </p>
                          )}
                        </div>

                        {/* Reschedule button trigger */}
                        {!isRescheduling && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              setReschedulingId(apt.id);
                              setRescheduleDate(apt.preferredDate);
                              setRescheduleTime(apt.preferredTime);
                            }}
                            className="self-start md:self-center flex items-center gap-1.5 px-4 py-2 border border-[#0F5232]/35 hover:border-[#DDB93B] hover:bg-[#DDB93B]/10 rounded text-[11px] font-bold uppercase tracking-wider text-[#0F5232] transition-all cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" /> Reschedule Slot
                          </button>
                        )}
                      </div>

                      {/* Inline Rescheduling Console */}
                      {isRescheduling && (
                        <form 
                          onSubmit={(e) => handleRescheduleSubmit(e, apt.id)}
                          className="mt-4 pt-4 border-t border-[#DDB93B]/20 space-y-4 animate-fade-in"
                        >
                          <div className="bg-amber-50/50 border border-amber-200/50 p-3 rounded flex items-start gap-2.5">
                            <AlertCircle className="h-4 w-4 text-[#DDB93B] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-bold text-amber-900">Rescheduling Active Session</p>
                              <p className="text-[10px] text-amber-800 font-light leading-relaxed">
                                Select a new calendar day and preferred hour slot below. Your changes will immediately notify our salon clerks for instant seat realignment.
                              </p>
                            </div>
                          </div>

                          {rescheduleSuccessMsg && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-[11px] font-semibold flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-600 animate-bounce" />
                              {rescheduleSuccessMsg}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* New Date */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block">
                                Choose New Calendar Day
                              </label>
                              <input
                                type="date"
                                required
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="w-full bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#DDB93B]"
                              />
                            </div>

                            {/* New Time Slot */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest block">
                                Choose New Time Hour
                              </label>
                              <select
                                value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                className="w-full bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#DDB93B] h-[34px] cursor-pointer"
                              >
                                {activeTimes.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-end pt-2">
                            <button
                              type="button"
                              disabled={isSubmittingReschedule}
                              onClick={() => setReschedulingId(null)}
                              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-600 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
                            >
                              Keep Current Slot
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingReschedule}
                              className="px-5 py-2 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black text-[10px] uppercase font-bold tracking-wider rounded transition-all flex items-center gap-1 cursor-pointer"
                            >
                              {isSubmittingReschedule ? (
                                <>
                                  <RotateCcw className="h-3 w-3 animate-spin" /> Aligning...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3" /> Update Session Time
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Previous Appointments History */}
        {cabinetTab === 'past' && (
          <div className="space-y-4 animate-fade-in">
            {previousApts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded space-y-3">
                <History className="h-8 w-8 text-[#DDB93B]/60 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700">No past visits recorded</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    You do not have any cancelled or past visits in our luxury ledger yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[...previousApts].sort((a, b) => b.preferredDate.localeCompare(a.preferredDate)).map((apt) => {
                  const { paymentStatus, paymentMethod, paymentAmount, cleanNotes } = parsePaymentFromNotes(apt.notes);
                  return (
                    <div 
                      key={apt.id} 
                      className="border border-gray-200 bg-gray-50/30 p-4 sm:p-5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 transition-all text-left"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono tracking-wider font-semibold text-[#DDB93B] uppercase">
                            Ref: {apt.id}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            apt.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          }`}>
                            {apt.status === 'cancelled' ? 'Cancelled' : 'Completed Visit'}
                          </span>
                          <span className="text-gray-300">•</span>
                          {paymentStatus === 'paid' ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Paid: ₹{paymentAmount} ({paymentMethod.toUpperCase()})
                            </span>
                          ) : paymentStatus === 'pending' ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                              ⌛ Processing: ₹{paymentAmount} ({paymentMethod.toUpperCase()})
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200">
                              Settle at Counter
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif-luxury text-sm font-semibold text-gray-800 tracking-wide">
                          {apt.serviceName}
                        </h4>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 font-light">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            Date: <strong className="font-medium text-gray-700">{apt.preferredDate}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            Time: <strong className="font-medium text-gray-700">{apt.preferredTime}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            Artist: <span className="font-medium text-gray-700">{apt.stylistPreference || 'Any expert'}</span>
                          </span>
                        </div>

                        {cleanNotes && (
                          <p className="text-[10px] text-gray-400 font-mono italic max-w-lg">
                            “{cleanNotes}”
                          </p>
                        )}
                      </div>

                      <div className="self-start sm:self-center shrink-0">
                        <span className="text-[11px] font-mono px-3 py-1 bg-white border border-gray-100 rounded text-[#0F5232] font-semibold">
                          Visit Archived
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
