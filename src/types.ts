/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  stylistPreference: string;
  notes: string;
  status: 'pending' | 'approved' | 'cancelled' | 'rescheduled';
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: 'makeup' | 'hair' | 'nails' | 'skin' | 'mens' | 'bridal';
  title: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  gender: string;
  isAdmin?: boolean;
}

export interface Testimonial {
  rating: number;
  comment: string;
  name: string;
  role: string;
  date: string;
}

export interface Membership {
  popular: boolean;
  title: string;
  price: number;
  billing: string;
  benefits: string[];
}

export interface BeforeAfterItem {
  id: string;
  before_url: string;
  after_url: string;
  title: string;
  description: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  appointmentId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  amount: number;
  paymentMethod: 'upi' | 'card' | 'counter';
  txnId: string;
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
  verifiedAt?: string;
}


