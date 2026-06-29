/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWidgets from './components/FloatingWidgets';
import { LightboxModal, BlogModal, MembershipModal } from './components/Modals';
import SupabaseDiagnosticModal from './components/SupabaseDiagnosticModal';

import RootLayout from './app/layout';
import HomePath from './app/page';
import ServicesPath from './app/services/page';
import BridalPath from './app/bridal/page';
import MembershipPath from './app/membership/page';
import AppointmentPath from './app/appointment/page';
import GalleryPath from './app/gallery/page';
import ContactPath from './app/contact/page';
import AdminDashboard from './app/admin/page';
import AuthPage from './app/auth/page';

import { 
  isSupabaseConfigured,
  fetchAppointments,
  saveAppointment,
  fetchCustomServices,
  fetchGalleryItems,
  getCurrentUser,
  signOutUser,
  updateCustomService,
  updateGalleryItem,
  fetchBookingSlots,
  updateBookingSlots,
  supabase,
  fetchBeforeAfterItems,
  updateBeforeAfterItem,
  removeBeforeAfterItem
} from './supabaseClient';

import { SERVICES, GALLERY_ITEMS, BLOG_POSTS, BEFORE_AFTER_ITEMS } from './data';
import { Appointment, Service, GalleryItem, BlogPost, UserProfile, BeforeAfterItem } from './types';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageId = (pathname: string) => {
    if (pathname === '/services') return 'services';
    if (pathname === '/bridal') return 'bridal';
    if (pathname === '/membership') return 'membership';
    if (pathname === '/gallery') return 'gallery';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/appointment') return 'appointment';
    if (pathname === '/auth') return 'auth';
    if (pathname === '/admin') return 'admin';
    return 'home';
  };

  const currentPage = getPageId(location.pathname);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfterItem[]>([]);
  const [bookingSlots, setBookingSlots] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [userAptStatuses, setUserAptStatuses] = useState<Record<string, 'pending' | 'approved' | 'cancelled' | 'rescheduled'>>({});
  const [clientToasts, setClientToasts] = useState<{ id: string; message: string; appointment: Appointment; type: 'approved' | 'cancelled' | 'rescheduled' }[]>([]);

  // Synthesize beautiful golden luxury bell alert chime for client notifications
  const playClientChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number, vol: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(vol, start + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = audioCtx.currentTime;
      // High-end majestic ascending harp/bell arpeggio
      playTone(1046.50, now, 0.8, 0.2);       // C6
      playTone(1318.51, now + 0.12, 0.9, 0.15); // E6
      playTone(1567.98, now + 0.24, 1.1, 0.15); // G6
    } catch (e) {
      console.warn('Audio chime playback blocked or unsupported:', e);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Redirect to /auth if password recovery is active or detected in URL hash or query string
  useEffect(() => {
    try {
      const hash = window.location.hash;
      const search = window.location.search;
      
      const isRecovery = hash.includes('type=recovery') || 
                         hash.includes('access_token=') || 
                         search.includes('type=recovery');

      if (isRecovery && currentPage !== 'auth') {
        console.log('Detected recovery mode redirect, navigating to auth/reset...');
        let emailVal = '';
        const emailMatch = hash.match(/email=([^&]*)/) || search.match(/email=([^&]*)/);
        if (emailMatch && emailMatch[1]) {
          emailVal = `&email=${emailMatch[1]}`;
        }
        navigate(`/auth?type=recovery${emailVal}`);
      }
    } catch (e) {
      console.warn('Error checking recovery URL params:', e);
    }
  }, [location.pathname, location.hash, currentPage, navigate]);

  // Handle live Supabase PASSWORD_RECOVERY events
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase Auth Event in App:', event);
      if (event === 'PASSWORD_RECOVERY') {
        const email = session?.user?.email || '';
        const emailQuery = email ? `&email=${encodeURIComponent(email)}` : '';
        console.log('PASSWORD_RECOVERY event received, navigating to reset password form.');
        navigate(`/auth?type=recovery${emailQuery}`);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // If navigating on auth voluntarily, go back, otherwise unlock Page
    if (currentPage === 'auth') {
      if (user.isAdmin) {
        navigateToPage('admin');
      } else {
        navigateToPage('appointment');
      }
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setUserAptStatuses({});
    setClientToasts([]);
    navigateToPage('home');
  };

  // Connection report message
  const [dbStatusMsg, setDbStatusMsg] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  // Lightbox preview for gallery images
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<GalleryItem | null>(null);

  // Active blog detail reading model
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Active Membership acquisition modal message
  const [enrolledMembership, setEnrolledMembership] = useState<string | null>(null);

  // Cache preselected services
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null);

  // Dynamic async fetching with offline-first fail-safes
  const refreshAllData = async () => {
    const initialBookings: Appointment[] = [
      {
        id: 'BBS-990521',
        name: 'Lavanya Gowda',
        phone: '+91 99162 44321',
        email: 'lavanya.gowda@gmail.com',
        gender: 'female',
        serviceId: 'makeup-1',
        serviceName: 'Royal Bridal HD Makeup',
        preferredDate: '2026-06-30',
        preferredTime: '05:00 AM',
        stylistPreference: 'Shubha',
        notes: 'Requested early 05:00 AM slot for wedding preparation. Gold lehenga drapery setup required.',
        status: 'approved',
        createdAt: '2026-06-15T04:22:10Z'
      },
      {
        id: 'BBS-440182',
        name: 'Pratima Raj',
        phone: '+91 98860 12345',
        email: 'pratima@yahoo.co.in',
        gender: 'female',
        serviceId: 'skin-1',
        serviceName: 'Golden Glow Cellular Facial',
        preferredDate: '2026-06-25',
        preferredTime: '11:00 AM',
        stylistPreference: 'No Preference',
        notes: 'Pre-wedding skin hydration facial. Skin is sensitive to salicylic acid.',
        status: 'pending',
        createdAt: '2026-06-22T10:15:30Z'
      }
    ];

    // 1. Fetch appointments
    const aptRes = await fetchAppointments(initialBookings);
    setAppointments(aptRes.data);

    // 2. Fetch services
    const srvRes = await fetchCustomServices(SERVICES);
    setServices(srvRes.data);

    // 3. Fetch gallery
    const galRes = await fetchGalleryItems(GALLERY_ITEMS);
    setGalleryItems(galRes.data);

    // 3b. Fetch before-after transformations
    const baRes = await fetchBeforeAfterItems(BEFORE_AFTER_ITEMS);
    setBeforeAfterItems(baRes.data);

    // 4. Fetch booking slots
    const slotRes = await fetchBookingSlots();
    setBookingSlots(slotRes.data);

    // Configure connectivity indicators
    if (isSupabaseConfigured) {
      if (aptRes.error || srvRes.error || galRes.error || slotRes.error || baRes.error) {
        setDbStatusMsg({
          type: 'warn',
          message: 'Supabase keys are configured in this environment, but some tables could not be queried. Click "Setup Database Tables" to view or copy the instant SQL setup script.'
        });
      } else {
        setDbStatusMsg({
          type: 'success',
          message: 'Fully connected and synchronized with your Supabase cloud database!'
        });
      }
    } else {
      setDbStatusMsg({
        type: 'error',
        message: 'The database is currently operating in offline mode. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables in the secrets panel to launch your database.'
      });
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Multi-tab real-time sync for client updates
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('appointment_notifications');
      channel.onmessage = async (event) => {
        if (event.data?.type === 'APPOINTMENT_UPDATED' || event.data?.type === 'APPOINTMENT_CREATED') {
          console.log('Client Real-time Broadcast: Appointment updated/created!', event.data);
          await refreshAllData();
        }
      };
      return () => channel.close();
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }, []);

  // Cloud database real-time sync for client updates
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    try {
      const subscription = client
        .channel('public-appointments-client-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments' },
          async (payload) => {
            console.log('Client Real-time Cloud update received:', payload);
            await refreshAllData();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(subscription);
      };
    } catch (e) {
      console.warn('Client Supabase Realtime subscription error:', e);
    }
  }, []);

  // Polling fallback to keep app data perfectly synchronized
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData().catch(err => console.warn('App background refresh failed:', err));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Monitor user's appointments and trigger toasts when their status changes
  useEffect(() => {
    if (!currentUser || appointments.length === 0) return;

    // Filter appointments belonging to this customer
    const userApts = appointments.filter(apt => 
      (apt.phone && apt.phone === currentUser.phone) || 
      (apt.email && currentUser.email && apt.email.toLowerCase() === currentUser.email.toLowerCase())
    );

    let hasChanges = false;
    const nextStatuses = { ...userAptStatuses };
    const newToasts: { id: string; message: string; appointment: Appointment; type: 'approved' | 'cancelled' | 'rescheduled' }[] = [];

    userApts.forEach(apt => {
      const prevStatus = userAptStatuses[apt.id];
      if (prevStatus === undefined) {
        // Initial load of this appointment: register silently to avoid false-alarms on login
        nextStatuses[apt.id] = apt.status;
        hasChanges = true;
      } else if (prevStatus !== apt.status) {
        // Status changed!
        nextStatuses[apt.id] = apt.status;
        hasChanges = true;

        // ONLY trigger toasts and chimes when transitioning to non-pending status
        if (apt.status !== 'pending') {
          let msg = '';
          if (apt.status === 'approved') {
            msg = `👑 Your appointment for "${apt.serviceName}" on ${apt.preferredDate} at ${apt.preferredTime} is now APPROVED!`;
          } else if (apt.status === 'rescheduled') {
            msg = `📅 Your appointment for "${apt.serviceName}" has been rescheduled to ${apt.preferredDate} at ${apt.preferredTime}.`;
          } else if (apt.status === 'cancelled') {
            msg = `❌ Your appointment for "${apt.serviceName}" has been cancelled.`;
          }

          if (msg) {
            newToasts.push({
              id: `${apt.id}-${Date.now()}-${Math.random()}`,
              message: msg,
              appointment: apt,
              type: apt.status as 'approved' | 'cancelled' | 'rescheduled'
            });
          }
        }
      }
    });

    if (hasChanges) {
      setUserAptStatuses(nextStatuses);
    }

    if (newToasts.length > 0) {
      setClientToasts(prev => [...prev, ...newToasts]);
      playClientChime();
    }
  }, [appointments, currentUser, userAptStatuses]);

  // Sync scroll to top on page navigation
  const navigateToPage = (page: string) => {
    const path = page === 'home' ? '/' : `/${page}`;
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Immediate select service shortcut
  const handleSelectServiceAndBook = (service: Service) => {
    setPreSelectedServiceId(service.id);
    navigateToPage('appointment');
  };

  const handleBookBridalAndNavigate = (packageName: string, packagePrice: number) => {
    const found = services.find(s => 
      s.name.toLowerCase().includes(packageName.toLowerCase()) || 
      packageName.toLowerCase().includes(s.name.toLowerCase())
    );
    if (found) {
      setPreSelectedServiceId(found.id);
    } else {
      setPreSelectedServiceId('bridal-1'); // default to first bridal package if not found
    }
    navigateToPage('appointment');
  };

  const handleAddNewAppointment = async (newApt: Appointment) => {
    setAppointments([newApt, ...appointments]);
    await saveAppointment(newApt);
    await refreshAllData();

    // Broadcast appointment creation to any open tabs (like the Admin Dashboard)
    try {
      const channel = new BroadcastChannel('appointment_notifications');
      channel.postMessage({ type: 'APPOINTMENT_CREATED', appointment: newApt });
      channel.close();
    } catch (e) {
      console.warn('BroadcastChannel failed to broadcast new appointment:', e);
    }
  };

  const handleRescheduleAppointment = async (id: string, newDate: string, newTime: string) => {
    const updatedApts = appointments.map(apt => {
      if (apt.id === id) {
        return {
          ...apt,
          preferredDate: newDate,
          preferredTime: newTime,
          status: 'rescheduled' as const
        };
      }
      return apt;
    });
    setAppointments(updatedApts);
    const targetApt = updatedApts.find(a => a.id === id);
    if (targetApt) {
      await saveAppointment(targetApt);
      // Broadcast update
      try {
        const channel = new BroadcastChannel('appointment_notifications');
        channel.postMessage({ type: 'APPOINTMENT_UPDATED', appointment: targetApt });
        channel.close();
      } catch (e) {
        console.warn('BroadcastChannel failed to broadcast updated appointment:', e);
      }
    }
    await refreshAllData();
  };

  const handleSelectBlogAndRead = (blog: BlogPost) => {
    setSelectedBlog(blog);
  };

  const handleRegisterMembership = (membershipName: string) => {
    setEnrolledMembership(membershipName);
  };

  const handleUpdateService = async (updatedService: Service) => {
    const res = await updateCustomService(updatedService);
    if (res.success) {
      await refreshAllData();
    } else {
      throw new Error(res.error || 'Failed to update custom service');
    }
  };

  const handleUpdateGalleryItem = async (updatedItem: GalleryItem) => {
    const res = await updateGalleryItem(updatedItem);
    if (res.success) {
      await refreshAllData();
    } else {
      throw new Error(res.error || 'Failed to update gallery image');
    }
  };

  const handleUpdateBookingSlots = async (updatedSlots: string[]) => {
    const res = await updateBookingSlots(updatedSlots);
    if (res.success) {
      await refreshAllData();
    } else {
      throw new Error(res.error || 'Failed to update timing slots');
    }
  };

  return (
    <RootLayout>
      
      {/* Top Banner Navigation */}
      <Navbar currentPage={currentPage} onNavigate={navigateToPage} currentUser={currentUser} onLogout={handleLogout} />

      {/* Main viewport panels */}
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={
            <HomePath 
              onNavigate={navigateToPage} 
              galleryItems={galleryItems}
              beforeAfterItems={beforeAfterItems}
              blogPosts={BLOG_POSTS}
              onSelectBlog={handleSelectBlogAndRead}
            />
          } />

          <Route path="/services" element={
            <ServicesPath 
              services={services} 
              onSelectService={handleSelectServiceAndBook} 
              isAdmin={currentUser?.isAdmin === true}
              onUpdateService={handleUpdateService}
            />
          } />

          <Route path="/bridal" element={
            <BridalPath 
              onBookBridal={handleBookBridalAndNavigate} 
            />
          } />

          <Route path="/membership" element={
            <MembershipPath 
              onSelectMembership={handleRegisterMembership} 
            />
          } />

          <Route path="/gallery" element={
            <GalleryPath 
              galleryItems={galleryItems} 
              onSelectImage={setSelectedLightboxImage} 
              isAdmin={currentUser?.isAdmin === true}
              onUpdateGalleryItem={handleUpdateGalleryItem}
            />
          } />

          <Route path="/contact" element={
            <ContactPath />
          } />

          <Route path="/appointment" element={
            <AppointmentPath 
              services={services}
              preSelectedServiceId={preSelectedServiceId}
              onAddNewAppointment={handleAddNewAppointment}
              currentUser={currentUser}
              onAuthSuccess={handleAuthSuccess}
              bookingSlots={bookingSlots}
              appointments={appointments}
              onRescheduleAppointment={handleRescheduleAppointment}
            />
          } />

          <Route path="/auth" element={
            <AuthPage 
              onAuthSuccess={handleAuthSuccess}
              onBackToHome={() => navigateToPage('home')}
            />
          } />

          <Route path="/admin" element={
            currentUser?.isAdmin ? (
              <AdminDashboard 
                appointments={appointments}
                setAppointments={setAppointments}
                services={services}
                setServices={setServices}
                galleryItems={galleryItems}
                setGalleryItems={setGalleryItems}
                beforeAfterItems={beforeAfterItems}
                setBeforeAfterItems={setBeforeAfterItems}
                dbStatusMsg={dbStatusMsg}
                onRefreshData={refreshAllData}
                onOpenDiagnostics={() => setIsDiagnosticOpen(true)}
                currentUser={currentUser}
                bookingSlots={bookingSlots}
                onUpdateBookingSlots={handleUpdateBookingSlots}
                onNavigate={navigateToPage}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
        </Routes>
      </main>

      {/* Footer contacts coordinates links */}
      <Footer 
        onNavigate={navigateToPage} 
        onOpenDiagnostics={() => setIsDiagnosticOpen(true)} 
        dbStatusMsg={dbStatusMsg}
        currentUser={currentUser}
      />

      {/* Floating widgets panels */}
      <FloatingWidgets />

      {/* Modal overlays portal */}
      <SupabaseDiagnosticModal 
        isOpen={isDiagnosticOpen} 
        onClose={() => setIsDiagnosticOpen(false)} 
      />

      <LightboxModal 
        image={selectedLightboxImage} 
        onClose={() => setSelectedLightboxImage(null)}
        onBookStylist={() => {
          setSelectedLightboxImage(null);
          navigateToPage('appointment');
        }}
      />

      <BlogModal 
        blog={selectedBlog} 
        onClose={() => setSelectedBlog(null)}
        onReserveConsultation={() => {
          setSelectedBlog(null);
          navigateToPage('appointment');
        }}
      />

      <MembershipModal 
        membershipTitle={enrolledMembership} 
        onClose={() => setEnrolledMembership(null)}
        onReserveSession={() => {
          setEnrolledMembership(null);
          navigateToPage('appointment');
        }}
      />

      {/* Floating Client Real-Time Status Notification Toasts Stack */}
      {clientToasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0" id="client-notification-stack">
          {clientToasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-primary border-2 border-secondary text-white p-4 rounded shadow-2xl flex items-start gap-3 animate-fade-in relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-full w-1 bg-secondary" />
              <div className="p-1.5 bg-primary rounded-full text-secondary">
                <Bell className="h-4 w-4 animate-bounce" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-widest text-secondary font-extrabold uppercase">
                    Status Update
                  </span>
                  <button
                    onClick={() => setClientToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-white/60 hover:text-white transition-all p-0.5 rounded cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] font-light leading-relaxed text-gray-100">
                  {toast.message}
                </p>
                <div className="text-[9px] font-mono text-secondary/90 flex items-center gap-2 pt-1">
                  <span>Ref: {toast.appointment.id}</span>
                  <span>•</span>
                  <span className="capitalize px-1.5 py-0.5 bg-black/30 rounded border border-white/5 font-bold">
                    {toast.appointment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </RootLayout>
  );
}
