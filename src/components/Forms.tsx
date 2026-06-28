/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SERVICES } from '../data';
import { Calendar, Clock, Smile, Sparkles, User, Scissors, CheckCircle, FileText } from 'lucide-react';
import { Appointment } from '../types';

// ==================== APPOINTMENT BOOKING FORM ====================
interface AppointmentFormProps {
  preselectedServiceId?: string;
  onAppointmentCreated: (appointment: Appointment) => void;
  onBackToServices: () => void;
}

export function AppointmentForm({ 
  preselectedServiceId = '', 
  onAppointmentCreated,
  onBackToServices
}: AppointmentFormProps) {
  // Form values
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('female');
  const [serviceId, setServiceId] = useState(preselectedServiceId || SERVICES[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [stylistPreference, setStylistPreference] = useState('No Preference');
  const [notes, setNotes] = useState('');

  // UI state
  const [submitted, setSubmitted] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Appointment | null>(null);

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const stylists = [
    'No Preference (Assign best available)',
    'Shubha (Founder & Master Educator)',
    'Ayesha (Lead Nail Sculptor)',
    'Elena (Professional Aesthetician)',
    'Rajesh (Senior Hair Stylist)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !preferredDate || !preferredTime) {
      alert('Please fill out all required fields to register your session.');
      return;
    }

    const selectedServiceObj = SERVICES.find(s => s.id === serviceId);
    const serviceName = selectedServiceObj ? selectedServiceObj.name : 'Custom Therapy';

    const newBooking: Appointment = {
      id: 'BBS-' + Math.floor(100000 + Math.random() * 900000),
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

    onAppointmentCreated(newBooking);
    setCreatedBooking(newBooking);
    setSubmitted(true);
  };

  const selectedServiceDetails = SERVICES.find(s => s.id === serviceId);

  if (submitted && createdBooking) {
    return (
      <div className="max-w-2xl mx-auto bg-[#0F5232] border border-[#DDB93B]/50 p-8 text-center relative overflow-hidden rounded">
        {/* Decorative Gold Elements */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#DDB93B] via-white to-[#DDB93B]" />
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/10 border border-[#DDB93B]/40 text-[#DDB93B] rounded-full">
            <CheckCircle className="h-10 w-10 text-[#DDB93B]" />
          </div>
        </div>

        <span className="text-xs uppercase tracking-[0.4em] text-[#DDB93B]">Reservation Confirmed</span>
        <h2 className="font-serif-luxury text-3xl text-white font-normal mt-2">Bespoke Session Secured</h2>
        
        <p className="text-sm text-white/90 mt-4 max-w-md mx-auto font-light">
          Greetings <span className="text-white font-bold">{createdBooking.name}</span>, your exclusive pampering appointment has been placed successfully. A text confirmation code has been dispatched to your device.
        </p>

        {/* Appointment Card Ticket layout */}
        <div className="mt-8 p-6 bg-white border border-[#DDB93B]/25 text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#DDB93B]/15">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Booking Reference</span>
              <span className="text-sm font-semibold text-[#DDB93B] font-mono uppercase">{createdBooking.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Status</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 uppercase tracking-wider">PENDING APPROVAL</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-gray-800">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Service Selected</span>
              <span className="text-xs font-semibold text-gray-900">{createdBooking.serviceName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Assigned Specialist</span>
              <span className="text-xs font-medium text-gray-900">{createdBooking.stylistPreference}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Target Slot</span>
              <span className="text-xs font-medium text-gray-900 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3 text-[#DDB93B]" /> {createdBooking.preferredDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Time Schedule</span>
              <span className="text-xs font-medium text-gray-900 flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-[#DDB93B]" /> {createdBooking.preferredTime}
              </span>
            </div>
          </div>

          {selectedServiceDetails && (
            <div className="pt-3 border-t border-[#DDB93B]/15 flex justify-between items-center">
              <span className="text-xs text-gray-500">Total Estimated Cost :</span>
              <span className="text-base font-serif-luxury text-gray-900 font-bold">₹{selectedServiceDetails.price}</span>
            </div>
          )}
        </div>

        {/* Studio Directions guide */}
        <div className="mt-8 text-xs text-white/80 leading-relaxed max-w-md mx-auto">
          <p className="font-bold text-[#DDB93B] uppercase tracking-wider mb-1">Getting to the Studio:</p>
          <p>Body and Beauty Studio, 2nd Floor, Major Sandeep Unnikrishnan Road, Yelahanka Satellite Town, Bengaluru. Ample valet parking is available on site.</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onBackToServices}
            className="py-3 px-6 bg-transparent border border-white/30 text-white/90 hover:text-white hover:border-white text-xs uppercase tracking-widest font-bold cursor-pointer"
          >
            Explore Services
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setCreatedBooking(null);
              setName('');
              setPhone('');
              setEmail('');
              setNotes('');
            }}
            className="py-3 px-6 bg-[#DDB93B] text-black border border-transparent hover:bg-white hover:text-black text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer"
          >
            Schedule Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white border border-[#DDB93B]/20 p-6 sm:p-10 relative rounded shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
        <Sparkles className="h-32 w-32 text-[#DDB93B]" />
      </div>

      <div className="mb-8 border-b border-gray-900 pb-5">
        <h3 className="font-serif-luxury text-2xl text-gray-900 font-medium tracking-wide">
          Bespoke Appointment Booking
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xl">
          Complete the details below to claim your designated luxurious beauty session. Standard reservation processing takes less than 30 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Full Name <span className="text-[#DDB93B]">*</span></label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DDB93B]/60" />
            <input
              type="text"
              required
              placeholder="e.g. Priyanjali Sen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/60 border border-gray-800 focus:border-[#DDB93B] outline-none py-3 pl-10 pr-4 text-gray-900 text-sm transition-colors"
              id="apt-name-input"
            />
          </div>
        </div>

        {/* Phone input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Phone Number <span className="text-[#DDB93B]">*</span></label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DDB93B]/60" />
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/60 border border-gray-800 focus:border-[#DDB93B] outline-none py-3 pl-10 pr-4 text-gray-900 text-sm transition-colors"
              id="apt-phone-input"
            />
          </div>
        </div>

        {/* Email input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Email Address <span className="text-[#DDB93B]">*</span></label>
          <input
            type="email"
            required
            placeholder="e.g. customer@premium.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/60 border border-gray-800 focus:border-[#DDB93B] outline-none py-3 px-4 text-gray-900 text-sm transition-colors"
            id="apt-email-input"
          />
        </div>

        {/* Gender Choice */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Gender Preference</label>
          <div className="grid grid-cols-3 gap-3">
            {['female', 'male', 'unspecified'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setGender(opt)}
                className={`py-2.5 px-3 uppercase text-xs font-semibold tracking-wider transition-all border outline-none ${
                  gender === opt
                    ? 'bg-[#0F5232]/30 border-[#DDB93B] text-[#DDB93B]'
                    : 'bg-white/40 border-gray-800 hover:border-gray-500 text-gray-500'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Service Picker */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Desired Salon Therapy <span className="text-[#DDB93B]">*</span></label>
          <div className="relative">
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full bg-white border border-gray-800 focus:border-[#DDB93B] outline-none py-3 px-4 text-gray-900 text-sm appearance-none cursor-pointer"
              id="apt-service-picker"
            >
              {SERVICES.map((srv) => (
                <option key={srv.id} value={srv.id} className="bg-[#121212] py-2">
                  {srv.category} — {srv.name} (₹{srv.price})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#DDB93B]">
              ▼
            </div>
          </div>
          {selectedServiceDetails && (
            <div className="bg-[#0F5232]/5 p-3.5 border border-[#0F5232]/25 text-xs text-gray-500 leading-snug">
              <span className="text-[#DDB93B] font-semibold block mb-1">Estimated Duration: {selectedServiceDetails.duration}</span>
              {selectedServiceDetails.description}
            </div>
          )}
        </div>

        {/* Day selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Preferred Date <span className="text-[#DDB93B]">*</span></label>
          <div className="relative">
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full bg-white/60 border border-gray-800 focus:border-[#DDB93B] outline-none py-3 px-4 text-gray-900 text-sm transition-colors cursor-pointer"
              id="apt-date-picker"
            />
          </div>
        </div>

        {/* Time hour selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Preferred Time Slot <span className="text-[#DDB93B]">*</span></label>
          <div className="relative">
            <select
              required
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full bg-white border border-gray-800 focus:border-[#DDB93B] outline-none py-3 px-4 text-gray-900 text-sm appearance-none cursor-pointer"
              id="apt-time-picker"
            >
              <option value="">-- Choose Slot --</option>
              {availableTimes.map((time) => (
                <option key={time} value={time} className="bg-[#121212]">{time}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#DDB93B]">
              ▼
            </div>
          </div>
        </div>

        {/* Stylist Preference */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Stylist & Therapist Preference</label>
          <div className="relative">
            <select
              value={stylistPreference}
              onChange={(e) => setStylistPreference(e.target.value)}
              className="w-full bg-white border border-gray-800 focus:border-[#DDB93B] outline-none py-3 px-4 text-gray-900 text-sm appearance-none cursor-pointer"
              id="apt-stylist-picker"
            >
              {stylists.map((styl) => (
                <option key={styl} value={styl} className="bg-[#121212]">{styl}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#DDB93B]">
              ▼
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Special Notes or Allergies</label>
          <textarea
            placeholder="Indicate custom requests, specific look expectations, skin vulnerabilities, or nail length requests if any."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white/60 border border-gray-800 focus:border-[#DDB93B] outline-none p-4 text-gray-900 text-sm transition-colors resize-none"
            id="apt-notes-textarea"
          />
        </div>

      </div>

      <div className="mt-8 pt-6 border-t border-gray-900 flex justify-between items-center flex-col sm:flex-row gap-4">
        <p className="text-[10px] text-gray-500 leading-snug">
          🛡️ By booking, you reserve an elite stylist time lock. Cancellations are free up to 4 hours prior. Please arrive 10 minutes prior for hydration prep.
        </p>
        <button
          type="submit"
          id="apt-submit-button"
          className="w-full sm:w-auto py-3.5 px-8 bg-[#0F5232] text-white border border-[#DDB93B]/45 hover:bg-[#DDB93B] hover:text-black font-black uppercase text-xs tracking-widest transition-all duration-300 shadow-md cursor-pointer"
        >
          Dispatch Booking Request
        </button>
      </div>

    </form>
  );
}

// ==================== CONTACT FORM ====================
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 5000);
  };

  return (
    <div className="bg-white border border-[#DDB93B]/20 p-6 sm:p-8 rounded shadow-sm">
      {success ? (
        <div className="py-12 text-center space-y-4">
          <div className="p-3 bg-[#0F5232]/10 border border-[#DDB93B]/35 inline-block text-[#DDB93B] rounded-full">
            <CheckCircle className="h-8 w-8 text-[#0F5232]" />
          </div>
          <h4 className="font-serif-luxury text-xl text-[#0F5232] font-semibold">Inquiry Dispatched Successfully</h4>
          <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
            Your premium consultation details have been logged in our studio terminal. Shubha's team will connect with you via email or call within 2 business hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h3 className="font-serif-luxury text-xl text-[#0F5232] tracking-wide font-semibold uppercase">Bespoke Inquiry Form</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Your Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shalini Hegde"
              className="w-full bg-white border border-[#DDB93B]/30 focus:border-[#DDB93B] p-3 text-[#1F2937] placeholder-gray-400 text-sm outline-none transition-colors rounded-none"
              id="ct-name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Your Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. shalini@example.com"
              className="w-full bg-white border border-[#DDB93B]/30 focus:border-[#DDB93B] p-3 text-[#1F2937] placeholder-gray-400 text-sm outline-none transition-colors rounded-none"
              id="ct-email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Pre-bridal customized package inquiries"
              className="w-full bg-white border border-[#DDB93B]/30 focus:border-[#DDB93B] p-3 text-[#1F2937] placeholder-gray-400 text-sm outline-none transition-colors rounded-none"
              id="ct-subject"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Message or Requirements *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please elaborate on your styling or wellness requests."
              className="w-full bg-white border border-[#DDB93B]/30 focus:border-[#DDB93B] p-4 text-[#1F2937] placeholder-gray-400 text-sm outline-none transition-colors resize-none rounded-none"
              id="ct-message"
            />
          </div>

          <button
            type="submit"
            id="ct-submit-btn"
            className="w-full py-3 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black font-black uppercase text-xs tracking-widest border border-transparent transition-all cursor-pointer rounded-none"
          >
            Submit Inquiry
          </button>
        </form>
      )}
    </div>
  );
}

// ==================== BRIDAL CONSULTATION FORM ====================
export function BridalConsultationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState('0');
  const [makeupType, setMakeupType] = useState('airbrush');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !eventDate) return;
    setDone(true);
  };

  return (
    <div className="bg-[#0F5232] border-2 border-[#DDB93B] p-6 sm:p-10 relative overflow-hidden rounded shadow-lg">
      {done ? (
        <div className="text-center py-10 space-y-5 text-white">
          <div className="inline-block p-4 bg-white/10 text-[#DDB93B] border border-[#DDB93B] rounded-full animate-bounce">
            👑
          </div>
          <h4 className="font-serif-luxury text-2xl text-[#DDB93B] font-semibold font-serif uppercase tracking-widest">Bridal File Initialized</h4>
          <p className="text-xs text-white/95 max-w-md mx-auto leading-relaxed font-light">
            Beautiful! Shubha, our principal founder, has received your deluxe bridal blueprint. A senior wedding counselor will contact you at <span className="text-[#DDB93B] font-bold">{phone}</span> within 4 hours to arrange your complimentary mock trail and coffee discussion.
          </p>
          <button
            onClick={() => {
              setDone(false);
              setName('');
              setPhone('');
              setEventDate('');
              setVenue('');
              setGuestCount('0');
            }}
            className="py-2.5 px-6 border border-[#DDB93B] text-[#DDB93B] hover:bg-white hover:text-black hover:border-transparent transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer rounded-none"
          >
            Form New Blueprint
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-[#DDB93B]/30 pb-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#DDB93B] block font-bold">Custom Bridal Consultation</span>
            <h3 className="font-serif-luxury text-2xl text-white font-medium mt-1 uppercase tracking-wide">Design Your Perfect Day</h3>
            <p className="text-xs text-white/85 mt-1 font-light">Our personalized bridal planning guarantees you look absolutely angelic during the ceremonies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#DDB93B] block font-bold">Bride's Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Diya Gatty"
                className="w-full bg-white border border-[#DDB93B]/35 p-2.5 text-[#1F2937] placeholder-gray-400 text-xs outline-none rounded-none"
                id="bd-name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#DDB93B] block font-bold">Contact Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 91111 22222"
                className="w-full bg-white border border-[#DDB93B]/35 p-2.5 text-[#1F2937] placeholder-gray-400 text-xs outline-none rounded-none"
                id="bd-phone"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#DDB93B] block font-bold">Wedding Ceremony Date *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-white border border-[#DDB93B]/35 p-2.5 text-[#1F2937] text-xs outline-none cursor-pointer rounded-none"
                id="bd-date"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#DDB93B] block font-bold">Ceremony Venue / City</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Grand Sheraton, Bengaluru"
                className="w-full bg-white border border-[#DDB93B]/35 p-2.5 text-[#1F2937] placeholder-gray-400 text-xs outline-none rounded-none"
                id="bd-venue"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#DDB93B] block font-bold">Style Preference</label>
              <select
                value={makeupType}
                onChange={(e) => setMakeupType(e.target.value)}
                className="w-full bg-white border border-[#DDB93B]/35 p-2.5 text-[#1F2937] text-xs outline-none cursor-pointer rounded-none h-[38px]"
                id="bd-makeup"
              >
                <option value="airbrush">Airbrush Flawless Glam</option>
                <option value="hd">Ultra HD Soft Matte</option>
                <option value="dewy">Editorial Dewy Glass Glow</option>
                <option value="traditional">Traditional Bridal Makeup</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#DDB93B] block font-bold">Additional Guest Makeups</label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full bg-white border border-[#DDB93B]/35 p-2.5 text-[#1F2937] text-xs outline-none cursor-pointer rounded-none h-[38px]"
                id="bd-guests"
              >
                <option value="0">None (Bride Only)</option>
                <option value="1-3">1 to 3 Bridesmaids/Cousins</option>
                <option value="4-7">4 to 7 Family Members</option>
                <option value="8+">8 or more Guests (Elite Salon Lockout)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            id="bd-submit-button"
            className="w-full py-3.5 bg-[#DDB93B] text-[#0F5232] font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#0F5232] hover:border-transparent border border-transparent transition-all cursor-pointer shadow-lg rounded-none"
          >
            Claim Bridal Consultation Slots
          </button>
        </form>
      )}
    </div>
  );
}
