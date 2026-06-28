/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Users, Scissors, Image as ImageIcon, X, 
  Calendar, Clock, Sparkles, LogOut, Bell, BellOff, CreditCard
} from 'lucide-react';
import { Appointment, Service, GalleryItem, UserProfile, BeforeAfterItem } from '../types';
import { 
  updateAppointmentStatus,
  updateCustomService, removeCustomService,
  saveAppointment, supabase, SUPABASE_SQL_SETUP
} from '../supabaseClient';

// Import sub-components
import OverviewTab from './admin/OverviewTab';
import AppointmentsTab from './admin/AppointmentsTab';
import CustomersTab from './admin/CustomersTab';
import ServicesTab from './admin/ServicesTab';
import GalleryTab from './admin/GalleryTab';
import TransformationsTab from './admin/TransformationsTab';
import SlotsTab from './admin/SlotsTab';
import PaymentsTab from './admin/PaymentsTab';

interface AdminDashboardProps {
  appointments: Appointment[];
  setAppointments: (a: Appointment[]) => void;
  services: Service[];
  setServices: (s: Service[]) => void;
  galleryItems: GalleryItem[];
  setGalleryItems: (g: GalleryItem[]) => void;
  beforeAfterItems?: BeforeAfterItem[];
  setBeforeAfterItems?: (b: BeforeAfterItem[]) => void;
  dbStatusMsg: { type: 'success' | 'warn' | 'error'; message: string } | null;
  onRefreshData: () => Promise<void>;
  onOpenDiagnostics?: () => void;
  currentUser?: UserProfile | null;
  bookingSlots?: string[];
  onUpdateBookingSlots?: (slots: string[]) => Promise<void>;
}

export default function AdminDashboard({
  appointments,
  setAppointments,
  services,
  setServices,
  galleryItems,
  setGalleryItems,
  beforeAfterItems = [],
  setBeforeAfterItems,
  dbStatusMsg,
  onRefreshData,
  onOpenDiagnostics,
  currentUser,
  bookingSlots = [],
  onUpdateBookingSlots
}: AdminDashboardProps) {

  // Dashboard navigation sub-state
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'customers' | 'services' | 'gallery' | 'slots' | 'transformations' | 'payments'>('overview');

  // Supabase SQL assistant state
  const [showSqlSetup, setShowSqlSetup] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // --- REAL-TIME BOOKING NOTIFICATIONS SYSTEM ---
  const [knownAptIds, setKnownAptIds] = useState<Set<string>>(() => new Set(appointments.map(a => a.id)));
  const [activeToasts, setActiveToasts] = useState<{ id: string; appointment: Appointment }[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<Appointment[]>(() => {
    try {
      const stored = sessionStorage.getItem('admin_booking_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('admin_notifications_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [highlightedAptId, setHighlightedAptId] = useState<string | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  // Synthesize beautiful vibrating telephone bell ring using Web Audio API
  const playRingSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playSingleRing = (startTime: number, duration: number) => {
        const osc1 = audioCtx.createOscillator();
        const gainNode1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(650, startTime);

        const osc2 = audioCtx.createOscillator();
        const gainNode2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(780, startTime);
        
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 18; // 18 Hz trill speed
        lfoGain.gain.value = 30;  // 30 Hz trill depth
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);
        
        gainNode1.gain.setValueAtTime(0, startTime);
        gainNode1.gain.linearRampToValueAtTime(0.5, startTime + 0.05); // quick attack
        gainNode1.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // decay

        gainNode2.gain.setValueAtTime(0, startTime);
        gainNode2.gain.linearRampToValueAtTime(0.35, startTime + 0.05); // quick attack
        gainNode2.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // decay
        
        osc1.connect(gainNode1);
        gainNode1.connect(audioCtx.destination);

        osc2.connect(gainNode2);
        gainNode2.connect(audioCtx.destination);
        
        lfo.start(startTime);
        osc1.start(startTime);
        osc2.start(startTime);
        
        lfo.stop(startTime + duration);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playSingleRing(now, 0.45);
      playSingleRing(now + 0.55, 0.55);
    } catch (e) {
      console.warn('Audio ring playback blocked or unsupported by browser:', e);
    }
  };

  // Sound loop for continuous ringing (minimum 1 minute or until silenced)
  useEffect(() => {
    if (!isRinging || isMuted) return;

    playRingSound();

    const intervalId = setInterval(() => {
      playRingSound();
    }, 3000);

    const timeoutId = setTimeout(() => {
      setIsRinging(false);
      console.log("Ringing auto-stopped after 60 seconds.");
    }, 60000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isRinging, isMuted]);

  const handleMuteToggle = () => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('admin_notifications_muted', String(next));
      } catch {}
      if (!next) {
        setTimeout(() => playRingSound(), 50);
      } else {
        setIsRinging(false);
      }
      return next;
    });
  };

  const triggerNotification = (apt: Appointment) => {
    const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
    setActiveToasts(prev => [...prev, { id: toastId, appointment: apt }]);
    
    setNotificationHistory(prev => {
      const updated = [apt, ...prev];
      try {
        sessionStorage.setItem('admin_booking_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isMuted) {
      setIsRinging(true);
    }

    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== toastId));
    }, 15000);
  };

  const handleViewAppointment = (aptId: string) => {
    setHighlightedAptId(aptId);
    setActiveTab('appointments');
    
    setTimeout(() => {
      const element = document.getElementById(`apt-card-${aptId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    setTimeout(() => {
      setHighlightedAptId(prev => prev === aptId ? null : prev);
    }, 6000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  // Authentication validation
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const email = currentUser?.email?.toLowerCase() || '';
    return currentUser?.isAdmin === true || email === 'admin@roopashree.com' || email === 'admin@bodyandbeautystudio.com';
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Sync authentication state with active login session
  useEffect(() => {
    const email = currentUser?.email?.toLowerCase() || '';
    if (currentUser?.isAdmin === true || email === 'admin@roopashree.com' || email === 'admin@bodyandbeautystudio.com') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [currentUser]);

  // Sync known IDs once authenticated to prevent historic alarms from triggering on login
  useEffect(() => {
    if (isAuthenticated && appointments.length > 0) {
      setKnownAptIds(new Set(appointments.map(a => a.id)));
    }
  }, [isAuthenticated]);

  // Real-time tab-to-tab sync via standard BroadcastChannel API
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const channel = new BroadcastChannel('appointment_notifications');
      channel.onmessage = async (event) => {
        if (event.data?.type === 'APPOINTMENT_CREATED') {
          console.log('Real-time Broadcast: New appointment booked!', event.data.appointment);
          await onRefreshData();
        }
      };
      return () => {
        channel.close();
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment:', e);
    }
  }, [isAuthenticated, onRefreshData]);

  // Real-time cloud sync via Supabase Realtime Postgres Changes
  useEffect(() => {
    const client = supabase;
    if (!isAuthenticated || !client) return;

    try {
      const subscription = client
        .channel('public-appointments-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'appointments' },
          async (payload) => {
            console.log('Real-time Supabase: New appointment inserted!', payload.new);
            await onRefreshData();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(subscription);
      };
    } catch (e) {
      console.warn('Supabase Realtime subscription error:', e);
    }
  }, [isAuthenticated, onRefreshData]);

  // Background Sync Interval: Poll onRefreshData every 5 seconds for real-time bookings detection (fallback)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(async () => {
      try {
        await onRefreshData();
      } catch (err) {
        console.warn('Sync refresh error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, onRefreshData]);

  // Sync listener to capture incoming new bookings and trigger notifications & rings
  useEffect(() => {
    if (!isAuthenticated) return;

    const newBookings = appointments.filter(apt => !knownAptIds.has(apt.id));
    
    if (newBookings.length > 0) {
      newBookings.forEach(apt => {
        triggerNotification(apt);
      });

      setKnownAptIds(prev => {
        const next = new Set(prev);
        newBookings.forEach(apt => next.add(apt.id));
        return next;
      });
    }
  }, [appointments, isAuthenticated, knownAptIds]);

  // Rescheduling states
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('09:00 AM');

  // Handle Auth submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'shubha77' || password === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect secret credential pass. Please type "shubha77" or "admin" to manage client data.');
    }
  };

  const broadcastUpdate = (appointment: Appointment) => {
    try {
      const channel = new BroadcastChannel('appointment_notifications');
      channel.postMessage({ type: 'APPOINTMENT_UPDATED', appointment });
      channel.close();
    } catch (e) {
      console.warn('BroadcastChannel failed to broadcast updated appointment:', e);
    }
  };

  // Appointment Actions
  const handleApprove = async (id: string) => {
    const updatedApts = appointments.map(apt => apt.id === id ? { ...apt, status: 'approved' as const } : apt);
    setAppointments(updatedApts);
    await updateAppointmentStatus(id, 'approved');
    const target = updatedApts.find(a => a.id === id);
    if (target) broadcastUpdate(target);
    await onRefreshData();
  };

  const handleCancel = async (id: string) => {
    const updatedApts = appointments.map(apt => apt.id === id ? { ...apt, status: 'cancelled' as const } : apt);
    setAppointments(updatedApts);
    await updateAppointmentStatus(id, 'cancelled');
    const target = updatedApts.find(a => a.id === id);
    if (target) broadcastUpdate(target);
    await onRefreshData();
  };

  const handleRescheduleSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) return;
    
    const targetApt = appointments.find(a => a.id === id);
    if (targetApt) {
      const updatedApt: Appointment = {
        ...targetApt,
        preferredDate: rescheduleDate,
        preferredTime: rescheduleTime,
        status: 'rescheduled'
      };
      
      setAppointments(appointments.map(apt => apt.id === id ? updatedApt : apt));
      await saveAppointment(updatedApt);
      broadcastUpdate(updatedApt);
      await onRefreshData();
    }
    setReschedulingId(null);
  };

  // Services Actions
  const handleAddService = async (newSvc: Service) => {
    setServices([newSvc, ...services]);
    await updateCustomService(newSvc);
    await onRefreshData();
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Are you certain you want to remove this service from your catalog?')) {
      setServices(services.filter(s => s.id !== id));
      await removeCustomService(id);
      await onRefreshData();
    }
  };

  const activeClientsCount = Array.from(new Set(appointments.map(a => a.phone))).length;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 animate-fade-in" id="admin-pass-gate">
        <div className="bg-[#0b0f0b] border border-[#DDB93B] p-8 text-center space-y-6">
          <div className="text-3xl font-serif-luxury text-[#DDB93B] tracking-widest font-black">🔒 ACCESS GATE</div>
          <p className="text-xs text-gray-500 font-light leading-relaxed">
            Please provide your secret credential key to read customer entries, schedule tables, and edit catalog assets.
          </p>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Enter admin password (e.g. shubha77)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-200 px-4 py-2.5 text-xs text-center text-white focus:outline-none focus:border-[#DDB93B]"
                autoFocus
              />
            </div>

            {authError && <p className="text-[10px] text-red-400 font-mono text-center leading-normal">{authError}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black hover:border-transparent text-[10px] uppercase font-bold tracking-widest border border-[#DDB93B]/25 transition-all cursor-pointer"
            >
              Unlock Terminal
            </button>
          </form>
          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-gray-500 font-mono">Hint: type "shubha77" or "admin" to enter.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in text-left" id="admin-dashboard-view">
      
      {/* Real-time Ringing / Alarm alert banner */}
      {isRinging && (
        <div className="bg-[#4a0d0d] border border-red-500/50 text-white p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded animate-pulse shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-red-600/5 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <span className="p-2.5 bg-red-600/30 border border-red-500/40 text-[#DDB93B] rounded-full flex items-center justify-center animate-bounce">
              <span className="h-6 w-6 font-extrabold flex items-center justify-center">🔔</span>
            </span>
            <div className="space-y-0.5">
              <h3 className="font-extrabold uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 text-[#DDB93B]">
                🚨 NEW INCOMING APPOINTMENT BELL RINGING
              </h3>
              <p className="text-[11px] text-gray-200 font-light">
                Real-time booking received! The physical alert ring is looping. Silence it manually or it will auto-stop in 1 minute.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsRinging(false)}
              className="w-full sm:w-auto px-5 py-2 bg-red-600 hover:bg-white hover:text-red-950 text-white font-bold uppercase text-[10px] tracking-widest transition-all cursor-pointer border border-transparent rounded-none"
            >
              Silence Ringing
            </button>
          </div>
        </div>
      )}

      {/* 1. Header with Logout / Sync status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#050805] border border-white/5 p-6">
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#DDB93B] font-extrabold flex items-center gap-1.5 font-mono">
            <Sparkles className="h-3 w-3 text-[#DDB93B]" /> administrative operation control
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-white font-semibold">Body and Beauty Studio Lead Desk</h1>
          <p className="text-xs text-gray-400 font-light">Managing Yelahanka salon bookings and remote cloud catalogs.</p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
          {/* Mute/Unmute sound toggler */}
          <button
            onClick={handleMuteToggle}
            className={`px-3 py-2 border transition-all text-[10px] uppercase font-bold tracking-widest cursor-pointer flex items-center gap-1.5 ${
              isMuted 
                ? 'bg-amber-950/20 border-amber-900/40 text-amber-500 hover:bg-amber-900/40' 
                : 'bg-[#0f1511] border-[#DDB93B]/30 text-[#DDB93B] hover:bg-[#DDB93B] hover:text-black hover:border-transparent'
            }`}
            title={isMuted ? "Unmute sound notifications" : "Mute sound notifications"}
          >
            <span>{isMuted ? "🔇 Muted" : "🔔 Alert Ring"}</span>
          </button>
          <button
            onClick={() => {
              setIsRinging(true);
              playRingSound();
            }}
            className="px-3 py-2 bg-[#0F5232]/10 border border-[#DDB93B]/40 text-[#DDB93B] hover:bg-[#DDB93B] hover:text-black transition-all text-[10px] uppercase font-bold tracking-widest cursor-pointer flex items-center gap-1"
            title="Test the continuous looping ring-ring notification bell"
          >
            <span>🔔 Test Ring</span>
          </button>
          <button
            onClick={() => onRefreshData()}
            className="px-4 py-2 bg-black border border-gray-700 hover:border-[#DDB93B] hover:text-[#DDB93B] text-[#DDB93B] text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer"
          >
            Refresh Database
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-red-950/20 text-red-400 border border-red-900/40 hover:bg-red-900 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation selectors */}
      <div className="flex flex-wrap border-b border-gray-200 gap-1 bg-transparent">
        {[
          { id: 'overview', title: 'Aura Analytics', icon: <BarChart className="h-3.5 w-3.5" /> },
          { id: 'appointments', title: `Reservations (${appointments.length})`, icon: <Calendar className="h-3.5 w-3.5" /> },
          { id: 'payments', title: 'Payment Ledger', icon: <CreditCard className="h-3.5 w-3.5" /> },
          { id: 'customers', title: `Client Index (${activeClientsCount})`, icon: <Users className="h-3.5 w-3.5" /> },
          { id: 'services', title: `Care Catalog (${services.length})`, icon: <Scissors className="h-3.5 w-3.5" /> },
          { id: 'gallery', title: `Style Gallery (${galleryItems.length})`, icon: <ImageIcon className="h-3.5 w-3.5" /> },
          { id: 'transformations', title: `Before & After (${beforeAfterItems.length})`, icon: <Sparkles className="h-3.5 w-3.5" /> },
          { id: 'slots', title: `Timing Slots (${bookingSlots.length})`, icon: <Clock className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === tab.id
                ? 'text-[#DDB93B] border-[#DDB93B] bg-white/5'
                : 'text-gray-500 border-transparent hover:text-[#DDB93B]'
            }`}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </button>
        ))}
      </div>

      {/* 2. TAB BLOCKS DISPLAY */}
      {activeTab === 'overview' && (
        <OverviewTab 
          dbStatusMsg={dbStatusMsg}
          onOpenDiagnostics={onOpenDiagnostics}
          showSqlSetup={showSqlSetup}
          setShowSqlSetup={setShowSqlSetup}
          sqlCopied={sqlCopied}
          onCopySql={handleCopySql}
          notificationHistory={notificationHistory}
          onClearNotificationHistory={() => {
            setNotificationHistory([]);
            try {
              sessionStorage.removeItem('admin_booking_notifications');
            } catch {}
          }}
          onViewAppointment={handleViewAppointment}
          appointments={appointments}
          services={services}
          onRefreshData={onRefreshData}
        />
      )}

      {activeTab === 'appointments' && (
        <AppointmentsTab 
          appointments={appointments}
          setAppointments={setAppointments}
          highlightedAptId={highlightedAptId}
          setHighlightedAptId={setHighlightedAptId}
          onApprove={handleApprove}
          onCancel={handleCancel}
          onRescheduleSubmit={handleRescheduleSubmit}
          reschedulingId={reschedulingId}
          setReschedulingId={setReschedulingId}
          rescheduleDate={rescheduleDate}
          setRescheduleDate={setRescheduleDate}
          rescheduleTime={rescheduleTime}
          setRescheduleTime={setRescheduleTime}
          bookingSlots={bookingSlots}
          onRefreshData={onRefreshData}
        />
      )}

      {activeTab === 'customers' && (
        <CustomersTab appointments={appointments} />
      )}

      {activeTab === 'services' && (
        <ServicesTab 
          services={services}
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
        />
      )}

      {activeTab === 'gallery' && (
        <GalleryTab 
          galleryItems={galleryItems}
          setGalleryItems={setGalleryItems}
          onRefreshData={onRefreshData}
        />
      )}

      {activeTab === 'transformations' && (
        <TransformationsTab 
          beforeAfterItems={beforeAfterItems}
          setBeforeAfterItems={setBeforeAfterItems}
          onRefreshData={onRefreshData}
        />
      )}

      {activeTab === 'slots' && (
        <SlotsTab 
          bookingSlots={bookingSlots}
          onUpdateBookingSlots={onUpdateBookingSlots}
          onRefreshData={onRefreshData}
        />
      )}

      {activeTab === 'payments' && (
        <PaymentsTab 
          onRefreshData={onRefreshData}
          appointments={appointments}
          setAppointments={setAppointments}
        />
      )}

      {/* ==================== FLOATING BOOKING ALERTS PORTAL ==================== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none" id="booking-notifications-portal">
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-black/95 border border-[#DDB93B] p-4 shadow-[0_4px_30px_rgba(212,175,55,0.18)] flex flex-col gap-3 animate-fade-in transition-all relative overflow-hidden group text-left"
          >
            {/* Ambient gold glow line on top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#DDB93B] to-transparent" />
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DDB93B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DDB93B]"></span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#DDB93B] font-mono">
                  🚨 NEW BOOKING RECEIVED
                </span>
              </div>
              <button
                onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-gray-500 hover:text-[#DDB93B] transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-white font-medium leading-normal">
                Client <strong className="text-[#DDB93B]">{toast.appointment.name}</strong> has just booked a session!
              </p>
              <div className="text-[10px] text-gray-300 font-mono space-y-0.5 leading-normal bg-white/5 p-2 rounded border border-white/5 mt-1">
                <p>💇‍♀️ Care: {toast.appointment.serviceName}</p>
                <p>📅 Date: {toast.appointment.preferredDate} at {toast.appointment.preferredTime}</p>
                <p>🎟 Ref ID: {toast.appointment.id}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  handleViewAppointment(toast.appointment.id);
                  setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                }}
                className="px-3 py-1 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black text-[9px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
              >
                View Booking
              </button>
              <button
                onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="px-2.5 py-1 border border-gray-700 text-gray-400 hover:text-white hover:border-white text-[9px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
