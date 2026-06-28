-- Aura Body & Beauty Studio: Supabase Database Schema Setup Script
-- Place this script into the Supabase SQL Editor to instantly setup the backend tables, policies, and triggers.

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
CREATE POLICY "Allow public edit of services" ON "CustomServices" FOR ALL USING (true);


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
CREATE POLICY "Allow public edit of gallery" ON "GalleryItems" FOR ALL USING (true);


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
CREATE POLICY "Allow public edit of slots" ON booking_slots FOR ALL USING (true);


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


-- ====================================================================
-- 9. PAYMENT TRANSACTIONS TABLE
-- ====================================================================


CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  appointment_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_name TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  txn_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  verified_at TEXT
);

-- Enable Row Level Security (RLS) on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of payments" ON payments;
DROP POLICY IF EXISTS "Allow public insert of payments" ON payments;
DROP POLICY IF EXISTS "Allow public update of payments" ON payments;

CREATE POLICY "Allow public read of payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert of payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of payments" ON payments FOR UPDATE USING (true);




