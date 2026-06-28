import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, Sparkles, AlertCircle, ChevronRight, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { signInUser, signUpUser, sendResetLink, updateUserPassword, supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  redirectReason?: string;
  onBackToHome?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export default function AuthPage({ onAuthSuccess, redirectReason, onBackToHome }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('female');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // For offline/simulated user testing: expose the magic link dynamically in UI
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null);
  const [showBypass, setShowBypass] = useState(false);

  // Parse parameters from both window.location.search and window.location.hash
  const getQueryParam = (name: string): string | null => {
    // 1. Check window.location.search
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has(name)) {
      return searchParams.get(name);
    }
    // 2. Check window.location.hash query portion (e.g. #/auth?type=recovery)
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const hashSearchParams = new URLSearchParams(hash.substring(qIndex));
      if (hashSearchParams.has(name)) {
        return hashSearchParams.get(name);
      }
    }
    return null;
  };

  // Auto-detect magic link recovery parameter from URL and active Supabase session
  useEffect(() => {
    const detectRecovery = async () => {
      try {
        const typeParam = getQueryParam('type');
        const emailParam = getQueryParam('email');
        
        let isRecovery = typeParam === 'recovery';
        let recoveryEmail = emailParam || '';

        // Also inspect live Supabase recovery sessions
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            recoveryEmail = session.user.email || recoveryEmail;
            if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token=')) {
              isRecovery = true;
            }
          }
        }

        if (isRecovery) {
          setMode('reset');
          if (recoveryEmail) {
            setEmail(recoveryEmail);
          }
          setSuccessMsg('Recovery session active. Please specify your new password.');
          
          // Clear query/hash recovery params cleanly to maintain visual security
          const cleanHash = window.location.hash.split('?')[0];
          window.history.replaceState({}, document.title, window.location.pathname + (cleanHash !== '#' ? cleanHash : ''));
        }
      } catch (e) {
        console.warn('Could not parse recovery session:', e);
      }
    };

    detectRecovery();
  }, []);

  const handleTabChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setSimulatedLink(null);
    setShowBypass(false);
  };

  const validatePhone = (num: string) => {
    return num.trim().length >= 8;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (mode === 'forgot') {
      if (!email) {
        setErrorMsg('Please specify your registered account email.');
        setLoading(false);
        return;
      }
      try {
        const result = await sendResetLink(email);
        if (result.success) {
          setSuccessMsg('A password recovery email has been requested. Check your email or use the simulation key.');
          if (result.simulatedLink) {
            setSimulatedLink(result.simulatedLink);
          }
        } else {
          setErrorMsg(result.error || 'Could not transmit recovery packet.');
          if (result.simulatedLink) {
            setSimulatedLink(result.simulatedLink);
          }
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Transmission failure.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'reset') {
      if (!email || !password) {
        setErrorMsg('Email and new secure password are required.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters long.');
        setLoading(false);
        return;
      }
      try {
        const result = await updateUserPassword(email, password);
        if (result.success && result.user) {
          setSuccessMsg('Your security passphrase has been reconstituted successfully! Accessing portal...');
          setTimeout(() => {
            onAuthSuccess(result.user!);
          }, 1200);
        } else {
          setErrorMsg(result.error || 'Failed to update credentials.');
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'An error occurred during password write.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login and Register
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const result = await signInUser(email, password);
        if (result.success && result.user) {
          setSuccessMsg('Authenticating your royal key...');
          setTimeout(() => {
            onAuthSuccess(result.user!);
          }, 1000);
        } else {
          setErrorMsg(result.error || 'Authentication failed. Please check credentials.');
        }
      } else {
        if (!name || !phone) {
          setErrorMsg('Gold profiles require your Name and Contact details.');
          setLoading(false);
          return;
        }
        if (!validatePhone(phone)) {
          setErrorMsg('Please insert a valid phone number (min 8 digits).');
          setLoading(false);
          return;
        }

        const result = await signUpUser(email, password, name, phone, gender);
        if (result.success && result.user) {
          setSuccessMsg('Your Royal Sanctuary Account is ready!');
          setTimeout(() => {
            onAuthSuccess(result.user!);
          }, 1200);
        } else {
          setErrorMsg(result.error || 'Registration failed. Try changing the email.');
          if (result.error && (result.error.includes('Supabase Configuration Alert') || result.error.includes('Redirect') || result.error.includes('Invalid path') || result.error.includes('not allowed'))) {
            setShowBypass(true);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'A transmission error occurred with the servers.');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const result = await signUpUser(email, password, name, phone, gender, true);
      if (result.success && result.user) {
        setSuccessMsg('Instant local VIP authorization granted! Enjoy fully-persistent custom local profile mode.');
        setTimeout(() => {
          onAuthSuccess(result.user!);
        }, 1200);
      } else {
        setErrorMsg(result.error || 'Local registration failed.');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Bypass failed.');
    } finally {
      setLoading(false);
    }
  };

  const simulateClick = (url: string) => {
    try {
      const parsed = new URL(url);
      const emailParam = parsed.searchParams.get('email');
      if (emailParam) {
        setMode('reset');
        setEmail(emailParam);
        setSuccessMsg('Simulated Magic Link clicked! Set your new password below.');
        setSimulatedLink(null);
      }
    } catch (e) {
      setMode('reset');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in" id="auth-page-container">
      <div className="w-full max-w-md bg-white border border-[#DDB93B]/20 p-8 relative rounded shadow-lg" id="auth-box">
        
        {/* Subtle royal framing lines */}
        <div className="absolute top-2 left-2 bottom-2 right-2 border border-[#DDB93B]/5 pointer-events-none" />
        
        {/* Aesthetic Golden Header Accents */}
        <div className="flex flex-col items-center mb-8 relative z-10 text-center">
          <div className="h-10 w-10 border border-[#DDB93B]/40 flex items-center justify-center mb-3 bg-[#111] animate-pulse">
            <Sparkles className="h-4 w-4 text-[#DDB93B]" />
          </div>
          <h2 className="font-serif-deco text-2xl text-[#DDB93B] tracking-widest uppercase">
            Aura Sanctuary Portal
          </h2>
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mt-1">
            Bridal Salon & Club VIP Entry
          </p>
          
          {redirectReason && (
            <div className="mt-4 px-3 py-1.5 bg-[#0F5232]/20 border border-[#DDB93B]/30 text-[#DDB93B] text-xs font-medium uppercase tracking-wider rounded-none">
              🔑 {redirectReason}
            </div>
          )}
        </div>

        {/* Dynamic Warning Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex flex-col gap-3 rounded-none animate-fade-in" id="auth-error-alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="font-sans leading-relaxed text-left">
                <span className="font-bold block uppercase tracking-wider mb-0.5 text-xs text-red-400">Sanctuary Lock</span>
                <span className="whitespace-pre-line">{errorMsg}</span>
              </div>
            </div>
            
            {showBypass && (
              <div className="mt-2 border-t border-red-800/20 pt-3 space-y-2 text-left">
                <p className="text-[10px] text-[#DDB93B] font-bold uppercase tracking-wider">⚡ Immediate Local Bypass Option</p>
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  Would you like to register this profile in our immediate backup register? You can book appointments immediately without waiting for server sync!
                </p>
                <button
                  type="button"
                  onClick={handleBypassRegister}
                  className="w-full py-2 bg-[#DDB93B] hover:bg-white text-black text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  Bypass & Register Locally
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Success Notification */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/20 text-emerald-200 text-xs flex items-start gap-2.5 rounded-none" id="auth-success-alert">
            <CheckCircle className="h-4 w-4 text-[#DDB93B] shrink-0 mt-0.5" />
            <div className="font-sans leading-relaxed text-left">
              <span className="font-bold block uppercase tracking-wider mb-0.5 text-xs text-[#DDB93B]">Authorization Channel</span>
              {successMsg}
            </div>
          </div>
        )}

        {/* Simulated Magic Link Email Box */}
        {simulatedLink && (
          <div className="mb-6 p-4 bg-[#F8F6F2] border border-[#DDB93B]/40 rounded text-left relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block p-1 bg-[#DDB93B]/10 text-[#DDB93B] border border-[#DDB93B]/20 rounded-none">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <p className="text-[11px] font-bold text-[#0F5232] uppercase tracking-wider">Simulated Email Transmitter</p>
            </div>
            <p className="text-[10px] text-[#1F2937] leading-relaxed">
              We generated an automated verification key for your testing. Click the link below to instantly authenticate the simulation and re-route to password resetting mode:
            </p>
            <button
              type="button"
              onClick={() => simulateClick(simulatedLink)}
              className="w-full py-2 bg-[#DDB93B]/10 hover:bg-[#DDB93B]/20 border border-[#DDB93B] text-white text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#DDB93B]" />
              Trigger Link Redirection
            </button>
            <div className="text-[8px] text-gray-500 overflow-x-auto select-all whitespace-pre p-2 bg-black border border-white/5 font-mono">
              {simulatedLink}
            </div>
          </div>
        )}

        {/* Tab Selector (Hidden if in Forgot or Reset mode) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex border-b border-white/10 mb-6 relative z-10" id="auth-tab">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 pb-3 text-xs uppercase tracking-widest font-bold transition-all relative ${
                mode === 'login' ? 'text-[#DDB93B]' : 'text-gray-500 hover:text-[#0F5232]'
              }`}
            >
              Authenticate Key
              {mode === 'login' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#DDB93B]" />
              )}
            </button>
            
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex-1 pb-3 text-xs uppercase tracking-widest font-bold transition-all relative ${
                mode === 'register' ? 'text-[#DDB93B]' : 'text-gray-500 hover:text-[#0F5232]'
              }`}
            >
              Register Profile
              {mode === 'register' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#DDB93B]" />
              )}
            </button>
          </div>
        )}

        {/* Title for custom states */}
        {mode === 'forgot' && (
          <div className="mb-6 text-left relative z-10">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
                setSimulatedLink(null);
              }}
              className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#DDB93B] hover:text-white transition-colors border-0 bg-transparent mb-2 cursor-pointer font-bold"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Log In
            </button>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#DDB93B] font-serif-deco">Request Recovery Link</h3>
            <p className="text-[10px] text-gray-400 mt-1">Specify your registered account email, and we will transmit a magic token to help recover your VIP credentials.</p>
          </div>
        )}

        {mode === 'reset' && (
          <div className="mb-6 text-left relative z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#DDB93B] font-serif-deco">Reconstitute Passphrase</h3>
            <p className="text-[10px] text-gray-400 mt-1">Enter your new security password below to restore immediate portal access.</p>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleAuth} className="space-y-4 relative z-10" id="auth-input-form">
          {mode === 'register' && (
            <>
              {/* Name field */}
              <div>
                <label className="block text-[10px] text-[#1F2937]/80 uppercase tracking-widest mb-1.5 font-bold">
                  Royal Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#DDB93B]/50" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anastasia Varma"
                    className="w-full bg-white border border-[#DDB93B]/35 px-9 py-2.5 text-xs text-[#1F2937] placeholder-gray-400 focus:outline-none focus:border-[#DDB93B] transition-colors rounded-none"
                    id="auth-register-name"
                  />
                </div>
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-[10px] text-[#1F2937]/80 uppercase tracking-widest mb-1.5 font-bold">
                  Secure Contact Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#DDB93B]/50" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99999 88888"
                    className="w-full bg-white border border-[#DDB93B]/35 px-9 py-2.5 text-xs text-[#1F2937] placeholder-gray-400 focus:outline-none focus:border-[#DDB93B] transition-colors rounded-none"
                    id="auth-register-phone"
                  />
                </div>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-[10px] text-[#1F2937]/80 uppercase tracking-widest mb-1.5 font-bold">
                  Gender Preference for Treatments
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-[#DDB93B]/35 px-3 py-2.5 text-xs text-[#1F2937] focus:outline-none focus:border-[#DDB93B] transition-colors rounded-none"
                  id="auth-register-gender"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Non-binary / Other</option>
                  <option value="prefer_not_to_say">Prefer Not To Disclose</option>
                </select>
              </div>
            </>
          )}

          {/* Email field (Visible across all modes, but read-only when resetting) */}
          <div>
            <label className="block text-[10px] text-[#1F2937]/80 uppercase tracking-widest mb-1.5 font-bold">
              Account Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#DDB93B]/50" />
              <input
                type="email"
                required
                readOnly={mode === 'reset'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aura@salon.com"
                className={`w-full border px-9 py-2.5 text-xs rounded-none transition-colors ${
                  mode === 'reset' 
                    ? 'bg-gray-100 border-[#DDB93B]/20 text-gray-500 cursor-not-allowed' 
                    : 'bg-white border-[#DDB93B]/35 text-[#1F2937] placeholder-gray-400 focus:outline-none focus:border-[#DDB93B]'
                }`}
                id="auth-email-input"
              />
            </div>
          </div>

          {/* Password field (Visible in login, register, and reset mode) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] text-[#1F2937]/80 uppercase tracking-widest font-bold">
                  {mode === 'reset' ? 'New Account Password *' : 'Account Password *'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setSimulatedLink(null);
                    }}
                    className="text-[9px] uppercase tracking-wider text-[#DDB93B] hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#DDB93B]/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#DDB93B]/35 px-9 py-2.5 text-xs text-[#1F2937] placeholder-gray-400 focus:outline-none focus:border-[#DDB93B] transition-colors rounded-none"
                  id="auth-password-input"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 group transition-all text-white border border-[#DDB93B]/40 ${
                loading 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed' 
                  : 'bg-[#0F5232] hover:bg-[#DDB93B] hover:text-black hover:border-transparent cursor-pointer'
              }`}
              id="auth-submit-btn"
            >
              {loading ? (
                'Processing Aura Encryption...'
              ) : (
                <>
                  {mode === 'login' && 'Confirm Sanctuary Identity'}
                  {mode === 'register' && 'Establish Royal Membership'}
                  {mode === 'forgot' && 'Transmit Magic Recovery Link'}
                  {mode === 'reset' && 'Reconstitute Secure Passphrase'}
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {onBackToHome && (
          <div className="mt-6 text-center border-t border-white/5 pt-4 relative z-10">
            <button
              type="button"
              onClick={onBackToHome}
              className="text-[9px] uppercase tracking-widest text-[#DDB93B] hover:text-white transition-colors bg-transparent border-0 cursor-pointer font-bold"
              id="auth-back-home-btn"
            >
              Return to Pavilion Lobby
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
