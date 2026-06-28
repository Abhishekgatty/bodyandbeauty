import React from 'react';
import { Database, Copy, CheckSquare, Sparkles, BarChart, Trash2 } from 'lucide-react';
import { BarChart as RechartBar, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Appointment, Service } from '../../types';
import { SUPABASE_SQL_SETUP } from '../../supabaseClient';

interface OverviewTabProps {
  dbStatusMsg: { type: 'success' | 'warn' | 'error'; message: string } | null;
  onOpenDiagnostics?: () => void;
  showSqlSetup: boolean;
  setShowSqlSetup: (show: boolean) => void;
  sqlCopied: boolean;
  onCopySql: () => void;
  notificationHistory: Appointment[];
  onClearNotificationHistory: () => void;
  onViewAppointment: (id: string) => void;
  appointments: Appointment[];
  services: Service[];
  onRefreshData: () => Promise<void>;
}

export default function OverviewTab({
  dbStatusMsg,
  onOpenDiagnostics,
  showSqlSetup,
  setShowSqlSetup,
  sqlCopied,
  onCopySql,
  notificationHistory,
  onClearNotificationHistory,
  onViewAppointment,
  appointments,
  services,
  onRefreshData
}: OverviewTabProps) {
  // Key Statistics calculated inside the component
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const approvedAppointments = appointments.filter(a => a.status === 'approved');
  const activeClientsCount = Array.from(new Set(appointments.map(a => a.phone))).length;

  const totalRevenueMock = approvedAppointments.reduce((acc, current) => {
    const matchingSvc = services.find(s => s.id === current.serviceId);
    return acc + (matchingSvc ? matchingSvc.price : 4500);
  }, 0);

  // Grouped charts database matching
  const categoryCounts = categoryDistribution(services);

  function categoryDistribution(servicesList: Service[]) {
    const dist: Record<string, number> = {};
    servicesList.forEach(s => {
      dist[s.category] = (dist[s.category] || 0) + 1;
    });
    return Object.entries(dist).map(([category, count]) => ({ category, count }));
  }

  return (
    <div className="space-y-8 animate-fade-in" id="admin-overview-tab">
      
      {/* SUPABASE BACKEND SYNCHRONIZER BOARD */}
      {dbStatusMsg && (
        <div className={`p-6 border relative overflow-hidden flex flex-col gap-4 ${
          dbStatusMsg.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/30' 
            : dbStatusMsg.type === 'warn'
            ? 'bg-amber-950/25 border-amber-500/40'
            : 'bg-red-950/15 border-red-900/30'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className={`h-5 w-5 ${dbStatusMsg.type === 'success' ? 'text-emerald-400' : 'text-amber-500'}`} />
                <h4 className="font-serif-luxury text-base text-white tracking-wide font-bold">Supabase Cloud Sync Status</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">{dbStatusMsg.message}</p>
            </div>

            <div className="flex gap-2 self-stretch md:self-auto shrink-0 flex-wrap">
              <button
                onClick={onOpenDiagnostics}
                className="px-4 py-2 border border-[#DDB93B]/50 hover:bg-[#DDB93B]/10 text-[#DDB93B] text-[10px] uppercase font-bold tracking-widest cursor-pointer flex items-center gap-1.5"
              >
                <Database className="h-3 w-3" />
                Run Diagnostic Suite
              </button>
              <button
                onClick={() => setShowSqlSetup(!showSqlSetup)}
                className="px-4 py-2 border border-[#DDB93B]/50 hover:bg-[#DDB93B]/10 text-[#DDB93B] text-[10px] uppercase font-bold tracking-widest cursor-pointer"
              >
                {showSqlSetup ? 'Conceal Setup Script' : 'Setup Database Tables'}
              </button>
              <button
                onClick={onRefreshData}
                className="px-4 py-2 bg-[#0F5232] text-white hover:bg-[#DDB93B] hover:text-black hover:border-transparent text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
              >
                Force Sync Now
              </button>
            </div>
          </div>

          {/* Toggleable SQL Table Setup Guide */}
          {showSqlSetup && (
            <div className="w-full mt-4 p-4 bg-black border border-[#DDB93B]/25 text-left space-y-4 font-mono text-[11px] block animate-fade-in">
              <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                <span className="text-[#DDB93B] font-bold uppercase tracking-wider text-[10px]">Quick SQL Installation script:</span>
                <button
                  onClick={onCopySql}
                  className="flex items-center gap-1 bg-[#0F5232]/40 border border-[#DDB93B]/35 text-[#DDB93B] px-2.5 py-1 text-[10px] hover:bg-[#DDB93B] hover:text-black transition-all cursor-pointer"
                >
                  {sqlCopied ? <CheckSquare className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{sqlCopied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-gray-500 p-2.5 bg-black/80 text-xs leading-relaxed max-h-60 whitespace-pre scrollbar-thin">
                {SUPABASE_SQL_SETUP}
              </pre>
              <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                💡 <strong>Instructions:</strong> Open your online Supabase Dashboard, enter your project, click on <strong>"SQL Editor"</strong> in the left sidebar, click <strong>"New Query"</strong>, paste the copied script above, and press <strong>"Run"</strong>! This generates the requested tables instantly with Row Level Security (RLS) open policies.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* ==================== ACTIVE SESSION ALERTS HUB ==================== */}
      {notificationHistory.length > 0 && (
        <div className="bg-[#0b0f0b] border border-[#DDB93B]/50 p-6 space-y-4 animate-fade-in relative overflow-hidden shadow-md" id="admin-alerts-hub">
          {/* Gold decorative accent glow */}
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-transparent to-[#DDB93B]/5 pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <h4 className="font-serif-luxury text-sm text-[#DDB93B] tracking-wider font-extrabold flex items-center gap-2 uppercase">
                🔔 Session Booking Alert History
              </h4>
            </div>
            <button
              onClick={onClearNotificationHistory}
              className="text-[9px] uppercase font-bold tracking-widest text-amber-500 hover:text-[#DDB93B] transition-colors cursor-pointer border border-amber-950/40 px-2.5 py-1 bg-amber-950/10 font-mono"
            >
              Clear Session History
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-60 overflow-y-auto scrollbar-thin text-left">
            {notificationHistory.map((apt) => (
              <div 
                key={apt.id} 
                className="p-3.5 bg-black border border-white/5 hover:border-[#DDB93B]/35 transition-all text-xs flex flex-col justify-between gap-3 relative group"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-white group-hover:text-[#DDB93B] transition-colors">{apt.name}</span>
                    <span className="text-[9px] font-mono text-amber-500 bg-amber-950/20 px-1.5 py-0.5 border border-amber-900/20">{apt.id}</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">💇‍♀️ {apt.serviceName}</p>
                  <p className="text-gray-400 text-[10px] font-mono">📅 {apt.preferredDate} at {apt.preferredTime}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[9px] text-gray-500 font-mono">
                    Booked: {new Date(apt.createdAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => onViewAppointment(apt.id)}
                    className="text-[9px] uppercase font-bold tracking-wider text-[#DDB93B] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Locate & Verify <Sparkles className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-[#050805] border border-white/5 p-6 space-y-2 text-left relative overflow-hidden shadow-sm hover:border-[#DDB93B]/25 transition-all">
          <span className="text-gray-400 text-[9px] uppercase tracking-widest block font-bold font-mono">TOTAL ASSIGNED ENTRIES</span>
          <p className="font-serif-luxury text-3xl text-white font-bold">{appointments.length}</p>
          <p className="text-[10px] text-gray-400">({pendingAppointments.length} pending verification)</p>
        </div>

        <div className="bg-[#050805] border border-white/5 p-6 space-y-2 text-left relative overflow-hidden shadow-sm hover:border-[#DDB93B]/25 transition-all">
          <span className="text-gray-400 text-[9px] uppercase tracking-widest block font-bold font-mono">ACTIVE DIGITAL CLIENTS</span>
          <p className="font-serif-luxury text-3xl text-[#DDB93B] font-bold">{activeClientsCount}</p>
          <p className="text-[10px] text-gray-400">(By unique phone numbers)</p>
        </div>

        <div className="bg-[#050805] border border-white/5 p-6 space-y-2 text-left relative overflow-hidden shadow-sm hover:border-[#DDB93B]/25 transition-all">
          <span className="text-gray-400 text-[9px] uppercase tracking-widest block font-bold font-mono">CATALOGUED PROCEDURES</span>
          <p className="font-serif-luxury text-3xl text-white font-bold">{services.length}</p>
          <p className="text-[10px] text-gray-400">(Addable from this terminal)</p>
        </div>

        <div className="bg-[#050805] border border-white/5 p-6 space-y-2 text-left relative overflow-hidden shadow-sm hover:border-[#DDB93B]/25 transition-all">
          <span className="text-gray-400 text-[9px] uppercase tracking-widest block font-bold font-mono">COMPLETED LEDGER VALUE</span>
          <p className="font-serif-luxury text-3xl text-emerald-400 font-bold">₹{totalRevenueMock.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400">({approvedAppointments.length} approved appointments)</p>
        </div>

      </div>

      {/* Charts Layout from Recharts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="bg-[#050805] border border-white/5 p-6 space-y-4 shadow-sm">
          <h3 className="font-serif-luxury text-sm text-[#DDB93B] tracking-widest uppercase font-bold">Services Distribution By Type</h3>
          <div className="h-64 font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBar data={categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="category" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #111', fontSize: 11 }} />
                <Bar dataKey="count" fill="#DDB93B" />
              </RechartBar>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#050805] border border-white/5 p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <h3 className="font-serif-luxury text-sm text-[#DDB93B] tracking-widest uppercase font-bold">Upcoming Verified Actions</h3>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Please click on the <strong>"Reservations"</strong> tab to approve pending wedding slots or change timing coordinates. New submissions at the studio appear instantly in the booking system queue.
            </p>
          </div>
          
          <div className="p-4 bg-black border border-white/5 space-y-2 text-xs text-gray-400 leading-normal font-sans">
            <span className="text-[#DDB93B] uppercase font-bold block text-[10px] tracking-wider font-mono">💡 Client Desk Guidelines:</span>
            <p>1. Keep VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY defined to avoid using localStorage offline sandbox.</p>
            <p>2. Approve pending bookings to calculate completed transaction values in the master calculator.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
