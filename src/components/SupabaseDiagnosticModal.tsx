import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, XCircle, Copy, RefreshCw, X, ExternalLink, Sparkles, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured, SUPABASE_SQL_SETUP, supabaseUrl } from '../supabaseClient';

interface SupabaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DiagnosticStatus = 'idle' | 'checking' | 'connected' | 'missing_tables' | 'auth_error' | 'unconfigured';

export default function SupabaseDiagnosticModal({ isOpen, onClose }: SupabaseDiagnosticModalProps) {
  const [status, setStatus] = useState<DiagnosticStatus>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [testedTables, setTestedTables] = useState<{ name: string; status: 'ok' | 'error'; error?: string }[]>([]);
  const [sqlCopied, setSqlCopied] = useState(false);

  const maskSecret = (key: string) => {
    if (!key) return 'Not Configured';
    if (key.length <= 15) return '***';
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  const runDiagnostics = async () => {
    setStatus('checking');
    setErrorDetails('');
    setTestedTables([]);

    if (!isSupabaseConfigured || !supabase) {
      setStatus('unconfigured');
      return;
    }

    const tablesToTest = ['appointments', 'CustomServices', 'GalleryItems', 'booking_slots'];
    const results: typeof testedTables = [];
    let hasTableErrors = false;
    let hasAuthOrUrlError = false;
    let authOrUrlErrorMessage = '';

    for (const tableName of tablesToTest) {
      try {
        // Try a tiny query to test existence and authorization
        const selectCol = tableName === 'booking_slots' ? 'time_slot' : 'id';
        const { data, error } = await supabase
          .from(tableName)
          .select(selectCol)
          .limit(1);

        if (error) {
          // Check if error is related to table not existing
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            results.push({ name: tableName, status: 'error', error: 'Table does not exist' });
            hasTableErrors = true;
          } else if (error.message.includes('JWT') || error.message.includes('API key') || (error as any).status === 401 || (error as any).status === 403) {
            results.push({ name: tableName, status: 'error', error: `Auth Error: ${error.message}` });
            hasAuthOrUrlError = true;
            authOrUrlErrorMessage = error.message;
          } else {
            results.push({ name: tableName, status: 'error', error: error.message });
            hasTableErrors = true;
          }
        } else {
          results.push({ name: tableName, status: 'ok' });
        }
      } catch (err: any) {
        results.push({ name: tableName, status: 'error', error: err?.message || 'Network fetch crashed' });
        hasAuthOrUrlError = true;
        authOrUrlErrorMessage = err?.message || 'Could not reach Supabase endpoint.';
      }
    }

    setTestedTables(results);

    if (hasAuthOrUrlError) {
      setStatus('auth_error');
      setErrorDetails(authOrUrlErrorMessage || 'Failed to authenticate with Supabase. Check your URL and Anon Key.');
    } else if (hasTableErrors) {
      setStatus('missing_tables');
      setErrorDetails('API credentials are valid, but required tables are missing from your database schema.');
    } else {
      setStatus('connected');
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in" id="db-diagnostic-modal">
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-[#DDB93B]/30 p-6 sm:p-8 relative rounded-none shadow-[0_0_80px_rgba(212,175,55,0.08)] my-8">
        
        {/* Elegant design inner border lines */}
        <div className="absolute top-2 left-2 bottom-2 right-2 border border-[#DDB93B]/5 pointer-events-none" />

        {/* Header section */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6 relative z-10">
          <div className="space-y-1 text-left">
            <span className="text-[9px] tracking-[0.3em] text-[#DDB93B] uppercase font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse text-[#DDB93B]" /> live system telemetry
            </span>
            <h3 className="font-serif-luxury text-xl sm:text-2xl text-white font-semibold uppercase tracking-wider">
              Supabase Cloud Integrator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-white/10 hover:border-[#DDB93B] hover:text-[#DDB93B] text-gray-400 transition-colors cursor-pointer"
            id="close-diagnostic-modal-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="space-y-6 relative z-10 text-left">
          
          {/* Key status hero box */}
          <div className="p-5 border flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-none bg-[#0a0a0a]">
            {status === 'checking' && (
              <div className="h-12 w-12 rounded-none border border-[#DDB93B]/30 flex items-center justify-center shrink-0 bg-black">
                <RefreshCw className="h-6 w-6 text-[#DDB93B] animate-spin" />
              </div>
            )}
            {status === 'connected' && (
              <div className="h-12 w-12 rounded-none border border-emerald-500/30 flex items-center justify-center shrink-0 bg-emerald-950/20">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
            )}
            {status === 'missing_tables' && (
              <div className="h-12 w-12 rounded-none border border-amber-500/30 flex items-center justify-center shrink-0 bg-amber-950/20">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
            )}
            {status === 'auth_error' && (
              <div className="h-12 w-12 rounded-none border border-red-500/30 flex items-center justify-center shrink-0 bg-red-950/20">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            )}
            {status === 'unconfigured' && (
              <div className="h-12 w-12 rounded-none border border-gray-500/30 flex items-center justify-center shrink-0 bg-neutral-900">
                <Database className="h-6 w-6 text-gray-400" />
              </div>
            )}

            <div className="space-y-1.5 flex-1 text-center sm:text-left">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white">
                {status === 'checking' && 'Analyzing Database Connection...'}
                {status === 'connected' && 'Supabase Cloud Connected & Synchronized'}
                {status === 'missing_tables' && 'Tables Missing (Action Required)'}
                {status === 'auth_error' && 'Authentication Credentials Failed'}
                {status === 'unconfigured' && 'Offline / Local Persistence Mode'}
              </h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                {status === 'checking' && 'Transmitting secure pings to test response latency, authorization parameters, and table integrity...'}
                {status === 'connected' && 'Excellent! Your applet is perfectly wired to your Supabase project. Custom care catalog additions and client appointment tables are fully synchronized in real-time.'}
                {status === 'missing_tables' && 'Your connection keys are valid and fully authenticated! However, the database returns schema failures because the necessary tables have not been created yet.'}
                {status === 'auth_error' && `Supabase returned authentication errors during initialization. ${errorDetails}`}
                {status === 'unconfigured' && 'The app is running offline using resilient HTML5 LocalStorage replication. To activate collaborative real-time sync, define the required variables in the environment settings.'}
              </p>
            </div>
          </div>

          {/* Environment Secrets Diagnostic Readout */}
          <div className="space-y-2">
            <h5 className="text-[10px] tracking-widest uppercase font-bold text-gray-400">Credential Diagnostics</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px] bg-black border border-white/5 p-4">
              <div>
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">VITE_SUPABASE_URL</span>
                <span className="text-white break-all">{(import.meta as any).env?.VITE_SUPABASE_URL || 'Not Defined'}</span>
                {((import.meta as any).env?.VITE_SUPABASE_URL || '').trim() !== supabaseUrl && supabaseUrl && (
                  <span className="text-[9px] text-[#DDB93B] block mt-1 font-mono leading-tight">
                    Auto-cleaned to:<br/>{supabaseUrl}
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider mb-0.5">VITE_SUPABASE_ANON_KEY</span>
                <span className="text-white break-all">{maskSecret((import.meta as any).env?.VITE_SUPABASE_ANON_KEY)}</span>
              </div>
            </div>
          </div>

          {/* Table Testing Diagnostics */}
          {isSupabaseConfigured && testedTables.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[10px] tracking-widest uppercase font-bold text-gray-400">Database Table Integrity</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {testedTables.map((table) => (
                  <div 
                    key={table.name} 
                    className={`p-3 border flex flex-col justify-between h-20 ${
                      table.status === 'ok' 
                        ? 'bg-emerald-950/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-950/5 border-red-500/20 text-red-400'
                    }`}
                  >
                    <span className="font-mono text-[10px] block truncate text-white">{table.name}</span>
                    <div className="flex items-center gap-1.5 mt-2">
                      {table.status === 'ok' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span className="text-[8px] uppercase font-bold tracking-wider">Active & OK</span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 text-red-400 shrink-0" />
                          <span className="text-[8px] uppercase font-bold tracking-wider truncate" title={table.error}>
                            {table.error || 'Failed'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action guidance based on status */}
          {status === 'missing_tables' && (
            <div className="space-y-4 animate-fade-in bg-amber-950/10 border border-amber-500/20 p-5">
              <div className="space-y-1">
                <span className="text-[10px] tracking-wider text-amber-400 font-bold uppercase block">👉 Missing Schema Configuration</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your Supabase account is fully linked, but the table entities do not exist yet. Please copy the instant setup SQL script below, open your <span className="text-[#DDB93B] font-semibold">Supabase SQL Editor</span>, paste the script, and click <span className="font-semibold">Run</span>.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-black border border-white/10 px-4 py-2">
                  <span className="text-[9px] font-mono text-gray-400">AuraStudioSchemaSetup.sql</span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#DDB93B] hover:text-white transition-colors border-0 bg-transparent cursor-pointer font-bold"
                  >
                    {sqlCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Copeed!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy SQL Script
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-black border border-white/5 p-3 font-mono text-[9px] text-gray-400 max-h-36 overflow-y-auto select-all leading-normal">
                  {SUPABASE_SQL_SETUP}
                </div>
              </div>
            </div>
          )}

          {status === 'auth_error' && (
            <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-200 text-xs rounded-none space-y-2">
              <span className="font-bold text-red-400 block uppercase tracking-wider">Troubleshooting Credential Mismatch</span>
              <p className="leading-relaxed">
                Supabase cannot authorize transactions with the provided URL and Anon Key. Please make sure that:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                <li>You copied the <span className="font-bold text-[#DDB93B]">Project API URL</span>, not your dashboard URL.</li>
                <li>You used the <span className="font-bold text-[#DDB93B]">anon (public) API key</span>, not the service_role key.</li>
                <li>You have saved the values in your workspace settings pane and restarted the server.</li>
              </ul>
            </div>
          )}

          {status === 'unconfigured' && (
            <div className="p-4 bg-[#111] border border-white/10 text-xs rounded-none space-y-3">
              <span className="font-bold text-[#DDB93B] block uppercase tracking-widest text-[10px]">How to Enable Collaborative Live Cloud Mode:</span>
              <p className="leading-relaxed text-gray-300">
                Setting up real-time cloud data storage takes less than 1 minute:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-gray-300">
                <li>Create a free account on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#DDB93B] underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="h-2.5 w-2.5" /></a> and set up a new project.</li>
                <li>Copy the <strong className="text-white">Project URL</strong> and <strong className="text-white">Anon Public API Key</strong> from Settings -&gt; API.</li>
                <li>Open the <strong className="text-white">Secrets Panel</strong> in your AI Studio editor, configure those keys, and restart the server!</li>
              </ol>
            </div>
          )}

          {/* Diagnostic utility footer action bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-t border-white/10 pt-4 gap-4">
            <span className="text-[9px] text-gray-500 font-mono">
              Diagnostic tool version 1.4.2 (Secure Client Port 3000)
            </span>
            <button
              onClick={runDiagnostics}
              disabled={status === 'checking'}
              className="px-5 py-2.5 bg-[#0F5232] hover:bg-[#DDB93B] text-white hover:text-black hover:border-transparent text-[10px] uppercase font-extrabold tracking-widest border border-[#DDB93B]/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`h-3 w-3 ${status === 'checking' ? 'animate-spin' : ''}`} />
              Re-run Connection Diagnostic
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
