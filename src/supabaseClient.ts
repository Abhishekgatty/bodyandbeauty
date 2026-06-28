/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Appointment, Service, GalleryItem, UserProfile, BeforeAfterItem, PaymentTransaction } from './types';

let rawUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
// Automatically sanitize the URL in case the user pasted the direct Rest API endpoint
while (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}
if (rawUrl.endsWith('/rest/v1')) {
  rawUrl = rawUrl.slice(0, -8);
}
while (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}

export const supabaseUrl = rawUrl;
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==================== SQL GENERATOR FOR USER ====================
export const SUPABASE_SQL_SETUP = `-- Copy and paste this script into your Supabase SQL Editor to set up tables, policies, and triggers:

-- ====================================================================
-- 1. APPOINTMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gender TEXT,
  service_id TEXT,
  service_name TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  stylist_preference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

-- Enable Row Level Security (RLS) on appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Dynamic policies for public reservation access
DROP POLICY IF EXISTS "Allow public read of appointments" ON appointments;
DROP POLICY IF EXISTS "Allow public insert of appointments" ON appointments;
DROP POLICY IF EXISTS "Allow public update of appointments" ON appointments;
DROP POLICY IF EXISTS "Allow public delete of appointments" ON appointments;

CREATE POLICY "Allow public read of appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert of appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of appointments" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of appointments" ON appointments FOR DELETE USING (true);


-- ====================================================================
-- 2. SERVICES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS "CustomServices" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration TEXT NOT NULL,
  description TEXT
);

-- Enable Row Level Security (RLS) on custom services
ALTER TABLE "CustomServices" ENABLE ROW LEVEL SECURITY;

-- Dynamic policies for service catalog setup
DROP POLICY IF EXISTS "Allow public read of services" ON "CustomServices";
DROP POLICY IF EXISTS "Allow public edit of services" ON "CustomServices";

CREATE POLICY "Allow public read of services" ON "CustomServices" FOR SELECT USING (true);
CREATE POLICY "Allow public edit of services" ON "CustomServices" FOR ALL USING (true) WITH CHECK (true);


-- ====================================================================
-- 3. GALLERY ITEMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS "GalleryItems" (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

-- Enable Row Level Security (RLS) on gallery portfolio items
ALTER TABLE "GalleryItems" ENABLE ROW LEVEL SECURITY;

-- Dynamic policies for gallery operations
DROP POLICY IF EXISTS "Allow public read of gallery" ON "GalleryItems";
DROP POLICY IF EXISTS "Allow public edit of gallery" ON "GalleryItems";

CREATE POLICY "Allow public read of gallery" ON "GalleryItems" FOR SELECT USING (true);
CREATE POLICY "Allow public edit of gallery" ON "GalleryItems" FOR ALL USING (true) WITH CHECK (true);


-- ====================================================================
-- 4. USER PROFILES TABLE (Integrated with Supabase Auth users)
-- ====================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  gender TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on user profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Dynamic policies for individual user profile control
DROP POLICY IF EXISTS "Allow public read of profiles" ON profiles;
DROP POLICY IF EXISTS "Allow individual profile update" ON profiles;
DROP POLICY IF EXISTS "Allow individual profile insert" ON profiles;

CREATE POLICY "Allow public read of profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual profile update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow individual profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ====================================================================
-- 5. PROFILE AUTOMATION TRIGGER
-- ====================================================================
-- This trigger automatically inserts a custom profile when a user completes registration via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, gender)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'gender', 'female')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ====================================================================
-- 6. BOOKING SLOTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS booking_slots (
  time_slot TEXT PRIMARY KEY
);

-- Enable Row Level Security (RLS) on booking slots
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;

-- Dynamic policies for public slot management
DROP POLICY IF EXISTS "Allow public read of slots" ON booking_slots;
DROP POLICY IF EXISTS "Allow public edit of slots" ON booking_slots;

CREATE POLICY "Allow public read of slots" ON booking_slots FOR SELECT USING (true);
CREATE POLICY "Allow public edit of slots" ON booking_slots FOR ALL USING (true) WITH CHECK (true);


-- ====================================================================
-- 7. BEFORE AFTER ITEMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS "BeforeAfterItems" (
  id TEXT PRIMARY KEY,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

-- Enable Row Level Security (RLS) on BeforeAfterItems
ALTER TABLE "BeforeAfterItems" ENABLE ROW LEVEL SECURITY;

-- Dynamic policies for before-after operations
DROP POLICY IF EXISTS "Allow public read of beforeafter" ON "BeforeAfterItems";
DROP POLICY IF EXISTS "Allow public edit of beforeafter" ON "BeforeAfterItems";

CREATE POLICY "Allow public read of beforeafter" ON "BeforeAfterItems" FOR SELECT USING (true);
CREATE POLICY "Allow public edit of beforeafter" ON "BeforeAfterItems" FOR ALL USING (true);


-- ====================================================================
-- 8. STORAGE BUCKET FOR IMAGES
-- ====================================================================
-- Create a public bucket 'salon-images' to host uploaded photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-images', 'salon-images', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure storage policies exist to allow public upload, read, and delete on 'salon-images' bucket
DROP POLICY IF EXISTS "Allow public read of salon-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload of salon-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete of salon-images" ON storage.objects;

CREATE POLICY "Allow public read of salon-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'salon-images');
CREATE POLICY "Allow public upload of salon-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'salon-images');
CREATE POLICY "Allow public delete of salon-images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'salon-images');
`;

// Helper: map database model to local types
function mapDbAppointment(db: any): Appointment {
  return {
    id: db.id,
    name: db.name,
    phone: db.phone,
    email: db.email || '',
    gender: db.gender || '',
    serviceId: db.service_id || '',
    serviceName: db.service_name || '',
    preferredDate: db.preferred_date || '',
    preferredTime: db.preferred_time || '',
    stylistPreference: db.stylist_preference || '',
    notes: db.notes || '',
    status: db.status as 'pending' | 'approved' | 'cancelled' | 'rescheduled',
    createdAt: db.created_at || new Date().toISOString(),
  };
}

// Helper: map local state to DB model
function mapToDbAppointment(apt: Appointment) {
  return {
    id: apt.id,
    name: apt.name,
    phone: apt.phone,
    email: apt.email,
    gender: apt.gender,
    service_id: apt.serviceId,
    service_name: apt.serviceName,
    preferred_date: apt.preferredDate,
    preferred_time: apt.preferredTime,
    stylist_preference: apt.stylistPreference,
    notes: apt.notes || '',
    status: apt.status,
    created_at: apt.createdAt,
  };
}

// ==================== APPOINTMENT CONTROLLERS ====================
export async function fetchAppointments(fallbackData: Appointment[]): Promise<{ data: Appointment[]; fromDb: boolean; error?: string }> {
  if (!supabase) {
    return { data: getLocalStorage('appointments', fallbackData), fromDb: false };
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query error (likely table not set up):', error.message);
      return { data: getLocalStorage('appointments', fallbackData), fromDb: false, error: `${error.message}. Using offline mode.` };
    }

    if (data && data.length > 0) {
      const mapped = data.map(mapDbAppointment);
      localStorage.setItem('appointments', JSON.stringify(mapped));
      return { data: mapped, fromDb: true };
    } else {
      // Seed default appointments in the database!
      const { error: insertError } = await supabase
        .from('appointments')
        .insert(fallbackData.map(mapToDbAppointment));

      if (!insertError) {
        localStorage.setItem('appointments', JSON.stringify(fallbackData));
        return { data: fallbackData, fromDb: true };
      }
      return { data: [], fromDb: true, error: insertError.message };
    }
  } catch (err: any) {
    console.error('Supabase fetch appointments error:', err);
    return { data: getLocalStorage('appointments', fallbackData), fromDb: false, error: err?.message || 'Network error' };
  }
}

export async function saveAppointment(appointment: Appointment): Promise<{ success: boolean; error?: string }> {
  // Sync locally first
  const existing = getLocalStorage<Appointment[]>('appointments', []);
  const updated = [appointment, ...existing.filter(a => a.id !== appointment.id)];
  localStorage.setItem('appointments', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const dbApt = mapToDbAppointment(appointment);
    const { error } = await supabase.from('appointments').upsert(dbApt);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database transaction failed' };
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<{ success: boolean; error?: string }> {
  // Local sync
  const existing = getLocalStorage<Appointment[]>('appointments', []);
  const updated = existing.map(a => a.id === appointmentId ? { ...a, status: status as any } : a);
  localStorage.setItem('appointments', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database update failed' };
  }
}

export async function removeAppointment(appointmentId: string): Promise<{ success: boolean; error?: string }> {
  // Local sync
  const existing = getLocalStorage<Appointment[]>('appointments', []);
  const updated = existing.filter(a => a.id !== appointmentId);
  localStorage.setItem('appointments', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database delete failed' };
  }
}

// ==================== PAYMENT TRANSACTION CONTROLLERS ====================
export async function savePaymentTransaction(payment: PaymentTransaction): Promise<{ success: boolean; error?: string }> {
  // Local sync
  const existing = getLocalStorage<PaymentTransaction[]>('payments', []);
  const updated = [payment, ...existing.filter(p => p.id !== payment.id)];
  localStorage.setItem('payments', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('payments').upsert({
      id: payment.id,
      appointment_id: payment.appointmentId,
      customer_name: payment.customerName,
      customer_phone: payment.customerPhone,
      customer_email: payment.customerEmail,
      service_name: payment.serviceName,
      amount: payment.amount,
      payment_method: payment.paymentMethod,
      txn_id: payment.txnId,
      status: payment.status,
      created_at: payment.createdAt,
      verified_at: payment.verifiedAt || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database error saving payment' };
  }
}

export async function fetchPaymentTransactions(): Promise<{ data: PaymentTransaction[]; fromDb: boolean; error?: string }> {
  if (!supabase) {
    return { data: getLocalStorage<PaymentTransaction[]>('payments', []), fromDb: false };
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: getLocalStorage<PaymentTransaction[]>('payments', []), fromDb: true, error: error.message };
    }

    const mapped: PaymentTransaction[] = (data || []).map(p => ({
      id: p.id,
      appointmentId: p.appointment_id,
      customerName: p.customer_name,
      customerPhone: p.customer_phone,
      customerEmail: p.customer_email,
      serviceName: p.service_name,
      amount: Number(p.amount),
      paymentMethod: p.payment_method as 'upi' | 'card',
      txnId: p.txn_id,
      status: p.status as 'pending' | 'verified' | 'failed',
      createdAt: p.created_at,
      verifiedAt: p.verified_at || undefined,
    }));

    // Cache to local storage
    localStorage.setItem('payments', JSON.stringify(mapped));
    return { data: mapped, fromDb: true };
  } catch (err: any) {
    return { data: getLocalStorage<PaymentTransaction[]>('payments', []), fromDb: false, error: err?.message || 'Network error' };
  }
}

export async function updatePaymentTransactionStatus(id: string, status: 'pending' | 'verified' | 'failed', verifiedAt?: string): Promise<{ success: boolean; error?: string }> {
  // Local sync
  const existing = getLocalStorage<PaymentTransaction[]>('payments', []);
  const updated = existing.map(p => p.id === id ? { ...p, status, verifiedAt: verifiedAt || p.verifiedAt } : p);
  localStorage.setItem('payments', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        verified_at: verifiedAt || null,
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error updating payment' };
  }
}

// ==================== SERVICE CONTROLLERS ====================
export async function fetchCustomServices(fallbackData: Service[]): Promise<{ data: Service[]; fromDb: boolean; error?: string }> {
  if (!supabase) {
    return { data: getLocalStorage('services', fallbackData), fromDb: false };
  }

  try {
    const { data, error } = await supabase
      .from('CustomServices')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.warn('Supabase query error CustomServices:', error.message);
      return { data: getLocalStorage('services', fallbackData), fromDb: false, error: `${error.message}. Using offline catalog.` };
    }

    if (data && data.length > 0) {
      const mapped: Service[] = data.map((db: any) => ({
        id: db.id,
        name: db.name,
        category: db.category,
        price: Number(db.price),
        duration: db.duration,
        description: db.description || '',
      }));

      // Auto-sync missing services (such as newly added Bridal packages) into CustomServices table
      const missingServices = fallbackData.filter(f => !mapped.some(m => m.id === f.id));
      if (missingServices.length > 0) {
        console.log('Seeding missing services to Supabase CustomServices table:', missingServices.map(s => s.name));
        const { error: insertMissingError } = await supabase
          .from('CustomServices')
          .insert(missingServices.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            price: s.price,
            duration: s.duration,
            description: s.description
          })));
        if (!insertMissingError) {
          mapped.push(...missingServices);
        } else {
          console.warn('Could not auto-seed missing services to database:', insertMissingError.message);
        }
      }

      localStorage.setItem('services', JSON.stringify(mapped));
      return { data: mapped, fromDb: true };
    } else {
      // Seed default services in the database!
      const { error: insertError } = await supabase
        .from('CustomServices')
        .insert(fallbackData.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          price: s.price,
          duration: s.duration,
          description: s.description
        })));
      
      if (!insertError) {
        localStorage.setItem('services', JSON.stringify(fallbackData));
        return { data: fallbackData, fromDb: true };
      }
      return { data: [], fromDb: true, error: insertError.message };
    }
  } catch (err: any) {
    return { data: getLocalStorage('services', fallbackData), fromDb: false, error: err?.message || 'Network error' };
  }
}

export async function updateCustomService(service: Service): Promise<{ success: boolean; error?: string }> {
  const existing = getLocalStorage<Service[]>('services', []);
  const updated = [service, ...existing.filter(s => s.id !== service.id)];
  localStorage.setItem('services', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('CustomServices').upsert({
      id: service.id,
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      description: service.description,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function removeCustomService(serviceId: string): Promise<{ success: boolean; error?: string }> {
  const existing = getLocalStorage<Service[]>('services', []);
  const updated = existing.filter(s => s.id !== serviceId);
  localStorage.setItem('services', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('CustomServices').delete().eq('id', serviceId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

// ==================== GALLERY ITEM CONTROLLERS ====================
export async function fetchGalleryItems(fallbackData: GalleryItem[]): Promise<{ data: GalleryItem[]; fromDb: boolean; error?: string }> {
  if (!supabase) {
    return { data: getLocalStorage('galleryItems', fallbackData), fromDb: false };
  }

  try {
    const { data, error } = await supabase
      .from('GalleryItems')
      .select('*');

    if (error) {
      console.warn('Supabase query error GalleryItems:', error.message);
      return { data: getLocalStorage('galleryItems', fallbackData), fromDb: false, error: `${error.message}. Using offline gallery.` };
    }

    if (data && data.length > 0) {
      const mapped: GalleryItem[] = data.map((db: any) => ({
        id: db.id,
        url: db.url,
        category: db.category as any,
        title: db.title,
        description: db.description || '',
      }));
      localStorage.setItem('galleryItems', JSON.stringify(mapped));
      return { data: mapped, fromDb: true };
    } else {
      // Seed default gallery items in the database!
      const { error: insertError } = await supabase
        .from('GalleryItems')
        .insert(fallbackData.map(g => ({
          id: g.id,
          url: g.url,
          category: g.category,
          title: g.title,
          description: g.description
        })));

      if (!insertError) {
        localStorage.setItem('galleryItems', JSON.stringify(fallbackData));
        return { data: fallbackData, fromDb: true };
      }
      return { data: [], fromDb: true, error: insertError.message };
    }
  } catch (err: any) {
    return { data: getLocalStorage('galleryItems', fallbackData), fromDb: false, error: err?.message || 'Network error' };
  }
}

export async function updateGalleryItem(item: GalleryItem): Promise<{ success: boolean; error?: string }> {
  const existing = getLocalStorage<GalleryItem[]>('galleryItems', []);
  const updated = [item, ...existing.filter(g => g.id !== item.id)];
  localStorage.setItem('galleryItems', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('GalleryItems').upsert({
      id: item.id,
      url: item.url,
      category: item.category,
      title: item.title,
      description: item.description,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function removeGalleryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const existing = getLocalStorage<GalleryItem[]>('galleryItems', []);
  const updated = existing.filter(g => g.id !== itemId);
  localStorage.setItem('galleryItems', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('GalleryItems').delete().eq('id', itemId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

// ==================== SLOT CONTROLLERS ====================
export const DEFAULT_TIMES = [
  '05:00 AM', '07:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

export async function fetchBookingSlots(): Promise<{ data: string[]; fromDb: boolean; error?: string }> {
  if (!supabase) {
    return { data: getLocalStorage('booking_slots', DEFAULT_TIMES), fromDb: false };
  }

  try {
    const { data, error } = await supabase
      .from('booking_slots')
      .select('time_slot')
      .order('time_slot', { ascending: true });

    if (error) {
      console.warn('Supabase query error booking_slots:', error.message);
      return { data: getLocalStorage('booking_slots', DEFAULT_TIMES), fromDb: false, error: `${error.message}. Using offline slots.` };
    }

    if (data && data.length > 0) {
      const mapped = data.map((d: any) => d.time_slot);
      localStorage.setItem('booking_slots', JSON.stringify(mapped));
      return { data: mapped, fromDb: true };
    } else {
      // Seed default times in the database!
      const { error: insertError } = await supabase
        .from('booking_slots')
        .insert(DEFAULT_TIMES.map(s => ({ time_slot: s })));
      
      if (!insertError) {
        localStorage.setItem('booking_slots', JSON.stringify(DEFAULT_TIMES));
        return { data: DEFAULT_TIMES, fromDb: true };
      }
      return { data: [], fromDb: true, error: insertError.message };
    }
  } catch (err: any) {
    return { data: getLocalStorage('booking_slots', DEFAULT_TIMES), fromDb: false, error: err?.message || 'Network error' };
  }
}

export async function updateBookingSlots(slots: string[]): Promise<{ success: boolean; error?: string }> {
  localStorage.setItem('booking_slots', JSON.stringify(slots));

  if (!supabase) {
    return { success: true };
  }

  try {
    // Delete all existing slots first to replace them
    const { error: deleteError } = await supabase.from('booking_slots').delete().neq('time_slot', '');
    if (deleteError) {
      // Try with direct deletion or ignore delete errors if table is empty
    }

    if (slots.length > 0) {
      const { error: insertError } = await supabase.from('booking_slots').insert(
        slots.map(s => ({ time_slot: s }))
      );
      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

// Low-level helper: localStorage access
function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

// ==================== AUTHENTICATION CONTROLLERS ====================

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export async function signUpUser(
  email: string,
  pass: string,
  name: string,
  phone: string,
  gender: string,
  bypassSupabase: boolean = false
): Promise<AuthResult> {
  const newUser: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 11),
    email,
    name,
    phone,
    gender,
  };

  const registered = getLocalStorage<any[]>('registered_users', []);
  if (registered.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already registered.' };
  }

  if (supabase && !bypassSupabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name, phone, gender },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) {
        let errMsg = error.message;
        if (error.message.includes('Invalid path specified in request URL') || error.message.includes('redirect') || error.message.includes('not allowed')) {
          errMsg = `Supabase Configuration Alert: "${error.message}". This happens because your Supabase Auth requires email verification, but this app URL (${window.location.origin}) has not been whitelisted as a Redirect URL in your Supabase project yet.\n\n👉 Fix this in 2 seconds:\n1. Go to your Supabase Dashboard -> Authentication -> URL Configuration.\n2. Add "${window.location.origin}" to your Allowed Redirect URLs.\n3. (Optional) Disable "Confirm email" under Auth -> Providers -> Email, so registration is instant!`;
        }
        return { success: false, error: errMsg };
      }
      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || name,
          phone: data.user.user_metadata?.phone || phone,
          gender: data.user.user_metadata?.gender || gender,
        };
        registered.push({ email, password: pass, profile });
        localStorage.setItem('registered_users', JSON.stringify(registered));
        localStorage.setItem('current_user', JSON.stringify(profile));
        return { success: true, user: profile };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database Auth failed' };
    }
  }

  registered.push({ email, password: pass, profile: newUser });
  localStorage.setItem('registered_users', JSON.stringify(registered));
  localStorage.setItem('current_user', JSON.stringify(newUser));
  return { success: true, user: newUser };
}

export async function signInUser(email: string, pass: string): Promise<AuthResult> {
  // Built-in Administrator Login Check
  const lowerEmail = email.toLowerCase();
  if ((lowerEmail === 'admin@roopashree.com' || lowerEmail === 'admin@bodyandbeautystudio.com') && (pass === 'shubha77' || pass === 'admin')) {
    const adminProfile: UserProfile = {
      id: 'usr_admin_royal',
      email: lowerEmail,
      name: 'Body & Beauty Studio Administrator',
      phone: '+91 99999 88888',
      gender: 'female',
      isAdmin: true
    };
    localStorage.setItem('current_user', JSON.stringify(adminProfile));
    return { success: true, user: adminProfile };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        console.warn('Supabase Auth failed, checking local fallback:', error.message);
      } else if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || 'Aura Guest',
          phone: data.user.user_metadata?.phone || '',
          gender: data.user.user_metadata?.gender || '',
        };
        localStorage.setItem('current_user', JSON.stringify(profile));
        return { success: true, user: profile };
      }
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
    }
  }

  const registered = getLocalStorage<any[]>('registered_users', []);
  const match = registered.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (match) {
    if (match.password === pass) {
      localStorage.setItem('current_user', JSON.stringify(match.profile));
      return { success: true, user: match.profile };
    } else {
      return { success: false, error: 'Incorrect credentials.' };
    }
  }

  return { success: false, error: 'Account not found. Please register first.' };
}

export async function signOutUser(): Promise<{ success: boolean }> {
  localStorage.removeItem('current_user');
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error ignored:', e);
    }
  }
  return { success: true };
}

export function getCurrentUser(): UserProfile | null {
  const cached = localStorage.getItem('current_user');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function sendResetLink(email: string): Promise<{ success: boolean; simulatedLink?: string; error?: string }> {
  let supabaseErrorMsg = '';
  const simulatedLink = `${window.location.origin}?type=recovery&email=${encodeURIComponent(email)}&token=${Math.random().toString(36).substring(2, 10)}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        console.warn('Supabase resetPasswordForEmail failed:', error.message);
        if (error.message.includes('Invalid path specified in request URL') || error.message.includes('redirect')) {
          supabaseErrorMsg = `Supabase setup error: "${error.message}". To fix this permanently, you MUST add "${window.location.origin}" to the Allowed Redirect URLs in your Supabase Dashboard under Authentication -> URL Configuration. In the meantime, you can use our secure local simulated reset link below:`;
        } else {
          supabaseErrorMsg = error.message;
        }
      } else {
        return { success: true };
      }
    } catch (err: any) {
      console.error('Supabase reset error:', err);
      supabaseErrorMsg = err?.message || 'Database Auth transaction error';
    }
  }

  const registered = getLocalStorage<any[]>('registered_users', []);
  const exists = registered.some(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!exists) {
    if (supabaseErrorMsg) {
      return { 
        success: false, 
        error: `${supabaseErrorMsg}\n\n(Note: Also, ensure this email is registered in local fallback storage as well).`,
        simulatedLink 
      };
    }
    return { success: false, error: 'No registered account found with that email.' };
  }

  return { success: true, simulatedLink, error: supabaseErrorMsg || undefined };
}

export async function updateUserPassword(email: string, newPass: string): Promise<AuthResult> {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPass
      });
      if (!error && data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || 'Aura Guest',
          phone: data.user.user_metadata?.phone || '',
          gender: data.user.user_metadata?.gender || '',
        };
        const registered = getLocalStorage<any[]>('registered_users', []);
        const idx = registered.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx !== -1) {
          registered[idx].password = newPass;
          localStorage.setItem('registered_users', JSON.stringify(registered));
        }
        localStorage.setItem('current_user', JSON.stringify(profile));
        return { success: true, user: profile };
      }
    } catch (err) {
      console.error('Supabase password update error:', err);
    }
  }

  const registered = getLocalStorage<any[]>('registered_users', []);
  const idx = registered.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx !== -1) {
    registered[idx].password = newPass;
    localStorage.setItem('registered_users', JSON.stringify(registered));
    localStorage.setItem('current_user', JSON.stringify(registered[idx].profile));
    return { success: true, user: registered[idx].profile };
  }

  return { success: false, error: 'Failed to find registered account to update.' };
}

// ==================== BEFORE-AFTER CONTROLLERS ====================
export async function fetchBeforeAfterItems(fallbackData: BeforeAfterItem[]): Promise<{ data: BeforeAfterItem[]; fromDb: boolean; error?: string }> {
  if (!supabase) {
    return { data: getLocalStorage('beforeAfterItems', fallbackData), fromDb: false };
  }

  try {
    const { data, error } = await supabase
      .from('BeforeAfterItems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query error BeforeAfterItems:', error.message);
      return { data: getLocalStorage('beforeAfterItems', fallbackData), fromDb: false, error: `${error.message}. Using offline catalog.` };
    }

    if (data && data.length > 0) {
      const mapped: BeforeAfterItem[] = data.map((db: any) => ({
        id: db.id,
        before_url: db.before_url,
        after_url: db.after_url,
        title: db.title,
        description: db.description || '',
        created_at: db.created_at || new Date().toISOString(),
      }));
      localStorage.setItem('beforeAfterItems', JSON.stringify(mapped));
      return { data: mapped, fromDb: true };
    } else {
      // Seed default items if any
      if (fallbackData.length > 0) {
        const { error: insertError } = await supabase
          .from('BeforeAfterItems')
          .insert(fallbackData.map(b => ({
            id: b.id,
            before_url: b.before_url,
            after_url: b.after_url,
            title: b.title,
            description: b.description,
            created_at: b.created_at
          })));
        if (!insertError) {
          localStorage.setItem('beforeAfterItems', JSON.stringify(fallbackData));
          return { data: fallbackData, fromDb: true };
        }
      }
      return { data: [], fromDb: true };
    }
  } catch (err: any) {
    return { data: getLocalStorage('beforeAfterItems', fallbackData), fromDb: false, error: err?.message || 'Network error' };
  }
}

export async function updateBeforeAfterItem(item: BeforeAfterItem): Promise<{ success: boolean; error?: string }> {
  const existing = getLocalStorage<BeforeAfterItem[]>('beforeAfterItems', []);
  const updated = [item, ...existing.filter(b => b.id !== item.id)];
  localStorage.setItem('beforeAfterItems', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('BeforeAfterItems').upsert({
      id: item.id,
      before_url: item.before_url,
      after_url: item.after_url,
      title: item.title,
      description: item.description,
      created_at: item.created_at,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function removeBeforeAfterItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const existing = getLocalStorage<BeforeAfterItem[]>('beforeAfterItems', []);
  const updated = existing.filter(b => b.id !== itemId);
  localStorage.setItem('beforeAfterItems', JSON.stringify(updated));

  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('BeforeAfterItems').delete().eq('id', itemId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Helper to upload an image to Supabase Storage.
 * It takes a file/blob or a base64 string.
 * If Supabase is not configured, it returns the base64 string (or input) as is.
 * If Supabase is configured, it uploads to 'salon-images' bucket and returns the public URL.
 */
export async function uploadImageToStorage(fileOrBase64: File | string): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    // If not configured, just return the input (or base64) as a fallback
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
  }

  try {
    let fileBody: Blob | File;
    let fileName = '';

    if (typeof fileOrBase64 === 'string') {
      if (!fileOrBase64.startsWith('data:')) {
        // Already a normal URL, return it directly
        return fileOrBase64;
      }
      // Convert base64 dataUrl to Blob
      const parts = fileOrBase64.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      fileBody = new Blob([u8arr], { type: mime });
      const ext = mime.split('/')[1] || 'jpg';
      fileName = `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    } else {
      fileBody = fileOrBase64;
      const ext = fileOrBase64.name.split('.').pop() || 'jpg';
      fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    }

    // Attempt to upload to 'salon-images' bucket
    const { data, error } = await supabase.storage
      .from('salon-images')
      .upload(fileName, fileBody, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      // Fallback to base64 if upload fails (e.g. bucket doesn't exist yet or policies not run)
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('salon-images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Error in uploadImageToStorage:', err);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
  }
}


